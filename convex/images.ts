import { v } from "convex/values";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { api, internal } from "./_generated/api";
import {
  generateAdventureText,
  generateSceneDescription,
} from "../src/utils/generatePrompt";
import OpenAI from "openai";

type ImageResponce = {
  created: number;
  data: { url: string }[] | undefined;
} | null;

const openai = new OpenAI();

export const visualizeScene = internalAction({
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

    const previousEntries = entries
      .map((entry) => {
        return `${entry.input}\n\n${entry.response}`;
      })
      .join("\n\n");
    // console.log(previousEntries);

    const content = generateSceneDescription(previousEntries);
    console.log(content);

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content }],
      model: "gpt-3.5-turbo",
    });

    const prompt = completion.choices[0].message.content ?? "";
    console.log("prompt", prompt);

    const imageFetchResponse = await fetch(
      `https://api.openai.com/v1/images/generations`,
      {
        method: "POST",
        body: JSON.stringify({
          prompt,
          n: 1,
          size: "512x512",
          //   response_format: "b64_json"
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const imageResponce: ImageResponce = await imageFetchResponse.json();
    // console.log(imageFetchResponse);

    const imageUrl = imageResponce?.data?.[0]?.url;
    console.log(imageUrl);

    if (imageUrl) {
      await ctx.runMutation(internal.images.addVisualization, {
        entryId: args.entryId,
        imageUrl,
      });
    }
  },
});

export const addVisualization = internalMutation({
  args: {
    imageUrl: v.string(),
    entryId: v.id("entries"),
  },
  handler: async (ctx, { entryId, imageUrl }) => {
    await ctx.db.patch(entryId, {
      imageUrl: imageUrl,
    });
  },
});
