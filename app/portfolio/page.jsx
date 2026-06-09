import Link from "next/link";
import {
  Star,
  MessageCircle,
  MapPin,
  Users,
  Sparkles,
  Award,
  Truck,
  Shield,
  Droplets,
  Sun,
  Store,
  Camera,
  Briefcase,
  ThumbsUp,
  ArrowRight,
  Quote,
} from "lucide-react";

import {
  getGalleryImages,
  getTestimonials,
  getPageContent,
} from "@/lib/supabase";
import { createSeo, SITE_URL, DEFAULT_IMAGE } from "@/components/Seo";
import ProjectGallery from "@/components/ProjectGallery";

// ✅ SEO
export const metadata = createSeo({
  title: "Professional Services | Water Heaters, Solar & Electrical",
  description:
    "TruePower Kenya - electric fence, CCTV, gate automation, inverters, solar, water heaters, fridge repair, washing machine repair and more across Nairobi.",
  path: "/services",
});

const PortfolioIconMap = {
  Star,
  MessageCircle,
  MapPin,
  Users,
  Sparkles,
  Award,
  Truck,
  Shield,
  Droplets,
  Sun,
  Store,
  Camera,
  Briefcase,
  ThumbsUp,
  ArrowRight,
  Quote,
};

function DynamicPortfolioIcon({ name, size = 24 }) {
  const IconComponent = PortfolioIconMap[name] || Sparkles;
  return <IconComponent size={size} />;
}

