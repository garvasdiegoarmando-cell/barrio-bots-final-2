const { Telegraf } = require('telegraf');

let CODES = [];
let USED = {};
let AUSENTE = null;

const AFUN = 'https://afun.mx/?ch=430500';
const VITRINA = 'https://t.me/VitrinaDelPatronReal';
const ADMIN = process.env.ADMIN || 'ElPatron1538';

function isAdmin(ctx){ return ctx.from && ctx.from.username === ADMIN; }

module.exports = async (req, res) => {
  try {
    const BOT1_TOKEN = process.env.BARRIO_GUARDIAN_TOKEN;
    const BOT2_TOKEN = process.env.EL_PATRON_GIROS_TOKEN;
    
    if(!BOT1_TOKEN || !BOT2_TOKEN){
      return res.status(200).send('Faltan tokens');
    }

    const bot1 = new Telegraf(BOT1_TOKEN);
    const bot2 = new Telegraf(BOT2_TOKEN);

    // WEBHOOK ACTIVATION
    if(req.method === 'GET' && req.url.includes('/api/bot') && !req.url.includes('bot1') && !req.url.includes('bot2')){
      const host = `https://${req.headers.host}`;
      await bot1.telegram.setWebhook(`${host}/api/bot1`);
      await bot2.telegram.setWebhook(`${host}/api/bot2`);
      return res.status(200).send('✅ Bots webhook seteado: /api/bot1 y /api/bot2 - Barrio ACTIVO con comandos');
    }

    // BOT1 - GUARDIAN
    bot1.on('new_chat_members', async (ctx)=>{
      try{
        const names = ctx.message.new_chat_members.map(m=>m.first_name).join(', ');
        await ctx.reply(`🔥 Bienvenido ${names} al Barrio del Patron!\n📌 Reglas:\n1. Respeto\n2. Registro limpio sin codigo de invitacion\n3. Verifica antes de recargar 100\n\nAcceso oficial: ${AFUN}\nUsa /registro`);
      }catch(e){}
    });

    bot1.on('left_chat_member', async (ctx)=>{
      try{ await ctx.reply(`👋 ${ctx.message.left_chat_member.first_name} salio del Barrio. ¡La puerta queda abierta!`); }catch(e){}
    });

    bot1.command('mute', async (ctx)=>{
      if(!isAdmin(ctx)) return;
      const target = ctx.message.reply_to_message?.from;
      if(!target) return ctx.reply('Responde al mensaje del usuario con /mute');
      const until = Math.floor(Date.now()/1000)+15*60;
      await ctx.restrictChatMember(target.id,{until_date:until, can_send_messages:false});
      await ctx.reply(`🔇 ${target.first_name} muteado 15 min`);
    });

    bot1.command('unmute', async (ctx)=>{
      if(!isAdmin(ctx)) return;
      const target = ctx.message.reply_to_message?.from;
      if(!target) return;
      await ctx.restrictChatMember(target.id,{can_send_messages:true,can_send_media_messages:true,can_send_other_messages:true,can_add_web_page_previews:true});
      await ctx.reply(`🔊 ${target.first_name} desmuteado`);
    });

    bot1.command('ausente', async (ctx)=>{
      if(!isAdmin(ctx)) return;
      AUSENTE = ctx.message.text.split(' ').slice(1).join(' ') || 'Patron ausente, regreso en breve.';
      await ctx.reply(`✅ Ausente activado: ${AUSENTE}`);
    });

    bot1.command('presente', async (ctx)=>{
      if(!isAdmin(ctx)) return;
      AUSENTE = null;
      await ctx.reply('✅ Patron de vuelta');
    });

    // BOT2 - GIROS
    bot2.start(async (ctx)=>{
      await ctx.reply(`💎 ¡Bienvenido al Barrio del Patron!\n\n🎰 /vitrina\n📝 /registro - registro limpio\n🔍 /verificar TU_ID\n\nAcceso oficial: ${AFUN}`, {
        reply_markup:{inline_keyboard:[[{text:'🎰 Vitrina', url:VITRINA}],[{text:'📝 Registro', url:AFUN}]]}
      });
    });

    bot2.command('agregar_codigo', async (ctx)=>{
      if(!isAdmin(ctx)) return;
      const code = ctx.message.text.split(' ').slice(1).join(' ').trim();
      if(!code) return ctx.reply('Uso: /agregar_codigo CODIGO');
      CODES.push(code);
      await ctx.reply(`✅ Codigo agregado: ${code}\nStock: ${CODES.length}`);
    });

    bot2.command('agregar_lote', async (ctx)=>{
      if(!isAdmin(ctx)) return;
      const raw = ctx.message.text.split(' ').slice(1).join(' ');
      const lote = raw.split(/[,\n\s]+/).filter(Boolean);
      if(lote.length===0) return ctx.reply('Manda codigos separados por espacio o salto de linea');
      CODES.push(...lote);
      await ctx.reply(`✅ Lote agregado: ${lote.length} codigos\nStock total: ${CODES.length}`);
    });

    bot2.command('stock', async (ctx)=>{
      if(!isAdmin(ctx)) return;
      await ctx.reply(`📦 Stock: ${CODES.length} codigos disponibles\nUsados: ${Object.keys(USED).length}`);
    });

    bot2.command('dar_codigo', async (ctx)=>{
      if(!isAdmin(ctx)) return;
      const target = ctx.message.reply_to_message?.from;
      if(!target) return ctx.reply('Responde al mensaje del usuario verificado con /dar_codigo');
      if(CODES.length===0) return ctx.reply('❌ Sin stock, agrega con /agregar_codigo');
      const code = CODES.shift();
      USED[code] = target.username || target.id;
      try{
        await ctx.telegram.sendMessage(target.id, `💎 Tu Bono Especial del Barrio:\n\n${code}\n\nCanjealo en AFUN. Registro limpio con ${AFUN} y recarga 100 mismo dia. Si no aparece, contacta al Patron.`);
        await ctx.reply(`✅ Codigo ${code} entregado a @${target.username||target.first_name}. Quedan: ${CODES.length}`);
      }catch(e){
        CODES.unshift(code);
        delete USED[code];
        await ctx.reply('No pude mandar DM, el usuario debe iniciar chat con el bot primero: @ElPatronGiros_bot');
      }
    });

    bot2.command('negar', async (ctx)=>{
      if(!isAdmin(ctx)) return;
      const target = ctx.message.reply_to_message?.from;
      if(!target) return;
      await ctx.reply(`❌ @${target.username||target.first_name} tu registro no aparece como Barrio Oficial en panel ch=430500. Lo hiciste con codigo de invitacion o con otro enlace. Haz cuenta nueva limpia sin poner nada en Codigo de invitacion, solo con ${AFUN}`);
    });

    bot2.command('verificar', async (ctx)=>{
      const id = ctx.message.text.split(' ').slice(1).join(' ').trim();
      if(!id) return ctx.reply('Uso: /verificar TU_ID_DE_AFUN\n\n1. Registrate en '+AFUN+'\n2. NO pongas nada en Codigo de invitacion\n3. Manda tu ID\n4. Espera confirmacion del Patron ANTES de recargar 100');
      await ctx.reply(`🔍 ID ${id} recibido, el Patron lo revisa en panel ch=430500. No recargues hasta que te confirme con /dar_codigo. ${AUSENTE?'Patron dice: '+AUSENTE:''}`);
    });

    bot2.command('registro', async (ctx)=>{
      await ctx.reply(`📝 REGISTRO LIMPIO - OBLIGATORIO:\n1. Entra: ${AFUN}\n2. Registrate normal\n3. En "Codigo de invitacion" NO PONGAS NADA, dejalo vacio\n4. Si pones algo, NO apareces en mi panel y NO te puedo dar codigo\n5. Despues pon /verificar TU_ID y espera mi confirmacion ANTES de recargar 100`, {disable_web_page_preview:true});
    });

    bot2.command('vitrina', async (ctx)=>{ await ctx.reply(`💎 Vitrina: ${VITRINA}`); });
    bot2.command('codigo', async (ctx)=>{ await ctx.reply('Para tu codigo usa /verificar TU_ID primero. El Patron revisa en panel ch=430500 y luego te da tu Bono Especial con /dar_codigo'); });
    bot2.command('id', async (ctx)=>{ await ctx.reply(`Tu ID Telegram: ${ctx.from.id} @${ctx.from.username||'sin username'}`); });
    bot2.command('ayuda', async (ctx)=>{ await ctx.reply(`🆘 Comandos:\n/registro - como registrarte limpio\n/verificar ID - verificar cuenta\n/codigo - info bono\n/vitrina - ver vitrina\n/id - tu ID\n\nAdmin: /stock /agregar_codigo /agregar_lote /dar_codigo /negar /mute /unmute /ausente /presente`); });

    // HANDLE UPDATES
    if(req.url.includes('bot1')){
      await bot1.handleUpdate(req.body, res);
      return;
    }
    if(req.url.includes('bot2')){
      await bot2.handleUpdate(req.body, res);
      return;
    }

    return res.status(200).send('API OK - Usa /api/bot para activar');

  }catch(e){
    return res.status(200).send('Error handled: '+e.message);
  }
};
