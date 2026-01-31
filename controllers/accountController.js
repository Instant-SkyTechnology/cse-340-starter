const accountModel = require("../models/account-model")
const utilities = require('../utilities')
const bcrypt = require("bcryptjs")

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email: '' // added
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    account_firstname: "", // added all 3
    account_lastname: "",
    account_email: ""
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password
  } = req.body

  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,          // REQUIRED
      account_email: ""      // REQUIRED for sticky logic
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      account_firstname: "", // added all 3
      account_lastname: "",
      account_email: ""
    })
  }
}

/* ****************************************
 *  Process Login
 * *************************************** */
async function loginAccount(req, res) {
  let nav = await utilities.getNav()
  const { email, password } = req.body

  try {
    const accountData = await accountModel.getAccountByEmail(email)

    // Email not found
    if (!accountData || !accountData.account_password) {
      req.flash("notice", "Invalid email or password.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        email,
        errors: null
      })
    }

    const passwordMatch = await bcrypt.compare(password, accountData.account_password)

    if (passwordMatch) {
      req.flash("notice", "Login successful!")
      return res.redirect("/")
    } else {
      req.flash("notice", "Invalid email or password.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        account_email: email, // added
        errors: null
      })
    }
  } catch (error) {
    console.error("loginAccount error:", error)
    req.flash("notice", "An unexpected error occurred. Please try again.")
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      email,
      errors: null
    })
  }
}


module.exports = { buildLogin, buildRegister, registerAccount, loginAccount }
