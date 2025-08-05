"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard since that's our main chat interface
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-gray-400">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}

