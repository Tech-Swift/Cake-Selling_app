import React from "react";

export default function StarRating({ value, onChange, max = 5, disabled = false }) {
  return (
    <div className="flex items-center space-x-1">
      {[...Array(max)].map((_, i) => (
        <button
          key={i}
          type="button"
          className={`text-2xl ${i < value ? "text-yellow-400" : "text-gray-300"} focus:outline-none`}
          onClick={() => !disabled && onChange(i + 1)}
          disabled={disabled}
          aria-label={`Rate ${i + 1} star${i === 0 ? "" : "s"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
} 