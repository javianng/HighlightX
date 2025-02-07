import { BookOpen } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-800 py-12 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="mb-4 flex items-center space-x-2 md:mb-0">
            <BookOpen className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold">HighlightX</span>
          </div>
          <nav>
            <ul className="flex flex-wrap justify-center space-x-6">
              <li>
                <Link href="#" className="hover:text-blue-400">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-400">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-400">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-400">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="mt-8 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} HighlightX. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
