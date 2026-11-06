let RANKING = global.RANKING || (global.RANKING = [
  {name:"ElPatron1538", username:"elpatron1538", points:1250, games:45, profit:750},
  {name:"LaFlaka", username:"laflaka", points:980, games:32, profit:480},
  {name:"ElChuy", username:"elchuy", points:850, games:28, profit:350},
  {name:"ElRayo", username:"elrayo", points:620, games:20, profit:120},
  {name:"LaBanda", username:"labanda", points:540, games:18, profit:40}
]);

module.exports = async (req,res) => {
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS') return res.status(200).send('OK');
  
  let body=req.body;
  if(!body && req.method==='POST'){ 
    try{ 
      const chunks=[]; 
      for await (const chunk of req) chunks.push(chunk); 
      // Note: in Vercel body is already parsed, this fallback for raw
    }catch(e){} 
    try{
      const c=[]; for await (const x of req) c.push(x);
      if(c.length) body=JSON.parse(Buffer.concat(c).toString());
    }catch(e){}
  }
  if(typeof body==='string'){ try{ body=JSON.parse(body);}catch(e){} }
  
  // Vercel may have already parsed body
  if(!body && req.body && typeof req.body === 'object') body = req.body;
  
  if(req.method==='GET'){
    const sorted = [...RANKING].sort((a,b)=>b.points-a.points).slice(0,20);
    return res.status(200).json({ranking:sorted, total:RANKING.length, live:true, timestamp:Date.now()});
  }
  if(req.method==='POST' && body){
    const {username, name, points, delta, games} = body;
    if(!username) return res.status(400).json({error:"no username"});
    let user = RANKING.find(u=>u.username===username.toLowerCase());
    if(!user){
      user = {name:name||username, username:username.toLowerCase(), points:500, games:0, profit:0};
      RANKING.push(user);
    }
    if(typeof points==='number') user.points = points;
    if(typeof delta==='number') user.points += delta;
    if(typeof games==='number') user.games = (user.games||0)+games;
    if(user.points<0) user.points=0;
    user.profit = user.points-500;
    if(name) user.name=name;
    global.RANKING = RANKING;
    return res.status(200).json({ok:true, user, ranking:RANKING.sort((a,b)=>b.points-a.points).slice(0,20), live:true});
  }
  return res.status(200).send('OK');
};
  
