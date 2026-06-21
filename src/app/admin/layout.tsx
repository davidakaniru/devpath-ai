import { Sidebar } from "@/components/layout/sidebar";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Activity,
  BarChart3,
  LayoutDashboard,
  Library,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/content", label: "Content", icon: Library },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/monitoring", label: "Monitoring", icon: Activity },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { fullName: true, email: true },
  });

  if (!user) redirect("/login");

  return (
    <div className="dark flex min-h-screen flex-col bg-background lg:flex-row">
      <Sidebar
        user={user}
        navItems={navItems}
        homeHref="/admin"
        brandLabel="DevPath Admin"
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
