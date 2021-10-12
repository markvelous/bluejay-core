/* eslint-disable @typescript-eslint/camelcase */
import { Telegraf } from "telegraf";
import { config } from "../config";

export const sendMessage = (message: string) => {
  const bot = new Telegraf(config.telegram.botToken);
  bot.telegram.sendMessage(config.telegram.chatId, message, { parse_mode: "Markdown" });
};
