let CODES = ["BONO-BIENVENIDA-BARRIO-100"];
let USED = {};
const ADMIN = "elpatron1538";
module.exports = async (req, res) => {
  const B2 = process.env.EL_PATRON_GIROS_TOKEN;
  if(!B2) return res.status(200).send('OK');
  let body = req.body;
  if(!body){ try{ const c=[]; for await (const x of req) c.push(x); body=JSON.parse(Buffer.concat(c).toString()); }catch(e){ return res.status(200).send('OK'); } }
  else if(typeof body==='string'){ try{ body=JSON.parse(body); }catch(e){} }
  if(!body || !body.message) return res.status(200).send('OK');
  const msg = body.message; const chatId = msg.chat.id; const text = (msg.text||'').trim();
  const fromUser = (msg.from?.username||"").toLowerCase();
  const isAdmin = fromUser === ADMIN;
  async function send(t){ await fetch(`https://api.telegram.org/bot${B2}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chatId,text:t})}); }
  async function sendTo(uid,t){ try{ await fetch(`https://api.telegram.org/bot${B2}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:uid,text:t})}); return true; }catch(e){ return false; } }

  if(text.startsWith('/start')) await send(`💎 ¡Bienvenido al Barrio!\n📝 /registro\n🔍 /verificar ID\n💎 /vitrina`);
  else if(text.startsWith('/stock')){ if(!isAdmin) return res.status(200).send('OK'); await send(`📦 Stock: ${CODES.length}\n${CODES.join('\n')}`); }
  else if(text.startsWith('/agregar_codigo')){ if(!isAdmin) return res.status(200).send('OK'); const c=text.replace('/agregar_codigo','').trim(); if(c){ CODES.push(c); await send(`✅ Agregado: ${c}\nTotal: ${CODES.length}`);} }
  else if(text.startsWith('/dar_codigo')){ if(!isAdmin) return res.status(200).send('OK'); const target=msg.reply_to_message?.from; if(!target){ await send('Responde al mensaje con /dar_codigo'); return res.status(200).send('OK'); } if(CODES.length===0){ await send('❌ Sin stock'); return res.status(200).send('OK'); } const code=CODES.shift(); const ok=await sendTo(target.id, `💎 Tu Bono Especial:\n\n${code}\n\nCanjealo en https://afun.mx/?ch=430500`); if(ok) await send(`✅ Codigo ${code} entregado a @${target.username}. Quedan: ${CODES.length}`); else { CODES.unshift(code); await send('❌ Debe iniciar chat conmigo primero'); } }
  else if(text.startsWith('/verificar')){ const id=text.replace('/verificar','').trim(); await send(`🔍 ID ${id} recibido, Patron lo revisa en panel ch=430500. No recargues hasta que te confirme.`); }
  else if(text.startsWith('/registro')) await send(`📝 REGISTRO LIMPIO:\n1. https://afun.mx/?ch=430500\n2. Deja VACIO Codigo invitacion\n3. /verificar TU_ID`);
  else if(text.startsWith('/vitrina')) await send(`💎 Vitrina: https://t.me/VitrinaDelPatronReal`);
  else if(text.startsWith('/id')) await send(`Tu ID: ${msg.from.id} @${msg.from.username}`);
  return res.status(200).send('OK');
};
