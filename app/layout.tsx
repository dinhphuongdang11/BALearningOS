import "./globals.css";
import React from "react";

export const metadata = {
  title: "BA Learning OS - Hệ điều hành học tập BA chuyên nghiệp",
  description: "Xây dựng định hướng và lộ trình học tập Business Analyst bài bản theo từng giai đoạn.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
