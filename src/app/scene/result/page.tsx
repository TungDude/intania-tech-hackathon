'use client'

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDeathCount } from "@/app/_utils/gameState";

export default function ResultPage() {
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
                    GAME END!!! <br />
                    คุณได้รับการฝึกฝนเพื่อเป็นบุคลากรที่มีมารยาทงามแล้ว <br />
                    โดยคุณได้เล่นเกมนี้ใหม่ไปทั้งหมด {getDeathCount()} รอบ <br />
                    ขอบคุณที่เล่นเกมของเรา
                </div>
            </div>
        )
}