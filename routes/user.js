const express= require("express");
const router= express.Router();
const User= require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport= require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");

//signup-routes
router.get("/signup", userController.renderSignup );

router.post("/signup", wrapAsync(userController.signup));

//login-routes
router.get("/login", userController.renderLogin);

router.post("/login",
     saveRedirectUrl,
     passport.authenticate("local",
        {failureRedirect: "/login",
        failureFlash: true, 
      }),
      userController.login );

//logout 
router.get("/logout", userController.logout);

module.exports = router;