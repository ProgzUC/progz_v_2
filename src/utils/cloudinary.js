


export const uploadToCloudinary = async (file, folder = "courses") => {
    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (!file) return null;
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        console.error("Cloudinary configuration missing");
        throw new Error("Cloudinary configuration missing");
    }

    if (file.size > 10 * 1024 * 1024) {
        throw new Error(`${file.name} exceeds 10MB limit`);
    }

    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", UPLOAD_PRESET);
    fd.append("folder", folder);

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
        {
            method: "POST",
            body: fd,
        }
    );

    if (!res.ok) {
        throw new Error("Cloudinary upload failed");
    }

    const data = await res.json();

    return {
        url: data.secure_url,
        publicId: data.public_id,
        fileType: data.resource_type,
        originalName: file.name,
    };
};
