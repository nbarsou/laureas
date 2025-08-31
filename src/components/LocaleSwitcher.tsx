"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    if (newLocale !== locale) {
      router.replace({ pathname }, { locale: newLocale });
      router.refresh();
    }
  };

  return (
    <Select value={locale} onValueChange={switchLocale}>
      <SelectTrigger className="h-9 w-[130px] rounded-full">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="es">Spanish</SelectItem>
      </SelectContent>
    </Select>
  );
}
