import { describe, expect, it, vi } from "vitest";
import {
  GENERATION_FAILED_MESSAGE,
  logClientError,
} from "./userMessages";

describe("userMessages", () => {
  it("uses generic generation failure copy without technical details", () => {
    expect(GENERATION_FAILED_MESSAGE).not.toMatch(/pydantic|validation error|json/i);
    expect(GENERATION_FAILED_MESSAGE.length).toBeGreaterThan(10);
  });

  it("logs errors to console without returning them to the UI layer", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logClientError("test", new Error("secret backend detail"));
    expect(spy).toHaveBeenCalledWith("[test]", expect.any(Error));
    spy.mockRestore();
  });
});
