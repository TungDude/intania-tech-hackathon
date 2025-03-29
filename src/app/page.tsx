"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleGoToHome = () => {
    router.push("/home");
  };

  return (
    <div className="flex w-full h-full bg-black relative">
      <Image
        src={"/images/0_door.PNG"}
        alt={"0_door"}
        width={1028}
        height={852}
        className="object-contain animate-zoom-in"
      />
      <button
        onClick={handleGoToHome}
        className="absolute top-4 right-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black"
      >
        Go to Home
      </button>
    </div>
  );
}
