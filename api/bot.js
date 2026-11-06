let CODES = ["BONO-BIENVENIDA-BARRIO-100"];
let USED = {};
let AUSENTE = null;
const AFUN = 'https://afun.mx/?ch=430500';
const VITRINA = 'https://t.me/VitrinaDelPatronReal';
const ADMIN = 'ElPatron1538';

async function tgSend(token, chatId, text){
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({chat_id: chatId, text: text})
  });
}

module.exports = async (req, res) => {
  const B1 = process.env.BARRIO_GUARDIAN_TOKEN;
  const B2 = process.env.EL_PATRON_GIROS_TOKEN;

  if(req.method === 'GET'){
    const host = `https://${req.headers.host}`;
    await fetch(`https://api.telegram.org/bot${B1}/setWebhook?url=${host}/api/bot1`);
    await fetch(`https://api.telegram.org/bot${B2}/setWebhook?url=${host}/api/bot2`);
    return res.status(200).send('✅ Bots webhook seteado: /api/bot1 y /api/bot2 - Barrio ACTIVO con comandos V3');
  }

  try{
    let body = req.body;
    if(typeof body === 'string') body = JSON.parse(body);
    if(!body || !body.message) return res.status(200).send('OK');
    const msg = body.message;
    const chatId = msg.chat.id;
    const text = msg.text || '';
    const fromUser = msg.from.username || '';
    let token = req.url.includes('bot1') ? B1 : B2;

    if(text.startsWith('/start')){
      await tgSend(token, chatId, `💎 ¡Bienvenido al Barrio del Patron!\n\n🎰 Vitrina: ${VITRINA}\n📝 /registro\n🔍 /verificar TU_ID\nAcceso: ${AFUN}`);
    }
    else if(text.startsWith('/stock')){
      await tgSend(token, chatId, `📦 Stock: ${CODES.length} codigos\nUsados: ${Object.keys(USED).length}`);
    }
    else if(text.startsWith('/agregar_codigo')){
      const code = text.replace('/agregar_codigo','').trim();
      if(code){ CODES.push(code); await tgSend(token, chatId, `✅ Agregado: ${code}\nStock: ${CODES.length}`); }
    }
    else if(text.startsWith('/verificar')){
      await tgSend(token, chatId, `🔍 ID recibido, Patron lo revisa en ch=430500`);
    }
    else if(text.startsWith('/registro')){
      await tgSend(token, chatId, `📝 REGISTRO LIMPIO:\n1. ${AFUN}\n2. Deja VACIO "Codigo de invitacion"\n3. /verificar TU_ID`);
    }
    else if(text.startsWith('/vitrina')){
      await tgSend(token, chatId, `💎 ${VITRINA}`);
    }
    else if(text.startsWith('/id')){
      await tgSend(token, chatId, `Tu ID: ${msg.from.id} @${fromUser}`);
    }
  }catch(e){}

  return res.status(200).send('OK');
};
