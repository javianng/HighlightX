"use client";

import { useRouter } from "next/navigation";
import ProtectedRoute from "~/components/ProtectedRoute";
import { logout } from "~/lib/auth";
import { useAuth } from "~/lib/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold">Dashboard</h1>
              </div>
              <div className="flex items-center">
                <span className="mr-4">{user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="h-96 rounded-lg border-4 border-dashed border-gray-200 p-4">
              <h2 className="mb-4 text-2xl font-bold">
                Welcome to your Dashboard
              </h2>
              <p className="text-gray-600">
                This is a protected page. You can only see this if you&apos;re
                logged in.
              </p>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
