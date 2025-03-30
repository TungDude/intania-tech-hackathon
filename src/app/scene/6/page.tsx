"use client"
import React, { useEffect, useState } from "react";
import Image from "next/image";
import EndScreen from "@/components/EndScreen";
import { useRouter } from "next/navigation";

export default function Scene6() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showLobsterMessage, setShowLobsterMessage] = useState(false);
  const [lose, setLose] = useState(false);
  const [showDepress, setShowDepress] = useState(false);
  const [option, setOption] = useState("");
  const [correct, setCorrect] = useState(false);

  useEffect(() => {
    if (correct) {
      setTimeout(() => {
        router.push("/scene/7")
      }, 6000)
    }
  }, [correct, router])

  useEffect(() => {
    if (lose) {
      setTimeout(() => {
        setShowDepress(true); // Show image after 2 seconds
      }, 2000);
    }
  }, [lose]);

  const handleSelectLobster = (option: string) => {
    setOption(option);
    setShowLobsterMessage(true);
    setTimeout(() => {
      setLose(true);
    }, 4000);
  };

  const handleSelectCorrect = () => {
    setCorrect(true);
  }

  useEffect(() => {
    setTimeout(() => {
      setShowMenu(true);
    }, 8500)
  }, []);

  return (
    <div
      className="relative bg-white h-screen w-full flex justify-center transition-all "
    >
      {correct && (
        <div className={`flex items-center justify-center h-screen text-4xl font-bold animate-fade-text-0 ${lose ? "animate-fall-down" : ""}`}>
          <Image
            src={'/images/1_boss_happy.png'}
            alt="boss_happy"
            width={200}
            height={200}
          />
          {'ส่วนผมเอา A5 Wagyu and Escargots de Bourgogne with Foie gras on top with Caviar ละกัน'}
        </div>
      )}
      {showDepress && (
        <>
          <Image
            src={'/images/lose_3.PNG'}
            alt={'3_hang'}
            width={1028}
            height={852}
            className={`object-contain animate-float-down w-full`}
          />
          <EndScreen
            text={option === 'Lobster' ? "มารยาทพื้นฐานข้อที่ 183 เมื่อผู้อาวุโสให้คุณสั่งอาหาร ควรเลือกอันที่ราคาไม่แพงเกินไป" : "มารยาทพื้นฐานข้อที่ 184 เมื่อผู้อาวุโสให้คุณสั่งอาหาร ไม่ควรเลือกอันที่ราคาถูกไป นับว่าเป็นการดูถูกกัน"}
            className="animate-fade-in-door-0"
          />
        </>
      )}
      {!showMenu ? (
        <div className="flex items-center justify-center h-screen text-4xl font-bold animate-fade-text-0">
          สั่งได้เลยนะ เลือกที่อยากกินเลย
        </div>
      ) : (
        <>
          {showLobsterMessage &&
            <div className={`flex items-center justify-center h-screen text-4xl font-bold animate-fade-text-0 ${lose ? "animate-fall-down" : ""}`}>
              <Image
                src={option === 'Lobster' ? '/images/1_boss_happy.png' : '/images/2_boss_normal.png'}
                alt="boss_happy"
                width={200}
                height={200}
              />
              {option === 'Lobster' ? 'กินของดีเลยนะ' : 'ผมมีเงินเลี้ยงคุณได้นะ'}
            </div>
          }
          {!showLobsterMessage && !correct &&
            < div
              className="flex flex-col items-center justify-center h-screen gap-8 text-3xl font-semibold"
            >
              <div
                className="flex justify-center items-center gap-8"
              >
                <div
                  className="block text-center border-[2px] rounded-3xl px-8 py-4 cursor-pointer"
                  onClick={() => handleSelectLobster("Lobster")}
                >
                  สเต๊กเนื้อธรรมดา
                  <div>399 THB</div>
                </div>
                <div
                  className="block text-center border-[2px] rounded-3xl px-8 py-4 cursor-pointer"
                  onClick={() => handleSelectLobster("Lobster")}
                >
                  สเต็กเนื้อวากิวสเปน
                  <div>789 THB</div>
                </div>
              </div>
              <div
                className="flex justify-center items-center gap-8"
              >
                <div
                  className="block text-center border-[2px] rounded-3xl px-8 py-4 cursor-pointer"
                  onClick={() => handleSelectLobster("Lobster")}
                >
                  ล็อปสเตอร์ท็อปคาเวียร์
                  <div>1299 THB</div>
                </div>
                <div
                  className="block text-center border-[2px] rounded-3xl px-8 py-4 cursor-pointer"
                  onClick={handleSelectCorrect}
                >
                  ข้าวกระเพราหมูสับไข่ดาว
                  <div>90 THB</div>
                </div>
              </div>
              <div
                className="flex justify-center items-center gap-8"
              >
                <div
                  className="block text-center border-[2px] rounded-3xl px-8 py-4 cursor-pointer"
                  onClick={() => handleSelectLobster("Nampla")}
                >
                  ข้าวคลุกน้ำปลา
                  <div>20 THB</div>
                </div>
              </div>
            </div>}
        </>
      )
      }
    </div >
  );
};