// /components/form/FormRow.tsx
export function FormRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">{children}</div>
  );
}
