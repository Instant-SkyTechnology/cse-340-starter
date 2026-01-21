// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:invId", invController.buildVehicleDetail);

// Trigger 500 error for testing
router.get("/trigger-error", (req, res, next) => {
  const err = new Error("Intentional Server Error");
  err.status = 500;
  next(err); 
});


module.exports = router;