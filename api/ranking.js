// api/check.js - Verifica si usuario está en El Barrio del Patron (automatico)
module.exports = async (req,res) => {
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS') return res.status(200).send('OK');

  let body = req.body;
  if(!body && req.method==='POST'){
    try{
      const c=[]; for await (const x of req) c.push(x);
      if(c.length) body=JSON.parse(Buffer.concat(c).toString());
    }catch(e){}
  }
  if(typeof body==='string'){ try{ body=JSON.parse(body);}catch(e){} }
  if(!body && req.query && req.query.user_id) body = req.query;

  const userId = body?.user_id || body?.userId || req.query?.user_id;
  const username = body?.username || req.query?.username;

  if(!userId){
    return res.status(200).json({in_group:false, reason:"no user_id", automatic:true});
  }

  // CONFIGURA AQUI TU GRUPO - Cambia por tu @ o ID de grupo
  const GROUP_CHAT_ID = process.env.BARRIO_GROUP_ID || "@ElBarriodelPatron"; // o pon tu ID numerico ej: -1001234567890
  const GUARDIAN_TOKEN = process.env.BARRIO_GUARDIAN_TOKEN;

  if(!GUARDIAN_TOKEN){
    // Si no hay token, permite por ahora pero marca como no verificado
    return res.status(200).json({in_group:true, verified:false, reason:"no token config", automatic:true});
  }

  try{
    const resp = await fetch(`https://api.telegram.org/bot${GUARDIAN_TOKEN}/getChatMember?chat_id=${GROUP_CHAT_ID}&user_id=${userId}`);
    const data = await resp.json();
    if(!data.ok){
      // Grupo no encontrado o bot no es admin, permite pero marca
      return res.status(200).json({in_group:true, verified:false, reason:data.description, automatic:true});
    }
    const status = data.result?.status; // creator, administrator, member, restricted, left, kicked
    const inGroup = ["creator","administrator","member","restricted"].includes(status);
    return res.status(200).json({
      in_group: inGroup,
      status: status,
      username: username,
      user_id: userId,
      automatic: true,
      timestamp: Date.now()
    });
  }catch(e){
    return res.status(200).json({in_group:true, verified:false, error:e.message, automatic:true});
  }
};
      
