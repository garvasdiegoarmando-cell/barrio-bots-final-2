const { Telegraf } = require('telegraf');

module.exports = async (req, res) => {
  try {
    const BOT1_TOKEN = process.env.BARRIO_GUARDIAN_TOKEN;
    const BOT2_TOKEN = process.env.EL_PATRON_GIROS_TOKEN;
    const ADMIN = process.env.ADMIN || 'ElPatron1538';
    const AFUN_LINK = 'https://afun.mx/?ch=430500';

    if (!BOT1_TOKEN || !BOT2_TOKEN) {
      return res.status(200).send('Faltan tokens - agrega en Vercel Environment Variables');
    }

    const bot1 = new Telegraf(BOT1_TOKEN);
    const bot2 = new Telegraf(BOT2_TOKEN);

    // ACTIVAR WEBHOOKS
    if (req.url && req.url.includes('/api/bot') && !req.url.includes('bot1') && !req.url.includes('bot2')) {
      const url = `https://${req.headers.host}`;
      await bot1.telegram.setWebhook(`${url}/api/bot1`);
      await bot2.telegram.setWebhook(`${url}/api/bot2`);
      return res.status(200).send('✅ Bots webhook seteado: /api/bot1 y /api/bot2 - Barrio ACTIVO');
    }

    // BOT1 - GUARDIAN
    bot1.on('new_chat_members', async (ctx) => {
      try { await ctx.reply(`🔥 Bienvenido al Barrio! Acceso oficial: ${AFUN_LINK} Usa /registro`); } catch {}
    });

    bot1.command('mute', async (ctx) => {
      if (ctx.from.username !== ADMIN) return;
      const reply = ctx.message.reply_to_message;
      if (!reply) return ctx.reply('Responde al mensaje para mutear');
      const until = Math.floor(Date.now()/1000) + 15*60;
      await ctx.restrictChatMember(reply.from.id, {until_date: until, can_send_messages: false});
      await ctx.reply('🔇 Muteado 15 min');
    });

    bot1.command('unmute', async (ctx) => {
      if (ctx.from.username !== ADMIN) return;
      const reply = ctx.message.reply_to_message;
      if (!reply) return;
      await ctx.restrictChatMember(reply.from.id, {can_send_messages: true, can_send_media_messages: true, can_send_other_messages: true, can_add_web_page_previews: true});
      await ctx.reply('🔊 Desmuteado');
    });

    bot1.command('presente', async (ctx) => {
      if (ctx.from.username === ADMIN) await ctx.reply('✅ Patrón de vuelta');
    });

    // BOT2 - GIROS
    let codes = [];
    bot2.start(async (ctx) => {
      await ctx.reply(`💎 ¡Barrio! /vitrina /registro /verificar ID\nAcceso: ${AFUN_LINK}`);
    });

    bot2.command('stock', async (ctx) => {
      if (ctx.from.username === ADMIN) await ctx.reply(`📦 Stock: ${codes.length} códigos`);
    });

    bot2.command('agregar_codigo', async (ctx) => {
      if (ctx.from.username !== ADMIN) return;
      const code = ctx.message.text.split(' ').slice(1).join(' ').trim();
      if (!code) return ctx.reply('Uso: /agregar_codigo CODIGO');
      codes.push(code);
      await ctx.reply(`✅ Agregado. Stock: ${codes.length}`);
    });

    bot2.command('verificar', async (ctx) => {
      await ctx.reply(`🔍 ID recibido. Patrón verifica en panel ch=430500. No recargues hasta confirmación.`);
    });

    bot2.command('registro', async (ctx) => {
      await ctx.reply(`📝 REGISTRO LIMPIO:\n1. Entra: ${AFUN_LINK}\n2. En Código de invitación NO PONGAS NADA\n3. Luego /verificar TU_ID`);
    });

    bot2.command('vitrina', async (ctx) => {
      await ctx.reply('🎰 Vitrina del Patrón: https://t.me/VitrinaDelPatronReal');
    });

    bot2.command('codigo', async (ctx) => {
      await ctx.reply('Para tu código usa /verificar tu ID primero');
    });

    // HANDLE UPDATE
