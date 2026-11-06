module.exports = async (req, res) => {
  try {
    const BOT1 = process.env.BARRIO_GUARDIAN_TOKEN;
    const BOT2 = process.env.EL_PATRON_GIROS_TOKEN;
    const HOST = `https://${req.headers.host}`;

    // Si abres /api/bot -> prende los 2 bots
    if (req.url.includes('/api/bot') && !req.url.includes('bot1') && !req.url.includes('bot2')) {
      if (!BOT1 || !BOT2) {
        return res.status(200).send('Faltan tokens en Vercel - agrega BARRIO_GUARDIAN_TOKEN y EL_PATRON_GIROS_TOKEN');
      }
      // Prende webhooks con fetch (sin libreria)
      await fetch(`https://api.telegram.org/bot${BOT1}/setWebhook?url=${HOST}/api/bot1`);
      await fetch(`https://api.telegram.org/bot${BOT2}/setWebhook?url=${HOST}/api/bot2`);
      return res.status(200).send('✅ Bots webhook seteado: /api/bot1 y /api/bot2 - Barrio del Patron ACTIVO');
    }

    // Si Telegram manda mensaje a /api/bot1 o /api/bot2
    if (req.url.includes('bot1') || req.url.includes('bot2')) {
      return res.status(200).send('OK');
    }

    return res.status(200).send('API OK - Abre /api/bot para activar bots');
  } catch (e) {
    return res.status(200).send('Error pero no falla: ' + e.message);
  }
};
