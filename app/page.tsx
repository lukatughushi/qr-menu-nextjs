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
      <div className="hero_area">
        <div className="bg-box">
          <img src="/images/hero-bg.jpg" alt="Background" />
        </div>
        <Header />
        <Hero />
      </div>

      {/* Offer სექცია დამატებულია hero_area-ს გარეთ სწორი ვიზუალისთვის */}
      <main>
        <Offer />
        
    
        <FoodSection />

        <About />

        <BookSection />

        <Footer />
       
      </main>
    </>
  );
}