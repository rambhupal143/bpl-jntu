var LocalStrategy   = require('passport-local').Strategy;
var md5 = require('md5');
var LOGGER = require('log4js').getLogger("sms");
var db = require("./oracledb.js");
//console.log(db)
process.env.UV_THREADPOOL_SIZE = 100;

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        
	done(null, user[0]);
    });

    passport.deserializeUser(function(id, done) {       
		//var selectSQL = "SELECT ID,USER_NAME,PASSWORD FROM USER WHERE id =:id";
		var selectSQL = "SELECT USER_ID,NAME,PASSWORD FROM BPL_USERS WHERE user_id =:id";
		console.log(id)
		db.doConnect(function(err, connection){
			if (err) {                  
				return done(err,null);
			} else {
				db.doExecute(connection, selectSQL,[id],function(err, result) {
					if (err) {
						db.doRelease(connection);
						done(err,null);
					} else {
						//LOGGER.debug('GOT RESULT');
						db.doRelease(connection);
						
						done(null,result.rows[0]);
					}
				});
			}
		});
	});
    
    passport.use(
        'local-signup',
        new LocalStrategy({            
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, username, password, done) {
			LOGGER.debug('SIGNUP IS CALLED');
            var selectSQL = "SELECT * FROM USER WHERE user_id =:username";
            var param = [];
            param.push(username.toUpperCase());
            db.doConnect(function(err, connection){  
				if (err) {
					return done(err);
				}
				db.doExecute(connection, selectSQL,param,function(err, result) {
					if (err) {
						db.doRelease(connection);
						return done(err);
					} 
					else {
						if (result.rows.length) {
							db.doRelease(connection);
							LOGGER.error('USER FOUND');
							return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
						} else {
							LOGGER.debug('USER NOT FOUND AND GOING TO INSERT');
                            var newUserOracle = {
                                username: username.toUpperCase(),
                                password: md5(password)
                            };
                            var bindParam = [];
							bindParam.push(username.toUpperCase());
							bindParam.push(md5(password));
                            var insertQuery = "INSERT INTO USER (username,password) values(:username,:password)";
                            db.doExecute(connection,insertQuery,bindParam,function(err, insResult) {
                                if (err) {
                                    db.doRelease(connection);
                                    return done(err);
                                } else {
                                    LOGGER.debug('INSERTION RESULT:'+JSON.stringify(insResult));
                                    return done(null,false, req.flash('signupMessage', 'Signed up Successfully!'));
                                }
                            });
                        }
					}
				});
			
			});            
        })
    );

    passport.use(
        'local-login',
        new LocalStrategy({
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true 
        },
			function(req, username, password, done) {
				//console.log('local-login');
				var selectSQL = "SELECT upper(USER_ID),NAME,PASSWORD,upper(ADMIN) FROM BPL_USERS WHERE user_id =:username1 ";
				var param = [];
				//console.log(db);
				param.push(username.toUpperCase());
				//param.push(username);
				db.doConnect(function(err, connection){  
					if (err) {
						console.log('error connection');
						return done(err);
					}
					db.doExecute(connection, selectSQL,param,function(err, result) {
						if (err) {
							console.log('User not found');
							db.doRelease(connection);
							return done(err);
						} 
						else {
							if (!result.rows.length) {
								db.doRelease(connection);
								return done(null, false, req.flash('loginMessage', 'No user found.'));
							}
							//Bhupal: For now no encyption
							//if (md5(password) != result.rows[0][2]) {							
								
							if (password != result.rows[0][2]) {
								console.log('wrong password');
								return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
							}
							
							req.session.header_name = result.rows[0][1]
							req.session.user_id = username.toUpperCase();
							//console.log(result.rows[0])
							req.session.admin = result.rows[0][3]
							//console.log(req.session.admin)
							return done(null, result.rows[0]);
						}
					});
			
				});	
			}
		)
    );
};


