import { Loader } from "lucide-react";
import { LoadingContainer } from "../styles";

export const LoadingSpinner = ({ size = 24, color = "currentColor" }) => {
  return (
    <LoadingContainer data-testid="loading-spinner">
      <Loader className="animate-spin" size={size} color={color} />
    </LoadingContainer>
  );
};
