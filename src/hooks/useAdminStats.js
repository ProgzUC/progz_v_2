import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchAdminStats, fetchEnrollmentTrends, fetchUserDistribution, fetchRecentActivities } from '../api/adminApi';

export const useAdminDashboard = (range = {}) => {
    const startDate = range.startDate || null;
    const endDate = range.endDate || null;
    const queryRange = { startDate, endDate };

    const statsQuery = useQuery({
        queryKey: ['adminStats', startDate, endDate],
        queryFn: () => fetchAdminStats(queryRange),
        placeholderData: keepPreviousData,
        retry: 1,
    });

    const trendsQuery = useQuery({
        queryKey: ['adminTrends', startDate, endDate],
        queryFn: () => fetchEnrollmentTrends(queryRange),
        placeholderData: keepPreviousData,
        retry: 1,
    });

    const distributionQuery = useQuery({
        queryKey: ['adminDistribution', startDate, endDate],
        queryFn: () => fetchUserDistribution(queryRange),
        placeholderData: keepPreviousData,
        retry: 1,
    });

    const activityQuery = useQuery({
        queryKey: ['adminActivity', startDate, endDate],
        queryFn: () => fetchRecentActivities(queryRange),
        placeholderData: keepPreviousData,
        retry: 1,
    });

    return {
        stats: statsQuery.data || { courses: 0, instructors: 0, students: 0 },
        enrollments: trendsQuery.data || [],
        userDistribution: distributionQuery.data || [],
        recentCourses: activityQuery.data?.courses || [],
        recentStudents: activityQuery.data?.students || [],

        isLoading: statsQuery.isLoading || trendsQuery.isLoading || distributionQuery.isLoading || activityQuery.isLoading,
        isFetching: statsQuery.isFetching || trendsQuery.isFetching || distributionQuery.isFetching || activityQuery.isFetching,
        isError: statsQuery.isError || trendsQuery.isError || distributionQuery.isError || activityQuery.isError,
    };
};
