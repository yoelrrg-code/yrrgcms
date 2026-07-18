"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { updateProfile } from "@/lib/actions/users";
import { sileo } from "sileo";

interface ProfileFormProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const parts = user.name.split(" ");
  const initialFirstName = parts[0] || "";
  const initialLastName = parts.slice(1).join(" ") || "";

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();

    if (!firstName.trim()) {
      sileo.error({ title: "First name is required." });
      return;
    }

    if (password && password !== confirmPassword) {
      sileo.error({ title: "Passwords do not match." });
      return;
    }

    startTransition(async () => {
      try {
        const combinedName = `${firstName.trim()} ${lastName.trim()}`.trim();
        await updateProfile({
          name: combinedName,
          ...(password ? { password } : {}),
        });
        
        sileo.success({ title: "Profile updated successfully." });
        setPassword("");
        setConfirmPassword("");
        
        // Refresh the router to update the session data in the layout/sidebar
        router.refresh();
      } catch (err) {
        sileo.error({
          title: err instanceof Error ? err.message : "Failed to update profile."
        });
      }
    });
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Update your personal information and account password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email (Readonly) */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address (Read-only)</Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="bg-muted text-muted-foreground cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
                required
              />
            </div>

            {/* Apellidos */}
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <h3 className="text-sm font-medium text-foreground">Change Password</h3>
            <p className="text-xs text-muted-foreground">
              Leave these fields blank if you do not want to change your current password.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nueva Contraseña */}
              <div className="space-y-1.5">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              {/* Confirmar Contraseña */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isPending} className="w-full md:w-auto">
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
