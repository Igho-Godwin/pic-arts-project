import { render, screen, fireEvent } from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import { faker } from "@faker-js/faker";

import { describe, it, expect, vi, beforeEach } from "vitest";

import { SearchInputBar } from "../components/SearchInputBar";

describe("SearchInputBar", () => {
  const mockHandleSearch = vi.fn();
  const mockSetSearchQuery = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly", () => {
    render(
      <SearchInputBar
        handleSearch={mockHandleSearch}
        searchQuery=""
        setSearchQuery={mockSetSearchQuery}
      />
    );

    expect(screen.getByTestId("search-input-bar")).toBeDefined();
    expect(screen.getByTestId("search-form")).toBeDefined();
    expect(screen.getByTestId("search-input")).toBeDefined();
    expect(screen.getByTestId("search-button")).toBeDefined();
  });

  it("updates search query on input change", () => {
    render(
      <SearchInputBar
        handleSearch={mockHandleSearch}
        searchQuery=""
        setSearchQuery={mockSetSearchQuery}
      />
    );

    const input = screen.getByTestId("search-input");
    const testValue = faker.lorem.word();

    fireEvent.change(input, { target: { value: testValue } });

    expect(mockSetSearchQuery).toHaveBeenCalledWith(testValue);
  });

  it("calls handleSearch on form submission", async () => {
    const testQuery = faker.lorem.words();

    render(
      <SearchInputBar
        handleSearch={mockHandleSearch}
        searchQuery={testQuery}
        setSearchQuery={mockSetSearchQuery}
      />
    );

    const form = screen.getByTestId("search-form");

    fireEvent.submit(form);

    expect(mockHandleSearch).toHaveBeenCalledWith(testQuery);
  });

  it("allows user to submit the form by clicking the search button", async () => {
    const testQuery = faker.lorem.words();

    render(
      <SearchInputBar
        handleSearch={mockHandleSearch}
        searchQuery={testQuery}
        setSearchQuery={mockSetSearchQuery}
      />
    );

    const button = screen.getByTestId("search-button");

    await userEvent.click(button);

    expect(mockHandleSearch).toHaveBeenCalledWith(testQuery);
  });

  it("has the correct placeholder text", () => {
    render(
      <SearchInputBar
        handleSearch={mockHandleSearch}
        searchQuery=""
        setSearchQuery={mockSetSearchQuery}
      />
    );

    const input = screen.getByTestId("search-input");
    expect(input).toHaveAttribute("placeholder", "Search for photos...");
  });

  it("has the correct aria-label", () => {
    render(
      <SearchInputBar
        handleSearch={mockHandleSearch}
        searchQuery=""
        setSearchQuery={mockSetSearchQuery}
      />
    );

    const input = screen.getByTestId("search-input");
    expect(input).toHaveAttribute("aria-label", "Search input");
  });
});
