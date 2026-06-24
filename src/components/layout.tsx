import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useSubscribeNewsletter, useListSettings } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { TopBar } from "@/components/top-bar";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/",        label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/cases",   label: "Before & After" },
  { href: "/about",   label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { data: rawSettings } = useListSettings();
  const settings = (rawSettings as Record<string, string> | undefined) ?? {};
  const logoUrl = settings["logo_url"] || "/logo.png";

  // Close drawer when route changes
  useEffect(() => { setOpen(false); }, [location]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div className="sticky top-0 z-50">
      <TopBar />

      <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4 md:px-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <img src={logoUrl} alt="Rana Glow Logo" className="h-8 w-8 md:h-10 md:w-10 object-contain rounded-sm" />
            <span className="font-serif text-base md:text-xl font-medium tracking-wide">RANA GLOW</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`transition-colors hover:text-foreground ${location === href ? "text-foreground" : ""}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA + Mobile controls */}
          <div className="flex items-center gap-3">
            {/* Book button — shortened text on mobile */}
            <Link href="/book">
              <Button className="font-serif tracking-wider text-xs md:text-sm px-3 md:px-4 h-9 md:h-10">
                <span className="hidden sm:inline">Book Appointment</span>
                <span className="sm:hidden">Book</span>
              </Button>
            </Link>

            {/* Hamburger — mobile only */}
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-md text-foreground hover:bg-muted transition-colors"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full w-72 max-w-[85vw] bg-background z-50 md:hidden shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-border/40">
          <span className="font-serif text-base font-medium tracking-wide">Menu</span>
          <button
            onClick={() => setOpen(false)}
            className="flex items-center justify-center w-9 h-9 rounded-md text-foreground hover:bg-muted transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer links */}
        <nav className="flex flex-col px-4 py-6 gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-muted
                ${location === href ? "bg-muted text-foreground" : "text-muted-foreground"}`}
            >
              {label}
            </Link>
          ))}

          <div className="mt-4 pt-4 border-t border-border/40">
            <Link href="/book">
              <Button className="w-full font-serif tracking-wider">
                Book Appointment
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export function Footer() {
  const { data: rawSettings } = useListSettings();
  const settings = (rawSettings as Record<string, string> | undefined) ?? {};
  const logoUrl = settings["logo_url"] || "/logo.png";
  const experienceBadge = settings["experience_badge"] || "More than 15 Years Experience in Skin Care & Laser Treatment — Dubai, UAE";

  const subscribe = useSubscribeNewsletter();
  const form = useForm<z.infer<typeof newsletterSchema>>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (values: z.infer<typeof newsletterSchema>) => {
    subscribe.mutate({ data: values }, {
      onSuccess: () => {
        toast.success("Subscribed to newsletter!");
        form.reset();
      },
      onError: () => {
        toast.error("Failed to subscribe. Please try again.");
      }
    });
  };

  return (
    <footer className="bg-[#1A1A1A] text-white pt-16 pb-8">
      {/* Experience badge */}
      <div className="bg-[#A36253] py-3 mb-0">
        <div className="container mx-auto px-4 md:px-6 text-center text-white text-sm font-medium tracking-wide">
          ✦ {experienceBadge} ✦
        </div>
      </div>
      <div className="container mx-auto px-4 md:px-6 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <img src={logoUrl} alt="Rana Glow Logo" className="h-8 w-8 object-contain rounded-sm grayscale invert" />
              <span className="font-serif text-xl font-medium tracking-wide text-white">RANA GLOW</span>
            </Link>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              An elegant skin care studio in Ottawa, offering clinical treatments with over 15 years of expertise from Dubai, UAE.
            </p>
          </div>
          <div>
            <h4 className="font-serif text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">Services</Link></li>
              <li><Link href="/cases" className="hover:text-white transition-colors">Before & After</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/book" className="hover:text-white transition-colors">Book Now</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-lg mb-6">Contact</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li>755 NAKINA WAY<br/>ON K1V2J2, Ottawa<br/>Canada</li>
              <li>+1 (613) 600-8392</li>
              <li>RANA.GLOW2025@GMAIL.COM</li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-lg mb-6">Newsletter</h4>
            <p className="text-white/70 text-sm mb-4">Subscribe for skincare tips and exclusive offers.</p>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder="Your email address"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/30"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={subscribe.isPending} variant="secondary" className="bg-white text-black hover:bg-white/90">
                  Join
                </Button>
              </form>
            </Form>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/50">
          <p>&copy; {new Date().getFullYear()} Rana Glow Skin Care Studio. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/admin" className="hover:text-white transition-colors">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
