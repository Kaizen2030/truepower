"use client";
import Link from "next/link";
import {
  Heart,
  Search,
  Menu,
  X,
  ShoppingBag,
  User,
  LayoutDashboard,
  UserCog,
  ShieldCheck,
  LockOpen,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Suspense, useRef, useState } from "react";

import TruePowerLogo from "./TruePowerLogo";
import SearchProducts from "./SearchProducts";
import ShoppingTagButton from "@/components/product/ShoppingTagButton";
import WishListCountLink from "@/components/product/WishListCountLink";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const categories = [
    { key: "water_heaters", label: "Water Heaters" },
    { key: "bulbs_lighting", label: "Bulbs & Lighting" },
    { key: "switches_sockets", label: "Switches & Sockets" },
    { key: "solar_solutions", label: "Solar Solutions" },
    { key: "water_pumps", label: "Water Pumps" },
  ];

  const links = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    { to: "/portfolio", label: "Portfolio" },
    { to: "/services", label: "Services" },
    { to: "/blog", label: "Blog" },
    { to: "/about", label: "About" },
  ];

  const CATS = [
    { to: "/shop", label: "All Products" },
    { to: "/shop?category=water_heaters", label: "Water Heaters" },
    { to: "/shop?category=bulbs_lighting", label: "Bulbs & Lighting" },
    { to: "/shop?category=switches_sockets", label: "Switches & Sockets" },
    { to: "/shop?category=solar_solutions", label: "Solar Solutions" },
    { to: "/shop?category=water_pumps", label: "Water Pumps" },
  ];
  const auth = useAuth();
  const { user, isAdmin, signOut = async () => {}, profile } = auth ?? {};

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountRef = useRef(null);
  const accountBtnRef = useRef(null);
  const accountMenuRef = useRef(null);
  const [menuPos, setMenuPos] = useState(null);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setOpen(false);
      router.push("/");
    }
  };
  return (
    <>
      {/* Announcement bar (UNCHANGED) */}
      <div className="bg-blue-600 text-white text-xs text-center py-2 px-4 md:block hidden">
        📞 +254 701 039 256 · Nyamakima, Nairobi CBD · Mon–Sat 8am–6pm
      </div>

      <nav className="bg-white">
        <div className="w-full mx-auto container">
          <div className="flex items-center justify-between gap-6 h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <TruePowerLogo size={40} />
              <span className="font-bold">
                True<span className="text-blue-500">Power</span>
              </span>
            </Link>

            {/* SEARCH (UPGRADED ONLY) */}

            <div className="grow md:block hidden">
              <Suspense fallback={<div className="h-10" />}>
                <SearchProducts />
              </Suspense>
            </div>

            {/* RIGHT ICONS (UNCHANGED) */}
            <div className="flex items-center md:gap-4 sm:gap-3  gap-2">
              {/* Desktop profile / Login button placed next to wishlist/cart */}
              {user ? (
                <>
                  {isAdmin && (
                    <div>
                      <Link href="/admin" title="Access Admin Page">
                        <ShieldCheck size={16} />
                      </Link>
                    </div>
                  )}
                  <div className="inline-flex items-center" ref={accountRef}>
                    <button
                      type="button"
                      ref={accountBtnRef}
                      onClick={() => {
                        if (!accountMenuOpen) {
                          const r =
                            accountBtnRef.current.getBoundingClientRect();
                          setMenuPos({
                            top: Math.round(r.bottom + 8),
                            left: Math.round(r.right - 100),
                          });
                        }
                        setAccountMenuOpen((s) => !s);
                      }}
                      className="flex relative"
                    >
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt="avatar"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <User size={16} />
                      )}
                      <ChevronDown className="absolute w-3 h-3 -right-2 -bottom-0.5" />
                    </button>
                  </div>

                  {accountMenuOpen && menuPos && (
                    <div
                      ref={accountMenuRef}
                      style={{
                        position: "fixed",
                        top: menuPos.top,
                        left: menuPos.left,
                        width: 100,
                      }}
                      className="bg-white border border-border rounded-lg shadow-lg z-[9999]"
                    >
                      <div className="flex flex-col py-1">
                        <Link
                          href="/profile"
                          onClick={() => setAccountMenuOpen(false)}
                          className="px-4 py-2 text-sm text-ink hover:bg-muted"
                        >
                          Profile
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setAccountMenuOpen(false)}
                          className="px-4 py-2 text-sm text-ink hover:bg-muted"
                        >
                          Orders
                        </Link>
                        <button
                          onClick={() => {
                            setAccountMenuOpen(false);
                            handleLogout();
                          }}
                          className="text-left px-4 py-2 text-sm text-sub hover:bg-muted"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link href="/login" className="btn-primary btn-login">
                  <User size={16} className="hidden md:inline-flex" />
                  Login
                </Link>
              )}
              {/* Wishlist */}
              <WishListCountLink />

              {/* Shopping Tag */}
              <ShoppingTagButton />

              {/* Menu button open */}
              <button onClick={() => setOpen(!open)}>
                <Menu />
              </button>
            </div>
          </div>
        </div>
        <div className=" w-full mx-auto container flex  gap-2 flex-wrap py-2 border-b border-t border-border md:justify-between">
          {CATS.map((cat) => (
            <Link
              key={cat.to}
              href={cat.to}
              className="text-[12px] font-extrabold
            "
            >
              {cat.label}
            </Link>
          ))}
        </div>
        {/* SEARCH (UPGRADED ONLY) */}
        <div className="px-4 pt-3 sm:px-6 lg:px-10 xl:px-1 md:hidden block">
          <Suspense fallback={<div className="h-10" />}>
            <SearchProducts />
          </Suspense>
        </div>

        {/* Announcement bar (UNCHANGED) */}
        <div className="bg-blue-600 text-white text-xs text-center py-2 mt-3 px-4 block md:hidden">
          📞 +254 701 039 256 · Nyamakima, Nairobi CBD · Mon–Sat 8am–6pm
        </div>

        {/* links */}
        {open && (
          <div
            className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-40"
            onClick={() => setOpen(false)}
          />
        )}
        <div
          className={`fixed top-0 right-0  h-full bg-white z-50 px-4 py-3
  transition-transform duration-300 ease-in-out
  w-full md:w-[300px]
  ${open ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="pt-3 text-right">
            <button onClick={() => setOpen(!open)}>
              <X />
            </button>
          </div>
          <div className="flex flex-col uppercase ">
            {links.map((l) => (
              <Link
                key={l.to}
                href={l.to}
                onClick={() => setOpen(!open)}
                className="px-3 pb-3 font-extrabold"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}
