/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Dice from "react-dice-roll";
import { Spinner } from "@/src/components/Spinner";
import { Heart } from "@/src/components/Hearts";

function AdventurePage(props: { params: { adventureId: string } }) {
  const [message, setMessage] = useState<string>("");
  const handlePlayerAction = useAction(api.dialog.handlePlayerAction);
  const adventureId = props.params.adventureId as Id<"adventures">;
  const entries = useQuery(api.dialog.getAllEntries);
  const items = useQuery(api.inventory.getAllItems);

  const lastEntry = entries && entries[entries.length - 1];

  return (
    <main className="flex flex-col items-center justify-between p-20">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="flex flex-col gap-4" id="left-side">
            <div
              id="style-1"
              className="bg-white dark:bg-[#121212] rounded-xl h-[600px] mb-2 overflow-y-auto text-black p-2"
            >
              {entries?.map((entry, idx) => {
                return (
                  <div
                    key={entry._id}
                    className="flex flex-col gap-8 text-black dark:text-white p-3 text-xl"
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
                className="p-1 px-2 rounded text-black dark:text-white flex-grow text-xl"
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                type="submit"
                className="rounded-lg bg-slate-400 px-2 py-1 dark:bg-slate-200 text-lg hover:dark:bg-slate-400 hover:bg-slate-300 font-semibold"
              >
                Submit
              </button>
            </form>
          </section>

          <section
            className="flex flex-col gap-4 row-start-1 md:col-start-2"
            id="right-side"
          >
            <div className="flex gap-4 flex-col md:flex-row">
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
              <div className="flex-grow grid grid-cols-6 md:grid-cols-2 h-fit gap-2">
                <div className="col-span-2 text-2xl capitalize text-black dark:text-white text-center hidden md:block">
                  HP
                </div>
                {new Array(lastEntry?.health).fill("").map((_, idx) => {
                  return (
                    <div key={`${idx}${idx}`} className="flex justify-center">
                      <Heart />
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
                      <div className="flex flex-col text-center text-xl text-black dark:text-white">
                        <img
                          src={item.imageUrl}
                          alt="inventory item"
                          className="rounded-xl border-slate-600 border"
                        />
                        <p>{itemName}</p>
                      </div>
                    ) : (
                      <div className="text-xl flex flex-col items-center text-black dark:text-white">
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
