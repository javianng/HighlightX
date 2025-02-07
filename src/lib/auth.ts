import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
  type AuthError,
} from "firebase/auth";
import { auth } from "./firebase";

export const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return userCredential.user;
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(authError.code || "An error occurred during sign up");
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return userCredential.user;
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(authError.code || "An error occurred during sign in");
  }
};

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(
      authError.code || "An error occurred during Google sign in",
    );
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(authError.code || "An error occurred during logout");
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
