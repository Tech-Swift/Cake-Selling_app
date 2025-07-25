import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import CakeList from "../components/CakeList";
import FeaturedCakes from "../components/FeaturedCakes";
import Testimonials from "../components/Testimonials";
import Footer from "../components/Footer";

export default function Home() {
  const [cakes, setCakes] = useState([]);

  useEffect(() => {
    // TODO: Replace with actual backend endpoint
    fetch("/api/cakes")
      .then(res => res.json())
      .then(data => setCakes(data))
      .catch(() => setCakes([]));
  }, []);

  return (
    <div>
      <Navbar />
      <div className="p-4">
        <FeaturedCakes />
        <CakeList />
        <Testimonials />
      </div>
      <Footer />
    </div>
  );
}
  