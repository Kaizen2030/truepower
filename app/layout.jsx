import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { BlogProvider } from "@/context/BlogContext";
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
