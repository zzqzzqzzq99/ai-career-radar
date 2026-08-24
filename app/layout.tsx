import type { Metadata } from "next";
import "./globals.css";

const title = "法律 AI 追踪｜招聘情报看板";
const description =
  "追踪企业法务 AI、法律科技、合规智能体岗位与能力趋势的公开招聘情报库。";
const metadataBase = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    "https://legal-ai-talent-radar.zhangzhuoqun70.chatgpt.site",
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
