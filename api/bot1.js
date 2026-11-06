let CODES = ["BONO-BIENVENIDA-100"];
module.exports = async (req, res) => {
  const B1 = process.env.BARRIO_GUARDIAN_TOKEN;
  const B2 = process.env.EL_PATRON_GIROS_TOKEN;
  const token = B1 || B2;
  let body = req.body;
  if(!body){ try{ const chunks=[]; for await (const c of req) chunks.push(c); body = JSON.parse(Buffer.concat(chunks).toString()); }catch(e){ return res.status(200).send('OK'); } } else if(typeof body==='string'){ try{ body=JSON.parse(body); }catch(e){} }
  if(!body || !body.message) return res.status(200).send('OK');
  const msg = body.message; const chatId = msg.chat.id; const text = (msg.text||'').trim();
  async function send(t){ await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chatId,text:t})}); }
  if(text.startsWith('/start')) await send(`🔥 Barrio Guardian ACTIVO\nTu ID: ${msg.from.id}`);
  else if(text.startsWith('/id')) await send(`Tu ID: ${msg.from.id} @${msg.from.username||''}`);
  else await send(`Guardian recibio: ${text}`);
  return res.status(200).send('OK');
};
