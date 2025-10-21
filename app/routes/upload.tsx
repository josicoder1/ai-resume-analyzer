import React, { type FormEvent, useState } from "react";
import Navbar from "~/Components/Navbar";
import FileUploader from "~/Components/FileUploader";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdf2img";
import { generateUUID } from "~/utils/formatters";
import { prepareInstructions, AIResponseFormat } from "../../Constants";

const Upload = () => {
    const { fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [errorText, setErrorText] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => setFile(file);

    const handleAnalyzer = async ({ companyName, jobTitle, jobDescription, file }: any) => {
        setIsProcessing(true);
        setErrorText("");
        try {
            setStatusText("Uploading the file...");
            const uploadedFile = await fs.upload([file]);
            if (!uploadedFile) throw new Error("Failed to upload File");

            setStatusText("Converting to image...");
            const imageFile = await convertPdfToImage(file);
            if (!imageFile.file) throw new Error(imageFile.error || "Failed to convert PDF to image");

            setStatusText("Uploading image...");
            const uploadedImage = await fs.upload([imageFile.file]);
            if (!uploadedImage) throw new Error("Failed to upload image");

            setStatusText("Preparing data...");
            const uuid = generateUUID();
            const data = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagePath: uploadedImage.path,
                companyName,
                jobTitle,
                jobDescription,
                feedback: "",
            };
            await kv.set(`resume:${uuid}`, JSON.stringify(data));

            setStatusText("Analyzing...");
            const feedback = await ai.feedback(
                uploadedFile.path,
                prepareInstructions({ jobTitle, jobDescription, AIResponseFormat })
            );
            if (!feedback) throw new Error("Failed to analyze resume");

            const feedbackText =
                typeof feedback.message.content === "string"
                    ? feedback.message.content
                    : feedback.message.content[0].text;

            try {
                data.feedback = JSON.parse(feedbackText);
            } catch {
                data.feedback = feedbackText;
            }

            await kv.set(`resume:${uuid}`, JSON.stringify(data));

            setStatusText("Analysis Complete, redirecting...");
            navigate(`/resume/${uuid}`);
        } catch (err: any) {
            console.error(err);
            setErrorText(err.message || "Analysis failed. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file) return setErrorText("Please upload a file");

        const formData = new FormData(e.currentTarget);
        handleAnalyzer({
            companyName: formData.get("company-name") as string,
            jobTitle: formData.get("job-title") as string,
            jobDescription: formData.get("job-description") as string,
            file,
        });
    };

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />
            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream job</h1>

                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" className="w-full" />
                        </>
                    ) : (
                        <h2>Drop your resume for an ATS score and improvement tips</h2>
                    )}

                    {!isProcessing && (
                        <form
                            id="upload-form"
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-4 mt-8"
                        >
                            {errorText && <p className="text-red-600">{errorText}</p>}

                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
                            </div>

                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
                            </div>

                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
                            </div>

                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            <button className="primary-button" type="submit">
                                Analyze Resume
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    );
};

export default Upload;
