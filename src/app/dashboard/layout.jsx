export const dynamic = "force-dynamic";

import DashboardLayoutClient from "@/Components/Dashboard/DashboardLayoutClient";
import { DashboardThemeProvider } from "@/context/DashboardThemeContext";
import { getAuthUser } from "@/fetch-API/getAuthUser";
import { switzer } from "@/lib/fonts";
import "./dashboard-tailwind.css";
import "./dashboard.css";

export const metadata = {
  title: "Tekzo Dashboard - Account & Orders",
  description:
    "Manage your Tekzo profile, orders, addresses, and purchase points.",
};

export default async function DashboardLayout({ children }) {
  const user = await getAuthUser();

  return (
    <div
      className={`${switzer.className} font-sans min-h-screen w-full bg-transparent antialiased no-scrollbar`}
    >
      <style>{`
        /* Complete scrollbar elimination for all dashboard routes */
        html, body {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
          overflow-y: auto !important;
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
          background: transparent !important;
        }
        * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
          background: transparent !important;
        }
      `}</style>
      <DashboardThemeProvider>
        <DashboardLayoutClient user={user}>
          {children}
        </DashboardLayoutClient>
      </DashboardThemeProvider>
    </div>
  );
}
