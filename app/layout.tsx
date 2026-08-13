import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./crt.css";
import CRTWrapper from "@/components/CRTWrapper";
import PageTransition from "@/components/PageTransition";
import ParticleFieldDynamic from "@/components/ParticleFieldDynamic";
import { LangProvider } from "@/lib/langContext";
import { QueryProvider } from "@/providers/query-provider";
import { MotionProvider } from "@/providers/motion-provider";
import SkipLink from "@/components/ui/SkipLink";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TERMINAL",
    template: "%s | TERMINAL",
  },
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
    <html lang="ko">
      <body className={`${jetbrainsMono.variable} font-orbit bg-terminal-bg-base overflow-x-hidden`}>
        <QueryProvider>
          <LangProvider>
            <MotionProvider>
              <SkipLink />
              <CRTWrapper>
                <ParticleFieldDynamic />
                <PageTransition>
                  {children}
                </PageTransition>
              </CRTWrapper>
            </MotionProvider>
          </LangProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
