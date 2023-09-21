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
  const items = useQuery(api.inventory.getAllItems);

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
          <div className="flex flex-col">
            <div className="flex">
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
              <div>
                {new Array(lastEntry?.health).fill("").map((_, idx) => {
                  return (
                    <div key={`${idx}${idx}`}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="red"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        className="text-red-600 w-6 h-6"
                      >
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                      </svg>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {lastEntry?.inventory.map((itemName, idx) => {
                const item = items?.find((item) => item.itemName === itemName);
                return (
                  <div key={`${itemName}${idx}`}>
                    {item && item.imageUrl ? (
                      <div className="flex flex-col text-center">
                        <img src={item.imageUrl} />
                        <p>{itemName}</p>
                      </div>
                    ) : (
                      <div>{itemName}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AdventurePage;
