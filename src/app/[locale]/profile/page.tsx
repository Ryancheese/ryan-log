import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfilePanel } from "@/components/profile-panel";
import { SUPPORTED_LOCALES, isSupportedLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

type LocaleProfilePageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleProfilePageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    return {};
  }
  const messages = getMessages(locale as Locale);
  return {
    title: messages.profile,
    description: messages.profileDesc,
  };
}

export default async function LocaleProfilePage({ params }: LocaleProfilePageProps) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return (
    <div className="flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center py-12">
      <ProfilePanel locale={locale as Locale} />
    </div>
  );
}
