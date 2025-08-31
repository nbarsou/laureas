import { cn } from "@/lib/utils";

interface HeaderProps {
  label: string;
}

export function AuthHeader({ label }: HeaderProps) {
  return (
    <div className="w-full flex flex-col gap-y-4 items-center justify-center">
      <h1 className={cn("text-3xl font-semibold")}>Laureas</h1>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
