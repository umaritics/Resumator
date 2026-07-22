import { describe, expect, it, vi } from "vitest";
import {
  API_UNREACHABLE_MESSAGE,
  GENERATION_FAILED_MESSAGE,
  logClientError,
  messageForGenerationError,
} from "./userMessages";

describe("userMessages", () => {
  it("uses generic generation failure copy without technical details", () => {
    expect(GENERATION_FAILED_MESSAGE).not.toMatch(/pydantic|validation error|json/i);
    expect(GENERATION_FAILED_MESSAGE.length).toBeGreaterThan(10);
  });

  it("maps network TypeErrors to an unreachable-server message", () => {
    expect(messageForGenerationError(new TypeError("Failed to fetch"))).toBe(
      API_UNREACHABLE_MESSAGE,
    );
    expect(messageForGenerationError(new Error("other"))).toBe(
      GENERATION_FAILED_MESSAGE,
    );
  });

  it("logs errors to console without returning them to the UI layer", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logClientError("test", new Error("secret backend detail"));
    expect(spy).toHaveBeenCalledWith("[test]", expect.any(Error));
    spy.mockRestore();
  });
});
