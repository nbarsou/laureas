// app/dashboard/layout.tsx
import { Header } from "@/components/Header";
import { SideNav } from "@/components/SideNav"; // ← your earlier sidebar
// import { auth } from '@/lib/auth';                     // wrapper around NextAuth getServerSession

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch once, pass to client header
  // const session = await auth();

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
