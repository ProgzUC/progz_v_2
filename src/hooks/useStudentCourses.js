import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchStudentCourses, fetchCourseProgress, fetchStudentCatalog, fetchStudentCatalogCourse } from "../api/studentApi";

export const useStudentCourses = () =>
    useQuery({
        queryKey: ["studentCourses"],
        queryFn: fetchStudentCourses,
    });

export const useStudentCatalog = () =>
    useQuery({
        queryKey: ["studentCatalog"],
        queryFn: fetchStudentCatalog,
    });

export const useStudentCatalogCourse = (courseId) =>
    useQuery({
        queryKey: ["studentCatalogCourse", courseId],
        queryFn: () => fetchStudentCatalogCourse(courseId),
        enabled: !!courseId,
    });

/** Catalog rows merged with live enrollment, progress, and next class. */
export const useUnifiedCatalog = () => {
    const catalogQuery = useStudentCatalog();
    const coursesQuery = useStudentCourses();

    const courses = useMemo(() => {
        const list = catalogQuery.data?.courses || [];
        const enrolled = coursesQuery.data?.enrolledCourses || [];
        const byId = new Map(enrolled.map((course) => [String(course.courseId), course]));

        return list
            .map((course) => {
                const match = byId.get(String(course.id)) || byId.get(String(course.courseId));
                return {
                    ...course,
                    enrolled: Boolean(match) || course.enrolled,
                    progressPercentage: match?.progressPercentage ?? null,
                    completedLessons: match?.completedLessons ?? null,
                    totalLessons: match?.totalLessons ?? course.lessonCount,
                    nextClassAt: match?.nextClassAt || null,
                    batchId: match?.batchId || null,
                    batchName: match?.batchName || null,
                    continueLesson: match?.continueLesson || null,
                };
            })
            .sort((a, b) => {
                if (a.enrolled !== b.enrolled) return a.enrolled ? -1 : 1;
                return String(a.title || "").localeCompare(String(b.title || ""), undefined, { sensitivity: "base" });
            });
    }, [catalogQuery.data, coursesQuery.data]);

    return {
        courses,
        continueLearning: coursesQuery.data?.continueLearning || null,
        nextClass: coursesQuery.data?.nextClass || null,
        isLoading: catalogQuery.isLoading || coursesQuery.isLoading,
        isError: catalogQuery.isError,
    };
};

export const useCourseProgress = (courseId) =>
    useQuery({
        queryKey: ["courseProgress", courseId],
        queryFn: () => fetchCourseProgress(courseId),
        enabled: !!courseId,
    });
