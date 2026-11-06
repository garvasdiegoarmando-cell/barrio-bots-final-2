let CODES = ["BONO-BIENVENIDA-100"];
let USED = {};

module.exports = async (req, res) => {
  const B1 = process.env.BARRIO_GUARDIAN_TOKEN;
  const B2 = process.env.EL_PATRON_GIROS_TOKEN;

  // ACTIVAR
  if(req.method === 'GET'){
    const host = `https://${req.headers.host}`;
    if(B1) await fetch(`https://api.telegram.org/bot${B1}/setWebhook?url=${host}/api/bot1`).then(r=>r.json()).then(d=>console.log(d));
    if(B2) await fetch(`https://api.telegram.org/bot${B2}/setWebhook?url=${host}/api/bot2`).then(r=>r.json()).then(d=>console.log(d));
    return res.status(200).send('✅ Bots webhook seteado: /api/bot1 y /api/bot2 - Barrio ACTIVO con comandos V4 FIX');
  }

  // LEER BODY MANUAL
  let body = req.body;
  if(!body){
    try{
      const chunks=[];
      for await (const c of req) chunks.push(c);
      body = JSON.parse(Buffer.concat(chunks).toString());
    }catch(e){ return res.status(200).send('OK'); }
  } else if(typeof body==='string'){
    try{ body=JSON.parse(body); }catch(e){}
  }

  if(!body || !body.message) return res.status(200).send('OK');

  const msg = body.message;
  const chatId = msg.chat.id;
  const text = (msg.text||'').trim();
  
  // SABER QUE BOT ES
  let token = B2;
  if(req.url && req.url.includes('bot1')) token = B1;
  if(req.url && req.url.includes('bot2')) token = B2;
  // si no viene url, usa el que corresponda al bot que te esta hablando
  // El Patron Giros es B2
  if(!token) token = B2;

  async function send(t){
    try{
      const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({chat_id: chatId, text: t})
      });
      const j = await r.json();
      console.log('send result', j);
    }catch(e){ console.log('send error', e); }
  }

  if(text.startsWith('/start')){
    await send(`💎 ¡Bienvenido al Barrio del Patron, Patrón!\n\nStock: ${CODES.length}\n\n📝 /registro\n🔍 /verificar ID\n📦 /stock\n💎 /vitrina\n\nAFUN: https://afun.mx/?ch=430500`);
  }
  else if(text.startsWith('/stock')){
    await send(`📦 STOCK V4 FIX: ${CODES.length} codigos\n\nCODES: ${CODES.join(', ')}\nUsados: ${Object.keys(USED).length}`);
  }
  else if(text.startsWith('/agregar_codigo')){
    const code = text.replace('/agregar_codigo','').trim();
    if(code){ CODES.push(code); await send(`✅ Agregado: ${code}\nTotal: ${CODES.length}`); }
    else await send('Uso: /agregar_codigo CODIGO');
  }
  else if(text.startsWith('/id')){
    await send(`Tu ID: ${msg.from.id} @${msg.from.username||''}`);
  }
  else {
    await send(`Recibido: ${text}\nPrueba /stock /start`);
  }

  return res.status(200).send('OK');
};
