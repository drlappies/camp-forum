if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const engine = require('ejs-mate');
const flash = require('connect-flash');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const ExpressError = require('./utils/ExpressError');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const cron = require('node-cron');
const moment = require('moment');
const dbUrl = process.env.NODE_ENV !== 'production' ? 'mongodb://localhost:27017/yelp-camp' : process.env.DB_URL

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log(process.env.NODE_ENV)
    console.log(`connected to ${dbUrl}`);
});

app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(mongoSanitize());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
    "https://code.jquery.com/jquery-3.6.0.js",
    "https://code.jquery.com/ui/1.12.1/jquery-ui.js"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://cdn.jsdelivr.net",
    "https://code.jquery.com/jquery-3.6.0.js",
    "https://code.jquery.com/ui/1.12.1/jquery-ui.js"
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
    "https://code.jquery.com/jquery-3.6.0.js",
    "https://code.jquery.com/ui/1.12.1/jquery-ui.js"
];
const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "self",
                "blob:",
                "data:",
                "https://res.cloudinary.com/davxrgxza/",
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

let secret = process.env.NODE_ENV !== 'production' ? 'an one cute ducky' : process.env.SESSION_SECRET

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: secret
    }
})

store.on('error', function (error) {
    console.log('session store error', error)
})

const sessionConfig = {
    store: store,
    name: 'session',
    secret: secret,
    resave: true,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'production' ? false : true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.set('trust proxy', 1);
app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    if (!['/login', '/register', '/'].includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl;
    }
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/moderation', adminRoutes);

app.get('/', (req, res) => {
    res.render('home');
});

const currentTime = moment().clone().toDate();
cron.schedule('*/1 * * * * *', async () => {
    await User.updateMany({ bannedUntil: currentTime }, { isBanned: false })
})

app.all('*', (res, req, next) => {
    next(new ExpressError('Page not found', 404));
});

app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) {
        err.message = "Something went wrong :'("
    }
    res.status(status).render('error', { err });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`server running on: http://localhost:${port}`);
});