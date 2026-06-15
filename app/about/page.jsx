import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Award,
  Building2,
  Check,
  Clock,
  Droplets,
  HeartHandshake,
  MapPin,
  MessageCircle,
  Shield,
  Sparkles,
  Star,
  Store,
  Sun,
  ThumbsUp,
  Truck,
  Users,
  Wrench,
  Zap,
} from "lucide-react";

import { createSeo } from "@/components/Seo";
import BlogCard from "@/components/BlogCard";
import {
  getGalleryImages,
  getPageContent,
  getTestimonials,
} from "@/lib/supabase";
import { getPublishedBlogs } from "@/lib/blogs";
import { getProducts } from "@/lib/products";

export const metadata = createSeo({
  title: "About TruePower Kenya",
  description:
    "TruePower Kenya supplies water heaters, pumps, solar, and electrical solutions from our Nyamakima showroom in Nairobi.",
  path: "/about",
});

export const dynamic = "force-dynamic";

const IconMap = {
  Users,
  Star,
  Zap,
  MapPin,
  Shield,
  Droplets,
  Sun,
  Store,
  MessageCircle,
  Award,
  Truck,
  Check,
  Clock,
  HeartHandshake,
  Building2,
  Wrench,
  ThumbsUp,
  Sparkles,
};

function DynamicIcon({ name, size = 24, className = "" }) {
  const IconComponent = IconMap[name] || Zap;
  return <IconComponent size={size} className={className} />;
}

const DEFAULT_STATS = [
  { value: "500+", label: "Customers served", icon: "Users" },
  { value: "4.9", label: "Customer rating", icon: "Star" },
  { value: "Same day", label: "Pickup support", icon: "Truck" },
  { value: "Nyamakima", label: "CBD showroom", icon: "MapPin" },
];

const DEFAULT_SERVICES = [
  {
    icon: "Zap",
    title: "Water Heaters",
    description:
      "Instant and storage heaters chosen for Kenyan homes, low pressure, and borehole water conditions.",
    chips: ["Instant showers", "Storage tanks", "Low pressure ready"],
  },
  {
    icon: "Sun",
    title: "Solar Solutions",
    description:
      "Solar products that help lower power bills while keeping your home or business running reliably.",
    chips: ["Panels", "Inverters", "Battery setups"],
  },
  {
    icon: "Droplets",
    title: "Water Pumps",
    description:
      "Booster and transfer pumps that keep water moving smoothly in homes, apartments, and compounds.",
    chips: ["Booster pumps", "Submersible pumps", "Pressure tanks"],
  },
  {
    icon: "Store",
    title: "Showroom Sales",
    description:
      "Visit our Nyamakima showroom, compare options in person, and get advice before you buy.",
    chips: ["Walk-in support", "Product demos", "Same day pickup"],
  },
  {
    icon: "Wrench",
    title: "Installation Support",
    description:
      "We guide installations and setup so the products you buy work the way they should from day one.",
    chips: ["Site advice", "After-sales help", "Setup guidance"],
  },
  {
    icon: "Building2",
    title: "Electrical Supply",
    description:
      "Reliable electrical items for homes, offices, and projects, from switches to fittings and accessories.",
    chips: ["Switches", "Sockets", "Lighting"],
  },
];

const DEFAULT_VALUES = [
  {
    icon: "Award",
    title: "Proven expertise",
    description:
      "We help customers pick the right product for the real conditions they have at home.",
  },
  {
    icon: "Shield",
    title: "Quality checked",
    description:
      "We focus on products we would trust to install in our own homes and projects.",
  },
  {
    icon: "Clock",
    title: "Fast response",
    description:
      "Questions on WhatsApp, quick follow-up, and practical support from the team.",
  },
  {
    icon: "ThumbsUp",
    title: "Built for Kenya",
    description:
      "Our advice and product selection is based on local water pressure, power, and installation realities.",
  },
];

const DEFAULT_HERO = {
  badge: "About TruePower",
  title: "A trusted partner for water, solar, and electrical solutions.",
  subtitle:
    "We help Kenyan homes and businesses choose products that perform well in real life, not just on the box.",
};

