const express = require("express");
const cors = require("cors");
const fs = require("fs");
const session = require("express-session");

const app = express();

app.use(cors());
app.use(express.json());

app.use(session({
    secret: "moodflow-ultra",
    resave: false,
    saveUninitialized: true
}));

const USERS_FILE = "./data/users.json";
const MOODS_FILE = "./data/moods.json";

function read(file){
    return JSON.parse(fs.readFileSync(file,"utf-8"));
}

function write(file,data){
    fs.writeFileSync(file, JSON.stringify(data,null,2));
}

/* ================= AUTH ================= */

app.post("/register",(req,res)=>{
    let users = read(USERS_FILE);

    const {username,password} = req.body;

    if(users.find(u=>u.username===username))
        return res.json({error:"User exists"});

    users.push({username,password});
    write(USERS_FILE,users);

    res.json({ok:true});
});

app.post("/login",(req,res)=>{
    let users = read(USERS_FILE);

    const {username,password} = req.body;

    let user = users.find(u=>u.username===username && u.password===password);

    if(!user) return res.json({error:"invalid"});

    req.session.user = username;
    res.json({ok:true});
});

/* ================= MOODS ================= */

app.get("/moods",(req,res)=>{
    if(!req.session.user) return res.json([]);

    let moods = read(MOODS_FILE);
    res.json(moods.filter(m=>m.user===req.session.user));
});

app.post("/moods",(req,res)=>{
    let moods = read(MOODS_FILE);

    moods.push({
        id:Date.now(),
        user:req.session.user,
        mood:req.body.mood,
        stress:Number(req.body.stress),
        note:req.body.note,
        time:new Date().toLocaleDateString()
    });

    write(MOODS_FILE,moods);

    res.json({ok:true});
});

/* ================= STATS ================= */

app.get("/stats",(req,res)=>{
    let moods = read(MOODS_FILE).filter(m=>m.user===req.session.user);

    let total=moods.length,sum=0,count={happy:0,ok:0,sad:0};

    moods.forEach(m=>{
        sum+=m.stress;
        count[m.mood]++;
    });

    let avg=total?(sum/total).toFixed(1):0;

    let top="N/A",max=0;
    for(let k in count){
        if(count[k]>max){
            max=count[k];
            top=k;
        }
    }

    res.json({
        totalDays:total,
        averageStress:avg,
        mostCommonMood:top,
        moodChart:count
    });
});

app.listen(3000,()=>console.log("Running 🚀"));