import { describe, test, expect } from "vitest";
import { formatCurrency, orderTotal } from "../src/utils/format";

describe("formatCurrency", () => {
  test("formats a whole number with the rupee symbol", () => {
    expect(formatCurrency(500)).toBe("₹500");
  });

  test("formats a numeric string", () => {
    expect(formatCurrency("40.00")).toBe("₹40");
  });
});

describe("orderTotal", () => {
  test("sums quantity * unit_price across items", () => {
    const order = {
      items: [
        { unit_price: 35, quantity: 15 },
        { unit_price: 20, quantity: 3 },
      ],
    };
    expect(orderTotal(order)).toBe(585);
  });

  test("returns 0 for an order with no items", () => {
    expect(orderTotal({ items: [] })).toBe(0);
    expect(orderTotal({})).toBe(0);
  });
});
