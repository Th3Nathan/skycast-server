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
app.use(cors('*'));

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
            return res.json({username: user.username, queries: user.queries});
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
            return res.json({username: user.username});
        });
    })(req, res, next);
});

app.get('/', function(req, res){
    res.send("hello");
});

app.post('/', function(req, res){
    res.send("nice post");
});

passport.serializeUser(function(user, cb) {
    cb(null, user.id);
  });
  
  passport.deserializeUser(function(id, cb) {
    models.User.find({where: {id: id}, include: [{model: models.Query}]}, function (err, user) {
      if (err) { return cb(err); }
      return cb(null, user); 
    });
  });
  

models.sequelize.sync({force: true}).then(() => {
    seed(models);
    app.listen(PORT);
    console.log("Listening");
});