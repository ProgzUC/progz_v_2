import { useQuery } from "@tanstack/react-query";
import { fetchStudentCourses, fetchCourseProgress } from "../api/studentApi";

export const useStudentCourses = () =>
    useQuery({
        queryKey: ["studentCourses"],
        queryFn: fetchStudentCourses,
    });

export const useCourseProgress = (courseId) =>
    useQuery({
        queryKey: ["courseProgress", courseId],
        queryFn: () => fetchCourseProgress(courseId),
        enabled: !!courseId,
    });
