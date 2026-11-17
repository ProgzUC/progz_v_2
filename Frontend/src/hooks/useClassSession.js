import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    startClass,
    joinClass,
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
            queryClient.invalidateQueries({ queryKey: ["classSessions"] });
        },
    });
};

/**
 * Join class — records join time and auto-marks attendance
 */
export const useJoinClass = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (batchId) => joinClass(batchId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["classSessions"] });
            queryClient.invalidateQueries({ queryKey: ["studentAttendance"] });
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
