const { body, validationResult } = require("express-validator")
const utilities = require("../utilities")
const invModel = require("../models/inventory-model")

const validate = {}

/* ******************************
 * Classification validation rules
 * ****************************** */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty()
      .withMessage("Classification name is required.")
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("Classification name cannot contain spaces or special characters.")
  ]
}

/* ******************************
 * Check classification data
 * ****************************** */
validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors,
      message: null,
      classification_name
    })
  }
  next()
}

/* ******************************
 * Inventory validation rules
 * ****************************** */
validate.inventoryRules = () => {
  return [
    body("classification_id").notEmpty().withMessage("Classification is required."),
    body("inv_make").trim().notEmpty().withMessage("Make is required."),
    body("inv_model").trim().notEmpty().withMessage("Model is required."),
    body("inv_year").isInt({ min: 1900 }).withMessage("Valid year required."),
    body("inv_description").trim().notEmpty().withMessage("Description is required."),
    body("inv_image").trim().notEmpty().withMessage("Image path required."),
    body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail path required."),
    body("inv_price").isFloat({ min: 0 }).withMessage("Price must be a number."),
    body("inv_miles").isInt({ min: 0 }).withMessage("Miles must be a number."),
    body("inv_color").trim().notEmpty().withMessage("Color is required.")
  ]
}

/* ******************************
 * Check inventory data
 * ****************************** */
validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const classificationList =
      await utilities.buildClassificationList(req.body.classification_id)

    return res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors,
      message: null,
      ...req.body   // THIS enables sticky inputs safely
    })
  }
  next()
}

module.exports = validate
