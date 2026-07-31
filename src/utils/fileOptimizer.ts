/**
 * Helper to compress image files client-side before sending to the backend.
 * Downscales images to max 1600px dimension and converts to JPEG with 0.82 quality.
 */
export async function optimizeFileForAnalysis(
  file: File
): Promise<{ name: string; mimeType: string; data: string }> {
  return new Promise((resolve, reject) => {
    // If it's an image, downscale and compress via HTML Canvas
    if (file.type.startsWith("image/")) {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        const maxDim = 1600;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          // Fallback to standard base64 if canvas context fails
          readAsBase64(file).then(resolve).catch(reject);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to optimized JPEG
        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        const base64Data = dataUrl.split(",")[1];

        resolve({
          name: file.name.replace(/\.[^/.]+$/, "") + "_optimized.jpg",
          mimeType: "image/jpeg",
          data: base64Data,
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        readAsBase64(file).then(resolve).catch(reject);
      };

      img.src = objectUrl;
    } else {
      // Standard base64 reader for PDF files
      readAsBase64(file).then(resolve).catch(reject);
    }
  });
}

function readAsBase64(
  file: File
): Promise<{ name: string; mimeType: string; data: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.includes(",") ? result.split(",")[1] : result;
      resolve({
        name: file.name,
        mimeType: file.type || "application/pdf",
        data: base64Data,
      });
    };
    reader.onerror = () =>
      reject(new Error(`'${file.name}' 파일을 읽는 도중 오류가 발생했습니다.`));
    reader.readAsDataURL(file);
  });
}
