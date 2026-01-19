import axios from "axios";

export const uploadToCloudinary = async (file) => {
    if (!file) return null;

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        console.error("Cloudinary configuration missing");
        throw new Error("Cloudinary configuration missing");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
            formData
        );

        return {
            url: response.data.secure_url,
            publicId: response.data.public_id,
            fileType: response.data.resource_type,
            originalName: response.data.original_filename
        };
    } catch (error) {
        console.error("Cloudinary upload failed:", error);
        throw error;
    }
};
