import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSiteSettings } from "@/lib/supabase/queries";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us — Green Basket",
  description:
    "Get in touch with Green Basket. We'd love to hear from you.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  const phone = settings["contact_phone"] ?? "";
  const email = settings["contact_email"] ?? "";
  const address = settings["contact_address"] ?? "";
  const whatsapp = settings["whatsapp_number"] ?? "";

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main id="main-content" className="min-h-screen">
        <div className="py-14 md:py-20 bg-white border-b border-gb-border">
          <div className="gb-container text-center">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#245B35" }}>Get in Touch</p>
            <h1 className="text-4xl md:text-5xl font-bold text-gb-charcoal mb-4">Contact Us</h1>
            <p className="text-gray-500 text-lg max-w-lg mx-auto">
              Have a question or want to place a bulk order? We're here to help.
            </p>
          </div>
        </div>

        <div className="py-14 bg-gb-cream">
          <div className="gb-container max-w-3xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {phone && (
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="gb-card p-6 flex items-center gap-4 group hover:shadow-md">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#e8f5ee" }}>
                    <Phone size={20} style={{ color: "#245B35" }} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-gb-charcoal">Phone</p>
                    <p className="text-gray-500 text-sm group-hover:text-gb-green transition-colors">{phone}</p>
                  </div>
                </a>
              )}

              {email && (
                <a href={`mailto:${email}`} className="gb-card p-6 flex items-center gap-4 group hover:shadow-md">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#e8f5ee" }}>
                    <Mail size={20} style={{ color: "#245B35" }} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-gb-charcoal">Email</p>
                    <p className="text-gray-500 text-sm group-hover:text-gb-green transition-colors">{email}</p>
                  </div>
                </a>
              )}

              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gb-card p-6 flex items-center gap-4 group hover:shadow-md"
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#e8f5ee" }}>
                    <MessageCircle size={20} style={{ color: "#245B35" }} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-gb-charcoal">WhatsApp</p>
                    <p className="text-gray-500 text-sm group-hover:text-gb-green transition-colors">{whatsapp}</p>
                  </div>
                </a>
              )}

              {address && (
                <div className="gb-card p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#e8f5ee" }}>
                    <MapPin size={20} style={{ color: "#245B35" }} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-gb-charcoal">Address</p>
                    <p className="text-gray-500 text-sm">{address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
