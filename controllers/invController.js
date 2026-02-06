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
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()
    res.render('./inventory/management', {
      title: 'Inventory Management',
      nav,
      errors: null,
      classificationSelect,
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

/* ********************************************
 *  Return Inventory by Classification As JSON
 * *******************************************/
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
// invCont.updateInventory = async function (req, res, next) {
//   let nav = await utilities.getNav()
//   const {
//     inv_id,
//     inv_make,
//     inv_model,
//     inv_description,
//     inv_image,
//     inv_thumbnail,
//     inv_price,
//     inv_year,
//     inv_miles,
//     inv_color,
//     classification_id,
//   } = req.body
//   const updateResult = await invModel.updateInventory(
//     inv_id,  
//     inv_make,
//     inv_model,
//     inv_description,
//     inv_image,
//     inv_thumbnail,
//     inv_price,
//     inv_year,
//     inv_miles,
//     inv_color,
//     classification_id
//   )

//   if (updateResult) {
//     const itemName = updateResult.inv_make + " " + updateResult.inv_model
//     req.flash("notice", `The ${itemName} was successfully updated.`)
//     res.redirect("/inv/")
//   } else {
//     const classificationSelect = await utilities.buildClassificationList(classification_id)
//     const itemName = `${inv_make} ${inv_model}`
//     req.flash("notice", "Sorry, the insert failed.")
//     res.status(501).render("inventory/edit-inventory", {
//     title: "Edit " + itemName,
//     nav,
//     classificationSelect: classificationSelect,
//     errors: null,
//     inv_id,
//     inv_make,
//     inv_model,
//     inv_year,
//     inv_description,
//     inv_image,
//     inv_thumbnail,
//     inv_price,
//     inv_miles,
//     inv_color,
//     classification_id
//     })
//   }
// }
invCont.updateInventory = async function (req, res, next) {
  try {
    const {
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    } = req.body

    // Manual validation — same style as add-inventory
    let errors = []

    if (!inv_make) errors.push({ msg: "Make is required" })
    if (!inv_model) errors.push({ msg: "Model is required" })
    if (!inv_year) errors.push({ msg: "Year is required" })
    if (!inv_price) errors.push({ msg: "Price is required" })
    if (!inv_miles) errors.push({ msg: "Miles is required" })
    if (!inv_color) errors.push({ msg: "Color is required" })
    if (!classification_id) errors.push({ msg: "Classification is required" })

    if (errors.length > 0) {
      // There are validation errors — rebuild the form with previous values
      let nav = await utilities.getNav()
      const classificationSelect = await utilities.buildClassificationList(classification_id)
      return res.render("./inventory/edit-inventory", {
        title: "Edit " + inv_make + " " + inv_model,
        nav,
        classificationSelect: classificationSelect,
        errors: { array: () => errors }, // same structure my ejs expects
        inv_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id
      })
    }

    // All fields valid — update in DB
    const result = await invModel.updateInventory(
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    )

    if (result) {
      req.flash("success", `${inv_make} ${inv_model} was successfully updated.`)
      res.redirect("/inv/")
    } else {
      req.flash("error", "Sorry, the update failed.")
      res.redirect("/inv/")
    }
  } catch (error) {
    next(error)
  }
}

/* ********************************
 *  Build delete confirmation view
 * ********************************/
invCont.buildDeleteConfirm = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)

    let nav = await utilities.getNav()
    const itemData = await invModel.getInventoryById(inv_id)

    if (!itemData) {
      req.flash("error", "Inventory item not found.")
      return res.redirect("/inv/")
    }

    const itemName = `${itemData.inv_make} ${itemData.inv_model}`

    res.render("./inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.body.inv_id)

    const deleteResult = await invModel.deleteInventoryItem(inv_id)

    if (deleteResult && deleteResult.rowCount === 1) {
      req.flash("notice", "Vehicle was successfully deleted.")
      res.redirect("/inv/")
    } else {
      req.flash("notice", "Sorry, the delete failed.")
      res.redirect(`/inv/delete/${inv_id}`)
    }
  } catch (error) {
    next(error)
  }
}




module.exports = invCont