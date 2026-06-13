import { describe, it, expect } from "vitest";
import { cn } from "./index.js";

describe("cn utility", () => {
  it("should merge tailwind classes correctly", () => {
    const result = cn("px-2 py-1", "bg-red-500", "px-4");
    expect(result).toContain("py-1");
    expect(result).toContain("bg-red-500");
    expect(result).toContain("px-4");
    expect(result).not.toContain("px-2"); // Override check
  });

  it("should handle conditional classes", () => {
    const isTrue = true;
    const isFalse = false;
    const result = cn("base", isTrue && "active", isFalse && "inactive");
    expect(result).toBe("base active");
  });
});
