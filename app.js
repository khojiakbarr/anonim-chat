// Telegram bot kodi
require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const mongoose = require("mongoose");
const User = require("./models/User");
const { randomPairing } = require("./utils/randomPairing");
const express = require("express");
const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN); // Tokeningizni qo'ying

// MongoDB ulanishi
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Ro'yxatdan o'tish jarayoni
bot.start(async (ctx) => {
  const chatId = ctx.chat.id;
  const existingUser = await User.findOne({ telegramId: chatId });

  if (!existingUser) {
    const name = ctx.chat.username || "Foydalanuvchi";

    await ctx.reply("Ismingiz aniqlandi: " + name);
    await ctx.reply(
      "Jinsingizni tanlang:",
      Markup.inlineKeyboard([
        Markup.button.callback("Erkak", "gender_male"),
        Markup.button.callback("Ayol", "gender_female"),
      ])
    );

    bot.action(/gender_(male|female)/, async (actionCtx) => {
      const gender = actionCtx.match[1] === "male" ? "erkak" : "ayol";
      await actionCtx.reply("Yoshingizni yozing (faqat raqam):");

      bot.on("text", async function handleAge(messageCtx) {
        const age = parseInt(messageCtx.message.text);
        if (isNaN(age)) {
          return messageCtx.reply("Iltimos, faqat raqam kiriting.");
        }
        // Yoshingiz qabul qilindi, hodisani olib tashlash
        await User.create({
          telegramId: chatId,
          name,
          age,
          gender,
        });

        await messageCtx.reply(
          "Ro'yxatdan muvaffaqiyatli o'tdingiz! Suhbatdosh qidirishni boshlashingiz mumkin.",
          Markup.keyboard([
            ["Suhbatdosh qidirish"],
            ["Qarama-qarshi jins qidirish", "18+ suhbatdosh qidirish"],
            ["Mening profilim"],
          ]).resize()
        );
      });
    });
  } else {
    await ctx.reply(
      "Siz allaqachon ro'yxatdan o'tgansiz! Suhbatdosh qidirishni boshlashingiz mumkin.",
      Markup.keyboard([
        ["Suhbatdosh qidirish"],
        ["Qarama-qarshi jins qidirish", "18+ suhbatdosh qidirish"],
        ["Mening profilim"],
      ]).resize()
    );
  }
});

// Suhbatdosh qidirish
bot.hears("Suhbatdosh qidirish", async (ctx) => {
  const chatId = ctx.chat.id;
  const user = await User.findOne({ telegramId: chatId });
  if (!user) return ctx.reply("Iltimos, avval ro'yxatdan o'ting: /start");

  const partner = await randomPairing(chatId);
  if (partner) {
    ctx.reply("Suhbatdosh topildi! Endi yozishingiz mumkin.");
    bot.telegram.sendMessage(
      partner.telegramId,
      "Yangi suhbatdosh topildi! Siz bilan suhbatlashmoqda."
    );
  } else {
    ctx.reply("Ayni paytda suhbatdosh topilmadi, biroz kuting.");
  }
});

// Qarama-qarshi jins qidirish
bot.hears("Qarama-qarshi jins qidirish", async (ctx) => {
  const chatId = ctx.chat.id;
  const user = await User.findOne({ telegramId: chatId });
  if (!user) return ctx.reply("Iltimos, avval ro'yxatdan o'ting: /start");

  const partner = await randomPairing(
    chatId,
    user.gender === "erkak" ? "ayol" : "erkak"
  );
  if (partner) {
    ctx.reply("Suhbatdosh topildi! Endi yozishingiz mumkin.");
    bot.telegram.sendMessage(
      partner.telegramId,
      "Yangi suhbatdosh topildi! Siz bilan suhbatlashmoqda."
    );
  } else {
    ctx.reply("Ayni paytda suhbatdosh topilmadi, biroz kuting.");
  }
});

// 18+ suhbatdosh qidirish
bot.hears("18+ suhbatdosh qidirish", async (ctx) => {
  const chatId = ctx.chat.id;
  const user = await User.findOne({ telegramId: chatId });
  if (!user) return ctx.reply("Iltimos, avval ro'yxatdan o'ting: /start");

  if (!user.isPremium) {
    return ctx.reply(
      "18+ suhbat qidirish uchun obuna sotib oling.",
      Markup.inlineKeyboard([
        Markup.button.callback("Obuna sotib olish", "buy_subscription"),
      ])
    );
  }

  const partner = await randomPairing(chatId, null, true);
  if (partner) {
    ctx.reply("Suhbatdosh topildi! Endi yozishingiz mumkin.");
    bot.telegram.sendMessage(
      partner.telegramId,
      "Yangi suhbatdosh topildi! Siz bilan suhbatlashmoqda."
    );
  } else {
    ctx.reply("Ayni paytda suhbatdosh topilmadi, biroz kuting.");
  }
});

// Mening profilim
bot.hears("Mening profilim", async (ctx) => {
  const chatId = ctx.chat.id;
  const user = await User.findOne({ telegramId: chatId });
  if (!user) return ctx.reply("Iltimos, avval ro'yxatdan o'ting: /start");

  ctx.reply(
    `Sizning profilingiz:\nIsm: ${user.name}\nYosh: ${user.age}\nJins: ${
      user.gender
    }\nObuna: ${user.isPremium ? "Ha" : "Yo'q"}`
  );
});

// Obuna sotib olish
bot.action("buy_subscription", async (ctx) => {
  await ctx.reply(
    "Obuna turlari:\n1. 1 kunlik\n2. 1 haftalik\n3. 1 oylik\n4. Doimiy",
    Markup.keyboard([
      ["1 kunlik", "1 haftalik"],
      ["1 oylik", "Doimiy"],
    ]).resize()
  );
});

// Suhbatni to'xtatish
bot.command("stop", async (ctx) => {
  const chatId = ctx.chat.id;
  const user = await User.findOne({ telegramId: chatId });
  if (!user || !user.pairedWith) {
    return ctx.reply("Siz hozirda hech kim bilan suhbatda emassiz.");
  }

  const partnerId = user.pairedWith;
  await User.updateOne({ telegramId: chatId }, { pairedWith: null });
  await User.updateOne({ telegramId: partnerId }, { pairedWith: null });

  ctx.reply("Suhbat to'xtatildi.");
  bot.telegram.sendMessage(partnerId, "Suhbatdosh suhbatni to'xtatdi.");
});

bot.launch();

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server ishga tushdi, port: ${PORT}`);
});
