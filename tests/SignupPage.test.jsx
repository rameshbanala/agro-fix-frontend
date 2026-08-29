import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import SignupPage from "../src/pages/SignupPage";
import { AuthProvider } from "../src/context/AuthContext";
import { ToastProvider } from "../src/context/ToastContext";

vi.mock("../src/api/auth", () => ({
  signup: vi.fn(),
  login: vi.fn(),
}));

const renderSignup = () =>
  render(
    <MemoryRouter>
      <ToastProvider>
        <AuthProvider>
          <SignupPage />
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>
  );

describe("SignupPage", () => {
  test("shows field-level validation errors instead of submitting on empty form", async () => {
    const user = userEvent.setup();
    renderSignup();

    await user.click(screen.getByRole("button", { name: /sign up/i }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(screen.getByText(/contact number is required/i)).toBeInTheDocument();
  });

  test("shows an inline error for an invalid email without touching other fields", async () => {
    const user = userEvent.setup();
    renderSignup();

    await user.type(screen.getByPlaceholderText(/full name/i), "Jane Doe");
    await user.type(screen.getByPlaceholderText(/email address/i), "not-an-email");
    await user.type(screen.getByPlaceholderText(/create password/i), "password123");
    await user.type(screen.getByPlaceholderText(/contact number/i), "1234567890");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument();
  });
});
