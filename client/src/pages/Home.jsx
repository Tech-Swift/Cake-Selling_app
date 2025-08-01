import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import CakeList from "../components/CakeList";
import FeaturedCakes from "../components/FeaturedCakes";
import Testimonials from "../components/Testimonials";
import Footer from "../components/Footer";
import api from "../utils/api";

export default function Home() {
  const [cakes, setCakes] = useState([]);

  useEffect(() => {
    api.get("/cakes")
      .then(res => setCakes(res.data))
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
  