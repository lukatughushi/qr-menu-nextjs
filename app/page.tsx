import Header from "../components/Header";
import Hero from "../components/Hero";
import Offer from "../components/Offer";
import FoodSection from "../components/FoodSection";
import About from "../components/About";
import BookSection from "../components/BookSection";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>
      <div className="hero_area" id="home">
        <div className="bg-box">
          <img src="/images/hero-bg.jpg" alt="Background" />
        </div>
        <Header />
        <Hero />
      </div>

      <main>
        {/* Offer სექცია ჩვეულებრივ რჩება */}
        <Offer />
        
        {/* ID-ები ნავბარიდან სქროლვისთვის */}
        <section id="menu">
          <FoodSection />
        </section>

        <section id="about">
          <About />
        </section>

        <section id="book">
          <BookSection />
        </section>
      </main>

      <Footer />
    </>
  );
}