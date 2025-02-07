import {
  BarChart,
  Book,
  Brain,
  Lock,
  ShoppingBag,
  Smartphone,
} from "lucide-react";

const features = [
  {
    icon: <Book className="h-8 w-8 text-blue-600" />,
    title: "Smart Note-Taking",
    description:
      "Effortlessly save highlights and notes from books and articles. Organize notes into customizable decks for better recall.",
  },
  {
    icon: <Brain className="h-8 w-8 text-blue-600" />,
    title: "Spaced Repetition",
    description:
      "AI-driven personalized review schedules improve memory recall and reinforce learning at the right time.",
  },
  {
    icon: <ShoppingBag className="h-8 w-8 text-blue-600" />,
    title: "Marketplace for Curated Notes",
    description:
      "Sell your book notes & decks to other users. Browse and purchase premium note decks curated by experts.",
  },
  {
    icon: <BarChart className="h-8 w-8 text-blue-600" />,
    title: "Analytics & Progress Tracking",
    description:
      "Track your learning streaks & review patterns. Identify concepts you need to revisit.",
  },
  {
    icon: <Smartphone className="h-8 w-8 text-blue-600" />,
    title: "Cross-Device Syncing",
    description:
      "Access your notes anytime, anywhere—mobile, tablet, or desktop. Secure cloud storage ensures no loss of data.",
  },
  {
    icon: <Lock className="h-8 w-8 text-blue-600" />,
    title: "Privacy & Security",
    description:
      "Your notes, your control—private by default. End-to-end encrypted storage for enhanced security.",
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-white py-20">
      <div className="container mx-auto px-4">
        <h2 className="mb-12 text-center text-4xl font-bold text-gray-800">
          Core Features
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="rounded-lg bg-gray-50 p-6 shadow-sm">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
