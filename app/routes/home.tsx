import type { Route } from "./+types/home";
import Navbar from "~/Components/Navbar";
import {resumes} from "../../Constants";
import ResumeCard from "~/Components/ResumeCard";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "smart feedback for your dream job!" },
  ];
}

export default function Home() {
  return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
          <div className="page-heading">
              <h1>Track Your Application & Resume Ratings </h1>
              <h2>Review Your submissions and check AI-powered feedback</h2>
          </div>
      </section>
      {resumes.length > 0 && (
              <div className="resumes-section">
                  {resumes.map((resume) => (
                      <ResumeCard key={resume.id} resume={resume} />
                  ))}
              </div>
          )
      }

  </main>
}
