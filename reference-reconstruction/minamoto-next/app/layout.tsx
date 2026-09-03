import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "株式会社minamoto｜TO THE NEXT FUTURE",
  description:
    "株式会社minamoto — 企業の次の未来を、アイデアと実行力でつくる。コーポレート領域とレグテック領域から、資金・経営・評判・Web・SNS・広告・開発の課題に向き合います。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700;900&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
