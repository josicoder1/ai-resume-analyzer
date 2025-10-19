import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

const FileUploader: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            console.log("File uploaded:", acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"], // Accept only PDFs
        },
        maxSize: 20 * 1024 * 1024, // 20 MB
    });

    return (
        <div className="w-full gradient-border p-6 rounded-2xl shadow-lg bg-white">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                    isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"
                }`}
            >
                <input {...getInputProps()} />

                <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 flex items-center justify-center">
                        <img
                            src="/icons/info.svg"
                            alt="upload"
                            className="w-16 h-16 opacity-70"
                        />
                    </div>

                    {file ? (
                        <div>
                            <p className="text-gray-700 font-semibold">{file.name}</p>
                            <p className="text-gray-500 text-sm">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    ) : (
                        <div>
                            <p className="text-lg text-gray-500">
                                <span className="font-semibold">Click to upload</span> or drag
                                and drop
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
