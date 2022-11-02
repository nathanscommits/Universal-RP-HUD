function openTarget() {
    document.getElementById('inventory').style.display = "none"
    document.getElementById('fightScreen').style.display = "none"
    document.getElementById('inv-hero-item').style.display = "none"
    document.getElementById('inv-hero-buttons').style.display = "none"
    document.getElementById('bagTab').classList.remove("active");
    document.getElementById('targetOptions').style.display = "none"
    document.getElementById('targetScreen').style.display = "block"
    document.getElementById('targetTab').classList.add("active");
    document.getElementById('statsTab').classList.remove("active");
    document.getElementById('stats').style.display = "none"
}
function openBag() {
    document.getElementById('inventory').style.display = "block"
    document.getElementById('fightScreen').style.display = "none"
    document.getElementById('inv-hero-buttons').style.display = "none"
    document.getElementById('inv-hero-item').style.display = "none"
    document.getElementById('bagTab').classList.add("active");
    document.getElementById('targetScreen').style.display = "none"
    document.getElementById('targetTab').classList.remove("active");
    document.getElementById('statsTab').classList.remove("active");
    document.getElementById('stats').style.display = "none"
}
function openStats() {
    document.getElementById('targetScreen').style.display = "none"
    document.getElementById('fightScreen').style.display = "none"
    document.getElementById('inventory').style.display = "none"
    document.getElementById('inv-hero-buttons').style.display = "none"
    document.getElementById('inv-hero-item').style.display = "none"
    document.getElementById('bagTab').classList.remove("active");
    document.getElementById('targetTab').classList.remove("active");
    document.getElementById('statsTab').classList.add("active");
    document.getElementById('stats').style.display = "block"

}
function heroCard(name, quantity, desc, id) {
   
   document.getElementById('inventory').scrollTo({
    top: 0,
    behavior: 'smooth'
   });

    
    var card = document.getElementById('card:'+id).cloneNode(true)
    // console.log("hero card:", name, quantity, desc)
    var container = document.getElementById('inv-hero-item')
    container.innerHTML ='<div id="inv-hero-card"></div>'
    var card_container = document.getElementById('inv-hero-card')
    card_container.innerHTML = ''
    container.style.display = "flex"

    document.getElementById('inv-hero-buttons').style.display = "flex"
    card_container.appendChild(card)
    card_container.classList.remove("inv-card")
    card_container.classList.add("card", "hero-card")
    document.getElementById('card-name:' + id).classList.add("card-name")
    document.getElementById('card-desc:' + id).classList.add("card-desc")
    document.getElementById('card-quantity:' + id).classList.add("quantity")
}