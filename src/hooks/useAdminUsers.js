import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPendingUsers, fetchAllUsers, approveUser, rejectUser, deleteUser } from "../api/axiosInstance";

export const usePendingUsers = () =>
    useQuery({
        queryKey: ["pendingUsers"],
        queryFn: fetchPendingUsers,
    });

export const useAllUsers = () =>
    useQuery({
        queryKey: ["allUsers"],
        queryFn: fetchAllUsers,
    });

export const useApproveUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: approveUser,
        onSuccess: () => {
            queryClient.invalidateQueries(["pendingUsers"]);
            queryClient.invalidateQueries(["allUsers"]);
        },
    });
};

export const useRejectUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: rejectUser,
        onSuccess: () => {
            queryClient.invalidateQueries(["pendingUsers"]);
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries(["allUsers"]);
        },
    });
};
