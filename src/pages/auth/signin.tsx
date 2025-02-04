"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaDiscord } from "react-icons/fa";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Login failed: " + res.error);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscordSignIn = async () => {
    await signIn("discord", { callbackUrl: "/dashboard" });
  };
  

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Sign In</h2>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-600 text-sm rounded-md text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
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
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300 disabled:bg-blue-400"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
        <p className="text-gray-600">
  Don&apos;t have an account?{" "}
  <Link href="/auth/signup" className="text-blue-600 hover:underline">
    Sign Up
  </Link>
</p>

        </div>

        <div className="mt-6">
        <button
  onClick={handleDiscordSignIn}
  className="w-full flex items-center justify-center bg-gray-800 text-white py-2 rounded-md hover:bg-gray-900 transition duration-300"
>
  <FaDiscord className="mr-2 text-xl" />
  Sign in with Discord
</button>

        </div>
      </div>  
    </div>
  );
}
