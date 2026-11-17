const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];

const EXTENSION_MAP = {
  ".pdf": ["application/pdf"],
  ".doc": ["application/msword"],
  ".docx": [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
  ],
};

export function isImageFile(file) {
  return file && (file.type?.startsWith("image/") || IMAGE_TYPES.includes(file.type));
}

export function matchesAccept(file, accept) {
  if (!file || !accept) return true;

  const name = file.name?.toLowerCase() || "";
  const type = file.type?.toLowerCase() || "";

  return accept.split(",").some((raw) => {
    const part = raw.trim().toLowerCase();
    if (!part) return false;

    if (part.startsWith(".")) {
      return name.endsWith(part) || EXTENSION_MAP[part]?.includes(type);
    }

    if (part.endsWith("/*")) {
      const prefix = part.replace("/*", "");
      return type.startsWith(`${prefix}/`);
    }

    return type === part;
  });
}

function extractUrlFromHtml(html) {
  if (!html) return null;
  const srcMatch = html.match(/src=["']([^"']+)["']/i);
  return srcMatch?.[1] || null;
}

function extractUrlFromUriList(uriList) {
  if (!uriList) return null;
  return uriList.split("\n").map((l) => l.trim()).find((l) => l.startsWith("http")) || null;
}

export async function fetchImageAsFile(url, filename = "dropped-image") {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Could not download the image.");
  }

  const blob = await response.blob();
  if (!blob.type.startsWith("image/")) {
    throw new Error("The dropped link is not an image.");
  }

  const ext = blob.type.split("/")[1]?.replace("svg+xml", "svg") || "png";
  return new File([blob], `${filename}.${ext}`, { type: blob.type });
}

export async function extractImageFromDrop(event) {
  event.preventDefault();
  event.stopPropagation();

  const dt = event.dataTransfer;
  if (!dt) return null;

  const directFile = [...(dt.files || [])].find(isImageFile);
  if (directFile) return directFile;

  for (const item of [...(dt.items || [])]) {
    if (item.kind !== "file") continue;
    const file = item.getAsFile();
    if (isImageFile(file)) return file;
  }

  const html = dt.getData("text/html");
  const uri = dt.getData("text/uri-list") || dt.getData("text/plain");
  const imageUrl = extractUrlFromHtml(html) || extractUrlFromUriList(uri);

  if (imageUrl?.startsWith("http")) {
    try {
      return await fetchImageAsFile(imageUrl);
    } catch {
      throw new Error(
        "Could not load image from the web. Save the image to your computer first, then drag it here."
      );
    }
  }

  return null;
}

function collectDirectFiles(dt, accept) {
  const files = [];

  for (const file of [...(dt.files || [])]) {
    if (matchesAccept(file, accept)) files.push(file);
  }

  for (const item of [...(dt.items || [])]) {
    if (item.kind !== "file") continue;
    const file = item.getAsFile();
    if (file && matchesAccept(file, accept)) files.push(file);
  }

  return files;
}

export async function extractFilesFromDrop(
  event,
  { multiple = false, accept = "", allowWebImages = true } = {}
) {
  event.preventDefault();
  event.stopPropagation();

  const dt = event.dataTransfer;
  if (!dt) return [];

  const acceptAllowsImages = !accept || accept.includes("image");
  let files = collectDirectFiles(dt, accept);

  if (files.length === 0 && allowWebImages && acceptAllowsImages) {
    const image = await extractImageFromDrop(event);
    if (image && matchesAccept(image, accept || "image/*")) {
      files = [image];
    }
  }

  if (files.length === 0) return [];
  return multiple ? files : [files[0]];
}

export const COURSE_FILE_ACCEPT = "image/*,video/*,.pdf,.doc,.docx";
