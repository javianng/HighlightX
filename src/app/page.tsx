import Features from "./Features";
import Footer from "./Footer";
import Header from "./Header";
import Hero from "./Hero";
import WhyChooseUs from "./WhyChooseUs";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main>
        <Hero />
        <Features />
        <WhyChooseUs />
      </main>
      <Footer />
    </div>
  );
}
