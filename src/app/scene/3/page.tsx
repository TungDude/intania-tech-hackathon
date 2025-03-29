'use client'
import React, { useState, useEffect } from "react";
import Image from "next/image";
import EndScreen from "@/components/EndScreen";
import { useRouter } from "next/navigation";

export default function Scene3() {
    const router = useRouter();
    const [isClothDropped, setIsClothDropped] = useState(false);
    const [textSequence, setTextSequence] = useState(0);
    const [winable, setWinable] = useState(false);
    const [lose, setLose] = useState(false);
    const [showHangImage, setShowHangImage] = useState(false);

    useEffect(() => {
        if (lose) return;

        const timeout = setTimeout(() => {
            setTextSequence(prev => prev + 1);
        }, 5000);

        return () => clearTimeout(timeout);
    }, [textSequence, lose]);

    useEffect(() => {
        if (textSequence === 3) {
            setWinable(true);
        }
    }, [textSequence]);

    useEffect(() => {
        if (lose) {
            setTimeout(() => {
                setShowHangImage(true); // Show image after 4 seconds
            }, 2000);
        }
    }, [lose]);


    const handleDragStart = (event: React.DragEvent<HTMLImageElement>) => {
        event.dataTransfer.setData("cloth", "true");
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const data = event.dataTransfer.getData("cloth");

        if (data) {
            if (!winable) {
                setLose(true);
                return;
            }

            setIsClothDropped(true);
            router.push('/scene/4');
        }
    };

    return (
        <div
            className={`relative bg-white h-screen w-full flex justify-center transition-all `}
        >
            {showHangImage && (
                <>
                    <Image
                        src={'/images/3_hang.PNG'}
                        alt={'3_hang'}
                        width={1028}
                        height={852}
                        className={`object-contain animate-float-down`}
                    />
                    <EndScreen
                        text="มารยาทพื้นฐานข้อที่ 11 ควรเอาผ้าคลุมตักก่อนรับประทานอาหาร"
                        className="animate-fade-in-door-0"
                    />
                </>
            )}
            {!showHangImage && (
                <Image
                    src={lose ? '/images/3_lose.PNG' : '/images/3_table_water_empty.PNG'}
                    alt={'3_sample_layout'}
                    width={1028}
                    height={852}
                    className={`object-contain transition-all ${lose ? "animate-fall-down" : ""
                        }`}
                />
            )}

            {textSequence === 1 && (
                <div key={textSequence} className={`absolute flex h-[400px] w-[400px] overflow-hidden left-[200px] bottom-[260px] animate-fade-text-3 ${lose ? "animate-fall-down" : ""
                    }`}>
                    <Image
                        src={'/images/ele_bubble_left.PNG'}
                        alt={'3_bubble_left'}
                        width={400}
                        height={400}
                        className="object-contain"
                    />
                    <div className="absolute inset-0 flex justify-center items-center text-black font-bold text-xl z-10 px-24">
                        ผมเรียกพนักงานให้เรียบร้อยแล้วนะครับ
                    </div>
                </div>
            )}

            {textSequence === 2 && (
                <div key={textSequence} className={`absolute flex h-[400px] w-[400px] overflow-hidden right-[200px] bottom-[260px] animate-fade-text-3 ${lose ? "animate-fall-down" : ""
                    }`}>
                    <Image
                        src={'/images/ele_bubble_right.PNG'}
                        alt={'3_bubble_right'}
                        width={400}
                        height={400}
                        className="object-contain"
                    />
                    <div className="absolute inset-0 flex justify-center items-center text-black font-bold text-xl z-10 px-28">
                        เชฟร้านนี้ทำเร็วและอร่อยมากนะ
                    </div>
                </div>
            )}

            {!isClothDropped && !lose && (
                <Image
                    src={'/images/IMG_5214.PNG'}
                    alt={'3_cloth'}
                    width={1028}
                    height={852}
                    className={`absolute bottom-[90px] h-[200px] w-auto cursor-pointer animate-pulse-cloth-3 hover:animate-scale-up-cloth-3 ${lose ? "animate-fall-down" : ""
                        }`}
                    draggable={true}
                    onDragStart={handleDragStart}
                />
            )}

            <div
                className="absolute bottom-0 w-[500px] h-[70px] opacity-0"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            />
        </div>
    );
}
