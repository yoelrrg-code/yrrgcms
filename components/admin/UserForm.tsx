"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { createUser, updateUser } from "@/lib/actions/users";

interface UserFormProps {
  user?: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "author" | "customer";
  } | null;
}

export function UserForm({ user }: UserFormProps) {
  const isNew = !user;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "author" | "customer">(user?.role ?? "customer");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (isNew && !password.trim()) {
      setError("Password is required when creating a new user.");
      return;
    }

    startTransition(async () => {
      try {
        if (isNew) {
          await createUser({ name, email, password, role });
          setSuccess("User created successfully.");
        } else {
          await updateUser(user.id, {
            name,
            email,
            role,
            ...(password.trim() ? { password } : {}),
          });
          setSuccess("User updated successfully.");
        }

        // Brief delay so the user sees the success message
        setTimeout(() => {
          router.push("/admin/users");
          router.refresh();
        }, 800);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An error occurred. Please try again."
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      {/* Feedback messages */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Jane Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isPending}
        />
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="jane@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isPending}
        />
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="password">
          Password{" "}
          {!isNew && (
            <span className="text-muted-foreground font-normal text-xs">
              (leave blank to keep current)
            </span>
          )}
        </Label>
        <Input
          id="password"
          type="password"
          placeholder={isNew ? "Minimum 6 characters" : "••••••••"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={isNew}
          minLength={isNew ? 6 : undefined}
          disabled={isPending}
        />
      </div>

      {/* Role */}
      <div className="space-y-1.5">
        <Label htmlFor="role">Role</Label>
        <Select
          value={role}
          onValueChange={(v) => setRole(v as "admin" | "author")}
          disabled={isPending}
        >
          <SelectTrigger id="role">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="author">Author</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Admins have full access. Authors can manage their own content only.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              {isNew ? "Creating…" : "Saving…"}
            </>
          ) : isNew ? (
            "Create User"
          ) : (
            "Save Changes"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => router.push("/admin/users")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
