import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPendingUsers, fetchAllUsers, approveUser, rejectUser, deleteUser, updateUser, adminCreateUser } from "../api/userApi";

export const usePendingUsers = () =>
    useQuery({
        queryKey: ["pendingUsers"],
        queryFn: fetchPendingUsers,
    });

export const useAllUsers = () =>
    useQuery({
        queryKey: ["allUsers"],
        queryFn: fetchAllUsers,
        refetchOnMount: "always",
    });

export const useApproveUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: approveUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pendingUsers"] });
            queryClient.invalidateQueries({ queryKey: ["allUsers"] });
        },
    });
};

export const useRejectUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: rejectUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pendingUsers"] });
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["allUsers"] });
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => updateUser(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["allUsers"] });
            queryClient.invalidateQueries({ queryKey: ["user", data.user.id] });
        },
    });
};

export const useAdminCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: adminCreateUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["allUsers"] });
            queryClient.refetchQueries({ queryKey: ["allUsers"] });
        },
    });
};
