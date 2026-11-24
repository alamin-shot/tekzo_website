import "./globals.css";
import { CounterProvider } from "@/context/CounterContext";
import { CompareProvider } from "@/context/CompareContext";
import WelcomePopup from "@/Components/WelcomePopup";
import RouterStaleRecovery from "@/Components/ReuseableComponent/CustomUIComponent/RouterStaleRecovery";
import { switzer, bornomala, bornomalaTaka } from "@/lib/fonts";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${switzer.variable} ${bornomalaTaka.variable} ${bornomala.variable}`}>
      <body
        className={`${switzer.className} font-sans antialiased`}
        suppressHydrationWarning={true}
      >
        <CounterProvider>
          <CompareProvider>
            <WelcomePopup />
            <RouterStaleRecovery />
            {children}
          </CompareProvider>
        </CounterProvider>
      </body>
    </html>
  );
}
