// ~/lib/pdf2img.ts
export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
    if (pdfjsLib) return pdfjsLib;
    if (loadPromise) return loadPromise;

    isLoading = true;
    loadPromise = (async () => {
        try {
            const lib = await import("pdfjs-dist");
            const { GlobalWorkerOptions } = lib;
            GlobalWorkerOptions.workerSrc = new URL(
                "pdfjs-dist/build/pdf.worker.min.mjs",
                import.meta.url
            ).toString();
            pdfjsLib = lib;
            return lib;
        } catch (err) {
            console.error("Failed to load pdfjs-dist:", err);
            throw err;
        } finally {
            isLoading = false;
        }
    })();

    return loadPromise;
}

export async function convertPdfToImage(file: File): Promise<PdfConversionResult> {
    try {
        const lib = await loadPdfJs();
        const { getDocument } = lib;

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);

        const viewport = page.getViewport({ scale: 3 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
            return { imageUrl: "", file: null, error: "Failed to get canvas context" };
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const imageFile = new File(
                            [blob],
                            `${file.name.replace(/\.pdf$/, "")}.png`,
                            { type: "image/png" }
                        );
                        resolve({ imageUrl: URL.createObjectURL(blob), file: imageFile });
                    } else {
                        resolve({ imageUrl: "", file: null, error: "Failed to create image blob" });
                    }
                },
                "image/png",
                1.0
            );
        });
    } catch (err: any) {
        console.error("PDF conversion error:", err);
        return { imageUrl: "", file: null, error: `Failed to convert PDF: ${err.message || err}` };
    }
}
