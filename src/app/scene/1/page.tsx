"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Scene1() {
  const [displayedText, setDisplayedText] = useState("");
  const fullText =
    "ช่วยด้วยๆ ช่วยด้วยๆช่วยด้วยๆช่วยด้วยๆช่วยด้วยๆช่วยด้วยๆช่วยด้วยๆช่วยด้วยๆช่วยด้วยๆช่วยด้วยๆช่วยด้วยๆ";
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayedText((prev) => prev + fullText[currentIndex]);
        currentIndex++;
      } else {
        setIsTypingComplete(true);
        clearInterval(intervalId);
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative">
      {/* Speech Bubble */}
      <div
        className="w-[800px] h-[300px] bg-contain bg-center bg-no-repeat flex items-center justify-center p-12 relative z-10 bg-transparent"
        style={{ backgroundImage: 'url("/images/ele_bubble_top.png")' }}
      >
        <div className="text-xl font-mono text-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-16">
          {displayedText}
          {!isTypingComplete && <span className="animate-pulse">|</span>}
        </div>
      </div>
      {/* Character Image */}
      <div className="relative w-[400px] h-[400px] z-20 -mt-16">
        <Image
          src="/images/1_boss_happy.png"
          alt="Boss Character"
          fill
          className={`object-contain ${
            !isTypingComplete ? "animate-bounce-subtle" : ""
          }`}
          priority
        />
      </div>
    </main>
  );
}
