import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBatches, createBatch, enrollStudent, bulkEnrollStudents, deleteBatch, updateBatch, getBatch, fetchTrainerBatches } from "../api/batchApi";
import { fetchBatchDetails, toggleSectionCompletion } from "../api/trainerApi";
import { getErrorMessage } from "../utils/apiError";

import { showError, showSuccess } from "../utils/toast";

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
            queryClient.invalidateQueries({ queryKey: ["batches"] });
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            queryClient.invalidateQueries({ queryKey: ["allUsers"] });
        },
    });
};

export const useEnrollStudent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: enrollStudent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["allUsers"] });
            queryClient.invalidateQueries({ queryKey: ["batches"] });
            queryClient.invalidateQueries({ queryKey: ["courses"] });
        },
    });
};

export const useBulkEnrollStudents = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: bulkEnrollStudents,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["allUsers"] });
            queryClient.invalidateQueries({ queryKey: ["pendingUsers"] });
            queryClient.invalidateQueries({ queryKey: ["batches"] });
            queryClient.invalidateQueries({ queryKey: ["courses"] });
        },
    });
};

export const useDeleteBatch = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (batchId) => deleteBatch(batchId), // Import this!
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["batches"] });
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            showSuccess("Batch has been deleted.");
        },
        onError: (err) => {
            showError(getErrorMessage(err, "Failed to delete batch"));
        }
    });
};

export const useUpdateBatch = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ batchId, batchData }) => updateBatch(batchId, batchData),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["batches"] });
            if (variables?.batchId) {
                queryClient.invalidateQueries({ queryKey: ["batch", variables.batchId] });
            }
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

// export const useToggleSectionCompletion = () => {
//     const queryClient = useQueryClient();
//     return useMutation({
//         mutationFn: toggleSectionCompletion,
//         onSuccess: (data, variables) => {
//             // Invalidate the batch details to refresh the section progress
//             if (variables.batchId) {
//                 queryClient.invalidateQueries(["trainerBatch", variables.batchId]);
//             }
//         },
//     });
// };
export const useToggleSectionCompletion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleSectionCompletion,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["trainerBatch", variables.batchId],
      });
      queryClient.invalidateQueries({ queryKey: ["studentCourses"] });
      queryClient.invalidateQueries({ queryKey: ["courseProgress"] });
    },
  });
};
