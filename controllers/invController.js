const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { validationResult } = require("express-validator")

const invCont = {}

/* ****************************************
 *  Build inventory by classification view
 * ****************************************/
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const nav = await utilities.getNav()

    // Prevent crash if no vehicles exist
    if (!data || data.length === 0) {
      return res.render("./inventory/classification", {
        title: "No Vehicles Found",
        nav,
        grid: '<p class="notice">Sorry, no matching vehicles could be found.</p>'
      })
    }

    const grid = await utilities.buildClassificationGrid(data)
    const className = data[0].classification_name

    res.render("./inventory/classification", {
      title: `${className} vehicles`,
      nav,
      grid,
    })
  } catch (error) {
    next(error)
  }
}


/* ****************************
 *  Build vehicle detail view
 * ****************************/
invCont.buildVehicleDetail = async function (req, res, next) {
  try {
    const inv_id = req.params.invId

    const vehicle = await invModel.getInventoryById(inv_id)
    if (!vehicle) {
      throw new Error("Vehicle not found")
    }

    const vehicleHTML = await utilities.buildVehicleDetail(vehicle)
    const nav = await utilities.getNav()

    res.render("./inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicleHTML,
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************
 * Build Management view
 * ****************************/
invCont.buildManagement = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render('./inventory/management', {
      title: 'Inventory Management',
      nav,
      message: req.flash('message')
    })
  } catch (error) {
    next(error)
  }
}

/* *******************************
 * Build Add Classification Form
 * ******************************/
invCont.buildAddClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render('./inventory/add-classification', {
      title: 'Add Classification',
      nav,
      errors: null,
      message: req.flash('message'),
      classification_name: '' // sticky
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************
 * Process Add Classification
 * ****************************/
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.render('./inventory/add-classification', {
      title: 'Add Classification',
      nav,
      errors,
      message: null,
      classification_name
    })
  }

  const result = await invModel.addClassification(classification_name)
  if (result) {
    req.flash('message', `Classification '${classification_name}' added successfully!`)
    return res.redirect("/inv/")
  } else {
    req.flash('message', 'Failed to add classification.')
    return res.redirect("/inv/")
  }
}

/* ****************************
 * Build Add Inventory Form
 * ****************************/
invCont.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()
    res.render('./inventory/add-inventory', {
      title: 'Add Inventory',
      nav,
      classificationList,
      message: req.flash('message'),
      errors: null,
      classification_id: '',
      inv_make: '',
      inv_model: '',
      inv_year: '',
      inv_description: '',
      inv_image: '/images/vehicles/no-image.png',
      inv_thumbnail: '/images/vehicles/no-image.png',
      inv_price: '',
      inv_miles: '',
      inv_color: ''
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************
 * Process Add Inventory
 * ****************************/
invCont.addInventory = async function (req, res, next) {
  const {
    classification_id, inv_make, inv_model, inv_year,
    inv_description, inv_image, inv_thumbnail,
    inv_price, inv_miles, inv_color
  } = req.body

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(classification_id)

    return res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors,
      message: null,
      ...req.body // sticky inputs
    })
  }

  const result = await invModel.addInventoryItem(
    classification_id, inv_make, inv_model, inv_year,
    inv_description, inv_image, inv_thumbnail,
    inv_price, inv_miles, inv_color
  )

  // This currently redirect to management
  if (result) {
    req.flash('message', `Vehicle '${inv_make} ${inv_model}' added successfully!`)
    return res.redirect("/inv/") 
  } else {
    req.flash('message', 'Failed to add vehicle.')
    return res.redirect('/inv/add-inventory')
  }
}


module.exports = invCont