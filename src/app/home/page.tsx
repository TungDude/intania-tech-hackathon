"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const handleSceneSelect = (sceneNumber: number) => {
    router.push(`/scene/${sceneNumber}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="text-center space-y-12">
        <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          It&apos;s All Matter
        </h1>
        <div className="space-y-4">
          <button
            onClick={() => handleSceneSelect(1)}
            className="w-64 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Scene 1
          </button>
          <button
            onClick={() => handleSceneSelect(2)}
            className="w-64 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Scene 2
          </button>
          <button
            onClick={() => handleSceneSelect(4)}
            className="w-64 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Scene 3
          </button>
        </div>
      </div>
    </main>
  );
}
