import Footer from "../components/Footer";

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
        <p className="mb-4">Have a question, special request, or just want to say hello? Fill out the form below or reach us directly!</p>
        <form className="mb-8 space-y-4">
          <input type="text" placeholder="Your Name" className="w-full border rounded px-3 py-2" required />
          <input type="email" placeholder="Your Email" className="w-full border rounded px-3 py-2" required />
          <textarea placeholder="Your Message" className="w-full border rounded px-3 py-2" rows={4} required />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Send Message</button>
        </form>
        <div>
          <h2 className="text-xl font-semibold mb-2">Our Contact Info</h2>
          <p>Email: <a href="mailto:info@cakeshop.com" className="text-blue-600 underline">info@cakeshop.com</a></p>
          <p>Phone: <a href="tel:+1234567890" className="text-blue-600 underline">+1 234 567 890</a></p>
          <p>Address: 123 Cake Street, Sweet City, Country</p>
        </div>
      </div>
      <Footer />
    </div>
  );
} 