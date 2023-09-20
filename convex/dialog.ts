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

const openai = new OpenAI({
  // apiKey: "my api key",
  // defaults to process.env["OPENAI_API_KEY"]
});

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
    });

    await ctx.scheduler.runAfter(0, internal.images.visualizeScene, {
      adventureId,
      entryId,
    });
  },
});

export const getAllEntries = query({
  handler: async (ctx) => {
    const entries = await ctx.db
      .query("entries")
      // .filter((q) => q.gte)
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
