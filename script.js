let mood="happy";
const API="http://localhost:3000";

function play(){
    document.getElementById("clickSound").play();
}

async function login(){
    play();

    await fetch(API+"/login",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            username:username.value,
            password:password.value
        })
    });

    auth.style.display="none";
    app.style.display="block";

    load();
}

async function register(){
    play();

    await fetch(API+"/register",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            username:username.value,
            password:password.value
        })
    });
}

function setMood(m){
    mood=m;
    emojiAnim.innerText=m==="happy"?"😄":m==="ok"?"😐":"😢";
}

async function addMood(){
    play();

    await fetch(API+"/moods",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            mood,
            stress:stress.value,
            note:note.value
        })
    });

    load();
}

let chart;

async function load(){

    let stats=await fetch(API+"/stats").then(r=>r.json());

    total.innerText=stats.totalDays;
    avg.innerText=stats.averageStress;
    common.innerText=stats.mostCommonMood;

    if(chart) chart.destroy();

    chart=new Chart(chart,{
        type:"bar",
        data:{
            labels:Object.keys(stats.moodChart),
            datasets:[{
                data:Object.values(stats.moodChart),
                backgroundColor:"#00c6ff"
            }]
        }
    });
}