"use client";
import Image from "next/image";
import { useState } from "react";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

export default function Home() {
  const createAdventure = useMutation(api.adventures.createAdventure);
  const router = useRouter();
  return (
    <div className="h-screen flex items-center justify-center w-full">
      <button
        className="rounded-lg"
        onClick={async () => {
          const adventureId = await createAdventure({ character: "warrior" });
          router.push(`/adventures/${adventureId}`);
        }}
      >
        Enter the dungeon
      </button>
    </div>
  );
}
