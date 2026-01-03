import type { Metadata } from "next";
import { getConfig } from "@otl/shared";
import "./globals.css";

const config = getConfig();

export const metadata: Metadata = {
  title: `${config.APP_NAME} - Open Links in Your Browser from Webhooks`,
  description:
    "Open links in your browser from Zapier, n8n, or any webhook-capable tool. No account needed, privacy-first, open source.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: config.APP_NAME,
    description:
      "Open links in your browser from Zapier, n8n, or any webhook-capable tool.",
    url: config.PUBLIC_BASE_URL,
    siteName: config.APP_NAME,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${config.APP_NAME} - Open links in your browser from webhooks`,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: config.APP_NAME,
    description:
      "Open links in your browser from Zapier, n8n, or any webhook-capable tool.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
