import { v } from "convex/values";
import OpenAI from "openai";
import { ImagesResponse } from "openai/resources";
import { CONSTANTS } from "../src/utils/constants";
import { generateSceneDescription } from "../src/utils/generatePrompt";
import { internal } from "./_generated/api";
import { internalAction, internalMutation } from "./_generated/server";

const openai = new OpenAI();

export const visualizeScene = internalAction({
  args: {
    adventureId: v.id("adventures"),
    entryId: v.id("entries"),
  },
  handler: async (ctx, args) => {
    const previousEntries = await ctx.runAction(
      internal.dialog.combineAllPreviousEntries,
      { adventureId: args.adventureId }
    );
    const content = generateSceneDescription(previousEntries);
    console.log(content);

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content }],
      model: "gpt-3.5-turbo",
    });

    const prompt = completion.choices[0].message.content ?? "";
    console.log("prompt", prompt);

    const imageUrl = await ctx.runAction(internal.images.generateImage, {
      prompt: prompt + " illustration, dark, fantasy",
    });

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

export const generateImage = internalAction({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const imageFetchResponse = await fetch(
      `https://api.openai.com/v1/images/generations`,
      {
        method: "POST",
        body: JSON.stringify({
          prompt: args.prompt,
          n: 1,
          size: "256x256",
          //   response_format: "b64_json"
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const imageResponce: ImagesResponse = await imageFetchResponse.json();
    // console.log(imageFetchResponse);
    const imageUrl = imageResponce?.data?.[0]?.url;
    console.log(imageUrl);

    if (imageUrl) {
      // Download the image
      const response = await fetch(imageUrl);
      const image = await response.blob();

      // Store the image in Convex
      const storageId = await ctx.storage.store(image);
      return (
        (await ctx.storage.getUrl(storageId)) ??
        CONSTANTS.DEFAULT_ITEM_IMAGE_URL
      );
    }
    return imageUrl;
  },
});

export const generateImageSecond = internalAction({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const opanaiResponse = await openai.images.generate({
      prompt: args.prompt,
      size: "256x256",
    });
    const imageUrl = opanaiResponse.data[0]["url"]!;

    // Download the image
    const response = await fetch(imageUrl);
    const image = await response.blob();

    // Store the image in Convex
    const storageId = await ctx.storage.store(image);

    await ctx.runMutation(internal.inventory.storeItemImage, {
      imageUrl:
        (await ctx.storage.getUrl(storageId)) ??
        CONSTANTS.DEFAULT_ITEM_IMAGE_URL,
      itemName: args.prompt,
    });

    return imageUrl;
  },
});
