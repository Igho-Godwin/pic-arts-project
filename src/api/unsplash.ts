import { Photo, PhotoDetails } from "../types";

const unSplashAccessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

export const fetchPhotos = async (
  page: number = 1,
  perPage: number = 100
): Promise<Photo[]> => {
  const response = await fetch(
    `https://api.unsplash.com/photos?per_page=${perPage}&page=${page}&client_id=${unSplashAccessKey}`
  );
  const result = await response.json();
  if ("errors" in result) {
    throw new Error(`Error fetching photos: ${result.errors[0]}`);
  }
  return result || [];
};

export const searchPhotos = async (
  query: string,
  page: number = 1,
  perPage: number = 100
): Promise<Photo[]> => {
  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${query}&per_page=${perPage}&page=${page}&client_id=${unSplashAccessKey}`
  );
  const result = await response.json();
  if ("errors" in result) {
    throw new Error(`Error fetching photos: ${result.errors[0]}`);
  }
  return result.results || [];
};

export const fetchPhotoDetailsById = async (
  id: string
): Promise<PhotoDetails | null> => {
  const response = await fetch(
    `https://api.unsplash.com/photos/${id}?client_id=${unSplashAccessKey}`
  );
  const result = await response.json();
  if ("errors" in result) {
    throw new Error(`Error fetching photos: ${result.errors[0]}`);
  }
  return result as PhotoDetails;
};
