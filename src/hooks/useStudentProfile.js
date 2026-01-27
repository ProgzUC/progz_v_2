import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchStudentProfile, updateStudentProfile, changeStudentPassword } from "../api/studentApi";

export const useStudentProfile = () =>
    useQuery({
        queryKey: ["studentProfile"],
        queryFn: fetchStudentProfile,
    });

export const useUpdateStudentProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateStudentProfile,
        onSuccess: () => {
            queryClient.invalidateQueries(["studentProfile"]);
        },
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: changeStudentPassword,
    });
};
