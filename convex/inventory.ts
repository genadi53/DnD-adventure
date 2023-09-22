import { v } from "convex/values";
import OpenAI from "openai";
import { CONSTANTS } from "../src/utils/constants";
import { generateInventory } from "../src/utils/generatePrompt";
import { internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";

type StatsResponce =
  | {
      health: number;
      inventory: string[];
    }
  | undefined;

const openai = new OpenAI();

export const summarizeInventory = internalAction({
  args: {
    adventureId: v.id("adventures"),
    entryId: v.id("entries"),
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

    const content = generateInventory(previousEntries);
    console.log(content);

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content }],
      model: "gpt-3.5-turbo",
    });

    const responce = completion.choices[0].message.content ?? "";
    console.log("responce", responce);

    const stats: StatsResponce = JSON.parse(responce);
    console.log(stats);

    if (!stats) throw new Error("Cannot get player stats and inventory");

    await Promise.all(
      stats.inventory.map((itemName) => {
        return ctx.runAction(internal.inventory.generateInventoryIcon, {
          itemName,
        });
      })
    );

    // for (const itemName of stats.inventory) {
    //   await ctx.runAction(internal.inventory.generateInventoryIcon, {
    //     itemName,
    //   });
    // }

    // const lastEntry = entries[entries.length - 1];
    await ctx.runMutation(internal.inventory.storePlayerStats, {
      entryId: args.entryId,
      health: stats ? stats.health : CONSTANTS.DEFAULT_HP,
      inventory: stats ? stats.inventory : [],
    });
  },
});

export const generateInventoryIcon = internalAction({
  args: {
    itemName: v.string(),
  },
  async handler(ctx, args) {
    const item = await ctx.runQuery(internal.inventory.getItemByName, {
      itemName: args.itemName,
    });

    if (item) return;
    const imageUrl = await ctx.runAction(internal.images.generateImage, {
      prompt: args.itemName,
    });

    if (imageUrl) {
      await ctx.runMutation(internal.inventory.storeItemImage, {
        imageUrl,
        itemName: args.itemName,
      });
    }
  },
});

export const storePlayerStats = internalMutation({
  args: {
    entryId: v.id("entries"),
    health: v.number(),
    inventory: v.array(v.string()),
  },
  async handler(ctx, { entryId, health, inventory }) {
    await ctx.db.patch(entryId, {
      health,
      inventory,
    });
  },
});

export const storeItemImage = internalMutation({
  args: {
    itemName: v.string(),
    imageUrl: v.string(),
  },
  async handler(ctx, { imageUrl, itemName }) {
    const item = await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("itemName"), itemName))
      .first();

    if (!item) {
      await ctx.db.insert("items", {
        itemName,
        imageUrl,
      });
    }
  },
});

export const getItemByName = internalQuery({
  args: {
    itemName: v.string(),
  },
  async handler(ctx, args) {
    const item = await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("itemName"), args.itemName))
      .first();
    return item;
  },
});

export const getAllItems = query({
  async handler(ctx) {
    return await ctx.db.query("items").collect();
  },
});
