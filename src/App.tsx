import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { GlobalStyle } from "./styles";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { ErrorBoundary } from "./components/ErrorBoundary";

const MasonryGrid = lazy(() =>
  import("./components/VirtualizedMasonryGrid").then((module) => ({
    default: module.VirtualizedMasonryGrid,
  }))
);
const PhotoDetails = lazy(() =>
  import("./components/PhotoDetails").then((module) => ({
    default: module.PhotoDetails,
  }))
);

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <GlobalStyle />
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" index element={<MasonryGrid />} />
            <Route path="/photo/:id" element={<PhotoDetails />} />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
