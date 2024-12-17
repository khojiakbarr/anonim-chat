# Telegram Anonim Chat Bot

Bu loyiha Telegram uchun anonim chat bot yaratishni ko'zda tutadi. Foydalanuvchilar bir-birlari bilan tasodifiy bog'lanib, suhbatlashishlari mumkin. Premium foydalanuvchilar esa yosh va jins bo'yicha suhbatdoshni tanlash imkoniyatiga ega bo'lishadi.

## Loyihani Ishga Tushirish

### 1. Talablar

Loyihani ishga tushirish uchun quyidagi texnologiyalar kerak bo'ladi:

- **Node.js** (v14+)
- **MongoDB** (Mongoose bilan)
- **Telegraf.js** (Telegram Bot API uchun)
- **Socket.io** (Real-time chat uchun)
- **Stripe** yoki **PayPal** (Premium obunalarni boshqarish uchun)

### 2. Loyiha Tuzilmasi

```
project/
│-- models/               --> Mongoose modellari (User)
│-- utils/                --> Qo'shimcha funksiyalar (random pairing)
│-- app.js                --> Asosiy bot kodi
│-- package.json          --> Node.js dependenciyalar
```

### 3. O'rnatish

Loyihani yuklab olib, kerakli paketlarni o'rnating:

```bash
npm install
```

Kerakli kutubxonalar:
- **telegraf** – Telegram Bot API bilan ishlash uchun
- **mongoose** – MongoDB ulanishi va ma'lumotlar saqlash uchun
- **socket.io** – Real-time funksiyalar uchun

### 4. Telegram Bot Tokeni

Telegram Bot Tokenini olish uchun:
1. Telegram'ning **BotFather**'iga `/newbot` komandasini yuboring.
2. Tokenni nusxalang va **app.js** fayliga joylashtiring:
   ```javascript
   const bot = new Telegraf('YOUR_TELEGRAM_BOT_TOKEN');
   ```

### 5. MongoDB Ulash

MongoDB ulanishini sozlang. `app.js` faylida quyidagilarni qo'shing:

```javascript
mongoose.connect('mongodb://localhost:27017/anonchat', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
```

### 6. Ishga Tushirish

Botni quyidagi buyruq bilan ishga tushiring:

```bash
node app.js
```

Bot muvaffaqiyatli ishga tushgandan so'ng quyidagi xabar chiqadi:

```
Bot ishga tushdi...
```

---

## Botning Buyruqlari

| Buyruq       | Tavsif                                      |
|--------------|--------------------------------------------|
| `/start`     | Ro'yxatdan o'tish va ma'lumot kiritish      |
| `/next`      | Tasodifiy suhbatdosh bilan bog'lanish       |
| `/stop`      | Suhbatni yakunlash                         |
| `/premium`   | Premium obuna sotib olish                  |

---

## Premium Xususiyatlari

Premium foydalanuvchilar:
1. Suhbatdoshning **jinsi** va **yoshini** tanlash imkoniga ega bo'ladi.
2. Premium obuna Stripe yoki PayPal orqali amalga oshiriladi.

### Stripe Integratsiyasi

Stripe orqali obuna qabul qilish uchun `Stripe Secret Key` ni oling va quyidagicha qo'shing:

```javascript
const stripe = require('stripe')('YOUR_STRIPE_SECRET_KEY');
```

---

## Mongoose Modellari

### User Modeli

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: { type: Number, required: true, unique: true },
  name: { type: String },
  age: { type: Number },
  gender: { type: String, enum: ['Erkak', 'Ayol'] },
  isPremium: { type: Boolean, default: false },
  pairedWith: { type: Number, default: null },
});

module.exports = mongoose.model('User', userSchema);
```

---

## Random Pairing Funksiyasi

Tasodifiy foydalanuvchini topish uchun:

```javascript
const User = require('../models/User');

const randomPairing = async (currentUserId) => {
  const availableUsers = await User.find({
    telegramId: { $ne: currentUserId },
    pairedWith: null,
  });

  if (availableUsers.length > 0) {
    const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
    await User.updateOne({ telegramId: currentUserId }, { pairedWith: randomUser.telegramId });
    await User.updateOne({ telegramId: randomUser.telegramId }, { pairedWith: currentUserId });
    return randomUser;
  }
  return null;
};

module.exports = { randomPairing };
```

---

## Deploy

Botni **Heroku** yoki boshqa Node.js hosting xizmatiga joylashtiring.

### PM2 Bilan Botni Monitoring Qilish

Botni doimiy ishlatish uchun PM2 ni o'rnating:

```bash
npm install -g pm2
pm2 start app.js --name "telegram-anon-bot"
```

---

## Xulosa

Bu loyiha foydalanuvchilarni anonim tarzda bog'lash va suhbatlashishga imkon beradi. Premium funksiyalar yordamida foydalanuvchilar ko'proq imkoniyatlarga ega bo'ladi.

Telegram botni sinab ko'ring va foydalanuvchi tajribasini yaxshilang!

---

**Muallif**: Sizning ismingiz
**Loyiha turi**: Telegram Anonim Chat Bot
**Texnologiyalar**: Node.js, Express.js, Telegraf.js, MongoDB, Socket.io
