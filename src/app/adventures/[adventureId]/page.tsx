/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Dice from "react-dice-roll";

function Spinner() {
  return (
    <div role="status">
      <svg
        aria-hidden="true"
        className="w-20 h-20 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-white"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

function AdventurePage(props: { params: { adventureId: string } }) {
  const [message, setMessage] = useState<string>("");
  const handlePlayerAction = useAction(api.dialog.handlePlayerAction);
  const adventureId = props.params.adventureId as Id<"adventures">;
  const entries = useQuery(api.dialog.getAllEntries);
  const items = useQuery(api.inventory.getAllItems);

  const lastEntry = entries && entries[entries.length - 1];

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-20">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="grid grid-cols-2 gap-8">
          <section className="flex flex-col gap-4" id="left-side">
            <div className="bg-white rounded-xl h-[600px] mb-2 overflow-y-auto text-black p-2">
              {entries?.map((entry, idx) => {
                return (
                  <div
                    key={entry._id}
                    className="flex flex-col gap-8 text-black p-3 text-xl"
                  >
                    {idx !== 0 && (
                      <div className="flex flex-col gap-1">
                        You:
                        <hr className="h-1 bg-slate-800" />
                        {entry.input}
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      Dungeon Master:
                      <hr className="h-1 bg-slate-800" />
                      {entry.response}
                    </div>
                  </div>
                );
              })}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                handlePlayerAction({
                  message,
                  adventureId,
                });
                setMessage("");
              }}
            >
              <Dice
                size={40}
                onRoll={(value) => setMessage(value.toString())}
              />

              <input
                className="p-1 px-2 rounded text-black flex-grow text-xl"
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                type="submit"
                className="rounded-lg bg-slate-400 px-2 py-1"
              >
                Submit
              </button>
            </form>
          </section>

          <section className="flex flex-col gap-4" id="right-side">
            <div className="flex gap-4">
              <div>
                {lastEntry && lastEntry.imageUrl ? (
                  <img
                    src={lastEntry.imageUrl}
                    alt="current event"
                    className="h-[512px] w-full rounded-xl"
                  />
                ) : (
                  <Spinner />
                )}
              </div>
              <div className="flex-grow grid grid-cols-3 h-fit gap-2">
                {new Array(lastEntry?.health).fill("").map((_, idx) => {
                  return (
                    <div key={`${idx}${idx}`} className="flex justify-center">
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
                        className="text-red-600 w-7 h-7"
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
                      <div className="flex flex-col text-center text-xl">
                        <img
                          src={item.imageUrl}
                          alt="inventory item"
                          className="rounded-xl border-slate-600 border"
                        />
                        <p>{itemName}</p>
                      </div>
                    ) : (
                      <div className="text-xl flex flex-col items-center">
                        <Spinner />
                        {itemName}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default AdventurePage;
