import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./globals.mobile.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://khanhlinhtrans.vn"),
  title: "KhanhLinh Trans | Dịch Vụ Thuê Xe Doanh Nghiệp & Du Lịch",
  description:
    "Website giới thiệu dịch vụ cho thuê xe cao cấp của KhanhLinh Trans, tối ưu cho doanh nghiệp, đoàn khách và lịch trình du lịch tại miền Trung.",
  keywords: [
    "KhanhLinh Trans",
    "thuê xe du lịch",
    "thuê xe doanh nghiệp",
    "airport transfer",
    "xe đưa đón đoàn"
  ],
  openGraph: {
    title: "KhanhLinh Trans",
    description:
      "Giải pháp vận chuyển cao cấp cho doanh nghiệp, sự kiện và du lịch tại miền Trung.",
    siteName: "KhanhLinh Trans",
    locale: "vi_VN",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "KhanhLinh Trans",
    description:
      "Đặt xe nhanh cho doanh nghiệp và đoàn khách với đội xe hiện đại, tài xế chuyên nghiệp."
  },
  alternates: {
    canonical: "/"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="/icon/font-awesome/css/all.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
