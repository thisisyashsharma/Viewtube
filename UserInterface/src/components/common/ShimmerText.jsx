import React from 'react';

/**
 * ShimmerText
 * Adds an Apple-style continuous text shimmer animation to text.
 * 
 * @param {React.ReactNode} children - Text content
 * @param {string} [className] - Additional classes
 * @param {boolean} [alwaysAnimate=true] - Whether to animate continuously or only on hover
 */
export default function ShimmerText({
  children,
  className = "",
  alwaysAnimate = true,
  ...props
}) {
  return (
    <span
      className={`inline-block bg-clip-text text-transparent bg-[linear-gradient(110deg,#111827_35%,#9ca3af_50%,#111827_65%)] dark:bg-[linear-gradient(110deg,#d1d5db_35%,#ffffff_50%,#d1d5db_65%)] ${
        alwaysAnimate ? 'animate-text-shimmer' : 'group-hover:animate-text-shimmer'
      } ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
