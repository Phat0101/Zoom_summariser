import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zoom summariser",
  description: "Summarise Zoom meetings for WSU guest speakers/lecturers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={''}>
        {children}
      </body>
    </html>
  );
}
