import axiosInstance from "./axiosInstance";

export const fetchBatches = async () => {
    try {
        const response = await axiosInstance.get("/batches");
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.warn("Batches endpoint returned 404, returning empty list.");
            return [];
        }
        console.error("Error fetching batches:", error);
        throw error;
    }
};

export const createBatch = async (batchData) => {
    // Single call to create batch including trainers
    const response = await axiosInstance.post("/batches", batchData);
    return response.data;
};

export const getBatch = async (batchId) => {
    const response = await axiosInstance.get(`/batches/${batchId}`);
    return response.data;
};

export const enrollStudent = async (data) => {
    // data expected: { batchId, studentId }
    // endpoint: /api/batches/:id/enroll
    const { batchId, studentId, instructorId } = data;

    if (!batchId) {
        throw new Error("Batch ID is missing for enrollment.");
    }

    // Construct payload for the specific endpoint
    const payload = { studentId };
    if (instructorId) payload.instructorId = instructorId;

    const response = await axiosInstance.post(`/batches/${batchId}/enroll`, payload);
    return response.data;
};

export const removeStudent = async (batchId, studentId) => {
    const response = await axiosInstance.post(`/batches/${batchId}/remove-student`, { studentId });
    return response.data;
};

export const deleteBatch = async (batchId) => {
    const response = await axiosInstance.delete(`/batches/${batchId}`);
    return response.data;
};

export const updateBatch = async (batchId, batchData) => {
    const response = await axiosInstance.put(`/batches/${batchId}`, batchData);
    return response.data;
};

export const fetchTrainerBatches = async () => {
    try {
        // Use the existing trainer-summary endpoint which returns activeBatches and completedBatches
        const response = await axiosInstance.get("/trainer/trainer-summary");
        return {
            activeBatches: response.data.activeBatches || [],
            completedBatches: response.data.completedBatches || []
        };
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.warn("Trainer summary endpoint returned 404, returning empty list.");
            return { activeBatches: [], completedBatches: [] };
        }
        console.error("Error fetching trainer batches:", error);
        throw error;
    }
};
