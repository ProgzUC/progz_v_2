import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBatches, createBatch, enrollStudent, deleteBatch, updateBatch, getBatch, fetchTrainerBatches } from "../api/batchApi";
import { fetchBatchDetails, toggleSectionCompletion } from "../api/trainerApi";
import Swal from "sweetalert2";

export const useBatches = () =>
    useQuery({
        queryKey: ["batches"],
        queryFn: fetchBatches,
    });

export const useBatch = (batchId) =>
    useQuery({
        queryKey: ["batch", batchId],
        queryFn: () => getBatch(batchId),
        enabled: !!batchId,
    });

export const useCreateBatch = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createBatch,
        onSuccess: () => {
            queryClient.invalidateQueries(["batches"]);
        },
    });
};

export const useEnrollStudent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: enrollStudent,
        onSuccess: () => {
            // Invalidate relevant queries (e.g., users, batches, courses)
            queryClient.invalidateQueries(["allUsers"]);
        },
    });
};

export const useDeleteBatch = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (batchId) => deleteBatch(batchId), // Import this!
        onSuccess: () => {
            queryClient.invalidateQueries(["batches"]);
            Swal.fire("Deleted!", "Batch has been deleted.", "success");
        },
        onError: (err) => {
            Swal.fire("Error", err.response?.data?.message || "Failed to delete batch", "error");
        }
    });
};

export const useUpdateBatch = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ batchId, batchData }) => updateBatch(batchId, batchData),
        onSuccess: () => {
            queryClient.invalidateQueries(["batches"]);
        },
    });
};

export const useTrainerBatches = () =>
    useQuery({
        queryKey: ["trainerBatches"],
        queryFn: fetchTrainerBatches,
    });

export const useTrainerBatchDetails = (batchId) =>
    useQuery({
        queryKey: ["trainerBatch", batchId],
        queryFn: () => fetchBatchDetails(batchId),
        enabled: !!batchId,
    });

export const useToggleSectionCompletion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: toggleSectionCompletion,
        onSuccess: (data, variables) => {
            // Invalidate the batch details to refresh the section progress
            if (variables.batchId) {
                queryClient.invalidateQueries(["trainerBatch", variables.batchId]);
            }
        },
    });
};
