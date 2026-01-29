import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    startClass,
    markAttendance,
    endClass,
    getClassSessions,
    getBatchAttendanceReport,
} from "../api/classSessionApi";

/**
 * Start a new class session
 */
export const useStartClass = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (batchId) => startClass(batchId),
        onSuccess: () => {
            // Invalidate sessions queries to refresh the list
            queryClient.invalidateQueries({ queryKey: ["classSessions"] });
        },
    });
};

/**
 * Mark attendance for students
 */
export const useMarkAttendance = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ sessionId, attendance }) => markAttendance(sessionId, attendance),
        onSuccess: (data, variables) => {
            // Update the specific session in cache
            queryClient.invalidateQueries({ queryKey: ["classSessions"] });
            queryClient.invalidateQueries({ queryKey: ["classSession", variables.sessionId] });
        },
    });
};

/**
 * End a class session
 */
export const useEndClass = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ sessionId, notes }) => endClass(sessionId, notes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["classSessions"] });
        },
    });
};

/**
 * Get class sessions for a batch
 */
export const useClassSessions = (batchId, filters = {}) => {
    return useQuery({
        queryKey: ["classSessions", batchId, filters],
        queryFn: () => getClassSessions(batchId, filters),
        enabled: !!batchId,
    });
};

/**
 * Get batch attendance report
 */
export const useBatchAttendanceReport = (batchId) => {
    return useQuery({
        queryKey: ["batchAttendanceReport", batchId],
        queryFn: () => getBatchAttendanceReport(batchId),
        enabled: !!batchId,
    });
};
