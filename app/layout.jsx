import "./globals.css";
import { DEFAULT_IMAGE, SITE_URL } from "@/components/Seo";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "TruePower Kenya",
    template: "%s | TruePower Kenya",
  },
  description:
    "Water heaters, solar, pumps, and electrical solutions for Kenyan homes.",
  applicationName: "TruePower Kenya",
  authors: [{ name: "TruePower Kenya" }],
  creator: "TruePower Kenya",
  publisher: "TruePower Kenya",
  openGraph: {
    siteName: "TruePower Kenya",
    type: "website",
    images: [{ url: DEFAULT_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    images: [DEFAULT_IMAGE],
  },
};

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <Navbar></Navbar>
            <CartDrawer></CartDrawer>
            {children}
            <Footer></Footer>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
