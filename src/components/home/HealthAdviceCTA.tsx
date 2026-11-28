import { siteConfig } from "@/lib/config";
import { getWhatsAppLink } from "@/lib/whatsapp";

export default function HealthAdviceCTA() {

  return (
    <section className="section-shell section-space">
      <div className="overflow-hidden rounded-[2rem] bg-primary p-7 text-white sm:p-10 lg:flex lg:items-center lg:justify-between lg:p-12">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
            Order support
          </p>
          <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
            Need help with a product or order?
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-white/75">
            Contact our support team with questions about product listings, availability, delivery or an existing order. For diagnosis, treatment or personal medical advice, please consult a qualified healthcare professional.
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:ml-6 lg:flex-col">
          <a
            href={`tel:+${siteConfig.phoneRaw}`}
            className="btn-secondary flex items-center justify-center gap-2 bg-white px-5 py-3 text-sm font-bold text-primary"
          >
            📞 Call {siteConfig.phone}
          </a>
          <a
            href={getWhatsAppLink("Hello A2Z Pharma, I need help with a product listing or an order.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition hover:brightness-95"
          >
            💬 WhatsApp Support
          </a>
        </div>
      </div>
    </section>
  );
}
