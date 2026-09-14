import { hasSupabaseConfig, supabase } from "@/lib/supabase";
import ServicesClient from "../../components/ServicesClient";
import Link from "next/link";

import { createSeo } from "@/components/Seo";
import ProjectGallery from "@/components/ProjectGallery";
import LivelyTrustStrip from "@/components/LivelyTrustStrip";
import LivelyCategoryRail from "@/components/LivelyCategoryRail";
import LivelyShowcase from "@/components/LivelyShowcase";
import LivelyProductRail from "@/components/LivelyProductRail";
import { getProducts } from "@/lib/products";
import {
  ArrowRight,
  Check,
  Zap,
  Sun,
  Droplets,
  ToggleRight,
  Wrench,
  PhoneCall,
  Sparkles,
  Clock,
  Shield,
  ShieldCheck,
  Star,
  Award,
  Truck,
  MessageCircle,
} from "lucide-react";

// ✅ SEO
export const metadata = createSeo({
  title: "Services",
  description:
    "Expert installation and repair services for instant showers, solar systems, inverters, CCTV, electric fences, and more across Nairobi.",
  path: "/services",
});

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  let services = [];
  if (hasSupabaseConfig()) {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true });

    if (error) {
      console.error(error);
    }
    services = data || [];
  }
  const productData = await getProducts({ pageSize: 12, limit: 12, sort: "newest" });
  const stats = [
    { value: "500+", label: "Projects Completed", icon: Award },
    { value: "98%", label: "Customer Satisfaction", icon: Star },
    { value: "24/7", label: "WhatsApp Support", icon: MessageCircle },
    { value: "2hr", label: "Response Time", icon: Clock },
  ];
  const serviceSlides = services.flatMap((service) => (service.images?.length ? service.images.slice(0, 1).map((image) => ({ image: image.url || image, kicker: service.category || "TruePower service", title: service.title, description: service.description || "Professional support from quote to completion.", href: "#services", action: "Explore service" })) : service.image_url ? [{ image: service.image_url, kicker: service.category || "TruePower service", title: service.title, description: service.description || "Professional support from quote to completion.", href: "#services", action: "Explore service" }] : []));
  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <LivelyShowcase slides={serviceSlides} categories={services.slice(0, 6).map((service) => ({ image: service.images?.[0]?.url || service.image_url, label: service.title || "Installation service", href: "#services" })).filter((item) => item.image)} />
      <LivelyProductRail products={productData?.data || []} title="Products we install and support" subtitle="Choose the right shower, heater, pump, solar or electrical solution." />
      <section className="relative flex min-h-[60vh] items-center overflow-hidden border-b border-orange-100 bg-[linear-gradient(135deg,#fffaf4_0%,#fff_52%,#eef5ff_100%)]">
        <div className="absolute inset-0">
          <div className="absolute -left-20 top-20 h-96 w-96 animate-drift rounded-full bg-[#ffd92f]/25 blur-3xl" />
          <div className="absolute -right-20 bottom-20 h-96 w-96 animate-float rounded-full bg-[#ff8a65]/15 blur-3xl" />
        </div>

        <div className="relative w-full mx-auto px-4 py-16 sm:px-6 sm:py-20 lg:px-10 xl:px-12">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-1.5 shadow-sm backdrop-blur">
              <Sparkles size={16} className="text-brand-500" />
              <span className="text-slate-700 text-sm font-medium">
                Expert Services in Nairobi
              </span>
            </div>
            <h1 className="animate-fade-up font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl text-slate-950 mb-6 leading-tight" style={{ animation: "fadeUp 0.7s ease-out forwards" }}>
              Professional <br />
              <span className="text-brand-500">Installation & Repair</span>
            </h1>
            <p className="animate-fade-up text-slate-600 text-base sm:text-lg lg:text-xl mb-8 max-w-xl leading-relaxed" style={{ animation: "fadeUp 0.7s ease-out 120ms forwards" }}>
              From electric fence and CCTV to instant showers, solar systems,
              inverters, and appliance repair - Nairobi&apos;s most trusted service
              team.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://wa.me/254701039256"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-full bg-[#ffd92f] px-8 py-3.5 font-display font-bold text-slate-950 shadow-lg transition-all hover:scale-105"
              >
                <MessageCircle size={18} /> Talk to an Expert
              </a>
              <Link
                href="/portfolio"
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-3.5 font-display font-bold text-slate-700 shadow-sm transition-all hover:scale-105"
              >
                View Portfolio <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <LivelyTrustStrip items={["FAST QUOTES", "CERTIFIED TECHNICIANS", "SAME-DAY NAIROBI SERVICE", "WARRANTY ON OUR WORK", "WHATSAPP SUPPORT"]} />
      <LivelyCategoryRail items={[{ label: "Instant showers", icon: "Droplets", href: "#services" }, { label: "Solar systems", icon: "Sun", href: "#services" }, { label: "Electrical", icon: "Zap", href: "#services" }, { label: "Repairs", icon: "Wrench", href: "#services" }]} />

      <section className="border-b border-border bg-white relative z-10 container">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="text-brand-500 mb-2 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  <stat.icon size={28} />
                </div>
                <p className="font-display font-extrabold text-3xl text-ink">
                  {stat.value}
                </p>
                <p className="text-sub text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <ServicesClient services={services} />
    </main>
  );
}
