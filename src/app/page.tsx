"use client";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "../utils/cn";
import ThemeButton from "../components/ThemeButton";

type CharacterType = "wizard" | "warrior" | "archer";
export default function Home() {
  const createAdventure = useMutation(api.adventures.createAdventure);
  const router = useRouter();

  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterType>("warrior");
  const characters: CharacterType[] = ["archer", "warrior", "wizard"];
  return (
    <div className="flex flex-col gap-4 items-center justify-center w-full">
      <h1 className="text-4xl capitalize py-4 text-black dark:text-white">
        Welcome to the text adventure
      </h1>
      <h3 className="text-2xl capitalize text-black dark:text-white">
        Choose your character
      </h3>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {characters.map((character, idx) => (
          <Image
            key={`${character}${idx}`}
            alt={`${character} character`}
            width={360}
            height={480}
            src={`/${character}.png`}
            className={cn(
              "w-full h-full",
              selectedCharacter === character
                ? "border-4 border-red-600 dark:border-white"
                : ""
            )}
            onClick={() => {
              setSelectedCharacter(character);
            }}
          />
        ))}
      </section>

      <button
        className="rounded-lg p-2 bg-slate-400 dark:bg-slate-200 text-lg hover:dark:bg-slate-400 hover:bg-slate-300 font-semibold"
        onClick={async () => {
          const adventureId = await createAdventure({
            character: selectedCharacter,
          });
          router.push(`/adventures/${adventureId}`);
        }}
      >
        Enter the dungeon
      </button>
    </div>
  );
}
