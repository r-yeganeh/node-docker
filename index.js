const express = require('express');
// const redis = require('redis');
const mongoose = require('mongoose');
const {
    MONGO_USER,
    MONGO_PASSWORD,
    MONGO_IP,
    MONGO_PORT,
    REDIS_URL,
    REDIS_PORT,
    SESSION_SECRET
} = require("./config/config");
const postRouter = require('./routes/postRoutes');
const userRouter = require('./routes/userRoutes');
const PORT = process.env.PORT || 3000;
const app = express();
const mongoUrl = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;
const cors = require('cors');

console.log('configs:');
console.log('MONGO_USER:', MONGO_USER);
console.log('MONGO_PASSWORD:', MONGO_PASSWORD);
console.log('MONGO_IP:', MONGO_IP);
console.log('MONGO_PORT:', MONGO_PORT);
console.log('REDIS_URL:', REDIS_URL);
console.log('REDIS_PORT:', REDIS_PORT);
console.log('SESSION_SECRET:', SESSION_SECRET);
console.log('mongoUrl:', mongoUrl);

//////////////////

const session = require("express-session");
const {createClient} = require("redis");
const RedisStore = require("connect-redis").default;
// console.log('REDIS_URL:vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv', REDIS_URL)
const redisUrl = `redis://${REDIS_URL}:${REDIS_PORT}`;
// Initialize client.
let redisClient = createClient({url: redisUrl})
redisClient.connect().catch(console.error);
// Initialize store.
let redisStore = new RedisStore({
    client: redisClient,
    prefix: "myapp:",
})

// Initialize session storage.
app.use(
    session({
        store: redisStore,
        resave: false, // required: force lightweight session keep alive (touch)
        saveUninitialized: false, // recommended: only save session when data exists
        secret: SESSION_SECRET,
        cookie: {
            secure: false,
            resave: false,
            saveUninitialized: false,
            httpOnly: true,
            maxAge: 60000
        }
    })
)

////////////////////////////////


const connectWithRetry = () => {
    console.log('connecting ...');
    console.log('mongoUrl: ', mongoUrl);
    mongoose.connect(mongoUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then(() => console.log('connected to database!'))
        .catch(err => {
            console.log(err);

            setTimeout(connectWithRetry, 5000);
        });
}

connectWithRetry();

app.enable('trust proxy');  // not important in this app but when you do rate limiting it is useful
app.use(cors({}));
app.get('/api/v1', (req, res) => {
    console.log('yeah! it ran!');
    res.send("<h2>Hi Reza!!</h2>");
    ////
});
app.use(express.json());
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/users', userRouter);


app.listen(PORT, () => console.log(`listening on port ${PORT} ...`));