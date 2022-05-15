const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const { cloudinary } = require('../cloudinary');
const mapBoxToken = process.env.MAPBOX_TOKEN;

//instantiate mapbox
const geoCoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};

//Route to create/add new campgrounds
//no need to make async since we are only rendering a form
//make sure this route comes first before campgrounds/:id so it will be treated as a separate route and not an id
module.exports.createCampground = async (req, res, next) => {
    const geoData = await geoCoder
        .forwardGeocode({
            //use location input field as query source
            query: req.body.campground.location,
            limit: 1,
        })
        .send();
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    //add in the location to the newly created campground
    campground.geometry = geoData.body.features[0].geometry;
    //map thru file data provided by multer
    campground.images = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
    }));
    campground.author = req.user._id; //assign newly created campground to current loggedIn user
    await campground.save();
    console.log(campground);
    //flash when a new campground is created, create this on routes where we want a flash message to appear
    //We use a middleware at our entry point(app.js) so the flash "key" will show up on any route that we have flash message added
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author',
            },
        })
        .populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/edit', { campground });
};

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
        ...req.body.campground,
    });
    const imgs = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
    }));
    //push the edited images into the existing array of images, not replace with "="
    campground.images.push(...imgs);
    await campground.save();
    //delete images function
    if (req.body.deleteImages) {
        //delete images from cloudinary first then proceed with updating other areas below
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        //need to trim() the images data first before deleting to avoid issues
        //this would delete the images from mongoDB and UI
        const trimedImagesForDelete = req.body.deleteImages.map((i) => i.trim());
        await campground.updateOne(
            {
                $pull: {
                    images: {
                        filename: { $in: trimedImagesForDelete },
                    },
                },
            },
            { new: true }
        );
        console.log(campground);
    }

    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground successfully deleted');
    res.redirect('/campgrounds');
};
