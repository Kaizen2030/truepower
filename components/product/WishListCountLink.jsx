"use client";
import { Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
export default function WishListCountLink({ count }) {
  const { wishlistCount } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link
      href="/wishlist"
      className="text-sub hover:text-ink hover:bg-muted rounded-lg transition-all relative"
    >
      <Heart size={18} />
      {mounted && wishlistCount > 0 && (
        <span className="absolute -top-1 -right-1 w-[14px] h-[14px] bg-brand-500 rounded-full text-[9px] font-bold flex items-center justify-center text-white leading-none">
          {wishlistCount}
        </span>
      )}
    </Link>
  );
}
