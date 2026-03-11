"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { LocaleToggle } from "@/components/shared/locale-toggle";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { AppLogo } from "@/components/shared/logo";

interface HeaderProps {
  locale: string;
}

export function Header({ locale }: HeaderProps) {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur shadow-sm dark:shadow-none">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={`/${locale}`} className="flex items-center gap-2.5">
          <AppLogo size={36} />
          <div className="flex flex-col leading-tight">
            {/* <span className="text-lg font-bold text-[#D4690E]">كام؟</span> */}
            {/* <span className="hidden sm:block text-[#D4690E] dark:text-[#D4690E] text-l leading-none">
              Kam Biyakhod?
            </span> */}
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href={`/${locale}`}
            className="hidden sm:block text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors px-2">
            {t("explore")}
          </Link>
          <Link
            href={`/${locale}/submit`}
            className="inline-flex items-center justify-center rounded-lg bg-[#D4690E] px-4 py-2 text-sm font-medium text-white hover:bg-[#b85a0c] transition-colors">
            {t("submit")}
          </Link>
          <LocaleToggle locale={locale} />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
