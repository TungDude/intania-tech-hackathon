import Image from "next/image";

export default function Home() {
  return (
    <div
      className="flex w-full h-full bg-black"
    >
      <Image
        src={'/images/0_door.PNG'}
        alt={'0_door'}
        width={1028}
        height={852}
        className="object-contain animate-zoom-in"
      />
    </div>
  );
}
