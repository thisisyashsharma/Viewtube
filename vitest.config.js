import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        name: "backend",
        test: {
          include: ["tests/backend/**/*.test.js"],
          environment: "node",
          setupFiles: ["./tests/backend/setup.js"],
          testTimeout: 30000,
          hookTimeout: 30000,
        },
      },
      {
        name: "frontend",
        root: "./UserInterface",
        test: {
          include: ["../tests/frontend/**/*.test.jsx"],
          environment: "jsdom",
          testTimeout: 10000,
        },
      },
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/controllers/**", "src/middlewares/**"],
    },
  },
});
