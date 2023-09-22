import { v } from "convex/values";
import {
  action,
  internalAction,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { api, internal } from "./_generated/api";
import OpenAI from "openai";
import { CONSTANTS } from "../src/utils/constants";

const openai = new OpenAI();

export const handlePlayerAction = action({
  args: {
    adventureId: v.id("adventures"),
    message: v.string(),
  },
  handler: async (ctx, { adventureId, message: userPrompt }) => {
    const entries = await ctx.runQuery(internal.dialog.getEntriesForAdventure, {
      adventureId,
    });

    const prefix = entries
      .map((entry) => {
        return `${entry.input}\n\n${entry.response}`;
      })
      .join("\n\n");

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: `${prefix}${userPrompt}` }],
      model: "gpt-3.5-turbo",
    });
    const response = completion.choices[0].message.content ?? "";
    console.log(completion);

    await ctx.runMutation(api.dialog.insertEntry, {
      input: userPrompt,
      response,
      adventureId,
    });
  },
});

export const insertEntry = mutation({
  args: {
    input: v.string(),
    response: v.string(),
    adventureId: v.id("adventures"),
  },
  handler: async (ctx, { input, response, adventureId }) => {
    const entryId = await ctx.db.insert("entries", {
      input,
      response,
      adventureId,
      health: CONSTANTS.DEFAULT_HP,
      inventory: [],
    });

    await ctx.scheduler.runAfter(0, internal.images.visualizeScene, {
      adventureId,
      entryId,
    });

    await ctx.scheduler.runAfter(0, internal.inventory.summarizeInventory, {
      adventureId,
      entryId,
    });
  },
});

export const getAllEntries = query({
  args: {
    adventureId: v.id("adventures"),
  },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("entries")
      .filter((q) => q.eq(q.field("adventureId"), args.adventureId))
      .collect();
    return entries;
  },
});

export const getEntriesForAdventure = internalQuery({
  args: {
    adventureId: v.id("adventures"),
  },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("entries")
      .filter((q) => q.eq(q.field("adventureId"), args.adventureId))
      .collect();
    return entries;
  },
});

export const combineAllPreviousEntries = internalAction({
  args: {
    adventureId: v.id("adventures"),
  },
  handler: async (ctx, args) => {
    const adventure = await ctx.runQuery(internal.adventures.findAdventure, {
      adventureId: args.adventureId,
    });

    if (!adventure) {
      throw new Error("Adventure not found");
    }

    const entries = await ctx.runQuery(internal.dialog.getEntriesForAdventure, {
      adventureId: args.adventureId,
    });
    // console.log(entries);

    const previousEntries: string = entries
      .map((entry) => {
        return `${entry.input}\n\n${entry.response}`;
      })
      .join("\n\n");
    // console.log(previousEntries);

    return previousEntries;
  },
});
