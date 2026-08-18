import React from 'react';

/**
 * LineDrawIcon
 * Renders an SVG icon with a continuous line-drawing / path-tracing reform animation on hover & focus.
 * 
 * @param {string} path - The SVG path `d` string
 * @param {string} [className] - Tailwind classes for container/size (default: 'w-5 h-5')
 * @param {string} [baseColor] - Base stroke color classes
 * @param {string} [activeColor] - Reforming drawing stroke color classes
 * @param {number} [strokeWidth=2] - Stroke width
 * @param {string} [viewBox="0 0 24 24"] - SVG viewBox
 * @param {React.ReactNode} [children] - Optional custom SVG path elements if not passing `path`
 */
export default function LineDrawIcon({
  path,
  className = "w-5 h-5",
  baseColor = "text-gray-500 dark:text-gray-400",
  activeColor = "text-gray-900 dark:text-white",
  strokeWidth = 2,
  viewBox = "0 0 24 24",
  children,
  ...props
}) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} {...props}>
      {/* Base Stroke Layer (Subtle track stroke that dims when reforming) */}
      <svg
        className={`w-full h-full absolute inset-0 ${baseColor} group-hover:opacity-30 group-focus:opacity-30 group-focus-visible:opacity-30 hover:opacity-30 focus:opacity-30 transition-opacity duration-300`}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        viewBox={viewBox}
      >
        {children ? (
          children
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d={path}
          />
        )}
      </svg>

      {/* Active High-Contrast Rebuilding Stroke on Hover / Focus */}
      <svg
        className={`w-full h-full absolute inset-0 ${activeColor} opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-focus-visible:opacity-100 hover:opacity-100 focus:opacity-100 transition-opacity duration-200 pointer-events-none`}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        viewBox={viewBox}
      >
        {children ? (
          React.Children.map(children, (child) =>
            React.isValidElement(child)
              ? React.cloneElement(child, {
                  pathLength: 100,
                  className: `${child.props.className || ''} group-hover:animate-svg-draw group-focus:animate-svg-draw group-focus-visible:animate-svg-draw hover:animate-svg-draw focus:animate-svg-draw transition-all`
                })
              : child
          )
        ) : (
          <path
            pathLength={100}
            className="group-hover:animate-svg-draw group-focus:animate-svg-draw group-focus-visible:animate-svg-draw hover:animate-svg-draw focus:animate-svg-draw transition-all"
            strokeLinecap="round"
            strokeLinejoin="round"
            d={path}
          />
        )}
      </svg>
    </div>
  );
}
