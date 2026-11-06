let CODES = ["BONO-BIENVENIDA-BARRIO-100"];
let USED = {};
let AUSENTE = null;
const ADMIN = 'ElPatron1538';
const AFUN = 'https://afun.mx/?ch=430500';
const VITRINA = 'https://t.me/VitrinaDelPatronReal';

module.exports = async (req, res) => {
  const B2 = process.env.EL_PATRON_GIROS_TOKEN;
  if(!B2) return res.status(200).send('OK');
  
  let body = req.body;
  if(!body){ try{ const c=[]; for await (const x of req) c.push(x); body=JSON.parse(Buffer.concat(c).toString()); }catch(e){ return res.status(200).send('OK'); } }
  else if(typeof body==='string'){ try{ body=JSON.parse(body); }catch(e){} }
  if(!body || !body.message) return res.status(200).send('OK');

  const msg = body.message;
  const chatId = msg.chat.id;
  const fromUser = msg.from?.username || '';
  const text = (msg.text||'').trim();

  async function send(t){
    await fetch(`https://api.telegram.org/bot${B2}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chatId,text:t,disable_web_page_preview:true})});
  }
  async function sendTo(uid,t){
    try{ await fetch(`https://api.telegram.org/bot${B2}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:uid,text:t})}); return true; }catch(e){ return false; }
  }

  if(text.startsWith('/start')){
    await send(`💎 ¡Bienvenido al Barrio del Patron, Patrón!\n\nStock: ${CODES.length}\n\n📝 /registro - registro limpio\n🔍 /verificar TU_ID - verificar\n📦 /stock - ver stock\n💎 /vitrina\n\nAFUN: ${AFUN}`);
  }
  else if(text.startsWith('/stock')){
    if(fromUser!==ADMIN) return res.status(200).send('OK');
    await send(`📦 Stock: ${CODES.length} codigos\nUsados: ${Object.keys(USED).length}\n\n${CODES.slice(0,20).join('\n')}${CODES.length>20?'\n...y '+(CODES.length-20)+' mas':''}`);
  }
  else if(text.startsWith('/agregar_codigo')){
    if(fromUser!==ADMIN) return res.status(200).send('OK');
    const code=text.replace('/agregar_codigo','').trim(); if(!code){ await send('Uso: /agregar_codigo CODIGO'); return res.status(200).send('OK'); }
    CODES.push(code); await send(`✅ Agregado: ${code}\nStock: ${CODES.length}`);
  }
  else if(text.startsWith('/agregar_lote')){
    if(fromUser!==ADMIN) return res.status(200).send('OK');
    const raw=text.replace('/agregar_lote','').trim(); const lote=raw.split(/[,\n\s]+/).filter(Boolean);
    if(lote.length===0){ await send('Manda codigos separados por espacio o salto de linea'); return res.status(200).send('OK'); }
    CODES.push(...lote); await send(`✅ Lote agregado: ${lote.length} codigos\nStock total: ${CODES.length}`);
  }
  else if(text.startsWith('/dar_codigo')){
    if(fromUser!==ADMIN) return res.status(200).send('OK');
    const target=msg.reply_to_message?.from; if(!target){ await send('Responde al mensaje del usuario verificado con /dar_codigo'); return res.status(200).send('OK'); }
    if(CODES.length===0){ await send('❌ Sin stock, agrega con /agregar_codigo'); return res.status(200).send('OK'); }
    const code=CODES.shift(); USED[code]=target.username||target.id;
    const ok=await sendTo(target.id, `💎 Tu Bono Especial del Barrio:\n\n${code}\n\nCanjealo en AFUN. Registro limpio con ${AFUN} y recarga 100 mismo dia. Si no aparece, contacta al Patron.`);
    if(ok){ await send(`✅ Codigo ${code} entregado a @${target.username||target.first_name}. Quedan: ${CODES.length}`); }
    else{ CODES.unshift(code); delete USED[code]; await send(`❌ No pude mandar DM a @${target.username||target.first_name}, debe iniciar chat conmigo primero: @ElPatronGiros_bot`); }
  }
  else if(text.startsWith('/negar')){
    if
