import "../globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { Header } from "@radix-ui/react-accordion";
import { Footer } from "@/components/Footer";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) { 
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          <div>
            {/* <Header /> */}
            <main>{children}</main>
            <Footer />
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
