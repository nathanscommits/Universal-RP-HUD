console.log(player)
socket.on("INV:" + UUID, (inventory) => {
    console.log(JSON.stringify(inventory))
    var html = `<h2>INVENTORY</h2><div class="table">`; 
    inventory.map( (cel, i) => { 
        html += `<div class="cel">
        <div id="card:${ i }" style="--front: url('${ cel.img }');" onclick="heroCard('${ cel.name }', '${ cel.quantity }', '${ cel.desc }', '${ i }')" class="card animated inv-card">
            <div id="card-name:${ i }" class="card-name"><span>${ cel.name }</span></div>
            <div id="card-desc:${ i }" class="card-desc"><p>${ cel.desc }</p><img src="/swbanner.jpeg" alt=""></div>
            <div id="card-quantity:${ i }" class="quantity">⨯${ cel.quantity }</div>
        </div>
    </div>`
    }) 
    var num = inventory.length 
    while(num++ < player.inventorySize) { 
        html += `<div class="cel"></div>`
    } 
    html += `</div>`

    document.getElementById("inventory").innerHTML = html
})
socket.on("BANK:" + UUID, (bank) => {
    var html = `<h2>BANK</h2><div class="table">`; 
    bank.map( cel => { 
        html += `<div class="cel">${cel.name}<div class="quantity">${cel.quantity}</div></div>`
    }) 
    var num = bank.length 
    while(num++ < player.bankSize) { 
        html += `<div class="cel"></div>`
    } 
    html += `</div>`

    document.getElementById("inventory").innerHTML = html
})
socket.on("EQUIP:" + UUID, (equip) => {
   var html = `<h2>EQUIPPED</h2><div class="table">`; 
    equip.map( cel => { 
        html += `<div class="cel">${cel.name}<div class="quantity">${cel.quantity}</div></div>`
    }) 
    var num = equip.length 
    while(num++ < player.equipNum) { 
        html += `<div class="cel"></div>`
    } 
    html += `</div>`

    document.getElementById("fight").innerHTML = html
})
socket.on("CRED:" + UUID, (credits) => {
    document.getElementById("currency").innerHTML = `$${JSON.stringify(credits)}`
})
