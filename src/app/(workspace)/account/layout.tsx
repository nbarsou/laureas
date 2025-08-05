// app/account/layout.tsx
import { AccountSideNav } from "@/components/AccountSideNav";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AccountSideNav />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
