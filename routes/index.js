var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");


// root route
router.get("/", function(req, res){
    res.render("landing");
});



//==============
// LOGIN ROUTES
//==============

// show login form
router.get("/login", function(req, res){
    if(!req.isAuthenticated()){
        res.render("login");
    } else {
        req.flash("warning", "You are already logged in.");
        res.redirect("/campgrounds");
    }
});

// handling login logic
router.post("/login", passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true
}), function(req, res){
    req.flash("success", "You are logged in, " + req.user.username +".");
    var returnTo = req.session.returnTo ? req.session.returnTo : '/campgrounds';
    delete req.session.returnTo;
    res.redirect(returnTo);
    }
);

router.get("/logout", function(req, res){
    req.flash("warning", "Logged out " + req.user.username + ".");
    req.logout();
    res.redirect("/campgrounds");
});



module.exports = router;
