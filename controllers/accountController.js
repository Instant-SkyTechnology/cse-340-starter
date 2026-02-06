const accountModel = require("../models/account-model")
const utilities = require('../utilities')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

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
 *  Delivery Account-Management
 * *************************************** */
async function buildAccountManagement(req, res, next) {
  try {
    const nav = await utilities.getNav()
    const accountData = res.locals.accountData || req.session.accountData

    res.render("account/account-management", {
      title: "Account Management",
      nav,
      accountData,   // must be defined for EJS
      notice: req.flash("notice"),
    })
  } catch (error) {
    next(error)   // This will hit your error handler
  }
}

/* ****************************************
 *  Delivery Change Password w5
 * *************************************** */
async function buildChangePasswordView(req, res, next) {
  try {
    const nav = await utilities.getNav()
    const account_id = req.params.account_id
    const accountData = await accountModel.getAccountById(account_id)

    res.render("account/change-password", {
      title: "Change Password",
      nav,
      accountData,
      errors: null,
      notice: req.flash("notice")
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res, next) {
  try {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    const accountData = await accountModel.getAccountByEmail(account_email)

    if (!accountData) {
      req.flash("notice", "Please check your credentials and try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }

    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password)
    if (!passwordMatch) {
      req.flash("notice", "Please check your credentials and try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }

    // remove password before signing JWT
    delete accountData.account_password

    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })

    // set cookie
    res.cookie("jwt", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600 * 1000,
    })

    // store data in locals so buildAccountManagement can use it
    res.locals.accountData = accountData

    // redirect to account management safely
    return res.redirect("/account/")
    
  } catch (error) {
    console.error("Login error:", error)
    req.flash("notice", "Server error — please try again later.")
    return res.status(500).redirect("/account/login")
  }
}


/* ****************************************
 *  Deliver Update Account View
 * *************************************** */
async function buildUpdateView(req, res) {
  const nav = await utilities.getNav()
  const account_id = parseInt(req.params.account_id)
  const accountData = await accountModel.getAccountById(account_id)

  res.render("account/update-account", {
    title: "Update Account",
    nav,
    errors: null,
    account_firstname: accountData.account_firstname || "",
    account_lastname: accountData.account_lastname || "",
    account_email: accountData.account_email || "",
    account_id: accountData.account_id,
    notice: req.flash("notice")
  })
}

/* ****************************************
 *  Process Update Account Info
 * *************************************** */
async function updateAccount(req, res) {
  const nav = await utilities.getNav()
  const { account_id, account_firstname, account_lastname, account_email } = req.body

  try {
    // Check if the email is already in use by another account
    const existingAccount = await accountModel.getAccountByEmail(account_email)
    if (existingAccount && existingAccount.account_id != account_id) {
      req.flash("notice", "Email is already in use.")
      return res.status(400).render("account/update-account", {
        title: "Update Account",
        nav,
        errors: null,
        account_firstname,
        account_lastname,
        account_email,
        account_id,
        notice: req.flash("notice")
      })
    }

    // Proceed to update account info
    const result = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    )

    if (result) {
      req.flash("notice", "Account updated successfully.")
      res.redirect("/account/")
    } else {
      req.flash("notice", "Update failed.")
      res.status(500).render("account/update-account", {
        title: "Update Account",
        nav,
        errors: null,
        account_firstname,
        account_lastname,
        account_email,
        account_id,
        notice: req.flash("notice")
      })
    }
  } catch (error) {
    console.error("Account update error:", error)
    req.flash("notice", "Server error — please try again later.")
    return res.status(500).render("account/update-account", {
      title: "Update Account",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
      account_id,
      notice: req.flash("notice")
    })
  }
}

/* ****************************************
 *  Process Update Password
 * *************************************** */
async function updatePassword(req, res) {
  const nav = await utilities.getNav()
  const { account_id, account_password } = req.body
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", "Error hashing password.")
    return res.status(500).render("account/update-account", {
      title: "Update Account",
      nav,
      errors: null,
      account_id
    })
  }

  const result = await accountModel.updatePassword(account_id, hashedPassword)

  if (result) {
    req.flash("notice", "Password updated successfully.")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Password update failed.")
    res.status(500).render("account/update-account", {
      title: "Update Account",
      nav,
      errors: null,
      account_id
    })
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, buildUpdateView, updateAccount, updatePassword, buildChangePasswordView }
