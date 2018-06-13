var middlewareObj = {};
var Campground = require("../models/campground");
var Comment = require("../models/comment");

// All middleware

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("warning", "Please login first.");
    req.session.returnTo = req.originalUrl;
    res.redirect("/login");
}

middlewareObj.checkCampAuthorization = function(req, res, next){
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err || !foundCampground){
                req.flash("error", "Campground not found.");
                return res.redirect("/campgrounds");
            } else {
                // does the user own the campground?
                if(foundCampground.author.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash("error", "You are not authorised to do that.");
                    res.redirect("/campgrounds/" + req.params.id);
                }
            }
        })
    } else {
        req.flash("warning", "You need to be logged in to do that.")
        req.session.returnTo = req.originalUrl;
        res.redirect("/login");
    }
}

middlewareObj.checkCommentAuthorization = function(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err || !foundComment){
                req.flash("error", "Comment not found.");
                return res.redirect("/campgrounds/" + req.params.id);
            } else {
                // does the user own the comment?
                if(foundComment.author.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash("error", "You are not authorised to do that.");
                    res.redirect("/campgrounds/" + req.params.id);
                }
            }
        })
    } else {
        req.flash("warning", "You need to be logged in to do that.")
        req.session.returnTo = req.originalUrl;
        res.redirect("/login");
    }
}


module.exports = middlewareObj;
