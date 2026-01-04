import { useQuery } from "@tanstack/react-query";
import { fetchTrainerBootstrap } from "../api/axiosInstance";

export const useTrainerBootstrap = () =>
  useQuery({
    queryKey: ["trainerBootstrap"],
    queryFn: fetchTrainerBootstrap,
  });
