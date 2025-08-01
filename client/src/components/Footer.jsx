import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-2 md:mb-0">&copy; {new Date().getFullYear()} CakeHouse. All rights reserved.</div>
          <div className="flex space-x-6">
            <a href="/about" className="hover:text-pink-400 transition-colors">About</a>
            <a href="/contact" className="hover:text-pink-400 transition-colors">Contact</a>
            <a href="/privacy" className="hover:text-pink-400 transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-pink-400 transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
} 