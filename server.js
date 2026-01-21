/*************************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *************************************************/
/*************************
 * Require Statements
 *************************/
const env = require("dotenv").config()
const path = require("path");
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const app = express()
const staticRoutes = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute");

/*************************
 * Routes
 *************************/
// Serve public folder for CSS, images, JS
app.use(express.static(path.join(__dirname, "public")));

app.use(staticRoutes)


/****************************
 * View Engine and Templates
 ****************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root

// Index route
app.get("/", baseController.buildHome)

// Inventory routes
app.use("/inv", inventoryRoute)


// 404 handler
app.use((req, res, next) => {
  const error = new Error("Page Not Found")
  error.status = 404
  next(error)
})

// Global error handler
app.use((error, req, res, next) => {
  res.status(error.status || 500)
  res.render("errors/error", {
    title: error.status || 500,
    message: error.message,
    nav: ""
  })
})


/*************************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/*******************************************
 * Log statement to confirm server operation
 *******************************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
