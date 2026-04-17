import type { Metadata } from "next";
import { ProfilePanel } from "@/components/profile-panel";

export const metadata: Metadata = {
  title: "个人信息",
  description: "Ryan 的个人资料、联系方式与网易云音乐人主页。",
};

export default function ProfilePage() {
  return (
    <div className="flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center py-12">
      <ProfilePanel />
    </div>
  );
}
