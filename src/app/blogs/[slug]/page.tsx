import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type Blog = {
  title: string;
  date: string;
  image: string;
  excerpt: string;
  content: string;
};

const blogs: Record<string, Blog> = {
  "ayurveda-vs-unani-medicine": {
    title: "Ayurveda and Unani: An Introduction to Two Traditional Systems",
    date: "25 Sep 2026",
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=1200",
    excerpt: "A brief overview of the different traditional frameworks used in Ayurveda and Unani, and why qualified guidance matters.",
    content: `Ayurveda and Unani are distinct traditional systems of health that developed in different historical and cultural settings. Each has its own terminology, texts and approach to understanding wellbeing.

TRADITIONAL FRAMEWORKS

• Ayurveda commonly describes health through the concepts of Vata, Pitta and Kapha, often referred to as the three doshas.
• Unani uses a traditional humoral framework that includes Dam, Balgham, Safra and Sauda.

These are concepts within their respective traditional systems. They are not a substitute for a modern medical assessment, and they should not be used to self-diagnose a condition.

PRODUCTS AND PERSONAL SAFETY

Products associated with a traditional system can differ in ingredients, strength, manufacturing quality, directions and safety considerations. A traditional label does not mean that a product is risk-free or suitable for everyone. Some ingredients may cause side effects or interact with medicines.

Before using a product, read its label and check the ingredients, directions, warnings, manufacturer details, batch information and expiry date. Ask a qualified healthcare professional or appropriately registered practitioner whether a product is suitable for you, especially if you have a medical condition, take medicines, are pregnant or breastfeeding, or are considering a product for a child.

A2Z Pharma provides product listings for customers to review. Availability and product details should be confirmed before an order is accepted.`,
  },
  "digestive-health-herbal-remedies": {
    title: "Everyday Digestive Health: Habits and When to Seek Care",
    date: "20 Sep 2026",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1200",
    excerpt: "Learn about everyday habits that support digestive wellbeing and symptoms that should be discussed with a healthcare professional.",
    content: `Digestive symptoms such as bloating, heartburn, constipation and stomach discomfort can have many different causes. Diet, medicines, infections and underlying health conditions may all play a role. A symptom alone cannot identify the cause.

EVERYDAY HABITS

• Eat a varied, balanced diet that includes fibre-containing foods where suitable for you.
• Drink enough fluids throughout the day, taking account of any fluid restrictions advised by your clinician.
• Regular movement and a consistent daily routine may support general wellbeing.
• Notice whether particular foods or habits appear to trigger symptoms, but avoid restrictive diets without appropriate guidance.

BE CAREFUL WITH HERBAL PRODUCTS

Herbal and traditional products are not automatically safe or effective for every digestive complaint. Ingredients and concentrations vary, and products may interact with prescription medicines or be unsuitable for some people. Do not use a product as a replacement for prescribed treatment without speaking to your healthcare professional.

WHEN TO SEEK MEDICAL ADVICE

Speak with a qualified healthcare professional if symptoms are persistent, recurrent or getting worse. Seek prompt medical attention for severe abdominal pain, blood in vomit or stool, repeated vomiting, signs of dehydration, unexplained weight loss or other worrying symptoms.

This article is general educational information. It does not diagnose digestive conditions or recommend a treatment for an individual.`,
  },
  "immunity-boosters-ayurveda-unani": {
    title: "Seasonal Health: Practical Habits and Responsible Product Use",
    date: "15 Sep 2026",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200",
    excerpt: "A practical look at everyday seasonal-health habits and the limits of supplements and traditional products.",
    content: `Seasonal changes can affect routines and may coincide with increases in some common infections. No food, herb or supplement can guarantee that a person will avoid an infection.

PRACTICAL EVERYDAY HABITS

• Wash your hands regularly and follow local public-health guidance.
• Keep indoor spaces appropriately ventilated where possible.
• Aim for a varied diet, adequate sleep and regular physical activity suited to your health.
• Follow vaccination advice from a qualified healthcare professional and relevant public-health authorities.
• Seek medical advice when symptoms are severe, persistent or concerning.

ABOUT SUPPLEMENTS AND TRADITIONAL PRODUCTS

Products marketed for immunity or general wellness vary in their ingredients and evidence. They should not be treated as a substitute for vaccination, medical care, a balanced diet or prescribed treatment. Some herbs and supplements can interact with medicines or may not be appropriate during pregnancy, breastfeeding or for people with certain health conditions.

Check product labels carefully and consult a qualified healthcare professional before starting a supplement or traditional preparation. Be cautious of claims that a product can prevent, treat or cure an infection.

A2Z Pharma's website content is general information only. Product suitability should be discussed with a qualified professional.`,
  },
  "joint-pain-natural-relief": {
    title: "Joint Pain and Stiffness: Understanding Your Options",
    date: "10 Sep 2026",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1200",
    excerpt: "Common reasons for joint discomfort, general self-care considerations and signs that need medical assessment.",
    content: `Joint pain and stiffness can have many causes, including injury, overuse, inflammatory conditions and age-related changes. The right approach depends on the cause, the joint affected and a person's overall health.

GENERAL CONSIDERATIONS

• Avoid activities that clearly worsen pain, while maintaining movement that is comfortable and appropriate for you.
• Follow advice from a qualified healthcare professional about activity, rehabilitation or pain management.
• Do not stop or change prescribed medicines without discussing it with the prescriber.
• Seek an assessment if pain is persistent, recurring or affecting everyday activities.

TRADITIONAL OILS AND HERBAL PRODUCTS

Traditional oils and herbal preparations may be used by some people as part of personal care. Their ingredients, evidence, effects and risks vary. A product should not be described as a proven treatment for arthritis, gout, inflammation or high uric acid unless that claim is supported by appropriate evidence and permitted under applicable rules. Do not use a topical product on broken or irritated skin unless its label and a healthcare professional say it is appropriate.

WHEN TO SEEK CARE

Get prompt medical attention for a suddenly hot, red or very swollen joint, joint pain with fever, severe pain after an injury, or inability to bear weight or move the joint. A healthcare professional can assess the cause and discuss suitable options.

This article is general educational information, not a diagnosis or treatment recommendation.`,
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = blogs[slug];
  if (!blog) return { title: "Blog Not Found" };
  return {
    title: blog.title,
    description: blog.excerpt,
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = blogs[slug];

  if (!blog) notFound();

  return (
    <article className="container mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/blogs"
        className="mb-6 inline-block text-sm text-primary hover:underline"
      >
        ← Back to Articles
      </Link>

      <div className="relative mb-6 aspect-[3/2] overflow-hidden rounded-lg">
        <Image
          src={blog.image}
          alt={blog.title}
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
        />
      </div>

      <p className="mb-4 text-xs text-gray-500">📅 {blog.date}</p>

      <h1 className="mb-6 text-2xl font-bold leading-tight text-primary md:text-3xl">
        {blog.title}
      </h1>

      <aside className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        This article is for general educational purposes only. It is not medical advice, diagnosis or treatment. Consult a qualified healthcare professional before using any medicine or healthcare product. Read our{" "}
        <Link href="/policies/disclaimer" className="font-semibold underline">
          Medical & Product Disclaimer
        </Link>.
      </aside>

      <div className="prose prose-lg max-w-none whitespace-pre-line leading-relaxed text-gray-700">
        {blog.content}
      </div>

      <div className="mt-10 border-t pt-6">
        <p className="mb-4 text-gray-600">
          Have a question about a product listing or an existing order?
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/products"
            className="rounded-full bg-primary px-6 py-2.5 font-semibold text-white transition hover:bg-primary-dark"
          >
            Browse Products
          </Link>
          <Link
            href="/contact"
            className="rounded-full border-2 border-primary px-6 py-2.5 font-semibold text-primary transition hover:bg-primary hover:text-white"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </article>
  );
}
