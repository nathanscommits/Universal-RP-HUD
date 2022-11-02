const express = require("express"),
  router = express.Router();

const LOCATIONS = require("./controllers/locations")
const { loadHUD } = require("./controllers/hud")
const { invOp, pay } = require("./controllers/inventory");

//load hud
router.get("/:rpsim/:uuid/:region", loadHUD)

//position stuff
router.post("/update-positions", LOCATIONS.store)

//inventory stuff
router.post('/inventory', invOp, (req, res) => {
  res.redirect("/")
})
router.post("/pay", pay)

//combat stuff
router.get('/fight', (req, res) => {
  res.render('fight')
})

router.get("/", (req, res) => {
  res.render("poster")
})

module.exports = router;
