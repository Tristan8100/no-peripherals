'use client'
import Posts from "@/components/modules/posts/posts";
import { PostsProps } from "@/types/posts.types";
import { supabase } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function FeedPage() {
    const [role, setRole] = useState<PostsProps["role"] | null>(null)

    useEffect(() => {
        const loadUser = async () => {
            const { data: authData } = await supabase.auth.getUser()
            const authUser = authData.user
    
            if (!authUser) return
    
            const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("id", authUser.id)
            .single()
    
            console.log('profile')

            setRole(profile?.role || null)
        }

        loadUser()
    })

    if (!role) return null

    return <>
        <Posts role={role} />
    </>
}