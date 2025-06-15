"use client";
import { useRouter } from "next/navigation";
import { User, KeyRound } from "lucide-react";

export default function Home() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-white">
      <h1 className="text-3xl font-bold text-purple-700 mb-8">Ice Cream Management System</h1>
      <div className="flex gap-8">
        <button
          onClick={() => router.push("/auth-forms/user")}
          className="flex flex-col items-center bg-white border border-purple-200 rounded-xl shadow-md px-10 py-8 hover:shadow-lg transition group"
        >
          <User className="w-10 h-10 text-purple-600 mb-2 group-hover:scale-110 transition" />
          <span className="text-lg font-semibold text-purple-700">User</span>
        </button>
        <button
          onClick={() => router.push("/auth-forms/admin")}
          className="flex flex-col items-center bg-white border border-purple-200 rounded-xl shadow-md px-10 py-8 hover:shadow-lg transition group"
        >
          <KeyRound className="w-10 h-10 text-purple-600 mb-2 group-hover:scale-110 transition" />
          <span className="text-lg font-semibold text-purple-700">Admin</span>
        </button>
      </div>
    </div>
  );
}
