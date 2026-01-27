import { useQuery } from '@tanstack/react-query';
import { fetchAdminStats, fetchEnrollmentTrends, fetchUserDistribution, fetchRecentActivities } from '../api/adminApi';

export const useAdminDashboard = () => {
    // 1. Stats Counter
    const statsQuery = useQuery({
        queryKey: ['adminStats'],
        queryFn: fetchAdminStats,
        retry: 1
    });

    // 2. Charts Data
    const trendsQuery = useQuery({
        queryKey: ['adminTrends'],
        queryFn: fetchEnrollmentTrends,
        retry: 1
    });

    const distributionQuery = useQuery({
        queryKey: ['adminDistribution'],
        queryFn: fetchUserDistribution,
        retry: 1
    });

    // 3. Recent Tables
    const activityQuery = useQuery({
        queryKey: ['adminActivity'],
        queryFn: fetchRecentActivities,
        retry: 1
    });

    return {
        stats: statsQuery.data || { courses: 0, instructors: 0, students: 0 },
        enrollments: trendsQuery.data || [],
        userDistribution: distributionQuery.data || [],
        recentCourses: activityQuery.data?.courses || [],
        recentStudents: activityQuery.data?.students || [],

        isLoading: statsQuery.isLoading || trendsQuery.isLoading || distributionQuery.isLoading || activityQuery.isLoading,
        isError: statsQuery.isError || trendsQuery.isError || distributionQuery.isError || activityQuery.isError
    };
};
