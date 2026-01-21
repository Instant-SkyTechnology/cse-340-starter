// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:invId", invController.buildVehicleDetail);

router.get("/trigger-error", (req, res, next) => {
  try {
    throw new Error("Intentional Server Error")
  } catch (error) {
    next(error)
  }
});


module.exports = router;