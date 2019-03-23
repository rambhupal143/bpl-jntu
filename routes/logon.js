var LOGGER = require('log4js').getLogger("routes");

module.exports = function(app, passport) {

	app.get('/', function(req, res) {
		//res.render('index.pug'); 
		res.redirect('/login')
		/*var admin = req.session.admin
		if (admin == 'Y') {
			res.redirect('/admin')
		} else {
			res.redirect('/options')
		}*/
	});
	
	app.get('/signup', function(req, res) {
        res.render('signup.pug', { message: req.flash('signupMessage') });
    });

	app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/signup',
            failureRedirect : '/signup',
            failureFlash : true
    }),
        function(req, res) {
        if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
            res.redirect('/');
        });

	app.get('/login', function(req, res) {
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/options',
            failureRedirect : '/login',
            failureFlash : true 
		}),
        function(req, res) {
	    if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 30;
            } else {
              req.session.cookie.expires = false;
            }
            //res.redirect('/login');
        });

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
};