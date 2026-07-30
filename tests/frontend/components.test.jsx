import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "../../UserInterface/src/components/ErrorBoundary.jsx";

describe("ErrorBoundary UI Component", () => {
  const ProblemChild = () => {
    throw new Error("UI Component Render Error");
  };

  const GoodChild = () => <div>Normal UI Content</div>;

  it("renders children normally when there is no rendering error", () => {
    render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>
    );

    expect(screen.getByText("Normal UI Content")).toBeDefined();
  });

  it("catches rendering errors and displays fallback error UI", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeDefined();
    consoleSpy.mockRestore();
  });
});
