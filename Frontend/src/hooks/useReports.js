import { useQuery } from '@tanstack/react-query';
import {
    fetchOperationalSummary,
    fetchAttendanceAnalytics,
    fetchEnrollmentAnalytics,
    fetchTrainerUtilization,
    fetchBatchHealth
} from '../api/reportApi';

export const useOperationalSummary = () => {
    return useQuery({
        queryKey: ['operationalSummary'],
        queryFn: fetchOperationalSummary,
        refetchOnWindowFocus: false,
    });
};

export const useAttendanceAnalytics = (filters = {}) => {
    return useQuery({
        queryKey: ['attendanceAnalytics', filters],
        queryFn: () => fetchAttendanceAnalytics(filters),
        refetchOnWindowFocus: false,
    });
};

export const useEnrollmentAnalytics = () => {
    return useQuery({
        queryKey: ['enrollmentAnalytics'],
        queryFn: fetchEnrollmentAnalytics,
        refetchOnWindowFocus: false,
    });
};

export const useTrainerUtilization = () => {
    return useQuery({
        queryKey: ['trainerUtilization'],
        queryFn: fetchTrainerUtilization,
        refetchOnWindowFocus: false,
    });
};

export const useBatchHealth = () => {
    return useQuery({
        queryKey: ['batchHealth'],
        queryFn: fetchBatchHealth,
        refetchOnWindowFocus: false,
    });
};
