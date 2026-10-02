import Link from "next/link";

const items = [
  { icon: "✓", label: "100% Authentic", color: "text-green-600" },
  { icon: "🚚", label: "Fast Delivery", color: "text-blue-600" },
  { icon: "💵", label: "COD Available", color: "text-amber-600" },
  { icon: "💬", label: "WhatsApp", color: "text-green-600", href: "https://wa.me/918410127168" },
];

export default function TrustStrip() {
  return (
    <section className="border-b border-gray-100 bg-white py-3">
      <div className="section-shell grid grid-cols-4 gap-2">
        {items.map((item) => {
          const Wrapper: any = item.href ? Link : "div";
          const wrapperProps = item.href
            ? { href: item.href, target: "_blank", rel: "noopener noreferrer" }
            : {};
          return (
            <Wrapper
              key={item.label}
              {...wrapperProps}
              className="flex flex-col items-center text-center"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-base ${item.color}`}
              >
                {item.icon}
              </span>
              <span className="mt-1 text-[10px] font-semibold leading-tight text-gray-600">
                {item.label}
              </span>
            </Wrapper>
          );
        })}
      </div>
    </section>
  );
}
