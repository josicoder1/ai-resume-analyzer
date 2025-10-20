import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

// ✅ Helper: Converts bytes to KB, MB, GB, etc.
function formatSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = bytes / Math.pow(k, i);
    return `${value.toFixed(2)} ${sizes[i]}`;
}

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect }) => {
    const [file, setFile] = useState<File | null>(null);

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const file = acceptedFiles[0] || null;
            setFile(file);
            onFileSelect?.(file);
        },
        [onFileSelect]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: {
            "application/pdf": [".pdf"], // Accept only PDFs
        },
        maxSize: 20 * 1024 * 1024, // 20 MB
    });

    // Handler to clear the file
    const handleRemoveFile = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering the dropzone
        setFile(null); // Clear local state
        onFileSelect?.(null); // Notify parent
    };

    return (
        <div className="w-full gradient-border p-6 rounded-2xl shadow-lg bg-white">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                    isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"
                }`}
            >
                <input {...getInputProps()} />
                <div className="space-y-4 cursor-pointer">
                    {file ? (
                        <div className="uploader-selected-file" onClick={(e) => e.stopPropagation()}>
                            <img src="../../public/images/pdf.png" alt="pdf" className="size-10" />
                            <div className="flex items-center space-x-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 truncate max-w-xs">{file.name}</p>
                                    <p className="text-gray-500 text-sm">{formatSize(file.size)}</p>
                                </div>
                            </div>
                            <button className="p-2 cursor-pointer" onClick={handleRemoveFile}>
                                <img src="/icons/cross.svg" alt="remove" className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="mx-auto w-16 h-16 flex items-center justify-center mb-2">
                                <img src="/icons/info.svg" alt="upload" className="w-16 h-16 opacity-70" />
                            </div>
                            <p className="text-lg text-gray-500">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-sm text-gray-400">PDF only (max 20 MB)</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileUploader;