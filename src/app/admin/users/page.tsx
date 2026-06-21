"use client";

import { CAREER_GOAL_LABELS } from "@/lib/prompts/assessment";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: "LEARNER" | "ADMIN";
  careerGoal: string | null;
  experienceLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | null;
  createdAt: string;
  _count: { progress: number };
}

const roleStyles: Record<string, string> = {
  ADMIN: "bg-primary/15 text-primary border-primary/30",
  LEARNER: "border-border bg-muted text-foreground",
};

const experienceStyles: Record<string, string> = {
  BEGINNER: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  INTERMEDIATE: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ADVANCED: "bg-destructive/15 text-destructive border-destructive/30",
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to load users.");
          return;
        }
        setUsers(data.users);
      } catch {
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Users
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {loading ? "Loading…" : `${users.length} registered user${users.length === 1 ? "" : "s"}.`}
        </p>
      </div>

      {error && (
        <p className="text-[13px] text-destructive bg-destructive/8 border border-destructive/15 rounded-xl px-3.5 py-2.5">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader size={28} className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border-2 border-border bg-card">
          <table className="w-full min-w-200 text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Career Goal</th>
                <th className="px-5 py-3 font-semibold">Experience</th>
                <th className="px-5 py-3 font-semibold">Topics Completed</th>
                <th className="px-5 py-3 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border last:border-0 hover:bg-surface/40"
                >
                  <td className="px-5 py-3 font-medium">{user.fullName}</td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {user.email}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                        roleStyles[user.role],
                      )}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {user.careerGoal
                      ? CAREER_GOAL_LABELS[user.careerGoal] ?? user.careerGoal
                      : "—"}
                  </td>
                  <td className="px-5 py-3">
                    {user.experienceLevel ? (
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
                          experienceStyles[user.experienceLevel],
                        )}
                      >
                        {user.experienceLevel.toLowerCase()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">{user._count.progress}</td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              No users found.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
