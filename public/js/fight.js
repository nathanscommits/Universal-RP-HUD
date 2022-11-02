var FIGHT_DETAILS = {fight_id: null}
var IN_COMBAT = false;
var CARD_SELECTED = ""
var LAST_SELECTED_CARD = ""
const ACTION_CARDS = ['fightCard:0', 'fightCard:1', 'fightCard:2', 'fightCard:3', 'fightCard:4'] 

socket.on("INITIAL_FIGHT_DETAILS:" + player.uuid, (details) => {
    if(IN_COMBAT) return;
    IN_COMBAT = true;
    FIGHT_DETAILS = details
    targetUpdate()
    // console.log("initial fight details loaded: ", details)
    if("start" in details && details.start) {
        setFightScreen()
    }
    socket.on("START_FIGHT:" + FIGHT_DETAILS.fight_id, (details) => {
        // console.log("fight details: ", FIGHT_DETAILS)
        // console.log("START_FIGHT recieved: ", details)
        FIGHT_DETAILS = details
        setFightScreen()
        if(details.players[details.turn].uuid == player.uuid) unlockHUD()
        else lockHUD()
    })
    socket.on("FIGHT_DETAILS:" + FIGHT_DETAILS.fight_id, (details) => {
        FIGHT_DETAILS = details
        targetUpdate()
        if(details.players[details.turn].uuid == player.uuid) unlockHUD()
        else lockHUD()
        // console.log("fight details updated: ", details)
    })
    socket.on("ANNOUNCE:" + FIGHT_DETAILS.fight_id, (details) => {
        console.log("ANNOUNCE: ", details)
    })
    socket.on("END_FIGHT:" + FIGHT_DETAILS.fight_id, (details) => {
        console.log("end fight: ", details)
    })
    socket.on("VOTE_KICK:" + FIGHT_DETAILS.fight_id, (details) => {
        console.log("vote kick: ", details)
    })
})

function targetUpdate() {
    var turnOrder = 0
    var html = ``;
    FIGHT_DETAILS.players.map( target => {
        if(!("healthIcons" in target))target.healthIcons = `<img src="/health.svg"><img src="/health.svg"><img src="/health.svg">`
        if(!("conditions" in target))target.conditions = ``
        if(!("distance" in target))target.distance = `0`
         //for(var i = target.health; i > 0; i-- ) { target.healthIcons += `<img src="/health.svg">` }
        html += `<button id="targetButton:${target.name}" onclick="target('${target.name}', 'targetButton:${target.name}')"><div class="turn-number">${++turnOrder}</div><div class="target-details">${target.healthIcons}<span>${target.conditions}</span><br>${target.name}<span id="distance:${target.uuid}">${target.distance}m</span></div></button>`
   })

   document.getElementById("fightTargets").innerHTML = html;
}

function fightCard(name, quantity, desc, id, image) {
    var card = `<div id="fightCardId" style="--front: url('${image}');" class="card inv-card">
    <div id="fight-card-name" class="card-name"><span>${name}</span></div>
    <div id="fight-card-desc" class="card-desc"><p>${desc}</p><img src="/swbanner.jpeg" alt=""></div>
</div>`
    // console.log("hero card:", name, quantity, desc)
    var container = document.getElementById('fight-hero-item')
    container.innerHTML ='<div id="fight-hero-card"></div>'
    var card_container = document.getElementById('fight-hero-card')

    card_container.innerHTML = card

    CARD_SELECTED = name
    if(LAST_SELECTED_CARD != "") {
        document.getElementById(LAST_SELECTED_CARD).style.background = '#fff'
        document.getElementById(LAST_SELECTED_CARD).style.color = '#000'
        if(ACTION_CARDS.includes(LAST_SELECTED_CARD)) {
            document.getElementById(LAST_SELECTED_CARD).style.background = 'rgb(226, 226, 226)'
            document.getElementById(LAST_SELECTED_CARD).style.color = '#000'
        }
    }
    LAST_SELECTED_CARD = id
    document.getElementById(id).style.background = '#dba221'
    document.getElementById(id).style.color = '#000'

    update_actions();
    
 }
