"use client";
import Image from "next/image";
import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const [message, setMessage] = useState<string>("");
  const handlePlayerAction = useAction(api.myActions.handlePlayerAction);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl h-[400px] w-[200px] text-black"></div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePlayerAction({ message });
            }}
          >
            <input
              className="p-1 rounded text-black"
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
    </main>
  );
}
