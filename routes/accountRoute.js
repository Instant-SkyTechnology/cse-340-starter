/* ****************************
 *  Account Routes
 * ****************************/
const express = require("express")
const router = express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const validate = require('../utilities/account-validation') // only ONE import

/* ****************************
 *  Delivery Login Views
 * ****************************/
router.get("/login", utilities.handleErrors(accountController.buildLogin))

/* ****************************
 *  Delivery Register Views
 * ****************************/
router.get('/register', utilities.handleErrors(accountController.buildRegister))

/* ****************************
 *  Process Registration 
 * ****************************/
router.post(
  "/register",
  validate.registationRules(),
  validate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

/* ****************************
 *  Process the login attempt
 * ****************************/
router.post(
  "/login",
  validate.loginRules(),
  validate.checkLoginData,
  utilities.handleErrors(accountController.loginAccount)
)

module.exports = router
