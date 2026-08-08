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
import { UserPlus, SquarePen } from "lucide-react";

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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage admin and author accounts.
          </p>
        </div>
        <Link href="/admin/users/new">
          <Button className="gap-2 font-bold rounded-xl shadow-sm">
            <UserPlus className="size-4" />
            New User
          </Button>
        </Link>
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
                    <TableCell className="font-bold text-foreground">{user.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">
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
                    <TableCell className="text-sm text-muted-foreground font-mono whitespace-nowrap">
                      {formatDate(user.lastLogin)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/users/${user.id}`}>
                          <Button
                            size="icon"
                            variant="outline"
                            className="size-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                            title="Editar usuario"
                          >
                            <SquarePen className="size-4" />
                          </Button>
                        </Link>
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
                  <p className="font-bold text-sm text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">{user.email}</p>
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

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  <span>Last login: </span>
                  <span className="font-mono text-foreground font-medium">{formatDate(user.lastLogin)}</span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/admin/users/${user.id}`}>
                    <Button
                      size="icon"
                      variant="outline"
                      className="size-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                      title="Editar usuario"
                    >
                      <SquarePen className="size-4" />
                    </Button>
                  </Link>
                  {userIsAdmin && user.id !== currentUserId && (
                    <DeleteUserButton
                      userId={user.id}
                      userName={user.name}
                    />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
