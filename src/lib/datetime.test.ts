import { describe, expect, it } from "vitest";
import { formatDateTime } from "./datetime";

describe("formatDateTime", () => {
  it("форматирует ISO-дату", () => {
    const result = formatDateTime("2026-08-16T13:35:00.000Z");
    expect(result).toContain("2026");
    expect(result).toMatch(/13:35|16:35/);
  });

  it("для не-ISO строк возвращает исходную строку", () => {
    expect(formatDateTime("сейчас")).toBe("сейчас");
  });

  it("для пустой строки возвращает пустую строку", () => {
    expect(formatDateTime("")).toBe("");
  });
});
