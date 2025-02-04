"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/utils/api";
import Link from "next/link"; // Import next/link

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const signupMutation = api.auth.signup.useMutation({
    onSuccess: () => {
      router.push("/auth/signin");
    },
    onError: (err) => {
      setError(err.message || "Signup failed. Please try again.");
    },
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    signupMutation.mutate({ name, email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Sign Up</h2>
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-600 text-sm rounded-md text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={signupMutation.isPending}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300 disabled:bg-blue-400"
          >
            {signupMutation.isPending ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        

<p className="mt-6 text-center text-gray-600">
  Already have an account?{" "}
  <Link href="/auth/signin" className="text-blue-600 hover:underline">
    Sign In
  </Link>
</p>

      </div>
    </div>
  );
}