const mongoose = require('mongoose');
const Campground = require('../models/campground');
const Review = require('../models/review');
const User = require('../models/user');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
})

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("connected to db");
});

const sample = array => {
    const arr = array[Math.floor(Math.random() * array.length)];
    return arr;
}

const seedDB = async () => {
    await Campground.deleteMany({});
    await Review.deleteMany({});
    await User.deleteMany({});
    const masterUser = new User({
        email: 'admin@admin.com',
        username: 'admin',
        about: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc non dignissim est. Praesent eu tempor tellus. In leo ante, imperdiet ut lacus non, fringilla vulputate purus.'
    })
    const addUser = await User.register(masterUser, 'admin');
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            author: addUser._id,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: [
                {
                    url: 'https://images.unsplash.com/photo-1476611338391-6f395a0ebc7b?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1502&q=80',
                    filename: 'YelpCamp/seed1_taailk'
                },
                {
                    url: 'https://images.unsplash.com/photo-1476611338391-6f395a0ebc7b?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1502&q=80',
                    filename: 'YelpCamp/seed2_fkub2u'
                },
                {
                    url: 'https://images.unsplash.com/photo-1476611338391-6f395a0ebc7b?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1502&q=80',
                    filename: 'YelpCamp/seed3_hhyxhf'
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur praesentium, tenetur facilis delectus iste quasi pariatur aperiam quibusdam fuga saepe reprehenderit. Eveniet fuga sapiente quae commodi. Deserunt saepe voluptatum nulla.',
            geometry: {
                type: 'Point',
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            difficulty: 'Beginner',
            facility: ['Glamping', 'Lavatory', 'Dry Toiliet', 'Toilet', 'Drying Rack', 'Table', 'Chair', 'Water Tap', 'Mobile Toilet', 'Shower', 'Playground', 'Stream']
        })
        await masterUser.save();
        await camp.save();
    }
}

seedDB();

console.log('seeded');