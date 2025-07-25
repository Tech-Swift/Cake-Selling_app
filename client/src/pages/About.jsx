import Footer from "../components/Footer";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-4">About Cake Shop</h1>
        <p className="mb-4">
          Welcome to Cake Shop! We are passionate about baking and delivering the most delicious cakes for every occasion. Whether it's a birthday, wedding, anniversary, or just a sweet craving, our cakes are made with love and the finest ingredients.
        </p>
        <p className="mb-4">
          Our team of talented bakers and decorators work tirelessly to create beautiful and tasty cakes that will make your celebrations memorable. We offer a wide variety of flavors, designs, and custom options to suit your needs.
        </p>
        <p>
          Thank you for choosing Cake Shop. We look forward to being a part of your special moments!
        </p>
      </div>
      <Footer />
    </div>
  );
} 