let AUSENTE = null;
const ADMIN = 'ElPatron1538';
const AFUN = 'https://afun.mx/?ch=430500';
const VITRINA = 'https://t.me/VitrinaDelPatronReal';

module.exports = async (req, res) => {
  const B1 = process.env.BARRIO_GUARDIAN_TOKEN;
  if(!B1) return res.status(200).send('OK');
  
  let body = req.body;
  if(!body){ try{ const c=[]; for await (const x of req) c.push(x); body=JSON.parse(Buffer.concat(c).toString()); }catch(e){ return res.status(200).send('OK'); } }
  else if(typeof body==='string'){ try{ body=JSON.parse(body); }catch(e){} }
  if(!body || !body.message) return res.status(200).send('OK');

  const msg = body.message;
  const chatId = msg.chat.id;
  const fromUser = msg.from?.username || '';

  async function send(t){
    await fetch(`https://api.telegram.org/bot${B1}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chatId,text:t})});
  }
  async function restrict(uid, perms, until){
    const b={chat_id:chatId, user_id:uid, ...perms}; if(until) b.until_date=until;
    await fetch(`https://api.telegram.org/bot${B1}/restrictChatMember`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
  }

  if(msg.new_chat_members){
    const names = msg.new_chat_members.map(m=>m.first_name).join(', ');
    await send(`🔥 Bienvenido ${names} al Barrio del Patron!\n📌 Reglas:\n1. Respeto\n2. Registro limpio sin codigo de invitacion\n3. Verifica antes de recargar 100\n\nAcceso oficial: ${AFUN}\nUsa /registro`);
    return res.status(200).send('OK');
  }
  if(msg.left_chat_member){
    await send(`👋 ${msg.left_chat_member.first_name} salio del Barrio. ¡La puerta queda abierta!`);
    return res.status(200).send('OK');
  }

  const text = (msg.text||'').trim();
  
  if(text.startsWith('/start') || text.startsWith('/id')){
    await send(`🔥 Barrio Guardian ACTIVO\nTu ID: ${msg.from.id} @${fromUser}\nChat: ${chatId}`);
  }
  else if(text.startsWith('/mute')){
    if(fromUser!==ADMIN) return res.status(200).send('OK');
    const target = msg.reply_to_message?.from; if(!target){ await send('Responde al mensaje con /mute'); return res.status(200).send('OK'); }
    const until = Math.floor(Date.now()/1000)+15*60;
    await restrict(target.id,{can_send_messages:false},until); await send(`🔇 ${target.first_name} muteado 15 min`);
  }
  else if(text.startsWith('/unmute')){
    if(fromUser!==ADMIN) return res.status(200).send('OK');
    const target = msg.reply_to_message?.from; if(!target) return res.status(200).send('OK');
    await restrict(target.id,{can_send_messages:true,can_send_media_messages:true,can_send_other_messages:true,can_add_web_page_previews:true}); await send(`🔊 ${target.first_name} desmuteado`);
  }
  else if(text.startsWith('/ausente')){
    if(fromUser!==ADMIN) return res.status(200).send('OK');
    AUSENTE = text.replace('/ausente','').trim() || 'Patron ausente, regreso en breve.'; await send(`✅ Ausente activado: ${AUSENTE}`);
  }
  else if(text.startsWith('/presente')){
    if(fromUser!==ADMIN) return res.status(200).send('OK');
    AUSENTE=null; await send('✅ Patron de vuelta');
  }
  return res.status(200).send('OK');
};
