const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');

main().catch((err) => {
    console.log('CONNECTION ERROR:');
    console.log(err);
}); //catch error

async function main() {
    await mongoose.connect('mongodb://localhost:27017/YelpCamp', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('MONGO CONNECTION OPEN');
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/makecampground', async (req, res) => {
    const camp = new Campground({ title: 'My Backyard', description: 'cheap camping' });
    await camp.save();
    res.send(camp);
});

app.listen(3000, () => {
    console.log('Serving on port 3000');
});
