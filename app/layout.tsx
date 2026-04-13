import type { Metadata } from "next";
import "./globals.css";
import "./crt.css";
import CRTWrapper from "@/components/CRTWrapper";
import PageTransition from "@/components/PageTransition";
import ParticleFieldDynamic from "@/components/ParticleFieldDynamic";
import { LangProvider } from "@/lib/langContext";

export const metadata: Metadata = {
  title: "TERMINAL",
  description:
    "Seoul-based techno platform designing an industrial station where audio signals and data intersect.",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning={true}>
      <body className="font-orbit bg-terminal-bg-base overflow-x-hidden">
        <LangProvider>
          <CRTWrapper>
            <ParticleFieldDynamic />
            <PageTransition>
              {children}
            </PageTransition>
          </CRTWrapper>
        </LangProvider>
      </body>
    </html>
  );
}
