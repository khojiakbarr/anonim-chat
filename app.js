// Telegram bot kodi

require("dotenv").config();
const { Telegraf } = require("telegraf");
const mongoose = require("mongoose");
const User = require("./models/User");
const { randomPairing } = require("./utils/randomPairing");

const bot = new Telegraf(process.env.BOT_TOKEN); // Tokeningizni qo'ying

// MongoDB ulanishi
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Foydalanuvchini saqlash
bot.start(async (ctx) => {
  const chatId = ctx.chat.id;
  const existingUser = await User.findOne({ telegramId: chatId });

  if (!existingUser) {
    await ctx.reply(
      "Ismingizni, yoshingizni va jinsingizni yuboring (Masalan: Ali, 25, Erkak):"
    );
    bot.on("text", async (messageCtx) => {
      const [name, age, gender] = messageCtx.message.text
        .split(",")
        .map((item) => item.trim());
      await User.create({ telegramId: chatId, name, age, gender });
      await messageCtx.reply(
        "Ro'yxatdan muvaffaqiyatli o'tdingiz! /next tugmasi bilan suhbat boshlang."
      );
    });
  } else {
    await ctx.reply(
      "Siz allaqachon ro'yxatdan o'tgansiz! /next tugmasini bosing."
    );
  }
});

// Random user bilan bog'lash
bot.command("next", async (ctx) => {
  const chatId = ctx.chat.id;
  const user = await User.findOne({ telegramId: chatId });
  if (!user) return ctx.reply("Iltimos, avval ro'yxatdan o'ting: /start");

  const partner = await randomPairing(chatId); // Random userni topish
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

bot.launch();
console.log("Bot ishga tushdi...");