export default async function PortfolioPage() {
  const [galleryImages, testimonials, content] = await Promise.all([
    getGalleryImages(),
    getTestimonials(),
    getPageContent("portfolio"),
  ]);

  const pageData = content?.main ?? content ?? {};

  const categories = pageData?.galleryCategories || [
    { key: "all", label: "All Work", icon: <Briefcase size={14} /> },
    {
      key: "installation",
      label: "Installations",
      icon: <Sparkles size={14} />,
    },
    { key: "showroom", label: "Showroom", icon: <Camera size={14} /> },
    { key: "product", label: "Products", icon: <ThumbsUp size={14} /> },
  ];

  const stats = pageData?.stats?.items ||
    pageData?.stats || [
      { value: "500+", label: "Happy Customers", icon: <Users size={24} /> },
      { value: "4.9★", label: "Average Rating", icon: <Star size={24} /> },
      {
        value: "24/7",
        label: "WhatsApp Support",
        icon: <MessageCircle size={24} />,
      },
      { value: "Same Day", label: "Nairobi Pickup", icon: <Truck size={24} /> },
    ];

  const hero = pageData?.hero || {
    badge: "TruePower Portfolio",
    title: "Our Portfolio",
    subtitle:
      "Real installations, genuine reviews, and proof that we deliver reliable water, solar and electrical solutions for Kenyan homes.",
  };

  const gallerySection = pageData?.gallerySection || {
    title: "Project Gallery",
    subtitle:
      "Browse recent installations, product finishes, and highlights from completed projects.",
  };

  const testimonialsSection = pageData?.testimonialsSection || {
    title: "Customer Feedback",
    subtitle: "Real feedback from real customers across Kenya.",
  };

  const promiseSection = pageData?.promiseSection || {
    title: "Our Promise",
    subtitle: "What makes us different",
  };

  const cta = pageData?.cta || {
    title: "Ready to find the right solution for your home?",
    subtitle:
      "Chat with us on WhatsApp — we’ll help you choose the right water heater, pump or solar option.",
    button_text: "WhatsApp Us",
    button_link: "https://wa.me/254701039256",
  };

  return (
    <main className="min-h-screen bg-white ">
      {/* HERO */}
      <section className="relative bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white overflow-hidden">
        <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-10 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mb-6">
            <Sparkles size={16} />
            <span className="text-sm font-medium">{hero.badge}</span>
          </div>
          <h1 className="text-5xl font-extrabold mb-4">{hero.title}</h1>
          <p className="text-lg max-w-2xl mx-auto">{hero.subtitle}</p>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-border bg-white container">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="text-brand-500 mb-2 flex justify-center group-hover:scale-110 transition-transform">
                  {typeof stat.icon === "string" ? (
                    <DynamicPortfolioIcon name={stat.icon} size={24} />
                  ) : (
                    stat.icon
                  )}
                </div>
                <p className="font-display font-extrabold text-2xl text-ink">
                  {stat.value}
                </p>
                <p className="text-sub text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 lg:py-20 bg-muted">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="text-center mb-12">
            <div className="badge mb-4">⚡ How It Works</div>
            <h2 className="font-display font-extrabold text-3xl lg:text-4xl text-ink mb-4">
              From "I Need Hot Water" to <br />
              <span className="text-brand-500">"This is Perfect"</span>
            </h2>
            <p className="text-sub max-w-xl mx-auto">
              3 simple steps. No confusion. No wrong purchases.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: <MessageCircle size={32} />,
                title: "Tell Us Your Situation",
                desc: "“I have borehole water and low pressure in my apartment” — that is all we need to start.",
                color: "from-blue-500 to-blue-600",
              },
              {
                step: "02",
                icon: <Award size={32} />,
                title: "Get Expert Recommendations",
                desc: "We share models, prices, and explain why each choice works for your setup.",
                color: "from-emerald-500 to-emerald-600",
              },
              {
                step: "03",
                icon: <Truck size={32} />,
                title: "Order & Install",
                desc: "Pickup from our CBD shop or arrange delivery — with clear installation guidance.",
                color: "from-purple-500 to-purple-600",
              },
            ].map((step) => (
              <div key={step.step} className="relative group">
                <div
                  className={`bg-gradient-to-br ${step.color} rounded-2xl p-6 text-white text-center relative z-10 transition-all hover:-translate-y-2 hover:shadow-xl`}
                >
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    {step.icon}
                  </div>
                  <div className="absolute -top-3 -left-3 w-10 h-10 bg-white rounded-full flex items-center justify-center text-ink font-display font-bold shadow-md">
                    {step.step}
                  </div>
                  <h3 className="font-display font-bold text-xl mb-3">
                    {step.title}
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ✅ PROJECT GALLERY (CLIENT) */}
      <section className="container">
        <ProjectGallery
          galleryImages={galleryImages || []}
          categories={categories}
          gallerySection={gallerySection}
        />
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 lg:py-20 bg-muted">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="text-center mb-12">
            <div className="badge mb-4">{testimonialsSection.title}</div>
            <h2 className="font-display font-extrabold text-3xl lg:text-4xl text-ink mb-4">
              {testimonialsSection.title}
            </h2>
            <p className="text-sub max-w-xl mx-auto">
              {testimonialsSection.subtitle}
            </p>
          </div>

          {testimonials.length === 0 ? (
            <div className="text-center py-16">
              <Star size={48} className="mx-auto text-faint mb-4" />
              <p className="text-sub">No testimonials yet. Check back soon!</p>
              <p className="text-faint text-sm mt-2">
                Admins can add testimonials in the dashboard
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t, idx) => (
                <div
                  key={t.id || idx}
                  className="bg-white rounded-2xl p-6 border border-border hover:shadow-product-hover transition-all group"
                >
                  <div className="flex gap-1 mb-4 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < (t.rating || 5) ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                  <Quote size={24} className="text-brand-200 mb-3" />
                  <p className="text-ink mb-4 leading-relaxed italic">
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-3 pt-3 border-t border-border">
                    <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-display font-bold">
                      {t.name?.charAt(0) || "C"}
                    </div>
                    <div>
                      <p className="font-display font-semibold text-ink text-sm">
                        {t.name}
                      </p>
                      <p className="text-sub text-xs flex items-center gap-1">
                        <MapPin size={10} /> {t.location || "Kenya"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PROMISE */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="text-center mb-12">
            <div className="badge mb-4">{promiseSection.title}</div>
            <h2 className="font-display font-extrabold text-3xl lg:text-4xl text-ink mb-4">
              {promiseSection.subtitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Shield size={28} />,
                title: "Borehole Ready",
                desc: "Heavy-duty copper coils that resist corrosion. Lasts 3x longer in salty water.",
                color: "bg-blue-50 text-blue-600",
              },
              {
                icon: <Droplets size={28} />,
                title: "Low Pressure? Solved",
                desc: "Built-in booster pumps that work even when your tank is on the ground floor.",
                color: "bg-emerald-50 text-emerald-600",
              },
              {
                icon: <Sun size={28} />,
                title: "Solar Compatible",
                desc: "Works alongside your existing solar system. Heat water efficiently even on cloudy days.",
                color: "bg-yellow-50 text-yellow-600",
              },
              {
                icon: <Store size={28} />,
                title: "See Before You Buy",
                desc: "Visit our Nyamakima showroom. See products in person, get expert advice.",
                color: "bg-purple-50 text-purple-600",
              },
            ].map((service) => (
              <div
                key={service.title}
                className="group text-center p-6 rounded-2xl border border-border hover:shadow-product-hover transition-all hover:-translate-y-1 bg-white"
              >
                <div
                  className={`${service.color} w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                >
                  {service.icon}
                </div>
                <h3 className="font-display font-bold text-lg text-ink mb-2">
                  {service.title}
                </h3>
                <p className="text-sub text-sm leading-relaxed">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center bg-brand-700 text-white">
        <h2 className="text-3xl font-extrabold mb-4">{cta.title}</h2>
        <p className="mb-6">{cta.subtitle}</p>

        <a
          href={cta.button_link}
          target="_blank"
          className="bg-white text-black px-6 py-3 rounded-full"
        >
          {cta.button_text}
        </a>

        <Link href="/shop" className="ml-4 underline">
          Browse Products
        </Link>
      </section>
    </main>
  );
}
