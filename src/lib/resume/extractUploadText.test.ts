import { describe, expect, it } from "vitest";
import {
  extractUploadText,
  UnsupportedResumeFileError,
} from "./extractUploadText";

describe("extractUploadText", () => {
  it("reads plain text uploads", async () => {
    const text = await extractUploadText(
      Buffer.from("Jane Doe\nSoftware Engineer\n"),
      "resume.txt",
    );
    expect(text).toContain("Jane Doe");
  });

  it("rejects unsupported extensions", async () => {
    await expect(
      extractUploadText(Buffer.from("x"), "photo.png"),
    ).rejects.toBeInstanceOf(UnsupportedResumeFileError);
  });

  it("rejects empty files", async () => {
    await expect(
      extractUploadText(Buffer.from(""), "empty.txt"),
    ).rejects.toBeInstanceOf(UnsupportedResumeFileError);
  });
});
