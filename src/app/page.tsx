"use client";
import Image from "next/image";
import { useState } from "react";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { cn } from "../utils/cn";

type CharacterType = "wizard" | "warrior" | "archer";
export default function Home() {
  const createAdventure = useMutation(api.adventures.createAdventure);
  const router = useRouter();

  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterType>("warrior");
  const characters: CharacterType[] = ["archer", "warrior", "wizard"];
  return (
    <div className="h-screen flex flex-col gap-4 items-center justify-center w-full">
      <h1 className="text-4xl capitalize py-4">
        Welcome to the text adventure
      </h1>

      <section className="grid grid-cols-3 gap-8">
        {characters.map((character, idx) => (
          <Image
            key={`${character}${idx}`}
            alt={`${character} character`}
            width={360}
            height={480}
            src={`/${character}.png`}
            className={cn(
              "w-full h-full",
              selectedCharacter === character ? "border-2 border-red-600" : ""
            )}
            onClick={() => {
              setSelectedCharacter(character);
            }}
          />
        ))}
      </section>

      <button
        className="rounded-lg p-2 bg-slate-400"
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
