import type { Metadata } from "next";
import "./globals.css";

const title = "法律 AI 追踪｜招聘情报看板";
const description =
  "按六类岗位族追踪法律 AI、法务数智化、知识评测与相邻智能体岗位，并标注来源层级和最近核验时间。";
const metadataBase = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    "https://hermes-nomos.github.io/legal-ai-job-tracker/",
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
