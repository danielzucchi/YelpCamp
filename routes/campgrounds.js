var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var User = require("../models/user");
var middleware = require("../middleware");
var NodeGeocoder = require('node-geocoder');

var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.AIzaSyBPMCx5jCBLYkEqF0nFgqZcfORKS6Y7xlw,
  formatter: null
};

var geocoder = NodeGeocoder(options);


router.get("/", function(req, res){
    req.session.returnTo = req.originalUrl;
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    Campground.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
        Campground.count().exec(function (err, count) {
            if (err) {
            req.flash("error", "Something went wrong.");
            res.redirect("/campgrounds");
        } else {
            res.render("campgrounds/index", {
                                            campgrounds: allCampgrounds,
                                            current: pageNumber,
                                            pages: Math.ceil(count / perPage)
                                            });
        }
    });
})});

router.post("/", middleware.isLoggedIn, function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var price = req.body.price;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
        req.flash('error', "Invalid address.");
        return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newCampground = {name: name, image: image, description: desc, price: price, author:author, location: location, lat: lat, lng: lng};
    //Create a new campground and save to database
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            req.flash("error", "Something went wrong.");
            return res.redirect("/campgrounds");
        } else {
            req.flash("success", "New campground created!");
            res.redirect("/campgrounds");
        }
    });
    });
});

router.get("/new", middleware.isLoggedIn, function(req, res) {
   res.render("campgrounds/new");
});

//Show more info about selected campground
router.get("/:id", function(req, res) {
    req.session.returnTo = req.originalUrl; // save url in case of login from here
    //find the campground with provided id
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            req.flash("error", "Something went wrong.");
            return res.redirect("/campgrounds");
        } else {
            if (!foundCampground) {
                req.flash("error", "Campground not found.");
                return res.redirect("/campgrounds");
            }
            //render show template with that campground, then pass in the foundCampground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
    req.params.id
});

// EDIT CAMPGROUND
router.get("/:id/edit", middleware.checkCampAuthorization, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

// UPDATE CAMPGROUND
router.put("/:id", middleware.checkCampAuthorization, function(req, res){
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            req.flash('error', "Invalid address.");
            return res.redirect('back');
        }
        req.body.campground.lat = data[0].latitude;
        req.body.campground.lng = data[0].longitude;
        req.body.campground.location = data[0].formattedAddress;
        // find and update the correct campground
        Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
            if(err){
                req.flash("error", "Something went wrong.");
                res.redirect("/campgrounds");
            } else {
                req.flash("success", "Campground updated successfully.");
                res.redirect("/campgrounds/" + req.params.id);
            }
        });
    });
});

// DELETE CAMPGROUND
router.delete("/:id", middleware.checkCampAuthorization, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Campground not found.");
            return res.redirect("/campgrounds");
        } else {
            Comment.remove({_id: {$in: foundCampground.comments}}, function(err){
                if(err){
                    req.flash("error", "Something went wrong.");
                    return res.redirect("/campgrounds");
                }
            });
            req.flash("warning", "Campground has been deleted.");
            res.redirect("/campgrounds");
        }
    });
});


module.exports = router;
