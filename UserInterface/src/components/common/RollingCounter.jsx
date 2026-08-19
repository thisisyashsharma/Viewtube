import React from "react";

function RollingDigit({ char }) {
  const isDigit = /^[0-9]$/.test(char);
  if (!isDigit) {
    return <span className="inline-block px-[0.5px]">{char}</span>;
  }

  const num = parseInt(char, 10);

  return (
    <span className="inline-block relative overflow-hidden h-[1.4em] leading-none align-middle select-none min-w-[0.58em]">
      <span
        className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transform: `translateY(-${num * 10}%)`,
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <span
            key={d}
            className="h-[1.4em] flex items-center justify-center font-[inherit] leading-none font-semibold"
          >
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

export default function RollingCounter({ value = 0, className = "" }) {
  const formatted = Number(value || 0).toLocaleString();
  const chars = formatted.split("");

  return (
    <span className={`inline-flex items-center tracking-tight ${className}`}>
      {chars.map((ch, idx) => (
        <RollingDigit key={`${idx}`} char={ch} />
      ))}
    </span>
  );
}

