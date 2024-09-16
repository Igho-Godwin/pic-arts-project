import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { VirtualizedMasonryGrid } from "../components/VirtualizedMasonryGrid";
import { fetchPhotos, searchPhotos } from "../api/unsplash";

import { Photo } from "../types";

import { faker } from "@faker-js/faker";

// Mocking fetchPhotos and searchPhotos APIs
vi.mock("../api/unsplash", () => ({
  fetchPhotos: vi.fn(),
  searchPhotos: vi.fn(),
}));

const mockPhotos = (numPhotos: number): Photo[] => {
  return Array.from({ length: numPhotos }, () => ({
    id: faker.string.uuid(),
    width: faker.number.int(1000),
    height: faker.number.int(1000),
    urls: {
      thumb: faker.image.url(),
    },
    alt_description: faker.lorem.sentence(),
  }));
};

const renderComponent = () => {
  render(<VirtualizedMasonryGrid />);
};

describe("VirtualizedMasonryGrid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders initial photos", async () => {
    // Mock the API responses
    const photos = mockPhotos(100);
    vi.mocked(fetchPhotos).mockResolvedValue(photos);

    renderComponent();

    // Expect the loading spinner to appear initially
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();

    // Wait for photos to be loaded
    await waitFor(() => {
      expect(fetchPhotos).toHaveBeenCalledTimes(1);
    });
  });

  it("handles search", async () => {
    const searchQuery = "mountains";
    const searchResults = mockPhotos(20);

    // Mock searchPhotos API response
    vi.mocked(searchPhotos).mockResolvedValue(searchResults);

    renderComponent();

    // Type in the search bar
    const searchInput = screen.getByTestId("search-input") as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: searchQuery } });
    fireEvent.submit(screen.getByTestId("search-form"));

    // Wait for search results to be loaded
    await waitFor(() => {
      expect(searchPhotos).toHaveBeenCalledWith(searchQuery, 1, 100);
    });
  });

  it("displays an error message when API call fails", async () => {
    const errorMessage = "Error fetching photos: Something went wrong!";
    vi.mocked(fetchPhotos).mockRejectedValue(
      new Error("Something went wrong!")
    );

    renderComponent();

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        errorMessage
      );
    });
  });
});
