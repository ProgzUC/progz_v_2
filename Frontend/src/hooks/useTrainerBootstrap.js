import { useQuery } from "@tanstack/react-query";
import { fetchTrainerBootstrap } from "../api/trainerApi";

export const useTrainerBootstrap = () =>
  useQuery({
    queryKey: ["trainerBootstrap"],
    queryFn: fetchTrainerBootstrap,
  });
