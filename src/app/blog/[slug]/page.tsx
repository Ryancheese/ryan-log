import { redirect } from "next/navigation";

type LegacyPostPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function LegacyBlogPostPage({ params }: LegacyPostPageProps) {
  const { slug } = await params;
  redirect(`/zh/blog/${slug}`);
}
