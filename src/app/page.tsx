"use client"
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [show, setShow] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isKnocking, setIsKnocking] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [knockCount, setKnockCount] = useState(0);
  const [end, setEnd] = useState(false);

  useEffect(() => {
    if (clickCount >= 5 && knockCount < 3) {
      setEnd(true);
    }
  }, [clickCount, knockCount])

  useEffect(() => {
    setTimeout(() => {
      setShow(1);
    }, 4000)
  }, [])

  const handleClickDoor = async () => {
    if (isProcessing || isKnocking) return; // Prevent multiple clicks

    setIsKnocking(true)
    try {
      setKnockCount(prev => prev + 1);
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate async operation
    } finally {
      setIsKnocking(false); // Re-enable clicks
    }
  }

  const handleClickKnob = async () => {
    if (isProcessing || isKnocking) return; // Prevent multiple clicks

    console.log(knockCount);

    if (knockCount >= 3) {
      router.push('/home');
    }

    setIsProcessing(true); // Disable clicks
    try {
      setClickCount(prev => prev + 1);
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate async operation
    } finally {
      setIsProcessing(false); // Re-enable clicks
    }
  };

  const getDoorImage = () => {
    const src = isKnocking ? '/images/0_door_knock.PNG' : !isProcessing ? '/images/0_door_zoom.PNG' : clickCount <= 3 || knockCount >= 3 ? '/images/0_door_turn.PNG' : '/images/0_door_knocktoomuch.PNG';

    return (
      <Image
        src={src}
        alt={'0_door_image'}
        width={1028}
        height={852}
        className="object-contain animate-fade-in-door-0"
      />
    )
  }

  return (
    <div
      className="relative"
    >
      {show === 0 ? (
        <Image
          src={'/images/0_door.PNG'}
          alt={'0_door'}
          width={1028}
          height={852}
          className="object-contain animate-zoom-in-door-0"
        />
      ) : !end ? (
        <>
          {getDoorImage()}
          <div
            className={`absolute z-20 bottom-[170px] right-[280px] w-[320px] h-[60px] ${isProcessing || isKnocking ? 'pointer-events-none' : 'cursor-pointer'
              } opacity-0`}
            onClick={handleClickKnob}
          >
          </div>
          <div
            className={`absolute bottom-0 right-[160px] w-full h-full ${isProcessing || isKnocking ? 'pointer-events-none' : 'cursor-pointer'
              } opacity-0`}
            onClick={handleClickDoor}
          >
          </div>
        </>
      ) : (
        <video
          src='/videos/video-output-119D2BEB-BFA1-42F1-8030-C5AA3D2FEB1A-1.mp4'
          autoPlay
          className="h-screen"
        />
      )}
    </div>
  );
}
