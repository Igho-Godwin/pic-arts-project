import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { SearchInputBar } from "./SearchInputBar";
import { fetchPhotos, searchPhotos } from "../api/unsplash";
import { Photo } from "../types";
import { LoadingSpinner } from "./LoadingSpinner";
import {
  GridContainer,
  MasonryGrid,
  PhotoColumn,
  PhotoImage,
  ErrorMessage,
} from "../styles";

import { v4 as uuidv4 } from 'uuid';

const BASE_COLUMN_WIDTH = 300;
const BUFFER_SIZE = 5;
const IMAGE_GAP = 15;
const PHOTOS_PER_PAGE = 100;

export const VirtualizedMasonryGrid: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [columnCount, setColumnCount] = useState(0);
  const [columnWidth, setColumnWidth] = useState(BASE_COLUMN_WIDTH);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const calculateColumnLayout = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    let columns = Math.floor(containerWidth / BASE_COLUMN_WIDTH);
    columns = Math.max(1, Math.min(columns, 4));
    const newColumnWidth = Math.floor(containerWidth / columns) - 10;
    setColumnWidth(newColumnWidth);
    setColumnCount(columns);
    setContainerHeight(containerRef.current.offsetHeight);
  }, []);

  const loadPhotos = useCallback(
    async (_searchQuery = "", reset = false) => {
      if (!hasMore && !reset) return;
      setIsLoading(true);
      setError(null);
      try {
        const fetchedPhotos = _searchQuery
          ? await searchPhotos(_searchQuery, reset ? 1 : page,  PHOTOS_PER_PAGE)
          : await fetchPhotos(reset ? 1 : page, PHOTOS_PER_PAGE);
        setIsLoading(false);
        if (fetchedPhotos.length === 0) {
          setHasMore(false);
        } else {
          setPhotos((prevPhotos) => {
            const newPhotos = reset
              ? fetchedPhotos
              : [...prevPhotos, ...fetchedPhotos];
            return newPhotos;
          });
          setPage((prevPage) => (reset ? 2 : prevPage + 1));
        }
      } catch (error: unknown) {
        setIsLoading(false);
        if (error instanceof Error) {
          setError("Error fetching photos: " + error.message);
        } else {
          setError("An unknown error occurred while fetching photos.");
        }
      }
    },
    [hasMore, page]
  );

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      loadPhotos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    calculateColumnLayout();
    window.addEventListener("resize", calculateColumnLayout);
    return () => window.removeEventListener("resize", calculateColumnLayout);
  }, [calculateColumnLayout]);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setPage(1);
      setPhotos([]);
      setHasMore(true);
      loadPhotos(query, true);
    },
    [loadPhotos]
  );

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      setScrollTop(scrollTop);
      if (
        scrollHeight - scrollTop <= clientHeight * 1.5 &&
        !isLoading &&
        hasMore
      ) {
        loadPhotos(searchQuery);
      }
    }
  }, [loadPhotos, isLoading, hasMore, searchQuery]);

  const getPhotoColumns = useCallback(() => {
    const columns: Photo[][] = Array.from({ length: columnCount }, () => []);
    const columnHeights = new Array(columnCount).fill(0);

    photos.forEach((photo) => {
      const shortestColumnIndex = columnHeights.indexOf(
        Math.min(...columnHeights)
      );
      columns[shortestColumnIndex].push(photo);
      const photoHeight = (photo.height / photo.width) * columnWidth;
      columnHeights[shortestColumnIndex] += photoHeight + IMAGE_GAP;
    });

    return columns;
  }, [photos, columnCount, columnWidth]);

  const renderVirtualizedColumns = useCallback(() => {
    const columns = getPhotoColumns();
    const virtualizedColumns: JSX.Element[] = [];

    columns.forEach((column, columnIndex) => {
      let accumulatedHeight = 0;
      const virtualizedItems: JSX.Element[] = [];

      column.forEach((photo) => {
        const photoHeight = (photo.height / photo.width) * columnWidth;
        const itemTop = accumulatedHeight;
        accumulatedHeight += photoHeight + IMAGE_GAP;

        if (
          itemTop + photoHeight > scrollTop - containerHeight * BUFFER_SIZE &&
          itemTop < scrollTop + containerHeight * (1 + BUFFER_SIZE)
        ) {
          virtualizedItems.push(
            <div
              data-testid="photo-item"
              key={uuidv4()}
              style={{
                height: `${photoHeight}px`,
                position: "absolute",
                top: `${itemTop}px`,
                width: "100%",
                marginBottom: `${IMAGE_GAP}px`,
              }}
            >
              <Link to={`/photo/${photo.id}`}>
                <PhotoImage
                  src={photo.urls.thumb}
                  alt={photo.alt_description || "Unsplash photo"}
                  loading="lazy"
                />
              </Link>
            </div>
          );
        }
      });

      virtualizedColumns.push(
        <PhotoColumn
          key={`column-${columnIndex}`}
          style={{
            width: `${columnWidth}px`,
            height: `${accumulatedHeight}px`,
            position: "relative",
          }}
        >
          {virtualizedItems}
        </PhotoColumn>
      );
    });

    return virtualizedColumns;
  }, [getPhotoColumns, columnWidth, scrollTop, containerHeight]);

  return (
    <GridContainer
      data-testid="grid-container"
      ref={containerRef}
      onScroll={handleScroll}
    >
      <SearchInputBar
        handleSearch={handleSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      {error && (
        <ErrorMessage data-testid="error-message">{error}</ErrorMessage>
      )}
      {isLoading && <LoadingSpinner />}
      {!isLoading && photos.length === 0 && <ErrorMessage>No photos</ErrorMessage>}
      <MasonryGrid>{renderVirtualizedColumns()}</MasonryGrid>
    </GridContainer>
  );
};
