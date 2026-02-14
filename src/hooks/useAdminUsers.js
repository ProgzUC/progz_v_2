import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPendingUsers, fetchAllUsers, approveUser, rejectUser, deleteUser, updateUser } from "../api/userApi";

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

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => updateUser(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries(["allUsers"]);
            queryClient.invalidateQueries(["user", data.user.id]);
        },
    });
};
