import { getProduct, getProducts } from "@/lib/products";
import { createSeo, SITE_URL, DEFAULT_IMAGE } from "@/components/Seo";
import ProductContent from "@/ui/ProductContent";
import { Suspense } from "react";
import Loading from "@/components/Loading";
import Link from "next/link";
export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (product) {
    const images = Array.isArray(product.images)
      ? product.images
      : product.images
        ? [product.images]
        : [];
    const specs = product.specs || {};
    const features = product.features || [];
    const productImage = images[0] || DEFAULT_IMAGE;
    const productDescription =
      product.description || `Buy ${product.name} from TruePower Kenya.`;
    const productJsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      image: images.length ? images : [DEFAULT_IMAGE],
      description: productDescription,
      sku: product.model || String(product.id),
      brand: {
        "@type": "Brand",
        name: "TruePower Kenya",
      },
      offers: {
        "@type": "Offer",
        priceCurrency: "KES",
        price: String(product.price),
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/product/${product.id}`,
      },
    };
  } else {
    return {
      title: "Not Found",
      description: "The product you are looking for does not exist.",
    };
  }
}
export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);

  const { data: related } = await getProducts({
    category: product.cat,
    limit: 5,
    excludeId: product.id,
  });
  return (
    <>
      {!product ? (
        <main className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-6xl mb-4">😕</p>
            <h2 className="font-display font-bold text-2xl text-ink mb-2">
              Product not found
            </h2>
            <Link href="/shop" className="btn-primary mt-4">
              Back to Shop
            </Link>
          </div>
        </main>
      ) : (
        <ProductContent product={product} related={related} />
      )}
    </>
  );
}
