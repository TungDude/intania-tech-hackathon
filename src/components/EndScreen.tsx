'use client'
import React from "react"

interface EndScreenProps {
    text: string;
    className?: string;
}

export default function EndScreen({ text, className }: EndScreenProps) {
    return (
        <div
            className={`absolute flex justify-center items-center h-[100vh] w-[100vw] bg-black/80 text-white font-bold text-4xl ${className ? className : ''}`}
        >
            {text}
        </div>
    )
};