//const socket = io("ws://localhost:8000");
// console.log("loaded location.js")
//need to know what region the player is on and the UUID of the player (pass in from URL params/queries?)

let SELECTED_PLAYER = {}
let PLAYER_COORDS = []
let NEARBY_PLAYERS = []
let PLAYER_AREA = ""
let RANGE = 9999999
const AREAS = [
    {
        name: "test_area",
        x: [500, 200, 0],
        y: [600, 100, 5]
    }
]

const getIntersect = (player, area) => {
    //compare players vector3 with areas x and y vector3 to see if its inside the object map
    function com (i) {
        if((player[i] > area.x[i] && player[i] < area.y[i]) || (player[i] < area.x[i] && player[i] > area.y[i])) return true
        return false
    }
    if(com(0) && com(1) && com(2)) return true
    return false
}

//return meter distance between 2 vectors
const vectorDistance = (x, y) =>
  Math.sqrt(x.reduce((acc, val, i) => acc + Math.pow(val - y[i], 2), 0));


//  console.log("LI:" + REGION)

socket.on("LI:" + REGION, (locations) => {
    //find location of this player
    // console.log("Updating location")
  locations.positions.map( (av) => {
    if(av.uuid == UUID) {
        PLAYER_COORDS = JSON.parse("[" + av.pos.replace("<", "").replace(">", "") + "]");
    }
  })

  //find all nearby players
  NEARBY_PLAYERS = []
  locations.positions.map( (av) => {
    //av = each avatar on region
    let av_coords = JSON.parse("[" + av.pos.replace("<", "").replace(">", "") + "]");
    av.distance = vectorDistance(av_coords, PLAYER_COORDS)
    if(av.uuid != UUID && av.distance < RANGE) {
        NEARBY_PLAYERS.push(av)
    }
  })

  //find what the area the player is in is called
  PLAYER_AREA = "Unknown"
  AREAS.map( area => {
      if(getIntersect(PLAYER_COORDS, area)) {
          PLAYER_AREA = area.name
        }
    })
    //update HUD elements with new info (nearby list, area name)
    var html = ``
    
    NEARBY_PLAYERS = NEARBY_PLAYERS.sort((a,b) => a.distance - b.distance);
    NEARBY_PLAYERS.map(nearby => {

        if("players" in FIGHT_DETAILS && FIGHT_DETAILS.players.length) {
            FIGHT_DETAILS.players.map( fight_nearby => {
                if(fight_nearby.uuid == nearby.uuid)  document.getElementById('distance:' + fight_nearby.uuid).innerHTML = parseInt(nearby.distance) + "m"
            })
        }

        if(nearby.name == SELECTED_PLAYER.name)
            html += `<button class="selectedButton" id='select:${nearby.uuid}' onclick='selectTarget(${JSON.stringify(nearby)})'>${nearby.name} <span>${parseInt(nearby.distance)}m</span></button>`
        else 
        html += `<button id='select:${nearby.uuid}' onclick='selectTarget(${JSON.stringify(nearby)})'>${nearby.name} <span>${parseInt(nearby.distance)}m</span></button>`
    })
    //html += `<button id='select:3ffd8a53-ff55-4632-8ebe-54b73b07e1a1' onclick='selectTarget({uuid:"3ffd8a53-ff55-4632-8ebe-54b73b07e1a1", name: "Sharky Piggins", distance: "2"})'>Sharky Piggins <span>2m</span></button>`
    // document.getElementById('fightTargets').innerHTML = html
    document.getElementById('target').innerHTML = html
    document.getElementById('location').innerHTML = `GPS: ${PLAYER_AREA}`
});

function selectTarget(target) {
    SELECTED_PLAYER = target;
    // console.log(target.name)
    //open target options, trade, fight, pay
    var html = `<div onclick='trade(${JSON.stringify(target)})' class="button_base b08_3d_pushback">
    <div>Trade</div>
    <div>Deal</div>
</div>
<div onclick='pay(${JSON.stringify(target)})' class="button_base b08_3d_pushback">
    <div>Pay</div>
    <div>Tip</div>
</div>
<div onclick='fight(${JSON.stringify(target)})' class="button_base b10_tveffect">
    <div>Fight</div>
    <div>
        <div>Attack</div>
        <div>Battle</div>
        <div>Duel</div>
    </div>
</div>`
    
    document.getElementById('targetOptions').style.display = "flex"
    document.getElementById('targetOptions').innerHTML = html
}
