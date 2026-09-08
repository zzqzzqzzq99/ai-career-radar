import type { Metadata } from "next";
import "./globals.css";

const title = "AI 转型求职雷达｜公开招聘情报看板";
const description =
  "帮助法律人和其他行业从业者按背景、地点与合作形式检索 AI 岗位，并追踪法律 AI、专业评测、产品和交付机会。";
const metadataBase = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    "https://zzqzzqzzq99.github.io/ai-career-radar/",
);

export const metadata: Metadata = {
  metadataBase,
  title,
  description,
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title,
    description,
    type: "website",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: title }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
