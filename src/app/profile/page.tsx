"use client";

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "types/types";
import ProtectedRoute from "~/components/ProtectedRoute";
import { useAuth } from "~/lib/AuthContext";
import { db } from "~/lib/firebase";

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    profile_picture: "",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!authUser) return;

      try {
        const userRef = doc(db, "users", authUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data() as User;
          setProfileData({
            name: userData.user_info.name,
            email: userData.user_info.email,
            profile_picture: userData.user_info.profile_picture ?? "",
          });
        }
        setLoading(false);
      } catch (error) {
        setError("Error fetching profile data");
        setLoading(false);
      }
    };

    void fetchUserProfile();
  }, [authUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;

    try {
      const userRef = doc(db, "users", authUser.uid);
      await updateDoc(userRef, {
        user_info: {
          name: profileData.name,
          email: profileData.email,
          profile_picture: profileData.profile_picture || null,
        },
      });
      router.push("/dashboard");
    } catch (error) {
      setError("Error updating profile");
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-md space-y-8">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
              Edit Profile
            </h2>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="profile_picture"
                  className="block text-sm font-medium text-gray-700"
                >
                  Profile Picture URL
                </label>
                <input
                  id="profile_picture"
                  type="url"
                  value={profileData.profile_picture}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      profile_picture: e.target.value,
                    })
                  }
                  className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="https://example.com/profile.jpg"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
