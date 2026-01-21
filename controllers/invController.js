const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ****************************************
 *  Build inventory by classification view
 * ****************************************/
// invCont.buildByClassificationId = async function (req, res, next) {
//     const classification_id = req.params.classificationId
//     const data = await invModel.getInventoryByClassificationId(classification_id)
//     // console.log("Vehicle data:", data)
//     // console.log("Vehicle thumbnails:", data.map(v => v.inv_thumbnail)) /*  These two lines help to debug the thumbnail*/


//   const grid = await utilities.buildClassificationGrid(data)
//   let nav = await utilities.getNav()
//   const className = data[0].classification_name
//   res.render("./inventory/classification", {
//     title: className + " vehicles",
//     nav,
//     grid,
//   })
// }
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const nav = await utilities.getNav()

    // ✅ Prevent crash if no vehicles exist
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


module.exports = invCont