const Interaction = require('../models/Interaction');

const logInteraction = async (userId, productId, type) => {
  if (!userId || !productId) return;
  try {
    await Interaction.create({ userId, productId, type });
  } catch (error) {
    console.error(`[Interaction Log Error - ${type}]:`, error.message);
  }
};

module.exports = { logInteraction };