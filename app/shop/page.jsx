// app/shop/page.jsx
import { createSeo, SITE_URL, DEFAULT_IMAGE } from "@/components/Seo";
import { Suspense } from "react";
import Loading from "@/components/Loading";
import ShopContent from "@/ui/ShopContent";

// ✅ SEO metadata (SERVER SIDE)
export const metadata = createSeo({
  title: "Shop Water Heaters, Pumps, Solar & Electrical Solutions",
  description: `Shop  at TruePower Kenya.`,
  path: "/shop",
});

// ✅ SERVER COMPONENT
export default async function ShopPage({ searchParams }) {
  return (
    <Suspense fallback={<Loading />}>
      <ShopContent searchParams={searchParams} />
    </Suspense>
  );
}