export default async function AboutPage() {
  const [content, testimonials, galleryImages, blogData, productData] = await Promise.all([
    getPageContent("about"),
    getTestimonials(),
    getGalleryImages(),
    getPublishedBlogs({ pageSize: 3 }),
    getProducts({ pageSize: 4, limit: 4, sort: "newest" }),
  ]);

  const pageData = content?.main ?? content ?? {};
  const hero = pageData?.hero || DEFAULT_HERO;
  const stats = pageData?.stats?.items || DEFAULT_STATS;
  const services = pageData?.services?.items || DEFAULT_SERVICES;
  const values = pageData?.values?.items || DEFAULT_VALUES;
  const story = pageData?.story || {};
  const showroom = pageData?.showroom || {};
  const cta = pageData?.cta || {};
  const blogPosts = blogData?.posts || [];
  const galleryPreview = (galleryImages || []).slice(0, 4);
  const productPreview = (productData?.data || [])
    .filter((product) => product.image_url || product.images?.[0])
    .slice(0, 4)
    .map((product) => ({
      id: product.id,
      image_url: product.image_url || product.images?.[0],
      title: product.name,
      description: product.model || product.catLabel || product.category || "Product",
    }));
  const heroVisuals = [...galleryPreview, ...productPreview]
    .filter((item) => item?.image_url)
    .slice(0, 4);

  const storyParagraphs = story.paragraphs?.length
    ? story.paragraphs
    : [
        "We started because too many water heaters and pumps were being sold without considering Kenyan water pressure, borehole conditions, or installation reality.",
        "We test what we stock, explain the differences clearly, and make sure customers can buy with confidence instead of guesswork.",
        "Our Nyamakima showroom gives you a place to see products in person, ask questions, and get support after the sale.",
      ];

  const storyFeatures = story.features?.length
    ? story.features
    : [
        "Borehole tested",
        "Low pressure ready",
        "Solar compatible",
        "Nairobi delivery",
        "Showroom support",
        "After-sales help",
      ];

  const heroPills = [
    showroom.address || "Nyamakima, Nairobi CBD",
    showroom.phone || "+254 701 039 256",
    "WhatsApp quotes",
    "Installation guidance",
  ];
  const ctaBackdrop = heroVisuals[1] || heroVisuals[0];

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#faf7f1_0%,#f8fbff_45%,#eef4ff_100%)] text-ink">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-16 h-56 w-56 rounded-full bg-brand-100/60 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-amber-100/60 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full px-4 py-16 sm:px-6 lg:px-10 lg:py-24 xl:px-12">
          <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-4 py-1.5 text-sm font-medium text-ink shadow-sm backdrop-blur-sm">
                <Sparkles size={16} className="text-brand-500" />
                {hero.badge || "About TruePower"}
              </div>

              <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl lg:text-6xl">
                {hero.title || "A trusted partner for water, solar, and electrical solutions."}
              </h1>

              <p className="mt-5 text-base leading-8 text-sub sm:text-lg">
                {hero.subtitle ||
                  "We help Kenyan homes and businesses choose products that perform well in real life, not just on the box."}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="https://wa.me/254701039256"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-display font-bold text-white transition-transform hover:scale-[1.02] shadow-sm"
                >
                  <MessageCircle size={18} />
                  Talk on WhatsApp
                </a>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-display font-bold text-ink transition-transform hover:scale-[1.02] shadow-sm border border-border"
                >
                  View Products
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {heroPills.map((pill) => (
                  <span
                    key={pill}
                    className="rounded-full border border-border bg-white/90 px-3 py-2 text-[11px] font-medium text-sub"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              {heroVisuals.length > 0 ? (
                <>
                  <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-sm aspect-[16/10]">
                    <Image
                      src={heroVisuals[0].image_url}
                      alt={heroVisuals[0].title || "TruePower installation"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    <div className="absolute left-4 right-4 bottom-4">
                      <p className="text-[10px] uppercase tracking-[0.26em] text-white/80">
                        Real product photo
                      </p>
                      <p className="mt-1.5 font-display text-lg font-bold text-white sm:text-2xl">
                        {heroVisuals[0].title || "TruePower"}
                      </p>
                    </div>
                  </div>

                  {heroVisuals[1] ? (
                    <div className="relative overflow-hidden rounded-[1.5rem] border border-border bg-white shadow-sm h-72">
                      <Image
                        src={heroVisuals[1].image_url}
                        alt={heroVisuals[1].title || "TruePower installation"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-transparent" />
                      <div className="absolute left-3 right-3 bottom-3">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-white/70">
                          Showroom / project
                        </p>
                        <p className="mt-1 font-display text-sm font-bold text-white sm:text-base">
                          {heroVisuals[1].title || "TruePower"}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="rounded-[1.75rem] border border-border bg-white/80 p-6 text-center">
                  <p className="font-display font-bold text-ink">Real photos loading</p>
                  <p className="mt-2 text-sm text-sub">
                    Add gallery or product images in the dashboard to fill this collage.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white">
        <div className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-10 xl:px-12">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border bg-muted p-4 text-center">
                <div className="mb-2 flex justify-center text-brand-500">
                  <DynamicIcon name={stat.icon} size={24} />
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
            <div className="badge mb-4">What We Do</div>
            <h2 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
              Complete support for water, power, and electrical needs.
            </h2>
            <p className="mt-4 text-sub">
              From product selection to installation advice, we keep the process simple and practical.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.title}
                className="group rounded-[1.75rem] border border-border bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-card sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-2xl bg-brand-50 p-3 text-brand-500">
                    <DynamicIcon name={service.icon} size={24} />
                  </div>
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-500">
                    TruePower
                  </span>
                </div>
                <h3 className="mt-5 text-base font-display font-bold text-ink sm:text-xl">
                  {service.title}
                </h3>
                <p className="mt-3 text-xs leading-5 text-sub sm:text-sm sm:leading-6">
                  {service.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {service.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] font-medium text-ink sm:px-3 sm:text-[11px]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-white">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div>
              <div className="badge mb-4">Our Story</div>
              <h2 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
                {story.title || "Built by Kenyans, for Kenyan conditions"}
              </h2>
              <div className="mt-6 space-y-5 text-base leading-8 text-sub">
                {storyParagraphs.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {storyFeatures.map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-sm text-ink"
                  >
                    <Check size={13} className="text-brand-500" />
                    {feature}
                  </span>
                ))}
              </div>

              <div className="mt-8 rounded-[1.75rem] border border-border bg-[linear-gradient(135deg,#f8fbff,#eef4ff)] p-5 sm:p-6">
                <p className="text-[11px] uppercase tracking-[0.28em] text-brand-500">
                  Why customers choose us
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
                  {values.map((value) => (
                    <div
                      key={value.title}
                      className="rounded-2xl border border-white/70 bg-white/85 p-3 sm:p-4 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-brand-50 p-2 text-brand-500">
                          <DynamicIcon name={value.icon} size={16} />
                        </div>
                        <p className="font-display font-bold text-sm text-ink">{value.title}</p>
                      </div>
                      <p className="mt-3 text-xs leading-5 text-sub sm:text-sm sm:leading-6">
                        {value.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {galleryPreview.length > 0 ? (
                galleryPreview.map((image, index) => (
                  <div
                    key={image.id || index}
                    className={`group relative overflow-hidden rounded-[1.75rem] border border-border bg-muted shadow-sm ${
                      index === 0 ? "sm:col-span-2 aspect-[16/10]" : "aspect-[4/5]"
                    }`}
                  >
                    <Image
                      src={image.image_url}
                      alt={image.title || "TruePower installation"}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <p className="font-display text-sm font-semibold">
                        {image.title || "Installation"}
                      </p>
                      <p className="text-xs text-white/75">
                        {image.description || image.category || "Project highlight"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="sm:col-span-2 rounded-[1.75rem] border border-border bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-brand-100">
                      Visual proof
                    </p>
                    <p className="mt-3 text-2xl font-display font-bold">
                      Recent installations and showroom work
                    </p>
                    <p className="mt-3 text-sm leading-6 text-white/75">
                      When no gallery images are available, we still keep this section ready to highlight real work.
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-border bg-muted p-5">
                    <div className="flex h-full items-center justify-center text-brand-500">
                      <CameraPlaceholder />
                    </div>
                  </div>
                  <div className="rounded-[1.5rem] border border-border bg-muted p-5">
                    <div className="flex h-full items-center justify-center text-brand-500">
                      <CameraPlaceholder />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <div className="badge mb-4">Customer Feedback</div>
            <h2 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
              Real customers, real results.
            </h2>
            <p className="mt-4 text-sub">
              What people say after buying, installing, and using our products.
            </p>
          </div>

          {testimonials.length === 0 ? (
            <div className="rounded-[1.75rem] border border-border bg-muted px-6 py-16 text-center">
              <Star size={48} className="mx-auto text-faint" />
              <p className="mt-4 text-sub">No testimonials yet. Check back soon.</p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-2 md:grid-cols-2 xl:grid-cols-3">
              {testimonials.slice(0, 3).map((testimonial, index) => (
                <article
                  key={testimonial.id || index}
                  className="rounded-[1.75rem] border border-border bg-white p-4 sm:p-6 shadow-sm"
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
                  <p className="mt-4 text-sm sm:text-base leading-6 sm:leading-7 text-ink italic line-clamp-6">
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
                      <p className="text-xs text-sub">{testimonial.location || "Kenya"}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-muted py-16 lg:py-20">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <div className="badge mb-4">From the Blog</div>
            <h2 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
              Helpful reads for better buying decisions.
            </h2>
            <p className="mt-4 text-sub">
              We share product advice, installation tips, and project updates on the blog.
            </p>
          </div>

          {blogPosts.length === 0 ? (
            <div className="rounded-[1.75rem] border border-border bg-white px-6 py-16 text-center">
              <p className="text-sub">No blog posts published yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
              {blogPosts.slice(0, 3).map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#f9f3ea_0%,#fffdf8_52%,#eef4ff_100%)] py-16 lg:py-20">
        <div className="absolute inset-0 pointer-events-none">
          {ctaBackdrop ? (
            <div className="absolute inset-y-0 right-0 hidden w-1/2 lg:block">
              <Image
                src={ctaBackdrop.image_url}
                alt={ctaBackdrop.title || "TruePower project"}
                fill
                className="object-cover opacity-25"
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
              {cta.title || "Ready to choose the right solution for your home?"}
            </h2>
            <p className="mt-4 max-w-2xl text-sub">
              {cta.subtitle ||
                "Chat with us, ask questions, get a quote quickly, and arrange pickup or delivery in Nairobi."}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-[1.35rem] border border-border bg-white/95 p-4 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.28em] text-brand-500">
                  Address
                </p>
                <p className="mt-2 text-sm font-semibold text-ink">
                  {showroom.address || "Nyamakima, Nairobi CBD"}
                </p>
              </div>
              <div className="rounded-[1.35rem] border border-border bg-white/95 p-4 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.28em] text-brand-500">
                  Phone
                </p>
                <p className="mt-2 text-sm font-semibold text-ink">
                  {showroom.phone || "+254 701 039 256"}
                </p>
              </div>
              <div className="rounded-[1.35rem] border border-border bg-white/95 p-4 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.28em] text-brand-500">
                  Hours
                </p>
                <p className="mt-2 text-sm font-semibold text-ink">
                  Monday to Saturday
                </p>
              </div>
              <div className="rounded-[1.35rem] border border-border bg-white/95 p-4 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.28em] text-brand-500">
                  Support
                </p>
                <p className="mt-2 text-sm font-semibold text-ink">
                  Quotes, delivery, installation
                </p>
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
                {showroom.address || "Nyamakima, Nairobi CBD"}
              </p>
              <p className="flex items-center gap-2">
                <MessageCircle size={16} className="text-brand-500" />
                {showroom.phone || "+254 701 039 256"}
              </p>
              <p className="flex items-center gap-2">
                <Clock size={16} className="text-brand-500" />
                Monday to Saturday, 8:00 AM - 6:00 PM
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
                {cta.button_text || "Chat Now on WhatsApp"}
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

function CameraPlaceholder() {
  return (
    <div className="text-center">
      <Store size={42} className="mx-auto mb-3 text-brand-400" />
      <p className="font-display font-semibold text-ink">Showcase ready</p>
      <p className="mt-1 text-sm text-sub">Add gallery photos from the admin dashboard</p>
    </div>
  );
}
