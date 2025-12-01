import "../globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { Header } from "@/components/custom/Header";
import { Footer } from "@/components/custom/Footer";
import { ChatBot } from "@/components/custom/ChatBot";
import { listAllCategoriesWithCache } from "@/services/categoryService";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) { 
  const categories = await listAllCategoriesWithCache();
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          <div>
            <Header categories={categories} />
            <main>{children}</main>
            <Footer />
            <ChatBot />
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
