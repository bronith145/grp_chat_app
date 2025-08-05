"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleRegister = async () => {
    try {
      setError("");
      const res = await axios.post("http://localhost:5000/api/auth/register", form);
      localStorage.setItem("token", res.data.token);
      router.push("/chat");
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Card className="w-full max-w-md bg-zinc-900 border border-zinc-700 text-white">
        <CardContent className="space-y-6 p-6">
          <h2 className="text-2xl font-bold text-center">Register</h2>

          <Input
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <Input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleRegister}>
            Register
          </Button>

          <p className="text-sm text-center text-zinc-400">
            Already have an account?{" "}
            <Link href="/login" className="underline text-purple-400">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
