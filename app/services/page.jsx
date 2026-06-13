import { hasSupabaseConfig, supabase } from "@/lib/supabase";
import ServicesClient from "../../components/ServicesClient";
import Link from "next/link";

import { createSeo } from "@/components/Seo";
import ProjectGallery from "@/components/ProjectGallery";
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
    "Expert installation and repair services for water heaters, solar systems, inverters, CCTV, electric fences, and more across Nairobi.",
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
  const stats = [
    { value: "500+", label: "Projects Completed", icon: Award },
    { value: "98%", label: "Customer Satisfaction", icon: Star },
    { value: "24/7", label: "WhatsApp Support", icon: MessageCircle },
    { value: "2hr", label: "Response Time", icon: Clock },
  ];
  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500">
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute top-20 -left-20 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-20 -right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-pulse" />
        </div>

        <div className="relative w-full mx-auto px-4 py-16 sm:px-6 sm:py-20 lg:px-10 xl:px-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
              <Sparkles size={16} className="text-yellow-300" />
              <span className="text-white/90 text-sm font-medium">
                Expert Services in Nairobi
              </span>
            </div>
            <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl text-white mb-6 leading-tight">
              Professional <br />
              <span className="text-yellow-300">Installation & Repair</span>
            </h1>
            <p className="text-white/90 text-base sm:text-lg lg:text-xl mb-8 max-w-xl leading-relaxed">
              From electric fence and CCTV to water heaters, solar systems,
              inverters, and appliance repair - Nairobi&apos;s most trusted service
              team.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://wa.me/254701039256"
                target="_blank"
                rel="noreferrer"
                className="bg-white text-brand-600 hover:bg-brand-50 px-8 py-3.5 rounded-full font-display font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-lg"
              >
                <MessageCircle size={18} /> Talk to an Expert
              </a>
              <Link
                href="/portfolio"
                className="bg-brand-500 hover:bg-brand-400 text-white px-8 py-3.5 rounded-full font-display font-bold flex items-center gap-2 transition-all hover:scale-105 border border-white/20"
              >
                View Portfolio <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

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
