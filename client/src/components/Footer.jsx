export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-700 py-4 mt-8 border-t">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
        <div className="mb-2 md:mb-0">&copy; {new Date().getFullYear()} Cake Shop. All rights reserved.</div>
        <div className="flex space-x-4">
          <a href="/" className="hover:underline">Home</a>
          <a href="/auth?mode=login" className="hover:underline">Login</a>
          <a href="/auth?mode=signup" className="hover:underline">Sign Up</a>
          <a href="/about" className="hover:underline">About</a>
          <a href="/contact" className="hover:underline">Contact</a>
        </div>
      </div>
    </footer>
  );
} 