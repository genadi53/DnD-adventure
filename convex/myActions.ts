import { v } from "convex/values";
import { action, mutation } from "./_generated/server";
import { api } from "./_generated/api";
import OpenAI from "openai";

const openai = new OpenAI({
  // apiKey: "my api key",
  // defaults to process.env["OPENAI_API_KEY"]
});
export const handlePlayerAction = action({
  args: {
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: args.message }],
      model: "gpt-3.5-turbo",
    });
    const input = args.message;
    const response = completion.choices[0].message.content ?? "";
    console.log(completion);

    await ctx.runMutation(api.myActions.insertEntry, { input, response });

    return completion;
  },
});

export const insertEntry = mutation({
  args: {
    input: v.string(),
    response: v.string(),
  },
  handler: async (ctx, { input, response }) => {
    await ctx.db.insert("entries", {
      input,
      response,
    });
  },
});
