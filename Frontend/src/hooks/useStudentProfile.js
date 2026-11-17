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
        onSuccess: (data) => {
            // Update the cache immediately for instant UI feedback
            queryClient.setQueryData(["studentProfile"], data);

            // Invalidate to ensure we stay in sync with any background server logic
            queryClient.invalidateQueries({
                queryKey: ["studentProfile"]
            });
        },
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: changeStudentPassword,
    });
};
