import * as pdfjsLib from "pdfjs-dist";

// Set worker source for pdfjs using cdnjs worker compatible with standard builds
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export interface ConvertedFilePart {
  name: string;
  mimeType: string;
  data: string;
}

/**
 * Optimizes and converts input files (PDF/Images) into lightweight JPEG Base64 parts.
 * Reduces raw 10MB+ PDF files into compact 100~300KB JPEG page snapshots to guarantee
 * fast, reliable transfer without hitting server payload limits (404/413 errors).
 */
export async function optimizeFilesForAnalysis(
  files: File[]
): Promise<ConvertedFilePart[]> {
  const results: ConvertedFilePart[] = [];

  for (const file of files) {
    if (file.type === "application/pdf") {
      try {
        const pdfParts = await convertPdfToImageParts(file);
        if (pdfParts.length > 0) {
          results.push(...pdfParts);
          continue;
        }
      } catch (err) {
        console.warn(`PDF JS rendering fallback for ${file.name}:`, err);
      }
      // Fallback if client-side PDF rendering fails
      const fallbackPart = await readAsBase64(file);
      results.push(fallbackPart);
    } else if (file.type.startsWith("image/")) {
      try {
        const imagePart = await compressImageFile(file);
        results.push(imagePart);
      } catch (err) {
        console.warn(`Image compression fallback for ${file.name}:`, err);
        const fallbackPart = await readAsBase64(file);
        results.push(fallbackPart);
      }
    } else {
      const fallbackPart = await readAsBase64(file);
      results.push(fallbackPart);
    }
  }

  return results;
}

/**
 * Converts PDF pages into lightweight JPEG images (Max 6 pages per PDF, 1200px max width).
 */
async function convertPdfToImageParts(file: File): Promise<ConvertedFilePart[]> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const numPages = Math.min(pdf.numPages, 6); // Render top 6 pages max
  const convertedParts: ConvertedFilePart[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const unscaledViewport = page.getViewport({ scale: 1.0 });

    // Target max dimension around 1200px for sharp text while keeping byte size ~150KB
    const targetMaxDim = 1200;
    const currentMax = Math.max(unscaledViewport.width, unscaledViewport.height);
    const scale = Math.min(1.5, targetMaxDim / currentMax);

    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) continue;

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    await page.render({
      canvasContext: ctx,
      viewport: viewport,
      canvas: canvas,
    }).promise;

    const dataUrl = canvas.toDataURL("image/jpeg", 0.78);
    const base64Data = dataUrl.split(",")[1];

    convertedParts.push({
      name: `${file.name.replace(/\.[^/.]+$/, "")}_page${pageNum}.jpg`,
      mimeType: "image/jpeg",
      data: base64Data,
    });
  }

  return convertedParts;
}

/**
 * Downscales and compresses image files (JPEG/PNG) to max 1200px JPEG.
 */
function compressImageFile(file: File): Promise<ConvertedFilePart> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const maxDim = 1200;
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
        readAsBase64(file).then(resolve).catch(reject);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.78);
      const base64Data = dataUrl.split(",")[1];

      resolve({
        name: file.name.replace(/\.[^/.]+$/, "") + "_compressed.jpg",
        mimeType: "image/jpeg",
        data: base64Data,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      readAsBase64(file).then(resolve).catch(reject);
    };

    img.src = objectUrl;
  });
}

function readAsBase64(file: File): Promise<ConvertedFilePart> {
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
      reject(new Error(`'${file.name}' 파일을 읽는 중 오류가 발생했습니다.`));
    reader.readAsDataURL(file);
  });
}
