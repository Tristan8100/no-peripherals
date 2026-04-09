'use client';

import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        console.log("Checking authentication status...");
        const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            setUser(user);
            console.log("Logged in:", user.email);
        } else {
            setUser(null);
            console.log("Not logged in");
            router.push("/");
        }
        });

        return () => unsubscribe();
    }, []);

    return (
      <>
        <div>layout</div>
        {children}
      </>
    );
}