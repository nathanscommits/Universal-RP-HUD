socket.on("TRADE_REQ:" + UUID, (details) => {
    //ask to accept/decline an incoming trade request
    document.getElementById("trade_request").innerHTML = `${JSON.stringify(details)}`
})