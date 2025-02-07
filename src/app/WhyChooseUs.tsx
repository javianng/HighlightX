import { CheckCircle } from "lucide-react";

const benefits = [
  "Boost knowledge retention with AI-powered reminders",
  "Save time by accessing curated book insights",
  "Monetize your knowledge by selling your best notes",
  "Customize your learning experience",
  "Improve your reading comprehension",
  "Stay organized with all your notes in one place",
];

export default function WhyChooseUs() {
  return (
    <section id="why-choose-us" className="bg-blue-50 py-20">
      <div className="container mx-auto px-4">
        <h2 className="mb-12 text-center text-4xl font-bold text-gray-800">
          Why Choose HighlightX?
        </h2>
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start space-x-3">
              <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-green-500" />
              <p className="text-lg text-gray-700">{benefit}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
