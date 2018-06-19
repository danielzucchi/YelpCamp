const   express         = require("express"),
        app             = express(),
        bodyParser      = require("body-parser"),
        mongoose        = require("mongoose"),
        passport        = require("passport"),
        localStrategy   = require("passport-local"),
        flash           = require("connect-flash"),
        methodOverride  = require("method-override")

var     Campground  = require("./models/campground"),
        Comment     = require("./models/comment"),
        User        = require("./models/user")

var     commentRoutes    = require("./routes/comments"),
        campgroundRoutes = require("./routes/campgrounds"),
        indexRoutes      = require("./routes/index"),
        userRoutes       = require("./routes/user")

mongoose.connect(process.env.DATABASEURL);

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require("moment");

// PASSPORT CONFIG
app.use(require("express-session")({
    secret: "Get it",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.warning = req.flash("warning");
    next();
});

app.use(indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use(userRoutes);


//app.listen(3000, function(){
//   console.log("Server in session.");
//});

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("Server in session.");
});
