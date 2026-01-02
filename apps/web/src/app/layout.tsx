import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OpenThat.link",
  description:
    "Open links in your browser from Zapier, n8n, or any webhook-capable tool.",
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
