import express from 'express';
import models from './models';
import seed from './seed';
import cors from 'cors';
import session from 'express-session';
import bodyParser from 'body-parser';
import passport from './passport';

const PORT = process.env.PORT || 8080;

const app = express(); 

app.use(express.static("public"));
app.use(session({ secret: "secret123" }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) =>{
res.header ('Access-Control-Allow-Origin', 'http://localhost:3000 ')
res.header ('Access-Control-Allow-Headers', 'Origin, X-Requested-With, X-AUTHENTICATION, X-IP, Content-Type, Accept')
res.header ('Access-Control-Allow-Credentials', true)
res.header ('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
next()
})
  
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

app.post('/signin', (req, res, next) => {
    passport.authenticate('signin', (err, user, info) => {
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

app.get('/', (req, res) => {
    res.send("hello from get");
});

app.post('/', (req, res) => {
    res.send("test post");
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

app.get('/queries',checkAuthentication, (req, res) => {

    console.log(req);
    return res.send(req.user.username);
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