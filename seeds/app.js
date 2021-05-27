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
    })
    const addUser = await User.register(masterUser, 'admin');
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: addUser._id,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: [
                {
                    url: 'https://res.cloudinary.com/davxrgxza/image/upload/v1621996800/YelpCamp/seed1_taailk.jpg',
                    filename: 'YelpCamp/seed1_taailk'
                },
                {
                    url: 'https://res.cloudinary.com/davxrgxza/image/upload/v1621996758/YelpCamp/seed2_fkub2u.jpg',
                    filename: 'YelpCamp/seed2_fkub2u'
                },
                {
                    url: 'https://res.cloudinary.com/davxrgxza/image/upload/v1621996876/YelpCamp/seed3_hhyxhf.jpg',
                    filename: 'YelpCamp/seed3_hhyxhf'
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur praesentium, tenetur facilis delectus iste quasi pariatur aperiam quibusdam fuga saepe reprehenderit. Eveniet fuga sapiente quae commodi. Deserunt saepe voluptatum nulla.',
            price: price,
            geometry: {
                type: 'Point',
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            }
        })
        await camp.save();
    }
}

seedDB();

console.log('seeded');