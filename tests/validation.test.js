import { describe, test, expect } from "vitest";
import {
  validateEmail,
  validatePassword,
  validateName,
  validateContact,
} from "../src/utils/validation";

describe("validateEmail", () => {
  test("rejects an empty value", () => {
    expect(validateEmail("")).toMatch(/required/i);
  });

  test("rejects a malformed address", () => {
    expect(validateEmail("not-an-email")).toMatch(/valid/i);
  });

  test("accepts a valid address", () => {
    expect(validateEmail("jane@example.com")).toBe("");
  });
});

describe("validatePassword", () => {
  test("rejects a short password", () => {
    expect(validatePassword("short")).toMatch(/8 characters/i);
  });

  test("accepts an 8+ character password", () => {
    expect(validatePassword("password123")).toBe("");
  });
});

describe("validateName", () => {
  test("rejects a blank name", () => {
    expect(validateName("   ")).toMatch(/required/i);
  });

  test("rejects a single-character name", () => {
    expect(validateName("A")).toMatch(/too short/i);
  });

  test("accepts a normal name", () => {
    expect(validateName("Jane Doe")).toBe("");
  });
});

describe("validateContact", () => {
  test("rejects an empty contact", () => {
    expect(validateContact("")).toMatch(/required/i);
  });

  test("rejects letters", () => {
    expect(validateContact("not-a-number")).toMatch(/valid/i);
  });

  test("accepts a plausible phone number", () => {
    expect(validateContact("+1 (555) 123-4567")).toBe("");
  });
});
