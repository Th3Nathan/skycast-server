import passport from 'passport';
import Local from 'passport-local';
import models from './models/index';
import bcrypt from 'bcrypt';
import { formatErrors } from './util';
const LocalStrategy = Local.Strategy;

passport.use(
    'signin',
    new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true,
    }, async (req, username, password, done) => {
        try {
            const user = await models.User.findOne({where: { username: username }, include:[{model: models.Query}]})
            if (!user) {
                return done(null, false, { message: 'No users exist with that username.' });
            }
            if (bcrypt.compareSync(password, user.password)){
                return done(null, user);
            }
            return done(null, false, { message: 'Incorrect password.' });
        } catch (err) {
            return done(err);
        }
    }
    )
);
            
passport.use(
    'signup',
    new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true,
    }, async (req, username, password, done) => {
        try {
            const existing = await models.User.findOne({where: { username: username }});
            if (existing) {
                return done(null, false, { message: 'User already exists.' });
            }
            try {
                const user = await models.User.create({username, password});
                return done(null, user);
            } catch(err){
                console.log(err);
                return done(null, false, { message: formatErrors(err, models)[0].message} );
            }
        } catch (err) {
            return done(err);
        }
    }
    )
);
export default passport;