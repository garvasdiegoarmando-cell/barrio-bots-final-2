let CODES = ["BONO-BIENVENIDA-100"];
let USED = {};
module.exports = async (req, res) => {
  const B2 = process.env.EL_PATRON_GIROS_TOKEN;
  const token = B2;
  let body = req.body;
  if(!body){ try{ const chunks=[]; for await (const c of req) chunks.push(c); body = JSON.parse(Buffer.concat(chunks).toString()); }catch(e){ return res.status(200).send('OK'); } } else if(typeof body==='string'){ try{ body=JSON.parse(body); }catch(e){} }
  if(!body || !body.message) return res.status(200).send('OK');
  const msg = body.message; const chatId = msg.chat.id; const text = (msg.text||'').trim();
  async function send(t){ await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chatId,text:t})}); }
  if(text.startsWith('/start')) await send(`💎 ¡Bienvenido al Barrio del Patron, Patrón!\n\nStock: ${CODES.length}\n\n📝 /registro\n🔍 /verificar ID\n📦 /stock\n💎 /vitrina\n\nAFUN: https://afun.mx/?ch=430500`);
  else if(text.startsWith('/stock')) await send(`📦 STOCK V4 FIX: ${CODES.length} codigos\n${CODES.join(', ')}`);
  else if(text.startsWith('/agregar_codigo')){ const c=text.replace('/agregar_codigo','').trim(); if(c){ CODES.push(c); await send(`✅ Agregado: ${c}\nTotal: ${CODES.length}`);} }
  else if(text.startsWith('/id')) await send(`Tu ID: ${msg.from.id} @${msg.from.username||''}`);
  else if(text.startsWith('/registro')) await send(`📝 REGISTRO LIMPIO:\n1. https://afun.mx/?ch=430500\n2. Deja VACIO "Codigo de invitacion"\n3. /verificar TU_ID`);
  else if(text.startsWith('/vitrina')) await send(`💎 https://t.me/VitrinaDelPatronReal`);
  else await send(`Recibido: ${text}\nPrueba /stock /start`);
  return res.status(200).send('OK');
};
