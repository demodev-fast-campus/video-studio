import type { Metadata } from "next";
import { VT323 } from "next/font/google";
import "./globals.css";

const pixelFont = VT323({
  weight: "400",
  variable: "--font-pixel",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Video Studio - AI Multi-Agent Video Production",
  description: "게더타운 스타일의 가상공간에서 AI 에이전트들이 협업하여 영상을 제작합니다",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${pixelFont.variable} font-pixel antialiased`}>
        {children}
      </body>
    </html>
  );
}
