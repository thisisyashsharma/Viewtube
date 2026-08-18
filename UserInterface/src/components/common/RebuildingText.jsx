import React, { useState, useEffect, useRef, useCallback } from "react";

/**
 * RebuildingText
 * Forms and reconstructs words letter-by-letter using a progressive line-drawing wave & pen-sweep beam on hover & focus.
 * Ensures 100% crisp typography without hollow borders or outline artifacts.
 * 
 * @param {string} [text] - The word/text to render and form
 * @param {React.ReactNode} [children] - Alternative text child
 * @param {string} [className] - Additional Tailwind / CSS classes
 * @param {boolean} [showUnderline=true] - Whether to show the bottom line writing beam
 */
export default function RebuildingText({
  text,
  children,
  className = "",
  showUnderline = true,
  ...props
}) {
  const targetText = typeof children === "string" ? children : text || "";
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Hook into parent .group element if present (e.g. <Link className="group">)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const parentGroup = el.closest(".group") || el;

    parentGroup.addEventListener("mouseenter", handleMouseEnter);
    parentGroup.addEventListener("mouseleave", handleMouseLeave);
    parentGroup.addEventListener("focusin", handleMouseEnter);
    parentGroup.addEventListener("focusout", handleMouseLeave);

    return () => {
      parentGroup.removeEventListener("mouseenter", handleMouseEnter);
      parentGroup.removeEventListener("mouseleave", handleMouseLeave);
      parentGroup.removeEventListener("focusin", handleMouseEnter);
      parentGroup.removeEventListener("focusout", handleMouseLeave);
    };
  }, [handleMouseEnter, handleMouseLeave]);

  const chars = targetText.split("");

  return (
    <span
      ref={containerRef}
      className={`relative inline-flex items-center select-none font-[inherit] ${className}`}
      {...props}
    >
      {/* Individual Letter Formation Wave */}
      <span className="relative inline-flex items-center whitespace-nowrap">
        {chars.map((char, index) => (
          <span
            key={`${char}-${index}-${isHovered ? "active" : "idle"}`}
            className="inline-block transition-opacity duration-200"
            style={{
              animation: isHovered
                ? `letterLineDraw 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 35}ms forwards`
                : "none",
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>

      {/* Luminous Line Beam forming the letters horizontally */}
      {showUnderline && (
        <span className="absolute -bottom-0.5 left-0 right-0 h-[2px] overflow-hidden pointer-events-none rounded-full">
          <span
            key={isHovered ? "line-active" : "line-idle"}
            className="block w-full h-full bg-gradient-to-r from-transparent via-blue-500 dark:via-blue-400 to-transparent"
            style={{
              animation: isHovered
                ? "lineBeamSweep 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards"
                : "none",
              opacity: isHovered ? 1 : 0,
            }}
          />
        </span>
      )}
    </span>
  );
}
