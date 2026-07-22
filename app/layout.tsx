import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./FloatingContactWidget.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://khanhlinhtrans.vn"),
  title: "Khánh Linh Trans | Dịch Vụ Thuê Xe Doanh Nghiệp & Du Lịch",
  description:
    "Website giới thiệu dịch vụ cho thuê xe cao cấp của Khánh Linh Trans, tối ưu cho doanh nghiệp, đoàn khách và lịch trình du lịch tại miền Trung.",
  keywords: [
    "Khánh Linh Trans",
    "thuê xe du lịch",
    "thuê xe doanh nghiệp",
    "airport transfer",
    "xe đưa đón đoàn"
  ],
  icons: {
    icon: "/images/logoKhanhLinh.png",
    shortcut: "/images/logoKhanhLinh.png",
    apple: "/images/logoKhanhLinh.png"
  },
  openGraph: {
    title: "Khánh Linh Trans",
    description:
      "Giải pháp vận chuyển cao cấp cho doanh nghiệp, sự kiện và du lịch tại miền Trung.",
    siteName: "Khánh Linh Trans",
    locale: "vi_VN",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Khánh Linh Trans",
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
        <link rel="icon" href="/images/logoKhanhLinh.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/logoKhanhLinh.png" />
        <link rel="stylesheet" href="/icon/font-awesome/css/all.css" precedence="default" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@300;400&display=swap" rel="stylesheet" precedence="default" />
      </head>
      <body>{children}</body>
    </html>
  );
}
