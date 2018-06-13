var express = require("express");
var passport = require("passport");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var User = require("../models/user");
var middleware = require("../middleware");


// show register form
router.get("/register", function(req, res){
    res.render("register");
});

// handle sign up
router.post("/register", function(req, res){
    var newUser = new User({
        username: req.body.username,
        email: req.body.email
    });
    User.count({email: req.body.email}, function(err, count){
        if(count > 0){
            req.flash("error", "Email address already registered.");
            res.redirect("register");
        } else {
            User.register(newUser, req.body.password, function(err, user){
                if(err){
                    req.flash("error", err.message + ".");
                    res.redirect("register");
                } else {
                    passport.authenticate("local")(req, res, function(){
                        req.flash("success", "Welcome to YelpCamp, " + user.username + "!");
                        res.redirect("/campgrounds");
                    });
                }
            })
        }
    });
});

// USER PROFILE
router.get("/user/:username", middleware.isLoggedIn, function(req, res){
    User.findOne({username: req.params.username}, function(err, foundUser){
        if(err || !foundUser){
            req.flash("error", "The requested user was not found or has been deleted.");
            return res.redirect("back");
        } else {
            Campground.find().where("author.id").equals(foundUser._id).exec(function(err, campgrounds){
                if(err){
                    req.flash("error", "Something went wrong.");
                    return res.redirect("back");
                } else {
                    res.render("user", {user: foundUser, campgrounds: campgrounds});
                }
            });
        }
    });
    req.params.username
});

module.exports = router;
