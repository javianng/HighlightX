import Link from "next/link";
import { Button } from "~/components/ui/button";
export default function Hero() {
  return (
    <section className="py-20 text-center">
      <div className="container mx-auto px-4">
        <h1 className="mb-6 text-5xl font-bold text-gray-800">
          Capture, Organize, and Retain Knowledge Effortlessly
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
          HighlightX helps you save, organize, and resurface key insights from
          books and articles using AI-powered spaced repetition.
        </p>
        <Button asChild size="lg">
          <Link href="/login" className="mr-4">
            Start Your Smarter Reading Journey
          </Link>
        </Button>
      </div>
    </section>
  );
}
