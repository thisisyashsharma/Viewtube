import React from 'react';

/**
 * LineDrawIcon
 * Renders an SVG icon with a continuous line-drawing / path-tracing reform animation on hover.
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
  baseColor = "text-gray-300 dark:text-gray-700",
  activeColor = "text-gray-900 dark:text-gray-100",
  strokeWidth = 2,
  viewBox = "0 0 24 24",
  children,
  ...props
}) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} {...props}>
      {/* Base Subtle Stroke */}
      <svg
        className={`w-full h-full absolute inset-0 ${baseColor} transition-colors`}
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

      {/* Active Reforming Stroke on Hover */}
      <svg
        className={`w-full h-full absolute inset-0 ${activeColor} transition-colors`}
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
                  className: `${child.props.className || ''} group-hover:animate-svg-draw transition-all`
                })
              : child
          )
        ) : (
          <path
            pathLength={100}
            className="group-hover:animate-svg-draw transition-all"
            strokeLinecap="round"
            strokeLinejoin="round"
            d={path}
          />
        )}
      </svg>
    </div>
  );
}
