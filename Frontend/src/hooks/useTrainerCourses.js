import { useQuery } from "@tanstack/react-query";
import { fetchTrainerCourses } from "../api/trainerApi";

export const useTrainerCourses = () =>
    useQuery({
        queryKey: ["trainerCourses"],
        queryFn: fetchTrainerCourses,
        staleTime: 2 * 60 * 1000, // courses don't change frequently
    });
