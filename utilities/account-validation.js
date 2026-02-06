const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")
const regValidate = {}

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
  regValidate.registationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the DB
      // body("account_email")
      //   .trim()
      //   .notEmpty()
      //   .withMessage("A valid email is required.")
      //   .bail()
      //   .isEmail()
      //   .withMessage("A valid email is required.")
      //   .normalizeEmail() // refer to validator.js docs
      // .custom(async (account_email) => {
      //     const emailExists = await accountModel.checkExistingEmail(account_email)
      //     if (emailExists){
      //       throw new Error("Email exists. Please log in or use different email")
      //     }
      //   }),
      
      // valid email is required and cannot already exist in the database
      body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail() // refer to validator.js docs
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
          const emailExists = await accountModel.checkExistingEmail(account_email)
          if (emailExists){
            throw new Error("Email exists. Please log in or use different email")
          }
        }),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .withMessage("Password does not meet requirements.")
        .bail()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }
  
/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
regValidate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Registration",
      nav,
      errors,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/* **********************************
 *  Login Data Validation Rules
 * ********************************* */
regValidate.loginRules = () => {
  return [
    // valid email is required
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address."),

    // password is required
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Please provide your password."),
  ]
}

/* *********************************************************
 * Check login data and return errors or continue to login
 * ****************************************************** */
regValidate.checkLoginData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.render("account/login", {
      title: "Login",
      nav,
      errors,
      account_email: req.body.account_email  // sticky added
    })
  }
  next()
}

/* **********************************
 * Update Account Info Validation Rules
 * ********************************* */
regValidate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a first name."),
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a last name."),
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        const account_id = req.body.account_id;
        const emailExists = await accountModel.checkExistingEmail(account_email);
        if (emailExists && emailExists.account_id != account_id) {
          throw new Error("Email exists. Please use a different email.");
        }
      }),
  ];
};

/* ******************************
 * Check update data
 * ***************************** */
// regValidate.checkUpdateData = async (req, res, next) => {
//   const { account_firstname, account_lastname, account_email } = req.body
//   const errors = validationResult(req)
//   if (!errors.isEmpty()) {
//     const nav = await utilities.getNav()
//     return res.render("account/update-account", {
//       title: "Update Account",
//       nav,
//       errors,
//       account_firstname,
//       account_lastname,
//       account_email,
//       account_id: req.body.account_id
//     })
//   }
//   next()
// }
regValidate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    return res.render("account/update-account", {
      title: "Update Account Information",
      nav,
      errors,
      accountData: res.locals.accountData,
      ...req.body, // keep user input sticky
    });
  }
  next();
};

regValidate.checkPassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    return res.render("account/change-password", {
      title: "Change Password",
      nav,
      errors,
      accountData: res.locals.accountData,
    });
  }
  next();
};

/* **********************************
 * Password Change Validation Rules
 * ********************************* */
regValidate.passwordRules = () => {
  return [
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required.")
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
      })
      .withMessage(
        "Password must be at least 8 characters, include uppercase, lowercase, and a number."
      ),
  ];
};

/* ******************************
 * Check password data
 * ***************************** */
regValidate.checkPassword = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.render("account/update-account", {
      title: "Update Account",
      nav,
      errors,
      account_id: req.body.account_id
    })
  }
  next()
}


module.exports = regValidate
