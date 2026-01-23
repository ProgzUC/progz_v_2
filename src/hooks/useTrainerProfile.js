import { useQuery } from "@tanstack/react-query";
import { fetchTrainerProfile } from "../api/trainerApi";

export const useTrainerProfile = () =>
  useQuery({
    queryKey: ["trainerProfile"],
    queryFn: fetchTrainerProfile,
    staleTime: 5 * 60 * 1000, // profile rarely changes
  });
