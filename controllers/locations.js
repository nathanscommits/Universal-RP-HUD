//store list of avatar coordinates (do we really need to store this?)
//(probably not! :>)
//process new named location info for each avatar in list (do this client side)
//
//send new coordinate and named location info to each avatar in list, through websocket (process nearby avatars on client side)
exports.store = async (req, res) => {
    global.io.emit("LI:" + req.body.region, req.body)
   // console.log(req.body)
    res.status(200).json({status:"ok"})
}
