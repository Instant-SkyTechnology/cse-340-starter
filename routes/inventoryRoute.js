// // Needed Resources
// const express = require("express")
// const router = new express.Router()
// const invController = require("../controllers/invController")
// const utilities = require("../utilities")
// const invValidation = require("../utilities/inventory-validation") // server-side validation


// /* ****************************
//  *  Task 1: Management View
//  * ****************************/
// router.get("/", utilities.handleErrors(invController.buildManagement))

// /* ****************************
//  *  Task 2: Add Classification
//  * ****************************/
// // Show the add-classification form
// router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))

// // Process add-classification form
// router.post(
//   "/add-classification",
//   invValidation.classificationRules(),
//   invValidation.checkClassificationData,
//   utilities.handleErrors(invController.addClassification)
// )

// /* ****************************
//  *  Task 3: Add Inventory
//  * ****************************/
// // Show the add-inventory form
// router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))

// // Process add-inventory form
// router.post(
//   "/add-inventory",
//   invValidation.inventoryRules(),
//   invValidation.checkInventoryData,
//   utilities.handleErrors(invController.addInventory)
// )

// /* ***********************************
//  *  Get Inventory for AJAX Route w5
//  * **********************************/
// router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// /* ***********************************
//  *  Get Edit Inventory Route w5
//  * **********************************/
// router.get("/edit/:inv_id", utilities.handleErrors(invController.editInventoryView))

// // Process edit-inventory form
// router.post("/update", utilities.handleErrors(invController.updateInventory))

// /* ***********************************
//  *  Get Delete Confirm Route w5
//  * **********************************/
// router.get("/delete/:inv_id", utilities.handleErrors(invController.buildDeleteConfirm))

// // Process delete
// router.post("/delete", utilities.handleErrors(invController.deleteInventory))

// /* ***********************************
//  *  Check Account privilage Route w5
//  * **********************************/
// router.get(
//   "/",
//   utilities.checkAccountType,
//   utilities.handleErrors(invController.buildManagementView)
// )

// router.get(
//   "/add-inventory",
//   utilities.checkAccountType,
//   utilities.handleErrors(invController.buildAddInventory)
// )

// /* ****************************
//  * Existing Routes
//  * ****************************/
// router.get("/type/:classificationId", invController.buildByClassificationId)
// router.get("/detail/:invId", invController.buildVehicleDetail)

// // Trigger 500 error for testing
// router.get("/trigger-error", (req, res, next) => {
//   const err = new Error("Intentional Server Error")
//   err.status = 500
//   next(err)
// })

// /*********************************** */

// module.exports = router

// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidation = require("../utilities/inventory-validation") // server-side validation

/* ****************************
 *  Task 2: Management View with Auth
 * ****************************/
router.get(
  "/", 
  utilities.checkJWTToken, // ensure user is logged in
  utilities.checkAccountType, // Task2: Employee/Admin only
  utilities.handleErrors(invController.buildManagement)
)

/* ****************************
 *  Task 2 & 3: Add Classification
 * ****************************/
// Show the add-classification form
router.get(
  "/add-classification", 
  utilities.checkJWTToken,
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildAddClassification)
)

// Process add-classification form
router.post(
  "/add-classification",
  utilities.checkJWTToken,
  utilities.checkAccountType,
  invValidation.classificationRules(),
  invValidation.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

/* ****************************
 *  Task 2 & 3: Add Inventory
 * ****************************/
// Show the add-inventory form
router.get(
  "/add-inventory",
  utilities.checkJWTToken,
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildAddInventory)
)

// Process add-inventory form
router.post(
  "/add-inventory",
  utilities.checkJWTToken,
  utilities.checkAccountType,
  invValidation.inventoryRules(),
  invValidation.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

/* ***********************************
 *  AJAX & Edit/Delete Inventory Routes
 * ***********************************/
router.get("/getInventory/:classification_id",
            utilities.handleErrors(invController.getInventoryJSON))

router.get("/edit/:inv_id",
            utilities.checkJWTToken,
            utilities.checkAccountType,
            utilities.handleErrors(invController.editInventoryView))
router.post("/update",
            utilities.checkJWTToken,
            utilities.checkAccountType,
            utilities.handleErrors(invController.updateInventory))

router.get("/delete/:inv_id",
            utilities.checkJWTToken,
            utilities.checkAccountType,
            utilities.handleErrors(invController.buildDeleteConfirm))
router.post("/delete",
            utilities.checkJWTToken,
            utilities.checkAccountType,
            utilities.handleErrors(invController.deleteInventory))

/* *****************************
 * Admin-only delete routes w6
 * ***************************** */
router.get(
  "/delete-classification/:classificationId",
  utilities.checkLogin,
  utilities.checkAdmin,
  utilities.handleErrors(invController.buildDeleteClassification)
)

router.post(
  "/delete-classification",
  utilities.checkLogin,
  utilities.checkAdmin,
  invValidation.validateDeleteClassification,
  utilities.handleErrors(invController.deleteClassification)
)

/* ****************************
 *  Public Routes (no auth)
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
