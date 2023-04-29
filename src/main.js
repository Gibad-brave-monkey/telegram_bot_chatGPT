import { Telegraf, session } from "telegraf";
import { message } from "telegraf/filters";
import { code } from "telegraf/format";
import { ogg } from "./audio.js";
import { openai } from "./openai.js";

import * as dotenv from "dotenv";
dotenv.config();

const token = process.env.TELEGRAM_TOKEN;

const INITIAL_SESSION = {
  messages: [],
};

const bot = new Telegraf(token);

bot.use(session());

bot.command("new", async (ctx) => {
  ctx.session = INITIAL_SESSION;
  await ctx.reply("Жду ваше голосовое или текстовое сообщения");
});

bot.command("start", async (ctx) => {
  ctx.session = INITIAL_SESSION;
  await ctx.reply("Жду ваше голосовое или текствое сообщение");
});

// Work with Voice Messages
bot.on(message("voice"), async (ctx) => {
  ctx.session ??= INITIAL_SESSION;
  try {
    await ctx.reply(code("Сообщение принял и жду Ответ от Сервера"));
    // await ctx.reply(JSON.stringify(ctx.message.voice, null, 2));
    // Work in ogg and Mp3 File
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
    const userId = String(ctx.message.from.id);
    console.log(link.href);
    const oggPath = await ogg.create(link.href, userId);
    const mp3Path = await ogg.toMp3(oggPath, userId);

    // Work in OpenAI
    const text = await openai.transcription(mp3Path);
    await ctx.reply(code(`Ваш запрос: ${text}`));
    ctx.session.messages.push({ role: openai.roles.USER, content: text });

    const response = await openai.chat(ctx.session.messages);

    ctx.session.messages.push({
      role: openai.roles.ASSISTANT,
      content: response.content,
    });

    await ctx.reply(response.content);
  } catch (error) {
    console.log(`Error:`, error.message);
  }
});

// Work with Text Messages
bot.on(message("text"), async (ctx) => {
  ctx.session ??= INITIAL_SESSION;
  try {
    await ctx.reply(code("Сообщение принял и жду Ответ от Сервера"));
    // Work on OpenAI
    ctx.session.messages.push({
      role: openai.roles.USER,
      content: ctx.message.text,
    });
    await ctx.reply(code(`Ваш запрос: ${ctx.message.text}`));

    const response = await openai.chat(ctx.session.messages);

    ctx.session.messages.push({
      role: openai.roles.ASSISTANT,
      content: response.content,
    });

    await ctx.reply(response.content);
  } catch (error) {
    console.log(`Error:`, error.message);
  }
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
