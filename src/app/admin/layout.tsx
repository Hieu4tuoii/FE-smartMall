import "../globals.css";
import { AdminLayoutContent } from "./AdminLayoutContent";
import { ClientProviders } from "@/components/providers/ClientProviders";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          <AdminLayoutContent>{children}</AdminLayoutContent>
        </ClientProviders>
      </body>
    </html>
  );
}

