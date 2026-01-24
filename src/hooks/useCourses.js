import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    fetchCourses,
    fetchCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    fetchCourseVersions,
    rollbackCourse
} from "../api/courseApi";


export const useCourses = () =>
    useQuery({
        queryKey: ["courses"],
        queryFn: fetchCourses,
    });

export const useCourse = (courseId) =>
    useQuery({
        queryKey: ["courses", courseId],
        queryFn: () => fetchCourseById(courseId),
        enabled: !!courseId, // Only run if courseId is present
    });

export const useCreateCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createCourse,
        onSuccess: () => {
            queryClient.invalidateQueries(["courses"]);
        },
    });
};

export const useUpdateCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        // mutationFn expects ({ courseId, courseData }) usually, 
        // but API is updateCourse(id, data). 
        // So we wrap it or expect the component to pass an object?
        // Let's make it easy for the component: expects { id, data }
        mutationFn: ({ id, data }) => updateCourse(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(["courses"]);
            queryClient.invalidateQueries(["courses", variables.id]);
        },
    });
};

export const useDeleteCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteCourse,
        onSuccess: () => {
            queryClient.invalidateQueries(["courses"]);
        },
    });
};

export const useCourseVersions = (courseId) =>
    useQuery({
        queryKey: ["courseVersions", courseId],
        queryFn: () => fetchCourseVersions(courseId),
        enabled: !!courseId,
    });

export const useRollbackCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ courseId, versionId }) => rollbackCourse(courseId, versionId),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(["courses", variables.courseId]);
            queryClient.invalidateQueries(["courseVersions", variables.courseId]);
        },
    });
};
