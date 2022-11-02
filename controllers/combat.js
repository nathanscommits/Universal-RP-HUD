const { all } = require("../router");
const { roll } = require("./roll");

const fightCollection = require("../db").db().collection("fights");
const playerCollection = require("../db").db().collection("players");
const cardCollection = require("../db").db().collection("cards");

exports.execute = async (details) => {
    console.log("EXECUTE recieved: ", details)
    const casterNatural = roll();
    const targetNatural = roll();

    const [caster, target, all_cards] = await Promise.all([
        playerCollection.find({uuid: details.UUID}),
        playerCollection.find({uuid: details.target_details.uuid}),
        cardCollection.find().toArray(),
    ])

    const default_actions = ["attack", "skip turn", "end fight", "flee", "vote to kick"]
    const card_selected = details.CARD_SELECTED.toLowerCase();
    //check if its a default action
    if( default_actions.includes(card_selected) ) {
        console.log("Default action chosen, ", details.CARD_SELECTED)
        if(card_selected == default_actions[0]) {
            //attack: default attack vs defense of target for 1 damage if successful, 2 if crit
            const didHit = await attack(caster, target, casterNatural, targetNatural)
            if(didHit) {
                //attack hit
            } else {
                //attack missed
            }
        } else if(card_selected == default_actions[1]) {
            //skip: do nothing on this turn\
            details.announce = "skipped their turn."
            global.io.emit("ANNOUNCE:" + details.fight_id, (details))
            endTurn(details)
        } else if(card_selected == default_actions[2]) {
            //end: ask each player if they would agree to end the fight. 60 secnods to vote
            global.io.emit("END_FIGHT:" + details.fight_id, (details))
        } else if(card_selected == default_actions[3]) {
            //flee: attempt to run away
            details.announce = "tried to escape."
            global.io.emit("ANNOUNCE:" + details.fight_id, (details))
            endTurn(details)
        } else if(card_selected == default_actions[4]) {
            //vote: ask each player if they agree to remove your target
            global.io.emit("VOTE_KICK:" + details.fight_id, (details))
        }
        return;
    }

    //get card effects
    let card_details = {};
    all_cards.map(card => {
        if(card.name == details.CARD_SELECTED) card_details = card;
    })
    console.log("Custom action chosen, ", card_details)

    //add/subtract card values to target
    processCard(card_details, target, caster, details)
    

    endTurn(details)
}
async function processPassiveCards(player, all_cards) { //this has to run once per player when joining a fight
    const [target] = await Promise.all([
        playerCollection.find({uuid: player.uuid}),
    ])
    //get card effects
    all_cards.map(card => {
        if(target.equipped.includes(card.name) && card.action == "passive") {
            for(stat in card.stats){
                target.stats[stat] = parseInt(target.stats[stat]) + parseInt(card.stats[stat])
                if(card.addStatus != "" && !target.status.includes(card.addStatus)) target.status.push(card.addStatus)
            }
        }
    })

    await playerCollection.updateOne({uuid: target.uuid}, {$set: {stats: target.stats, status: target.status}})

    return target
}
function processCard(card, target, caster, details) {
    // add card stats to caster stats
    

    //add caster effect to target

    //save new data

    //end turn
    endTurn(details)
    return;
}
//Didnt I already make this function?
function getModifiers(target) {
    const targetStats = {
        defense: 0,
        attack: 0,
        dodge: 0,
    }
    target.equipped.map(card => {
        if(card.action == "passive") {
            for ( key in card.modifiers) {
                if(targetStats.hasOwnProperty(key))
                    targetStats[key] += card.modifiers[key]
                else 
                    targetStats[key] = card.modifiers[key]
            }
        }
    })

    return targetStats
}

async function attack(caster, target, casterNatural, targetNatural, card) {
    //look at all cards attached to players and sumerize bonuses
    const targetStats = getModifiers(target)
    const casterStats = getModifiers(caster)
    const targetRoll = targetStats.defense + targetStats.dodge + targetNatural;
    const casterRoll = casterStats.attack + casterNatural;

    if(targetRoll < casterRoll) {
        //attack landed
        if(casterNatural == 100) { 
            //critical hit
            card.critDamage = parseInt(card.critDamage)
            if(card.critDamage != 0) target.health = await health(target, card.critDamage)
            //add status on crit 
            if(!target.status.includes(card.statusOnCrit)) target.status.push(card.statusOnCrit)
        }
        else target.health = await health(target, parseInt(card.damage))
        return target
    } else {
        //attack missed
        return false
    }
}
async function health(target, amount) {
    target.health = parseInt(target.health)
    target.healthMax = parseInt(target.healthMax)
    amount = parseInt(amount)

    target.health += amount
    if(target.health > target.healthMax) target.health = target.healthMax
    else if(target.health < 0) {
        target.health = 0
        kill(target)
        // return here?
    }

    await playerCollection.updateOne({uuid: target.uuid}, {$set: {health: target.health}})
    return target.health
}
function kill(target) {

}
function endTurn(details) {
    ++details.FIGHT_DETAILS.turn
    if(details.FIGHT_DETAILS.turn >= details.FIGHT_DETAILS.players.length) details.FIGHT_DETAILS.turn = 0;
    //check next person is able to do anything
    delete details.FIGHT_DETAILS._id
    fightCollection.updateOne({fight_id: details.fight_id}, {$set: details.FIGHT_DETAILS}, {upsert: true})

    global.io.emit("FIGHT_DETAILS:" + details.fight_id, (details.FIGHT_DETAILS))
}
exports.startFight = async (details) => {
    // console.log("START_FIGHT recieved: ", details)
    const [all_cards] = await Promise.all([
        cardCollection.find().toArray(),
    ])
    details.players.map( async (player_detail, i) => {
        details.players[i].order = i; // assign initiative modifiers here
        await processPassiveCards(player_detail, all_cards)
      })
      details.player = details.players
      .sort((a, b) => a.order < b.order)
  
      details.turn = 0;
      // io.emit("FIGHT_DETAILS:" + details.fight_id, (details))
      global.io.emit("START_FIGHT:" + details.fight_id, (details))
      delete details._id
      fightCollection.updateOne({fight_id: details.fight_id}, {$set: details}, {upsert: true})
}
exports.InitialFightDetails = async (details) => {
    // console.log("initial fight details loaded: ", details)

    //check target isn't already in a fight
    var fight = await fightCollection.findOne({player_ids: {$in: [details.target.uuid]}})
    if(fight) {
      fight.players.push(details.initiator);
      fight.player_ids.push(details.initiator.uuid)
      fightCollection.updateOne({fight_id: fight.fight_id}, {$set: fight}, {upsert: true})
      global.io.emit("INITIAL_FIGHT_DETAILS:" + details.initiator.uuid, ({...fight, start: true}))
      global.io.emit("FIGHT_DETAILS:" + fight.fight_id, (fight))
      return;
    }
    fightCollection.insertOne(details)
    global.io.emit("INITIAL_FIGHT_DETAILS:" + details.target.uuid, (details))
    global.io.emit("INITIAL_FIGHT_DETAILS:" + details.initiator.uuid, (details))
}
