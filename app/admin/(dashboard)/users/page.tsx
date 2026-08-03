import Link from "next/link";
import { auth } from "@/lib/auth";
import { getUsers } from "@/lib/actions/users";
import { isAdmin } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteUserButton } from "@/components/admin/delete-user-button";
import { UserPlus, Pencil } from "lucide-react";

function formatDate(date: Date | null): string {
  if (!date) return "Never";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default async function UsersPage() {
  const session = await auth();
  const userIsAdmin = isAdmin(session);
  const currentUserId = session?.user?.id;

  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage admin and author accounts.
          </p>
        </div>
        <Button render={<Link href="/admin/users/new" />}>
          <UserPlus className="size-4" />
          New User
        </Button>
      </div>

      {/* Desktop table >=1024px */}
      <div className="hidden lg:block rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 dark:bg-slate-900/80">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-xs uppercase tracking-wider">Name</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Email</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Role</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider whitespace-nowrap">Last Login</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-10"
                  >
                    No users found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition">
                    <TableCell className="font-bold text-slate-900 dark:text-white">{user.name}</TableCell>
                    <TableCell className="text-sm text-slate-500 font-mono">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === "admin" ? "default" : user.role === "author" ? "secondary" : "outline"}
                        className="capitalize font-bold rounded-lg px-2.5 py-0.5"
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500 font-mono whitespace-nowrap">
                      {formatDate(user.lastLogin)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5" render={<Link href={`/admin/users/${user.id}`} />}>
                          <Pencil className="size-3.5" />
                          Edit
                        </Button>
                        {userIsAdmin && user.id !== currentUserId && (
                          <DeleteUserButton
                            userId={user.id}
                            userName={user.name}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile cards <1024px */}
      <div className="lg:hidden space-y-3">
        {users.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            No users found. Create one to get started.
          </div>
        ) : (
          users.map((user) => (
            <div key={user.id} className="rounded-2xl border border-border bg-card shadow-sm p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">{user.email}</p>
                </div>
                <div className="shrink-0">
                  <Badge
                    variant={user.role === "admin" ? "default" : user.role === "author" ? "secondary" : "outline"}
                    className="capitalize font-bold rounded-lg px-2 py-0.5 text-xs"
                  >
                    {user.role}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-start gap-2 text-xs text-slate-500 pt-1">
                <span>Last login:</span>
                <span className="font-mono text-slate-400">{formatDate(user.lastLogin)}</span>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Link href={`/admin/users/${user.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full h-10 text-xs gap-1.5 rounded-md">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                </Link>
                {userIsAdmin && user.id !== currentUserId && (
                  <div className="flex-1">
                    <DeleteUserButton
                      userId={user.id}
                      userName={user.name}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
