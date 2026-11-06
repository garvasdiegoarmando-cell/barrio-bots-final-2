let CODES = ["BONO-BIENVENIDA-BARRIO-100"];
let USED = {};
module.exports = async (req, res) => {
  const B2 = process.env.EL_PATRON_GIROS_TOKEN;
  if(!B2) return res.status(200).send('OK');
  let body = req.body;
  if(!body){ try{ const c=[]; for await (const x of req) c.push(x); body=JSON.parse(Buffer.concat(c).toString()); }catch(e){ return res.status(200).send('OK'); } }
  else if(typeof body==='string'){ try{ body=JSON.parse(body); }catch(e){} }
  if(!body || !body.message) return res.status(200).send('OK');
  const msg = body.message; const chatId = msg.chat.id; const text = (msg.text||'').trim();
  async function send(t){ await fetch(`https://api.telegram.org/bot${B2}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chatId,text:t,disable_web_page_preview:true})}); }
  if(text.startsWith('/start')) await send(`💎 ¡Bienvenido al Barrio del Patron!\nStock: ${CODES.length}\n📝 /registro\n🔍 /verificar ID\n📦 /stock\n💎 /vitrina\nAFUN: https://afun.mx/?ch=430500`);
  else if(text.startsWith('/stock')) await send(`📦 Stock: ${CODES.length} codigos\n${CODES.join('\n')}`);
  else if(text.startsWith('/agregar_codigo')){ const c=text.replace('/agregar_codigo','').trim(); if(c){ CODES.push(c); await send(`✅ Agregado: ${c}\nTotal: ${CODES.length}`);} }
  else if(text.startsWith('/verificar')){ const id=text.replace('/verificar','').trim(); await send(`🔍 ID ${id} recibido, Patron lo revisa en panel ch=430500. No recargues hasta que te confirme con /dar_codigo.`); }
  else if(text.startsWith('/registro')) await send(`📝 REGISTRO LIMPIO:\n1. https://afun.mx/?ch=430500\n2. Deja VACIO "Codigo de invitacion"\n3. /verificar TU_ID`);
  else if(text.startsWith('/vitrina')) await send(`💎 Vitrina: https://t.me/VitrinaDelPatronReal`);
  else if(text.startsWith('/id')) await send(`Tu ID: ${msg.from.id} @${msg.from.username||''}`);
  else if(text.startsWith('/ayuda')) await send(`Comandos: /registro /verificar /vitrina /id /stock`);
  return res.status(200).send('OK');
};
