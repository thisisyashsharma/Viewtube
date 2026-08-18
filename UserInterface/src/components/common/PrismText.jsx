import React from "react";

/**
 * PrismText
 * High-performance 2-layer mask shimmer text component matching the exact Upload button beam light.
 * Base text stays 100% solid & legible, while the pure black (light mode) / pure brilliant white (dark mode)
 * light beam sweeps infinitely across the word while hovered.
 * 
 * @param {string} [text] - Text string to display
 * @param {React.ReactNode} [children] - Alternative text children
 * @param {string} [className] - Additional styling classes
 * @param {string} [baseColor] - Base text color override
 * @param {string} [beamColor] - Beam highlight color override
 */
export default function PrismText({
  text,
  children,
  className = "",
  baseColor = "",
  beamColor = "",
  ...props
}) {
  const targetText = typeof children === "string" ? children : text || "";

  return (
    <span
      className={`relative inline-flex items-center select-none font-[inherit] ${className}`}
      {...props}
    >
      {/* Base Layer: Solid, 100% Crisp Typography */}
      <span className={`whitespace-nowrap transition-colors duration-200 ${baseColor || "text-gray-700 dark:text-gray-200 group-hover:text-gray-500 dark:group-hover:text-white"}`}>
        {targetText}
      </span>

      {/* Beam Light Overlay: Pure Black in Light Mode, Pure Brilliant White in Dark Mode (Hover Only) */}
      <span
        className={`absolute inset-0 flex items-center whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 hover:opacity-100 animate-mask-shimmer transition-opacity duration-200 ${beamColor || "text-black dark:text"}`}
        aria-hidden="true"
      >
        {targetText}
      </span>
    </span>
  );
}
