import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import FloatingProfileButton from "./components/FloatingProfileButton";

export const metadata: Metadata = {
  title: "Trolas Awards",
  description: "Votación para la ceremonia Trolas Awards",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

 return (
    <html lang="es">
      <body>
        <Providers>
          {session?.user && (
            <FloatingProfileButton
              name={session.user.name}
              image={(session.user as any).image}
            />
          )}
          {children}
        </Providers>
      </body>
    </html>
  );
}
