"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {apiClient} from "@/sheared/apiClient";
import {getInformationProfile} from "@/constants/const";
import { MeRequest, MeResponse } from "@/types/profile/profile";

export interface User {
    id?: number
    username?: string
    firstName?: string
    lastName?: string
    phone?: string
    bio?: string
    profilePicture?: string
    roles?: string[]
}

export function useUserData() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const handleUserInformation = async () => {
        try {
            const token = localStorage.getItem("token")
            if (!token) {
                router.push("/auth/login")
                return
            }
            const response = await apiClient<MeRequest, MeResponse>(
                {
                    url: getInformationProfile(token),
                    method: "GET",
                    token: token,
                }
            );
            if (response.username != null && response.roles != null && response.id != null) {
                const userData: User = {
                    id: response.id,
                    username: response.username,
                    roles: response.roles,
                    bio: response.bio,
                    lastName: response.lastName,
                    firstName: response.firstName,
                    phone: response.phone,
                    profilePicture: response.profilePicture,
                }
                setUser(userData)
            }
        } catch (err: any) {
            router.push("/auth/login")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        handleUserInformation().then();
    }, [])

    return { user, setUser, loading }
}
