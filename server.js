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
const session = require("express-session")
const pool = require('./database/')

// Routes & controllers
const staticRoutes = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require("./utilities/");
const accountRouter = require("./routes/accountRoute")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")

const app = express()

/* ***********************
 * Middleware
 * ************************/
 app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))
// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function (req, res, next) {
  res.locals.messages = function () {
    const flash = req.flash(); // get all flash messages
    let html = '';

    for (const type in flash) {
      flash[type].forEach(msg => {
        const cssClass = type === 'notice' ? 'info' : type; //to match "notice" to "info" in my CSS
        html += `<div class="messages ${cssClass}">${msg}</div>`;
      });
    }

    return html;
  };
  next();
});

app.use(async (req, res, next) => {
  res.locals.nav = await utilities.getNav()
  next()
})

// Process Registrations Middleware w4
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// Login activity w5
app.use(cookieParser())
app.use(utilities.checkJWTToken)


/*************************
 * Routes
 *************************/
// Serve public folder for CSS, images, JS
app.use(express.static(path.join(__dirname, "public")));

app.use("/account", accountRouter)

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