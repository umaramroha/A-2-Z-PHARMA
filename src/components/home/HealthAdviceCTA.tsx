export default function HealthAdviceCTA() {
  const phone = "918077988509";
  const phoneDisplay = "+91 80779 88509";
  const waMessage = encodeURIComponent(
    "Hi A2Z Pharma, I need health advice about a product."
  );

  return (
    <section className="section-shell section-space">
      <div className="overflow-hidden rounded-[2rem] bg-primary p-7 text-white sm:p-10 lg:flex lg:items-center lg:justify-between lg:p-12">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
            Need help choosing?
          </p>
          <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
            Talk to our health expert
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-white/70">
            Confused about which product is right for you? Call or WhatsApp us
            and our team will help you find the right wellness solution.
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:ml-6 lg:flex-col">
          <a
            href={`tel:+${phone}`}
            className="btn-secondary flex items-center justify-center gap-2 bg-white px-5 py-3 text-sm font-bold text-primary"
          >
            📞 Call {phoneDisplay}
          </a>
          <a
            href={`https://wa.me/${phone}?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition hover:brightness-95"
          >
            💬 WhatsApp Now
          </a>
        </div>
      </div>
    </section>
  );
}
