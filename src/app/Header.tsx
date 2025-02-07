import { BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function Header() {
  return (
    <header className="bg-white px-6 py-4 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-800">HighlightX</span>
        </Link>
        <nav className="space-x-4">
          <Link href="#features" className="text-gray-600 hover:text-primary">
            Features
          </Link>
          <Link
            href="#why-choose-us"
            className="text-gray-600 hover:text-primary"
          >
            Why Us
          </Link>
          <Button>
            <Link href={"/login"}>Sign In</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
