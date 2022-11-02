// inventory items need a (unique)name and quanitity

//const serverProperties = require("../data/serverProperties.json");
const playerCollection = require("../db").db().collection("players");
const paycheckCollection = require("../db").db().collection("paychecks");
const cardCollection = require("../db").db().collection("cards");

exports.invOp = async (req, res, next) => {
    req.body.player = await playerCollection.findOne({uuid: req.body.uuid, rpsim: req.body.rpsim})
    let inventory
    if(req.body.op == "add") inventory = await add(req.body)
    else if(req.body.op == "remove") inventory = await remove(req.body)
    else if(req.body.op == "trade") inventory = await trade(req.body)
    else if(req.body.op == "deposit") inventory = await deposit(req.body)
    else if(req.body.op == "withdraw") inventory = await withdraw(req.body)
    else if(req.body.op == "equip") inventory = await equip(req.body)
    else if(req.body.op == "unequip") inventory = await unequip(req.body)
    else if(req.body.op == "sell") inventory = await sell(req.body)
    else if(req.body.op == "buy") inventory = await buy(req.body)
    console.log(inventory)
    if(typeof inventory === "string") res.send(inventory)
    else {
       
        next()
    }
}
const add = async (data) => {
    try {
        data.item.quantity = parseInt(data.item.quantity)
        console.log("Add!")
        let inventory = data.player.inventory;
        let found = false;
        inventory.forEach((e, i) => {
          if (e.name == data.item.name) {
            found = true;
            inventory[i]["quantity"] = parseInt(inventory[i]["quantity"]) + data.item.quantity;
          }
        });
        if (!found) {
          if (inventory.length < data.player.inventorySize) {
            inventory.push(data.item);
          } else {
           console.log("inventory full")
           return "inventory full"
          }
        }
        global.io.emit("INV:" + data.uuid, inventory)
        await playerCollection.updateOne(
            {uuid: data.uuid, rpsim: data.rpsim},
            { $set: { inventory: inventory } },
            { upsert: true }
        );
        return inventory;
      } catch (e) {
        console.log(e);
        return "error";
      }
}
const remove = async (data) => {
    try {
        data.item.quantity = parseInt(data.item.quantity)
        console.log("remove!")
        let inventory = data.player.inventory;
        inventory.forEach((e, i) => {
          if (e.name == data.item.name) {
            console.log(e, i)
            inventory[i]["quantity"] = parseInt(inventory[i]["quantity"]) - data.item.quantity;
            if(inventory[i]["quantity"] < 1) {
                inventory.splice(i, 1)
            }
          }
        });
        global.io.emit("INV:" + data.uuid, inventory)
        await playerCollection.updateOne(
            {uuid: data.uuid, rpsim: data.rpsim},
            { $set: { inventory: inventory } },
            { upsert: true }
        );
        return inventory;
      } catch (e) {
        console.log(e);
        return "error";
      }
}
const hasEnough = (data) => {
    let inventory = data.player.inventory;
    let hasEnough = false
    inventory.forEach((e, i) => {
      if (e.name == data.item.name) {
        console.log(e, i)
        if(parseInt(inventory[i]["quantity"]) >= parseInt(data.item.quantity)) {
            hasEnough = true
        }
      }
    });
    return hasEnough;
}
const deposit = async (data) => {
    //remove from inv, add to bank
    try {
       if(hasEnough(data)) {
        let inventory = await remove(data)
        data.item.quantity = parseInt(data.item.quantity)
        console.log("Add!")
        let bank = data.player.bank;
        let found = false;
        bank.forEach((e, i) => {
          if (e.name == data.item.name) {
            found = true;
            bank[i]["quantity"] = parseInt(bank[i]["quantity"]) + data.item.quantity;
          }
        });
        if (!found) {
          if (bank.length < data.player.bankSize) {
            bank.push(data.item);
          } else {
           console.log("bank full")
           return "bank full"
          }
        }
        global.io.emit("BANK:" + data.uuid, bank)
        await playerCollection.updateOne(
            {uuid: data.uuid, rpsim: data.rpsim},
            { $set: { bank: bank } },
            { upsert: true }
        );
        return inventory;
       } else {
        return "you don't have that item or amount of items"
       }
    } catch (e) {
    console.log(e);
    return "error";
    }
}
const withdraw = async (data) => {
     //remove from inv, add to bank
     try {
         data.item.quantity = parseInt(data.item.quantity)
         console.log("withdraw!")
         let bank = data.player.bank;
       
         bank.forEach((e, i) => {
           if (e.name == data.item.name) {
            
             bank[i]["quantity"] = parseInt(bank[i]["quantity"]) - data.item.quantity;
             if(bank[i]["quantity"] < 1) {
                bank.splice(i, 1)
            }
           }
         });
         global.io.emit("BANK:" + data.uuid, bank)
         await playerCollection.updateOne(
             {uuid: data.uuid, rpsim: data.rpsim},
             { $set: { bank: bank } },
             { upsert: true }
         );
         let inventory = await add(data)
         return inventory;
        
     } catch (e) {
     console.log(e);
     return "error";
     }
}
const equip = async (data) => {
try {
    //lookup card
    //const card = await cardCollection.findOne({name: data.item.name})
    //check all the slots are not in use
    if(data.player.equipped.length < data.player.equipNum) {
        //slot card and remove from inventory
        const inventory = await remove(data)
        data.player.equipped.push(data.item)
        global.io.emit("EQUIP:" + data.uuid, data.player.equipped)
        await playerCollection.updateOne(
          {uuid: data.uuid, rpsim: data.rpsim},
          { $set: { equipped: data.player.equipped } },
          { upsert: true }
        );
        return inventory
    }
    
    return "Not enough equippment space";
} catch (e) {
console.log(e);
return "error";
}
}
const unequip = async (data) => {
try {
  //lookup card
  //const card = await cardCollection.findOne({name: data.item.name})
  //check all the slots are not in use
  if(data.player.inventory.length < data.player.inventorySize) {
      //slot card and remove from inventory
      const index = data.player.equipped.indexOf(data.item) // probably this thats broken, use a map instead
      data.player.equipped.splice(index, 1)
      global.io.emit("EQUIP:" + data.uuid, data.player.equipped)
      await playerCollection.updateOne(
        {uuid: data.uuid, rpsim: data.rpsim},
        { $set: { equipped: data.player.equipped } },
        { upsert: true }
        );
        const inventory = await add(data)
        return inventory;
      }
      
  return "Not enough inventory space";
} catch (e) {
console.log(e);
return "error";
}
}
const sell = async (data) => {
  //remove item

  //add items sell value to currency

}
const buy = async (data) => {
  //remove items value from currency

  //add item to inventory
}
const trade = async (data) => {
  //remove item from player A
  //remove currency from player B
  
  //add item to player B
  //add currency to player A
}

exports.pay = async (req, res) => {
  let pay = 10;
  const maxDaily = 100;
  const [paycheck_total, player] = await Promise.all([
    paycheckCollection.findOne({uuid: req.body.uuid}),
    playerCollection.findOne({uuid: req.body.uuid, rpsim: req.body.rpsim})
  ])
  
  if(paycheck_total.total + pay > maxDaily) {
    // tax it by 80%
    pay *= 0.2
  }
  let credits = parseFloat(player.currency + pay)
  playerCollection.updateOne({uuid: req.body.uuid, rpsim: req.body.rpsim}, {$set: {currency: credits}}, {upsert: true})
  paycheckCollection.updateOne({uuid: req.body.uuid, rpsim: req.body.rpsim}, {$set: {total: (paycheck_total.total + pay)}}, {upsert: true})
  global.io.emit("CRED:" + req.body.uuid, credits)

  console.log(req.body)
  res.status(200).json({status:"ok"})
}