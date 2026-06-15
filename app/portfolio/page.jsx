import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Award,
  Briefcase,
  Camera,
  Droplets,
  MapPin,
  MessageCircle,
  Quote,
  Shield,
  Sparkles,
  Star,
  Store,
  Sun,
  Truck,
  Users,
} from "lucide-react";

import { getGalleryImages, getTestimonials, getPageContent } from "@/lib/supabase";
import { createSeo } from "@/components/Seo";
import ProjectGallery from "@/components/ProjectGallery";

export const metadata = createSeo({
  title: "Portfolio & Installations",
  description:
    "Browse TruePower Kenya projects, customer testimonials, and proof of installation quality across Nairobi and beyond.",
  path: "/portfolio",
});

export const dynamic = "force-dynamic";

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
};

function DynamicPortfolioIcon({ name, size = 24, className = "" }) {
  const IconComponent = PortfolioIconMap[name] || Sparkles;
  return <IconComponent size={size} className={className} />;
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
    { key: "installation", label: "Installations", icon: <Camera size={14} /> },
    { key: "showroom", label: "Showroom", icon: <Store size={14} /> },
    { key: "product", label: "Products", icon: <Droplets size={14} /> },
  ];

  const stats =
    pageData?.stats?.items ||
    pageData?.stats || [
      { value: "500+", label: "Projects completed", icon: "Users" },
      { value: "4.9", label: "Average rating", icon: "Star" },
      { value: "24/7", label: "WhatsApp support", icon: "MessageCircle" },
      { value: "Same day", label: "Nairobi pickup", icon: "Truck" },
    ];

  const hero =
    pageData?.hero || {
      badge: "Portfolio",
      title: "Installations, products, and customer results.",
      subtitle:
        "A clear view of the work we do, the results we deliver, and the quality customers can expect from TruePower.",
    };

  const gallerySection =
    pageData?.gallerySection || {
      title: "Project Gallery",
      subtitle:
        "Recent installations, showroom photos, and product highlights from completed work.",
    };

  const testimonialsSection =
    pageData?.testimonialsSection || {
      title: "Customer Feedback",
      subtitle: "Real feedback from real customers across Kenya.",
    };

  const promiseSection =
    pageData?.promiseSection || {
      title: "What We Stand For",
      subtitle: "Practical guidance, dependable products, and after-sales support.",
    };

  const cta =
    pageData?.cta || {
      title: "Need help choosing the right solution?",
      subtitle:
        "Chat with us on WhatsApp and we will help you match the right water heater, pump, solar setup, or electrical product to your needs.",
      button_text: "WhatsApp Us",
      button_link: "https://wa.me/254701039256",
    };

  const heroShots = (galleryImages || []).filter((image) => image?.image_url).slice(0, 4);
  const ctaVisual = heroShots[1] || heroShots[0];

  const processSteps = [
    {
      step: "01",
      icon: MessageCircle,
      title: "Share your setup",
      desc: "Tell us about your water pressure, building type, or power setup and we will guide you from there.",
    },
    {
      step: "02",
      icon: Award,
      title: "Get a clear recommendation",
      desc: "We suggest the right product options, explain the trade-offs, and keep the pricing straightforward.",
    },
    {
      step: "03",
      icon: Truck,
      title: "Order, pick up, or install",
      desc: "Collect from the showroom or arrange delivery with installation guidance where needed.",
    },
  ];

  const promiseCards = [
    {
      icon: Shield,
      title: "Built for local conditions",
      desc: "Products chosen with Kenyan water pressure, borehole use, and installation realities in mind.",
    },
    {
      icon: Droplets,
      title: "Low-pressure support",
      desc: "Water heaters and pumps that are selected to perform reliably in difficult pressure conditions.",
    },
    {
      icon: Sun,
      title: "Solar-friendly choices",
      desc: "Options that work well alongside existing solar systems and help reduce power costs.",
    },
    {
      icon: Store,
      title: "See before you buy",
      desc: "Visit the Nyamakima showroom, compare the products, and ask questions before committing.",
    },
  ];

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <section className="border-b border-border bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_52%,#eef4ff_100%)]">
        <div className="mx-auto grid w-full gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-10 lg:py-20 xl:px-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-1.5 text-sm font-semibold text-ink shadow-sm">
              <Briefcase size={16} className="text-brand-500" />
              {hero.badge || "Portfolio"}
            </div>

            <h1 className="mt-6 max-w-3xl font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl lg:text-6xl">
              {hero.title || "Installations, products, and customer results."}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-sub sm:text-lg">
              {hero.subtitle ||
                "A clear view of the work we do, the results we deliver, and the quality customers can expect from TruePower."}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={cta.button_link || "https://wa.me/254701039256"}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-display font-bold text-white transition-transform hover:scale-[1.02] shadow-sm"
              >
                <MessageCircle size={18} />
                {cta.button_text || "WhatsApp Us"}
              </a>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-6 py-3 font-display font-bold text-ink transition-transform hover:scale-[1.02] shadow-sm"
              >
                Browse Products
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {[
                "Water heaters",
                "Solar solutions",
                "Water pumps",
                "Showroom support",
              ].map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-sub shadow-sm"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {heroShots.length > 0 ? (
              <>
                <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-sm aspect-[16/10]">
                  <Image
                    src={heroShots[0].image_url}
                    alt={heroShots[0].title || "TruePower installation"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                  <div className="absolute left-4 right-4 bottom-4">
                    <p className="text-[10px] uppercase tracking-[0.26em] text-white/80">
                      Featured project
                    </p>
                    <p className="mt-1.5 font-display text-lg font-bold text-white sm:text-2xl">
                      {heroShots[0].title || "TruePower"}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/75">
                      {heroShots[0].description || heroShots[0].category || "Project highlight"}
                    </p>
                  </div>
                </div>

                {heroShots[1] ? (
                  <div className="relative overflow-hidden rounded-[1.5rem] border border-border bg-white shadow-sm h-72">
                    <Image
                      src={heroShots[1].image_url}
                      alt={heroShots[1].title || "TruePower installation"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-transparent" />
                    <div className="absolute left-3 right-3 bottom-3">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-white/70">
                        Installation / product
                      </p>
                      <p className="mt-1 font-display text-sm font-bold text-white sm:text-base">
                        {heroShots[1].title || "TruePower"}
                      </p>
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="rounded-[1.5rem] border border-border bg-white p-6 text-center shadow-sm">
                <p className="font-display font-bold text-ink">Real photos loading</p>
                <p className="mt-2 text-sm text-sub">
                  Add gallery photos from the dashboard to fill this portfolio panel.
                </p>
              </div>
            )}

            <div className="rounded-[1.5rem] border border-border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-brand-500">
                    Project focus
                  </p>
                  <p className="mt-2 text-xl font-display font-bold text-ink">
                    Show what we actually deliver
                  </p>
                </div>
                <div className="rounded-2xl bg-brand-50 p-3 text-brand-500">
                  <Camera size={26} />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  "Clear product selection",
                  "Practical installation advice",
                  "Nairobi showroom support",
                  "Real customer feedback",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-border bg-muted px-3 py-3 text-sm font-medium text-ink"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white">
        <div className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-10 xl:px-12">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border bg-muted p-4 text-center shadow-sm"
              >
                <div className="mb-2 flex justify-center text-brand-500">
                  {typeof stat.icon === "string" ? (
                    <DynamicPortfolioIcon name={stat.icon} size={22} />
                  ) : (
                    stat.icon
                  )}
                </div>
                <p className="font-display text-2xl font-extrabold text-ink">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-sub">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted py-16 lg:py-20">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <div className="badge mb-4">Process</div>
            <h2 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
              Clear steps from enquiry to installation.
            </h2>
            <p className="mt-4 text-sub">
              Short, practical, and designed so customers know exactly what happens next.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {processSteps.map((step) => {
              const StepIcon = step.icon;
              return (
                <article
                  key={step.step}
                  className="relative rounded-[1.75rem] border border-border bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
                      <StepIcon size={22} />
                    </div>
                    <div className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold tracking-[0.2em] text-sub">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="mt-6 text-xl font-display font-bold text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-sub">{step.desc}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <ProjectGallery
          galleryImages={galleryImages || []}
          categories={categories}
          gallerySection={gallerySection}
        />
      </section>

      <section className="bg-muted py-16 lg:py-20">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <div className="badge mb-4">{testimonialsSection.title}</div>
            <h2 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
              Real customers, real results.
            </h2>
            <p className="mt-4 text-sub">{testimonialsSection.subtitle}</p>
          </div>

          {testimonials.length === 0 ? (
            <div className="rounded-[1.75rem] border border-border bg-white px-6 py-16 text-center shadow-sm">
              <Star size={48} className="mx-auto text-faint" />
              <p className="mt-4 text-sub">No testimonials yet. Check back soon.</p>
              <p className="mt-2 text-sm text-faint">
                Admins can add testimonials in the dashboard.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <article
                  key={testimonial.id || index}
                  className="rounded-[1.75rem] border border-border bg-white p-5 shadow-sm"
                >
                  <div className="flex gap-1 text-yellow-400">
                    {[...Array(5)].map((_, starIndex) => (
                      <Star
                        key={starIndex}
                        size={16}
                        fill={
                          starIndex < Number(testimonial.rating || 5)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    ))}
                  </div>
                  <Quote size={20} className="mt-4 text-brand-300" />
                  <p className="mt-4 text-sm leading-6 text-ink italic line-clamp-6">
                    &quot;{testimonial.text}&quot;
                  </p>
                  <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-display font-bold text-brand-600">
                      {(testimonial.name || "C").charAt(0)}
                    </div>
                    <div>
                      <p className="font-display font-semibold text-ink">
                        {testimonial.name}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-sub">
                        <MapPin size={10} /> {testimonial.location || "Kenya"}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <div className="badge mb-4">{promiseSection.title}</div>
            <h2 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
              {promiseSection.subtitle}
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {promiseCards.map((service) => {
              const ServiceIcon = service.icon;
              return (
                <article
                  key={service.title}
                  className="rounded-[1.5rem] border border-border bg-white p-5 shadow-sm"
                >
                  <div className="h-1 w-16 rounded-full bg-brand-500" />
                  <div className="mt-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
                    <ServiceIcon size={22} />
                  </div>
                  <h3 className="mt-5 text-lg font-display font-bold text-ink">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-sub">{service.desc}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-border bg-[linear-gradient(135deg,#f9f3ea_0%,#fffdf8_52%,#eef4ff_100%)] py-16 lg:py-20">
        <div className="absolute inset-0 pointer-events-none">
          {ctaVisual ? (
            <div className="absolute inset-y-0 right-0 hidden w-1/2 lg:block">
              <Image
                src={ctaVisual.image_url}
                alt={ctaVisual.title || "TruePower project"}
                fill
                className="object-cover opacity-20"
                sizes="50vw"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(249,243,234,0.98),rgba(249,243,234,0.72),rgba(238,244,255,0.18))]" />
            </div>
          ) : null}
        </div>

        <div className="relative mx-auto grid w-full gap-8 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:px-10 xl:px-12">
          <div>
            <div className="badge border-border bg-white/90 text-ink shadow-sm">
              Visit or chat with us
            </div>
            <h2 className="mt-4 max-w-2xl font-display text-3xl font-extrabold text-ink sm:text-4xl">
              {cta.title || "Need help choosing the right solution?"}
            </h2>
            <p className="mt-4 max-w-2xl text-sub">
              {cta.subtitle ||
                "Chat with us on WhatsApp and we will help you match the right water heater, pump, solar setup, or electrical product to your needs."}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-[1.35rem] border border-border bg-white/95 p-4 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.28em] text-brand-500">
                  Address
                </p>
                <p className="mt-2 text-sm font-semibold text-ink">Nyamakima, Nairobi CBD</p>
              </div>
              <div className="rounded-[1.35rem] border border-border bg-white/95 p-4 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.28em] text-brand-500">
                  Phone
                </p>
                <p className="mt-2 text-sm font-semibold text-ink">+254 701 039 256</p>
              </div>
              <div className="rounded-[1.35rem] border border-border bg-white/95 p-4 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.28em] text-brand-500">
                  Hours
                </p>
                <p className="mt-2 text-sm font-semibold text-ink">Mon to Sat</p>
              </div>
              <div className="rounded-[1.35rem] border border-border bg-white/95 p-4 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.28em] text-brand-500">
                  Support
                </p>
                <p className="mt-2 text-sm font-semibold text-ink">Quotes and installation help</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-border bg-white/95 p-6 shadow-lg backdrop-blur-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-brand-500">
                  TruePower contact
                </p>
                <p className="mt-2 text-2xl font-display font-bold text-ink">
                  Let us help you choose well
                </p>
              </div>
              <div className="rounded-2xl bg-brand-50 p-3 text-brand-500">
                <MessageCircle size={26} />
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm text-sub">
              <p className="flex items-center gap-2">
                <MapPin size={16} className="text-brand-500" />
                Nyamakima, Nairobi CBD
              </p>
              <p className="flex items-center gap-2">
                <MessageCircle size={16} className="text-brand-500" />
                +254 701 039 256
              </p>
              <p className="flex items-center gap-2">
                <Truck size={16} className="text-brand-500" />
                Pickup, delivery, and installation guidance
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={cta.button_link || "https://wa.me/254701039256"}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-3 font-display font-bold text-white transition-transform hover:scale-[1.02]"
              >
                <MessageCircle size={18} />
                {cta.button_text || "WhatsApp Us"}
              </a>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-3 font-display font-bold text-ink transition-transform hover:scale-[1.02]"
              >
                Browse Products
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
