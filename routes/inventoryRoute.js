// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidation = require("../utilities/inventory-validation") // server-side validation


/* ****************************
 *  Task 1: Management View
 * ****************************/
router.get("/", utilities.handleErrors(invController.buildManagement))

/* ****************************
 *  Task 2: Add Classification
 * ****************************/
// Show the add-classification form
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))

// Process add-classification form
router.post(
  "/add-classification",
  invValidation.classificationRules(),
  invValidation.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

/* ****************************
 *  Task 3: Add Inventory
 * ****************************/
// Show the add-inventory form
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))

// Process add-inventory form
router.post(
  "/add-inventory",
  invValidation.inventoryRules(),
  invValidation.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

/* ****************************
 * Existing Routes 
 * ****************************/
router.get("/type/:classificationId", invController.buildByClassificationId)
router.get("/detail/:invId", invController.buildVehicleDetail)

// Trigger 500 error for testing
router.get("/trigger-error", (req, res, next) => {
  const err = new Error("Intentional Server Error")
  err.status = 500
  next(err)
})

/*********************************** */

module.exports = router
