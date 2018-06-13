var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");


//==================
// COMMENTS ROUTES
//==================

router.get("/new", middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err || !campground){
            req.flash("error", "Campground does not exist.");
            return res.redirect("/campgrounds")
        } else {
            res.render("comments/new", {campground: campground});
        }
    });
});

router.post("/", function(req, res){
    //Lookup campground using ID
    Campground.findById(req.params.id, function(err, campground){
        if(err || !campground){
            req.flash("error", "Campground does not exist.");
            return res.redirect("/campgrounds");
        } else {
            //Create new comment
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    req.flash("error", "Something went wrong.");
                    return res.redirect("/campgrounds/" + campground._id);
                } else {
                    // add username and ID to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    // save comment
                    comment.save();
                    //Connect new comment to campground
                    campground.comments.push(comment);
                    campground.save();
                    //redirect to show page of current campground
                    req.flash("success", "Your comment has been posted!");
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});

// edit comment
router.get("/:comment_id/edit", middleware.checkCommentAuthorization, function(req, res){
    req.session.returnTo = req.originalUrl;
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err || !foundComment){
            req.flash("error", "Comment not found.");
            return res.redirect("/campgrounds/" + req.params.id);
        } else {
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
        }
    });
});

// comment update
router.put("/:comment_id", middleware.checkCommentAuthorization, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err || !updatedComment){
            req.flash("error", "Socmething went wrong.")
            return res.redirect("/campgrounds/" + req.params.id);
        } else {
            req.flash("success", "Comment edited successfully.")
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// comment delete
router.delete("/:comment_id", middleware.checkCommentAuthorization, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            req.flash("error", "Something went wrong.")
            res.redirect("/campgrounds/" + req.params.id);
        } else {
            req.flash("warning", "Comment deleted.")
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});





module.exports = router;
