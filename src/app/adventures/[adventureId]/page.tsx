"use client";
import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

function AdventurePage(props: { params: { adventureId: string } }) {
  const [message, setMessage] = useState<string>("");
  const handlePlayerAction = useAction(api.dialog.handlePlayerAction);
  const adventureId = props.params.adventureId as Id<"adventures">;
  const entries = useQuery(api.dialog.getAllEntries);
  const lastEntry = entries && entries[entries.length - 1];

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-xl h-[400px] overflow-y-auto text-black p-2">
              {entries?.map((entry) => {
                return (
                  <div
                    key={entry._id}
                    className="flex flex-col gap-2 text-black"
                  >
                    <div>{entry.input}</div>
                    <div>{entry.response}</div>
                  </div>
                );
              })}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePlayerAction({
                  message,
                  adventureId,
                });
                setMessage("");
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
          <div>
            {lastEntry && lastEntry.imageUrl ? (
              <img
                src={lastEntry.imageUrl}
                alt="current event"
                className="h-[512px] w-full"
              />
            ) : (
              <span>loading...</span>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default AdventurePage;
