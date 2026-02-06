/* ****************************
 *  Account Routes
 * ****************************/
const express = require("express")
const router = express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation') // only ONE import

/* ****************************
 *  Delivery Login Views
 * ****************************/
router.get("/login", utilities.handleErrors(accountController.buildLogin))

/* ****************************
 *  Delivery Register Views
 * ****************************/
router.get('/register', utilities.handleErrors(accountController.buildRegister))

/* ***********************************
 *  Delivery Account-Management Views w5
 * **********************************/
// router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))
router.get(
  "/",
  utilities.checkJWTToken, // <--- important
  utilities.handleErrors(accountController.buildAccountManagement)
)

/* ****************************
 *  Delivery Update Account View w5
 * ****************************/
router.get(
  "/update/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateView)
)

/* ****************************
 *  Process Update Account w4
 * ****************************/
router.post(
  "/update",
  regValidate.updateAccountRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)

/* ****************************
 *  Process Update Password w5
 * ****************************/
router.post(
  "/update-password",
  regValidate.passwordRules(),
  regValidate.checkPassword,
  utilities.handleErrors(accountController.updatePassword)
)

/* ****************************
 *  Delivery Change Password View
 * ****************************/
router.get(
  "/change-password/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildChangePasswordView)
)

/* ****************************
 *  Process Registration 
 * ****************************/
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

/* ****************************
 *  Process the login attempt
 * ****************************/
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

/* ****************************************
 *  Logout
 * *************************************** */
router.get("/logout", (req, res, next) => {
  try {
    res.clearCookie("jwt")
    req.flash("notice", "You have been logged out.")
    return res.redirect("/")
  } catch (error) {
    next(error)
  }
})


module.exports = router
