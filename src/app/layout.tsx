import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rrsunureew.sn"),
  title: {
    default: "RR Sunu Reew - Renaissance Républicaine",
    template: "%s | RR Sunu Reew"
  },
  description: "Parti politique sénégalais Renaissance Républicaine Sunu Reew dirigé par le Secrétaire Général Abdoulaye Diouf Sarr. Ensemble, construisons un Sénégal prospère, uni et solidaire.",
  keywords: ["RR Sunu Reew", "Renaissance Républicaine", "Abdoulaye Diouf Sarr", "Sénégal", "Politique", "Parti politique"],
  authors: [{ name: "Renaissance Républicaine Sunu Reew" }],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "RR Sunu Reew - Renaissance Républicaine",
    description: "Parti politique sénégalais dirigé par Abdoulaye Diouf Sarr",
    url: "https://rrsunureew.sn",
    siteName: "RR Sunu Reew",
    type: "website",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "RR Sunu Reew - Renaissance Républicaine",
    description: "Parti politique sénégalais dirigé par Abdoulaye Diouf Sarr",
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#008751",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}