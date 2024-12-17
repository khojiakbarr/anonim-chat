const User = require("../models/User");

const randomPairing = async (currentUserId) => {
  const availableUsers = await User.find({
    telegramId: { $ne: currentUserId },
    pairedWith: null,
  });
  console.log(availableUsers);

  if (availableUsers.length > 0) {
    const randomUser =
      availableUsers[Math.floor(Math.random() * availableUsers.length)];
    await User.updateOne(
      { telegramId: currentUserId },
      { pairedWith: randomUser.telegramId }
    );
    await User.updateOne(
      { telegramId: randomUser.telegramId },
      { pairedWith: currentUserId }
    );
    return randomUser;
  }
  return null;
};

module.exports = { randomPairing };
