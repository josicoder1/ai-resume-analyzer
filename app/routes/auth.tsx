import React, { useEffect } from "react";
import { usePuterStore } from "~/lib/puter";
import { useLocation, useNavigate } from "react-router";

export const meta = () => ([
    { title: "Resumind | Auth" },
    { name: "description", content: "Log into your account" },
])

const Auth: React.FC = () => {
    const { isLoading, auth } = usePuterStore();
    const location = useLocation();
    const navigate = useNavigate();

    const next = new URLSearchParams(location.search).get("next") || "/";

    useEffect(() => {
        if (auth?.isAuthenticated && location.pathname !== next) {
            navigate(next);
        }
    }, [auth?.isAuthenticated, navigate, next, location.pathname]);

    const handleSignOut = async () => {
        await auth.signOut();
        navigate("/auth");
    };

    return (
        <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center">
            <div className="gradient-border shadow-lg">
                <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
                    <div className="flex flex-col gap-2 items-center text-center">
                        <h1 className="text-2xl font-bold">Welcome</h1>
                        <h2 className="text-gray-600">Log In to Continue Your Journey</h2>
                    </div>

                    <div>
                        {isLoading ? (
                            <button className="auth-button animate-pulse" disabled>
                                <p>Signing you in...</p>
                            </button>
                        ) : auth?.isAuthenticated ? (
                            <button className="auth-button" onClick={handleSignOut}>
                                <p>Log Out</p>
                            </button>
                        ) : (
                            <button className="auth-button" onClick={auth.signIn}>
                                <p>Log In</p>
                            </button>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Auth;