function update_actions() {
    var fightAction = document.getElementById('fight-action')
    var name = CARD_SELECTED
    if(name != ""){
        if(TARGET != "") {
            fightAction.innerHTML = `<div class="flex">
            <div class="fight-action-text"> <p>Use ${name} on ${TARGET}?</p> </div>
            <div class="fight-action-button"><button onclick="execute()">Execute</button></div>
            </div>`
        } else {
            fightAction.innerHTML = `<div class="flex"><div class="fight-action-text" style="width: 100%;"><p>Use ${name} on who? Select a target from above.</p></div></div>`
        }
    } else if(TARGET != "") {
        fightAction.innerHTML = `<div class="flex"><div class="fight-action-text" style="width: 100%;"><p>What card do you want to use on ${TARGET}?</p></div></div>`
    }

    if(name == "End Fight" || name == "Skip Turn" || name == "Flee") {
        fightAction.innerHTML = `<div class="flex">
        <div class="fight-action-text"> <p>Do you want to ${name}?</p> </div>
        <div class="fight-action-button"><button onclick="execute()">Execute</button></div>
        </div>`
    }
}
function exitFightScreen() {
    // IN_COMBAT = false;
    // lockHUD();
    document.getElementById('fightTab').style.display = "none"
    // document.getElementById('fightTargetList').style.display = "none"
    document.getElementById('fightScreen').style.display = "none"
    document.getElementById('startFightScreen').style.display = "none"
    document.getElementById('targetScreen').style.display = "block"
    document.getElementById('targetTab').style.display = "block"
}
function setFightScreen() {
    // IN_COMBAT = true;
    document.getElementById('targetScreen').style.display = "none"
    document.getElementById('startFightScreen').style.display = "none"
    // document.getElementById('targetTab').style.display = "none"
    // document.getElementById('fightTab').style.display = "block"
    // document.getElementById('fightTargetList').style.display = "block"
    document.getElementById('fightScreen').style.display = "block"
}

function fight(target) {
    //target is an object with uuid, name, distance
    if(IN_COMBAT) return;
    var self = {
        uuid: player.uuid,
        name: player.playerName,
    }
    FIGHT_DETAILS = {
        initiator: self,
        target: target,
        players: [self, target],
        player_ids: [self.uuid, target.uuid],
        fight_id: self.uuid + new Date().getTime(),
    }
    targetUpdate()
    // console.log("fight starting: ",FIGHT_DETAILS)
    socket.emit("INITIAL_FIGHT_DETAILS", FIGHT_DETAILS);

    //display "start fight" screen
    document.getElementById('targetScreen').style.display = "none"
    document.getElementById('startFightScreen').style.display = "block"
}
function startFight() {
    document.getElementById('startFightScreen').style.display = "none"
    // document.getElementById('fightScreen').style.display = "block"
    socket.emit("START_FIGHT", FIGHT_DETAILS);
    // console.log("startFight(): ", FIGHT_DETAILS)
    // if(FIGHT_DETAILS.players[FIGHT_DETAILS.turn].uuid == player.uuid) unlockHUD()
    // else lockHUD()
}

function execute() {
    //query server with execute object
    var target_details = "";
    FIGHT_DETAILS.players.map( user_details => {
        if(user_details.name == TARGET) target_details = user_details
    })
    var execute = {
        fight_id: FIGHT_DETAILS.fight_id,
        FIGHT_DETAILS,
        TARGET,
        target_details,
        CARD_SELECTED,
        UUID: player.uuid
    }
    console.log("executing: ", execute)
    socket.emit("EXECUTE", execute);
}

function lockHUD() {
    //disable fight screen
    console.log("locking hud")
    document.getElementById('fight-action').innerHTML = `<p>It's ${FIGHT_DETAILS.players[FIGHT_DETAILS.turn].name}'s turn.</p>`
    document.getElementById('fight-actions').style.display = "none"
}
function unlockHUD() {
    //enable fight screen
    console.log("unlocking hud")
    document.getElementById('fight-actions').style.display = "flex"
    document.getElementById('fight-action').innerHTML = `<p>Select a target and card to use.</p>`
}


