"use client"
import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const [show, setShow] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [end, setEnd] = useState(false);

  useEffect(() => {
    if (clickCount === 5) {
      setEnd(true);
    }
  }, [clickCount])

  useEffect(() => {
    setTimeout(() => {
      setShow(1);
    }, 4000)
  }, [])

  const handleClickKnob = async () => {
    if (isProcessing) return; // Prevent multiple clicks

    setIsProcessing(true); // Disable clicks
    try {
      setClickCount(prev => prev + 1);
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate async operation
    } finally {
      setIsProcessing(false); // Re-enable clicks
    }
  };

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
          {!isProcessing ? (
            <Image
              src={'/images/0_door_zoom.PNG'}
              alt={'0_door_zoom'}
              width={1028}
              height={852}
              className="object-contain animate-fade-in-door-0"
            />
          ) : clickCount <= 3 ? (
            <Image
              src={'/images/0_door_turn.PNG'}
              alt={'0_door_zoom'}
              width={1028}
              height={852}
              className="object-contain animate-fade-in-door-0"
            />
          ) : (
            <Image
              src={'/images/0_door_knocktoomuch.PNG'}
              alt={'0_door_knocktoomuch'}
              width={1028}
              height={852}
              className="object-contain animate-fade-in-door-0"
            />
          )}
          <div
            className={`absolute bottom-[170px] right-[280px] w-[320px] h-[60px] ${
              isProcessing ? 'pointer-events-none' : 'cursor-pointer'
            } opacity-0`}
            onClick={handleClickKnob}
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
