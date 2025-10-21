import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const formatSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        const size = bytes / Math.pow(1024, i);
        return `${size.toFixed(2)} ${units[i]}`;
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        console.log('Accepted files:', acceptedFiles);
        const file = acceptedFiles[0] || null;
        setSelectedFile(file);
        onFileSelect?.(file);
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        onDrop,
        multiple: false,
        accept: {
            'application/pdf': ['.pdf'],
        },
        maxSize: 20 * 1024 * 1024, // 20 MB
    });

    useEffect(() => {
        if (fileRejections.length > 0) {
            console.warn('Rejected:', fileRejections);
            alert('Only PDF files under 20 MB are allowed.');
        }
    }, [fileRejections]);

    return (
        <div className="w-full p-4">
            <div
                {...getRootProps({
                    className: `border-2 border-dashed rounded-xl p-8 transition-colors duration-300 cursor-pointer flex flex-col items-center justify-center ${
                        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                    }`,
                })}
            >
                <input {...getInputProps()} />

                {selectedFile ? (
                    <div className="flex items-center justify-between w-full max-w-md p-3 bg-white rounded-lg shadow-sm">
                        <div className="flex items-center space-x-3">
                            <img src="/images/pdf.png" alt="pdf" className="w-10 h-10" />
                            <div>
                                <p className="text-sm text-gray-700 truncate max-w-[200px]">
                                    {selectedFile.name}
                                </p>
                                <p className="text-gray-500 text-xs">{formatSize(selectedFile.size)}</p>
                            </div>
                        </div>
                        <button
                            className="p-2 rounded-full hover:bg-gray-100"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFile(null);
                                onFileSelect?.(null);
                            }}
                        >
                            <img src="/icons/cross.svg" alt="remove" className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="text-center text-gray-500">
                        <img src="/icons/info.svg" alt="upload" className="w-16 h-16 mx-auto mb-3" />
                        {isDragActive ? (
                            <p className="text-blue-600 font-medium">Drop your PDF here...</p>
                        ) : (
                            <>
                                <p className="text-lg">Click to upload or drag & drop</p>
                                <p className="text-sm">PDF files only (max 20 MB)</p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUploader;
