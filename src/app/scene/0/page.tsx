"use client"
import React, { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Scene0() {
    const router = useRouter();

    useEffect(() => {
        if (!router) return;

        setTimeout(() => {
            router.push('/scene/1');
        }, 8500)
    }, [router]);

    return (
        <div
            className="flex justify-center items-center hfull w-full bg-white"
        >
            <div className="flex items-center justify-center h-screen text-4xl font-bold animate-fade-text-0">
                ณ บริษัทแห่งหนึ่งในกรุงเทพฯ
            </div>
        </div>
    )
}
