import type { Route } from "./+types/home";
import Navbar from "~/Components/Navbar";
import ResumeCard from "~/Components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import {Link, useNavigate} from "react-router";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Resumind" },
        { name: "description", content: "Smart feedback for your dream job!" },
    ];
}

export default function Home() {
    const { auth, kv } = usePuterStore();
    const navigate = useNavigate();

    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loadingResumes, setLoadingResumes] = useState(false);

    // State for the currently selected resume and its image URL
    const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
    const [resumeUrl, setResumeUrl] = useState<string>("");

    // Redirect if not authenticated
    useEffect(() => {
        if (!auth.isAuthenticated) {
            navigate("/auth?next=/");
        }
    }, [auth.isAuthenticated]);

    // Load all resumes from KV
    useEffect(() => {
        const loadResumes = async () => {
            setLoadingResumes(true);
            const resumeItems = (await kv.list("resume:*", true)) as KVItem[];

            const parsedResumes = resumeItems?.map((resume) => JSON.parse(resume.value) as Resume);
            console.log("parsedResumes", parsedResumes);

            setResumes(parsedResumes || []);
            setLoadingResumes(false);
        };
        loadResumes();
    }, []);

    // Load selected resume image
    useEffect(() => {
        if (!selectedResume) return;

        const loadResumeImage = async () => {
            const blob = await fs.read(selectedResume.imagePath);
            if (!blob) return;

            const url = URL.createObjectURL(blob);
            setResumeUrl(url);
        };

        loadResumeImage();
    }, [selectedResume]);

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />
            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Track Your Application & Resume Ratings</h1>
                    {!loadingResumes && resumes?.length === 0 ? (
                        <h2>No resumes found. upload your first resume to get feedback.</h2>
                    ): (
                            <h2>Review your submissions and check AI-powered feedback</h2>
                            )}

                </div>
                {loadingResumes && (
                    <div className="flex flex-col items-center justify-center">
                        <img src="/images/resume-scan-2.gif" className="w-[200px]"/>
                    </div>
                )}

                {!loadingResumes && resumes.length > 0 && (
                    <div className="resumes-section grid gap-4">
                        {resumes.map((resume) => (
                            <div key={resume.id} onClick={() => setSelectedResume(resume)}>
                                <ResumeCard resume={resume} />
                            </div>
                        ))}
                    </div>
                )}
                {!loadingResumes && resumes.length === 0 && (
                    <div className="flex flex-col items-center justify-center mt-10 gap-4">
                        <Link to="/upload" className="primary-button w-fit text-xl font-semibold">
                            Upload Resume
                        </Link>
                    </div>
                )}
            </section>
        </main>
    );
}
