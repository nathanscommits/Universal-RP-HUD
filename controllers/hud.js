const playerCollection = require("../db").db().collection("players");
exports.loadHUD = async (req, res) => {
    const player = await playerCollection.findOne({uuid: req.params.uuid, rpsim: req.params.rpsim})
    res.render('hud', {queries: req.queries, params: req.params, player: player})
}