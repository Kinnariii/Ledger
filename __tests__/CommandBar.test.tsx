import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CommandBar from "@/app/components/CommandBar";
import "@testing-library/jest-dom";

describe("CommandBar Component", () => {
  it("renders with custom placeholder", () => {
    render(<CommandBar placeholder="Write some instructions..." />);
    const input = screen.getByPlaceholderText("Write some instructions...");
    expect(input).toBeInTheDocument();
  });

  it("disables send button when input is empty, and enables when text is present", () => {
    render(<CommandBar />);
    const input = screen.getByRole("textbox");
    const button = screen.getByRole("button", { name: /send/i });

    // Initial state: empty and disabled
    expect(button).toBeDisabled();

    // Type text
    fireEvent.change(input, { target: { value: "Hello" } });
    expect(button).not.toBeDisabled();

    // Clear text
    fireEvent.change(input, { target: { value: "" } });
    expect(button).toBeDisabled();
  });

  it("calls onSubmit with input text and clears input on submit", () => {
    const handleSubmit = vi.fn();
    render(<CommandBar onSubmit={handleSubmit} />);
    const input = screen.getByRole("textbox");
    const button = screen.getByRole("button", { name: /send/i });

    // Type and submit
    fireEvent.change(input, { target: { value: "Trigger automation" } });
    fireEvent.click(button);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith("Trigger automation");
    
    // Check input is cleared
    expect(input).toHaveValue("");
  });
});
