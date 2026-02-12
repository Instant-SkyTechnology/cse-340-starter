const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const Util = {}

/* **************************************
 * Constructs the nav HTML unordered list
 ****************************************/
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  
  // Home link
  list += '<li><a href="/" title="Home page">Home</a></li>'
  
  // Classification links
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      // Clean up thumbnail path
      let imgPath = vehicle.inv_thumbnail && vehicle.inv_thumbnail !== ''
        ? vehicle.inv_thumbnail.replace('/images/vehicles/vehicles/', '/images/vehicles/')
        : '/images/vehicles/no-image.png'

      grid += '<li>'
      grid +=  '<a href="/inv/detail/' + vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + ' details"><img src="' + imgPath
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="/inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************
 * Build vehicle detail HTML
 * **************************/
Util.buildVehicleDetail = async function(vehicle) {
  let imgPath = vehicle.inv_image
    ? vehicle.inv_image.replace('/images/vehicles/vehicles/', '/images/vehicles/')
    : '/images/vehicles/no-image.png'

  return `
  <section class="vehicle-detail">
    <div class="vehicle-image">
      <img src="${imgPath}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
    </div>
    <div class="vehicle-info">
      <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
      <p class="price">
        <strong>Price:</strong>
        $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}
      </p>
      <p><strong>Mileage:</strong>
        ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)} miles
      </p>
      <p><strong>Description:</strong> ${vehicle.inv_description}</p>
      <p><strong>Color:</strong> ${vehicle.inv_color}</p>
    </div>
  </section>
  `
}

/* **************************************
 * Handle errors in async route functions
 ****************************************/
Util.handleErrors = function (fn) {
  return async function (req, res, next) {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);  // Pass the error to the next middleware
    }
  };
};

/* **************************************
 * Build classification select list
 * ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"

  data.rows.forEach((row) => {
    classificationList += `<option value="${row.classification_id}"`
    if (classification_id != null && row.classification_id == classification_id) {
      classificationList += " selected"
    }
    classificationList += `>${row.classification_name}</option>`
  })

  classificationList += "</select>"
  return classificationList
}

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      (err, accountData) => {
        if (err) {
          req.flash("notice", "Please log in")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        next()
      }
    )
  } else {
    // Ensure accountData is at least null to prevent crashes in EJS
    res.locals.accountData = null
    res.locals.loggedin = 0
    next()
  }
}


/* ****************************************
* Middleware to check type validity
**************************************** */
Util.checkAccountType = (req, res, next) => {
  const account = res.locals.accountData

  if (
    account &&
    (account.account_type === "Employee" ||
     account.account_type === "Admin")
  ) {
    return next()
  }

  req.flash("notice", "Please log in with proper permissions.")
  return res.status(403).render("account/login", {
    title: "Login",
  })
}

/* *********************************
 * Admin authorization middleware w6
 * ***************************** */
Util.checkAdmin = (req, res, next) => {
  if (
    res.locals.accountData &&
    res.locals.accountData.account_type === "Admin"
  ) {
    return next()
  }

  req.flash("notice", "Admin access required.")
  return res.redirect("/account/login")
}


/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

module.exports = Util