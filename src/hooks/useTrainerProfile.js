import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTrainerProfile, updateTrainerProfile } from "../api/trainerApi";

export const useTrainerProfile = () =>
  useQuery({
    queryKey: ["trainerProfile"],
    queryFn: fetchTrainerProfile,
    staleTime: 5 * 60 * 1000, // profile rarely changes
  });

export const useUpdateTrainerProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTrainerProfile,
    onSuccess: () => {
      queryClient.invalidateQueries(["trainerProfile"]);
    },
  });
};
