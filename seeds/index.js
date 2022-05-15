const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

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

//Function to Generate a random camp name from seedHelpers file
const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            //user ID
            author: '626ea176472ce370d0128273',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description:
                'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eum libero velit sunt perspiciatis beatae at aliquam, quo fugiat architecto veniam nemo dolorem magnam sit consectetur, distinctio tenetur voluptate maxime mollitia.',
            price,
            geometry: {
                type: 'Point',
                coordinates: [cities[random1000].longitude, cities[random1000].latitude],
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dcdcxuckl/image/upload/v1652019438/YelpCamp/risdvi1w6iegjeall9j6.jpg',
                    filename: 'YelpCamp/risdvi1w6iegjeall9j6',
                },
                {
                    url: 'https://res.cloudinary.com/dcdcxuckl/image/upload/v1652020245/YelpCamp/d3ynf37ogva9fmwmf51i.jpg',
                    filename: 'YelpCamp/d3ynf37ogva9fmwmf51i',
                },
                {
                    url: 'https://res.cloudinary.com/dcdcxuckl/image/upload/v1652019440/YelpCamp/zs5qpa2ywgvelizmkln0.jpg',
                    filename: 'YelpCamp/zs5qpa2ywgvelizmkln0',
                },
                {
                    url: 'https://res.cloudinary.com/dcdcxuckl/image/upload/v1652019441/YelpCamp/ybawdudphqrtuhnkos1t.jpg',
                    filename: 'YelpCamp/ybawdudphqrtuhnkos1t',
                },
            ],
        });
        await camp.save();
    }
};

seedDB().then(() => mongoose.connection.close());
