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

// Routes & controllers
const staticRoutes = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require("./utilities/");


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

/***********************************
 * 404 handler
 * Global Error Handling Middleware
 ***********************************/
app.use((req, res, next) => {
  const error = new Error("Sorry, we appear to have lost that page.")
  error.status = 404
  next(error)
})

app.use(async (err, req, res, next) => {
  const nav = await utilities.getNav(); 
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);

  const message =
    err.status === 404
      ? err.message
      : "Oh no! There was a crash. Maybe try a different route?";

  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  });
});

/**************************************
 * Local Server Information
 * Values from .env (environment) file
 **************************************/
const port = process.env.PORT
const host = process.env.HOST

/*******************************************
 * Log statement to confirm server operation
 *******************************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
