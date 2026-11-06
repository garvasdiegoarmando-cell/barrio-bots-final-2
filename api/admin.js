// api/admin.js - Comandos exclusivos del Patron - Solo @ElPatron1538
export default async function handler(req, res){
  const TOKEN = process.env.BARRIO_GUARDIAN_TOKEN || process.env.TELEGRAM_TOKEN || "";
  const GROUP_ID = process.env.GROUP_CHAT_ID || "-100...";
  
  if(req.method === 'GET'){
    return res.status(200).json({
      status: "Panel Exclusivo Activo",
      admin: "@ElPatron1538",
      commands: ["anunciar_actividad","anunciar_bono","dar_puntos","dar_codigo","anunciar_ganador","ver_stock","ranking"]
    });
  }
  if(req.method !== 'POST'){
    return res.status(405).json({error:"POST only"});
  }
  const body = req.body || {};
  const {action, username, puntos, codigo, customText} = body;
  if(!TOKEN){
    return res.status(500).json({error:"No TOKEN"});
  }
  let text = "";
  let chat_id = GROUP_ID;
  switch(action){
    case "anunciar_actividad_1dia":
      text = `🔴 *MODO ACTIVIDAD ACTIVADO - EL BARRIO DEL PATRON*\n\n⏰ Duración: 1 DÍA\n💎 Multiplicador: x2 puntos\n🎰 Jueguen en la mini-app\n\n👉 https://barrio-bots-final-2.vercel.app/\n\nTop 3 gana Bono Especial`;
      break;
    case "anunciar_actividad_3dias":
      text = `🔴 *MODO ACTIVIDAD ACTIVADO - EL BARRIO DEL PATRON*\n\n⏰ Duración: 3 DÍAS\n💎 Multiplicador: x2 puntos\n🎰 Jueguen en la mini-app\n\n👉 https://barrio-bots-final-2.vercel.app/\n\nTop 3 gana Bono Especial\n\nAFUN: https://afun.mx/?ch=430500`;
      break;
    case "anunciar_bono_2000":
      text = `🎁 *BONO RESCATE ACTIVO*\n\nSi tienes menos de 1000 puntos en la mini-app, entra y recibes *2000 de bono automático*\n\n👉 https://barrio-bots-final-2.vercel.app/\n\nAdemás bono diario 100 cada 24h`;
      break;
    case "dar_puntos":
      if(!username || !puntos) return res.status(400).json({error:"Falta username o puntos"});
      text = `💰 @${username.replace('@','')} recibió ${puntos} puntos del Patrón 💎\n\nSigue jugando: https://barrio-bots-final-2.vercel.app/`;
      break;
    case "dar_codigo":
      if(!username || !codigo) return res.status(400).json({error:"Falta username o codigo"});
      text = `🎉 @${username.replace('@','')} GANASTE CÓDIGO DEL BARRIO\n\nCódigo: \`${codigo}\`\n\nÚsalo en https://afun.mx/?ch=430500\nRegistro limpio - Código invitación VACÍO`;
      break;
    case "anunciar_ganador":
      if(!username) return res.status(400).json({error:"Falta username"});
      text = `🏆 *GANADOR DEL RANKING - EL BARRIO DEL PATRON*\n\n🥇 @${username.replace('@','')} es el TOP 1\n\nGanó Bono Especial\nContacta a @ElPatron1538`;
      break;
    case "ver_stock":
      text = `📦 Stock de códigos - Revisa con /stock en privado @ElPatron1538`;
      break;
    case "ranking":
      text = `📊 Ranking del Barrio - https://barrio-bots-final-2.vercel.app/`;
      break;
    case "custom":
      text = customText || "Mensaje del Patrón";
      break;
    default:
      return res.status(400).json({error:"Accion no valida"});
  }
  try{
    const tgRes = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`,{
      method: 'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ chat_id, text, parse_mode: "Markdown" })
    });
    const tgData = await tgRes.json();
    if(!tgData.ok){
      return res.status(500).json({error:"Telegram error", details: tgData});
    }
    return res.status(200).json({ok:true, sent: text, action});
  }catch(e){
    return res.status(500).json({error:e.message});
  }
}