// const fight_id = ""

// socket.on("COMBAT:" + fight_id, (details) => {
//     // lock/unlock combat options depending on whos turn it is
    

// })
// socket.on("BEGIN_FIGHT:" + fight_id, (details) => {
//     // lock/unlock combat options depending on whos turn it is
//     lockHUD()
//     setFightScreen()

// })





// let QUED_PLAYERS = []

// function fight(target) { 
// // 1) You can hit the "fight" button to start combat with someone. Each person in range will be asked if they want to join in with a 30 second countdown.
// // 2) The person you initiated the fight with will not have a choice and must fight or flee.
// // 3) Add every player who joined to a turn list. assign turn order.
//     //setFightScreen()
//     TIMED_OUT = false;
//     //send requests to NEARBY_TARGETS - target
//     // document.getElementById("combat_request").innerHTML = `Fight starting in 30 seconds!`
//     NEARBY_PLAYERS.map( nearby => {
//         socket.emit("JOIN_COMBAT:"+nearby.uuid, {player, target})
//     })
//     //add target and player to fight party que
//     QUED_PLAYERS.push(target)
//     QUED_PLAYERS.push(player)
//     //start 30 second timer
//     setTimeout(rollIniative(), 30 * 1000)
//     //postData('http://localhost:8000/fight', { nearby: NEARBY_PLAYERS, target: target, player: player })
//     // .then(data => {
//     //     console.log(data); //JSON data parsed by `data.json()` call
//     //     if(data.status == 'error') {
//     //         document.getElementById("combat_request").innerHTML = `${data.error}`
//     //         return
//     //     }
//     //   //start 30 second timer
     
//     // });
// }


// socket.on("Unlock" + UUID, (details) => {
//     unlockHUD()
// })


// var COMBAT_REQUESTER = "";
// var IN_COMBAT = false;
// var TIMED_OUT = false;
// socket.on("JOIN_COMBAT:" + UUID, (details) => {
//     //ask to accept/decline an incoming combat request
//     console.log("Join_combat request from: ",details.player)
//     COMBAT_REQUESTER = details.player;
//     if(details.target == UUID || details.player == UUID)
//         document.getElementById("combat_request").innerHTML = `Fight starting in 30 seconds!`
//     else 
//         document.getElementById("combat_request").innerHTML = `${JSON.stringify(details)}`
// })

// socket.on("JOIN_FIGHT:" + UUID, (joining) => {
//     if(QUED_PLAYERS.includes(joining) || TIMED_OUT) return;
//     QUED_PLAYERS.push(joining)
// })

// socket.on("END_FIGHT:" + UUID, (details) => {
//     console.log(details)
//     exitFightScreen()
// })

// function join_fight() {
//     if(IN_COMBAT) {
//         document.getElementById("combat_request").innerHTML = `You are already in a fight.`
//         return;
//     }
//     socket.emit("JOIN_FIGHT:"+COMBAT_REQUESTER, {UUID})
//     // lockHUD()
//     // setFightScreen()
// }

// function rollIniative(){
//     //start fight
//     TIMED_OUT = true;
//     console.log("Rolling initiative!")

//     let shuffled = QUED_PLAYERS
//     .map(value => ({ value, sort: Math.random() }))
//     .sort((a, b) => a.sort - b.sort)
//     .map(({ value }) => value)

//     let players = []

//     shuffled.map( (e, i) => {
//         players.push({
//             uuid: e,
//             turn: i + 1
//         })
//     })

//     var fight_obj = {
//         initiator: UUID,
//         players,
//     }

//     postData('http://localhost:8000/fight', fight_obj)
//     // .then(data => {
//     //     //returns the sorted initative order or combatants
//     //     //display list on each combatants HUD in correct order.
//     //     //unlock first persons turn.
//     // })
// }