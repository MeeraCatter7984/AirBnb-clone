const express= require("express");
const router= express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema}= require("../schema.js"); 
const Listing= require("../models/listing.js");
const {isLoggedIn}= require("../middleware.js")


const validateListing =(req, res, next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg= error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};

//Index route
router.get("/", wrapAsync(async (req, res)=>{
   const allListings= await Listing.find({});
   res.render("listings/index.ejs", { allListings });
}));

//New route
router.get("/new", isLoggedIn,(req, res)=>{   
    res.render("listings/new.ejs")
});

//show route
router.get("/:id", wrapAsync(async(req, res)=>{
    let{ id }= req.params;
    const listing = await Listing.findById(id)
    .populate("reviews")
    .populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested for does not exist.");
        res.redirect("/listings");        
    }
    console.log(listing);
    res.render("listings/show.ejs", {listing});
})
);

//Create route
router.post(
    "/",
    isLoggedIn,
    validateListing,
     wrapAsync(async(req, res, next)=>{
    //let {title, description, image, price, country, location}=req.body;
    //we will go for method 2, i.e.,by indexes of object listing. see in new.js
    //let listing=req.body.listing;

    // if(!req.body.listing){
    //     throw new ExpressError(400, "Send valid data for listing");
    // }
    const newListing= new Listing(req.body.listing);
    newListing.owner = req.user._id;
    // if(!newListing.title){
    //     throw new ExpressError(400, "title is missing");
    // }
    // if(!newListing.description){
    //     throw new ExpressError(400, "description is missing");
    // } instead we install joi to validate our schema.
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
})
);

//Edit route
router.get(
    "/:id/edit",
    isLoggedIn , 
    wrapAsync( async( req, res) => {
    let{ id }= req.params;
    const listing = await Listing.findById(id);
     if(!listing){
        req.flash("error", "Listing you requested for does not exist.");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
})
);

//Update route
router.put(
    "/:id",
    isLoggedIn,
    validateListing,
    wrapAsync(async(req, res)=>{
    let{ id }= req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}));

//Delete route
router.delete("/:id",
    isLoggedIn,
    wrapAsync(async ( req, res) =>{
    let { id }= req.params;
    let deletedListing= await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}));

module.exports= router;