import express from 'express';
import models from './models';
import seed from './seed';
import session from 'express-session';
import bodyParser from 'body-parser';
import passport from './passport';
import axios from 'axios';
import moment from 'moment';
const PORT = process.env.PORT || 8080;

const app = express(); 

app.use(express.static("public"));
app.use(session({ secret: "secret123" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

let clientUrl = process.env.NODE_ENV === 'production' ? 'http://nathanskycast.herokuapp.com' : 'http://localhost:3000';

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', clientUrl);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.post('/signin', (req, res, next) => {
    passport.authenticate('signin', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.json({error: info.message});
        }
        req.login(user, async (err) => {
            if (err) {
                console.error(err);
                return next(err);
            }
            await user.getQueries();
            return res.json({username: user.username, queries: user.queries, id: user.id});
        });
    })(req, res, next);
});

app.post('/signup', (req, res, next) => {
    passport.authenticate('signup', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.json({error: info.message});
        }
        req.login(user, (err) => {
            if (err) {
                console.error(err);
                return next(err);
            }
            return res.json({username: user.username, id: user.id});
        });
    })(req, res, next);
});

app.get('/logout', function(req, res){
    req.logout();
    res.send('logout successful');
  });

const checkAuthentication = (req,res,next) => {
    if(req.isAuthenticated()){
        return next();
    } else{
        return res.send('haxin?')
    }
}

const darksky = (lat, lng, time) => {
    let key = process.env.DARKSKY_KEY || require('./secrets');
    let url = `https://api.darksky.net/forecast/${key}/${lat},${lng}${time ? `,${time}` : ''}?lang=en&units=us&exclude=minutely`
    return axios.get(url);
}

app.post('/weather', async (req, res, next) => {
    const {lat, lng, name} = req.body;
    try {
        const forecast = await darksky(lat, lng);
        res.status(200).json(forecast.data)
    } catch (e) {
        console.log(e);
        next(err);
    }
})

app.post('/history', async (req, res, next) => {
    const {lat, lng, time} = req.body;
    let oneWeekTimes = [];
    let startTime = moment(parseInt(time, 10), 'X');
    oneWeekTimes.push(startTime.unix());
    for (let i = 0; i < 7; i++) {
        oneWeekTimes.push(startTime.add(1, 'days').unix());
    }
    let promises = oneWeekTimes.map(dayTime => darksky(lat, lng, dayTime))
    try {
        let forecasts = await Promise.all(promises);
        res.status(200).json(forecasts.map(forecast => forecast.data));
    } catch(err) {
        console.log(err);
        next(err);
    }
})

app.post('/addquery', checkAuthentication,async (req, res) => {
    console.log(req.body);
    const {lat, lng, name} = req.body;
    const userId = req.user.id;
    const newQuery = await models.Query.create({name, latitude: lat, longitude: lng, userId});
    return res.json({id: newQuery.id, name: newQuery.name});
})

passport.serializeUser((user, cb) => cb(null, user.id));
  
passport.deserializeUser(async (id, cb) => {
    try {
        let user = await models.User.findById(id) 
        cb(null, user);
    } catch(err) {
        cb(err);
    }
});

models.sequelize.sync({force: true}).then(() => {
    seed(models);
    app.listen(PORT);
    console.log("Listening");
});