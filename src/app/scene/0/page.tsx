"use client";

import { useRouter } from "next/navigation";

export default function Scene0() {
  const router = useRouter();
  return (
    <div
      className="flex items-center justify-center h-screen text-4xl font-bold animate-fade-text-0"
      onClick={() => router.push("/scene/1")}
    >
      ณ บริษัทแห่งหนึ่งในกรุงเทพฯ
    </div>
  );
}
