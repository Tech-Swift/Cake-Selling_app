import React from "react";
import { Construction } from "lucide-react";

export default function PlaceholderPage({ title, description = "This feature is coming soon!" }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <Construction className="h-16 w-16 text-gray-400 mb-4" />
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">{title}</h2>
      <p className="text-gray-500 max-w-md">{description}</p>
    </div>
  );
} 