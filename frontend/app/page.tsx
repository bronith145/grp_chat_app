"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <motion.main
      className="h-screen flex flex-col items-center justify-center text-center space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className="text-4xl md:text-6xl font-bold text-gradient bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
        Welcome to Reqium
      </h1>
      <p className="text-lg text-zinc-400">Your encrypted real-time chat platform</p>
      <div className="flex gap-4">
        <Link href="/login">
          <Button className="bg-purple-600 hover:bg-purple-700">Login</Button>
        </Link>
        <Link href="/register">
          <Button variant="outline" className="text-white border-white">Register</Button>
        </Link>
      </div>
    </motion.main>
  );
}
