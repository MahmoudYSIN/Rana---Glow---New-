import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  useListServices,
  useListTestimonials,
  useListSettings,
  useListCases,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarHeart, ArrowRight } from "lucide-react";

const FALLBACK_FEATURED = [
  { id: 1, name: "Hydrafacial (Our Signature Treatment!)", description: "A machine-assisted facial that exfoliates, hydrates, and rejuvenates. Removes dead skin cells, cleanses pores, and infuses antioxidant-rich serums. Safe during pregnancy—no downtime.", category: "Facials", durationMinutes: 60, price: 140, imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80", isActive: true, createdAt: "" },
  { id: 7, name: "Microneedling", description: "Collagen-inducing therapy using tiny needles and serums to reduce wrinkles, scars, and pigmentation. Also effective for hair restoration.", category: "Treatments", durationMinutes: 60, price: 200, imageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80", isActive: true, createdAt: "" },
  { id: 10, name: "Green Peel (Organic)", description: "A 100% herbal peel for natural skin regeneration using aloe vera and marigold. Addresses pigmentation, fine lines, and enlarged pores.", category: "Peels", durationMinutes: 60, price: 200, imageUrl: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&q=80", isActive: true, createdAt: "" },
];

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width="14" height="14" viewBox="0 0 24 24" fill={n <= rating ? "#F59E0B" : "#E5E7EB"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

type CaseItem = {
  id: number;
  title: string;
  description?: string | null;
  category?: string | null;
  beforeImageUrl?: string | null;
  afterImageUrl?: string | null;
  isPublished: boolean;
  createdAt: string;
};

export default function Home() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 768
  );
  const [showStickyBtn, setShowStickyBtn] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { setShowStickyBtn(!entry.isIntersecting); },
      { threshold: 0.1 }
    );
    const hero = heroRef.current;
    if (hero) observer.observe(hero);
    return () => { if (hero) observer.unobserve(hero); };
  }, []);

  const { data: services } = useListServices();
  const { data: testimonials } = useListTestimonials();
  const { data: rawSettings } = useListSettings();
  const { data: allCases } = useListCases();

  const settings = (rawSettings as Record<string, string> | undefined) ?? {};
  const featuredServices = (services && services.length > 0) ? services.slice(0, 3) : FALLBACK_FEATURED;
  const publishedTestimonials = testimonials?.filter(t => t.isPublished) || [];
  const publishedCases = ((allCases as CaseItem[] | undefined) ?? [])
    .filter(c => c.isPublished && (c.beforeImageUrl || c.afterImageUrl))
    .slice(0, 6);

  return (
    <Layout>
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-[85vh] flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 z-0" style={{ background: "linear-gradient(150deg, #2c1a12 0%, #5a2d1c 30%, #7a3d28 55%, #3c2a21 80%, #1a0e08 100%)" }}>
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(196,149,106,0.22) 0%, transparent 70%)", transform: "translate(20%, -20%)" }} />
          <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full" style={{ background: "radial-gradient(circle, rgba(163,98,83,0.18) 0%, transparent 70%)" }} />
          <div className="absolute top-1/2 left-1/2 w-full h-full" style={{ background: "radial-gradient(ellipse at center, rgba(90,45,28,0.4) 0%, transparent 60%)", transform: "translate(-50%, -50%)" }} />
        </div>
        <div className="relative z-10 w-full mx-auto px-6 sm:px-8 text-center text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-2xl mx-auto space-y-5">
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-wide leading-tight">
              Reveal Your<br/>Natural Radiance
            </h1>
            <p className="text-sm sm:text-base md:text-lg font-light tracking-wide text-white/85 max-w-lg mx-auto leading-relaxed">
              An intimate luxury skin care studio in Ottawa blending advanced treatments with holistic wellbeing.
            </p>
            <div className="pt-4 sm:pt-6">
              <Link href="/book">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-serif tracking-widest text-sm md:text-lg px-6 md:px-8 py-4 md:py-6 rounded-none">
                  BOOK YOUR GLOW
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── About Preview ──────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="space-y-6">
              <h2 className="font-serif text-3xl md:text-4xl text-foreground">The Rana Glow Philosophy</h2>
              <div className="w-12 h-px bg-primary"></div>
              <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                We believe that great skin is a reflection of your overall wellbeing. Our studio offers a sanctuary where advanced clinical treatments meet deeply restorative spa rituals.
              </p>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                Every treatment is tailored specifically to your skin's unique needs in this moment, ensuring optimal results without compromising the skin barrier.
              </p>
              <div className="pt-4">
                <Link href="/about">
                  <Button variant="outline" className="font-serif rounded-none border-primary text-primary hover:bg-primary hover:text-white transition-colors">
                    Meet Our Team
                  </Button>
                </Link>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <img src="/service-facial.png" alt="Facial Treatment" className="w-full aspect-[4/5] object-cover rounded-sm shadow-xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Featured Services ──────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-10 md:mb-16 space-y-4">
            <h2 className="font-serif text-3xl md:text-4xl text-foreground">Curated Treatments</h2>
            <div className="w-12 h-px bg-primary mx-auto"></div>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {featuredServices.map((service, i) => (
              <motion.div key={service.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <Card className="h-full border-none shadow-md overflow-hidden group bg-card rounded-sm">
                  {service.imageUrl && (
                    <div className="aspect-[4/3] overflow-hidden">
                      <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                  )}
                  <CardContent className="p-5 md:p-8 space-y-3 md:space-y-4">
                    <div className="text-xs uppercase tracking-widest text-primary font-medium">{service.category}</div>
                    <h3 className="font-serif text-xl md:text-2xl">{service.name}</h3>
                    <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">{service.description}</p>
                    <div className="pt-2 md:pt-4 flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{service.durationMinutes} min / ${service.price}</span>
                      <Link href={`/book?service=${service.id}`} className="text-primary text-sm font-medium hover:underline underline-offset-4">Book Now</Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10 md:mt-12">
            <Link href="/services">
              <Button variant="outline" className="font-serif rounded-none border-primary text-primary hover:bg-primary hover:text-white transition-colors">
                View Full Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Before & After Gallery ─────────────────────────────────── */}
      {publishedCases.length > 0 && (
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-center mb-10 md:mb-14 space-y-4">
              <p className="text-xs uppercase tracking-widest text-primary font-medium">Transformation Gallery</p>
              <h2 className="font-serif text-3xl md:text-4xl text-foreground">Real Results</h2>
              <div className="w-12 h-px bg-primary mx-auto"></div>
              <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                Every skin tells a story. See the visible transformations our clients experience through our advanced treatments.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {publishedCases.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group rounded-sm overflow-hidden shadow-md bg-white hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Before / After image grid */}
                  <div className="grid grid-cols-2 h-52">
                    <div className="relative overflow-hidden">
                      <img
                        src={item.beforeImageUrl ?? "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=70"}
                        alt="Before"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <span className="absolute bottom-2 left-2 text-[10px] font-semibold uppercase tracking-wider bg-black/55 text-white px-2 py-1 rounded-sm">Before</span>
                    </div>
                    <div className="relative overflow-hidden border-l border-white/30">
                      <img
                        src={item.afterImageUrl ?? "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=70"}
                        alt="After"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <span className="absolute bottom-2 right-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-sm" style={{ background: "rgba(122,61,40,0.85)", color: "#fff" }}>After</span>
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-4 md:p-5">
                    {item.category && (
                      <p className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-1">{item.category}</p>
                    )}
                    <h3 className="font-serif text-base md:text-lg text-stone-800 leading-snug">{item.title}</h3>
                    {item.description && (
                      <p className="text-stone-500 text-xs mt-1.5 leading-relaxed line-clamp-2">{item.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-10 md:mt-12">
              <Link href="/cases">
                <Button variant="outline" className="font-serif rounded-none border-primary text-primary hover:bg-primary hover:text-white transition-colors gap-2">
                  View Full Gallery <ArrowRight size={15} />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Google Reviews ─────────────────────────────────────────── */}
      {publishedTestimonials.length > 0 && (
        <section className="py-16 md:py-24 bg-stone-50">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-center mb-10 md:mb-14 space-y-3">
              <div className="flex items-center justify-center gap-2">
                <GoogleLogo />
                <span className="text-xs uppercase tracking-widest font-semibold text-stone-500">Google Reviews</span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl text-foreground">What Our Clients Say</h2>
              <div className="w-12 h-px bg-primary mx-auto"></div>
              <div className="flex items-center justify-center gap-1.5 pt-1">
                <StarRating rating={5} />
                <span className="text-sm font-semibold text-stone-700 ml-1">4.8</span>
                <span className="text-sm text-stone-400">· Based on {publishedTestimonials.length}+ reviews</span>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {publishedTestimonials.slice(0, 6).map((t, i) => {
                const initial = t.clientName.charAt(0).toUpperCase();
                const avatarColors = [
                  ["#7a3d28", "#fff"], ["#5a2d1c", "#fff"], ["#3a2a1e", "#fff"],
                  ["#a36253", "#fff"], ["#6d3620", "#fff"], ["#8b4f35", "#fff"],
                ];
                const [bg, fg] = avatarColors[i % avatarColors.length];
                const reviewDate = new Date(t.createdAt).toLocaleDateString("en-CA", { year: "numeric", month: "short" });
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.07 }}
                    className="bg-white rounded-xl shadow-sm border border-stone-100 p-6 flex flex-col gap-4 hover:shadow-md transition-shadow"
                  >
                    {/* Top row: Google logo + rating */}
                    <div className="flex items-start justify-between">
                      <StarRating rating={t.rating} />
                      <GoogleLogo />
                    </div>

                    {/* Review text */}
                    <p className="text-stone-600 text-sm leading-relaxed flex-1 line-clamp-4 italic">
                      "{t.text}"
                    </p>

                    {/* Divider */}
                    <div className="w-full h-px bg-stone-100" />

                    {/* Reviewer identity */}
                    <div className="flex items-center gap-3">
                      {t.imageUrl ? (
                        <img src={t.imageUrl} alt={t.clientName} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                          style={{ background: bg, color: fg }}
                        >
                          {initial}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-stone-800 truncate">{t.clientName}</p>
                        <p className="text-xs text-stone-400">{reviewDate} · {t.serviceName}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Sticky Mobile "Book Now" FAB ───────────────────────────── */}
      <AnimatePresence>
        {showStickyBtn && isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 md:hidden"
          >
            <Link href="/book">
              <button
                style={{ background: "linear-gradient(135deg, #5a2d1c 0%, #7a3d28 100%)" }}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-full shadow-2xl text-white font-serif tracking-widest text-sm uppercase active:scale-95 transition-transform"
              >
                <CalendarHeart size={17} strokeWidth={1.8} />
                Book Now
              </button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
