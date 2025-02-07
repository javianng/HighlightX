"use client";

import { Separator } from "@radix-ui/react-dropdown-menu";
import { type User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type User as DbUser } from "types/types";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { signIn, signInWithGoogle, signUp } from "~/lib/auth";
import { db } from "~/lib/firebase";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const createUserDocument = async (user: FirebaseUser) => {
    if (!user.email) throw new Error("User email is required");

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const newUser: DbUser = {
        user_info: { name: user.email.split("@")[0] ?? "", email: user.email },
        purchases: [],
      };
      await setDoc(userRef, newUser);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const user = isLogin
        ? await signIn(email, password)
        : await signUp(email, password);
      if (user) await createUserDocument(user);
      router.push("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) await createUserDocument(user);
      router.push("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <div className="p-4">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <CardHeader>
          <CardTitle className="text-center">
            {isLogin ? "Sign in to your account" : "Create a new account"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full">
              {isLogin ? "Sign in" : "Sign up"}
            </Button>
          </form>
          <Separator className="my-4" />
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google logo"
              className="mr-2 h-5 w-5"
            />
            Sign in with Google
          </Button>
          <p className="mt-4 text-center text-sm">
            <button
              className="hover:underline"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
