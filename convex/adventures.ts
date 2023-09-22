import { v } from "convex/values";
import OpenAI from "openai";
import { generateAdventureText } from "../src/utils/generatePrompt";
import { CharacterType } from "../src/utils/types";
import { api, internal } from "./_generated/api";
import { internalAction, internalQuery, mutation } from "./_generated/server";

const openai = new OpenAI({
  // apiKey: "my api key",
  // defaults to process.env["OPENAI_API_KEY"]
});

export const createAdventure = mutation({
  args: {
    character: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("adventures", {
      characterClass: args.character,
    });

    await ctx.scheduler.runAfter(0, internal.adventures.setupAdventureEntries, {
      adventureId: id,
    });

    return id;
  },
});

export const findAdventure = internalQuery({
  args: {
    adventureId: v.id("adventures"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.adventureId);
  },
});

export const setupAdventureEntries = internalAction({
  args: {
    adventureId: v.id("adventures"),
  },
  handler: async (ctx, args) => {
    const adventure = await ctx.runQuery(
      internal.adventures.findAdventure,
      args
    );

    if (!adventure) {
      throw new Error("Adventure not found");
    }

    const input = generateAdventureText(adventure.characterClass);
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: input }],
      model: "gpt-3.5-turbo",
    });
    const response = completion.choices[0].message.content ?? "";
    console.log(completion);

    await ctx.runMutation(api.dialog.insertEntry, {
      input,
      response,
      adventureId: args.adventureId,
    });

    return completion;
  },
});
