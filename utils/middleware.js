module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        //store the URL they are requesting so they would directly go to the same page they wanted to make changes to
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first');
        res.redirect('/login');
    }
    next();
};
