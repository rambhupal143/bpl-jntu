var LOGGER = require('log4js').getLogger("sms");
var db = require("../config/oracledb.js");

/* Developer notes
	1. app.get/post --> is under routes directory
	2. res.render   --> is under views directory
	3. res.redirect --> redirect to route
*/	

module.exports = function(app,passport) {
	
	
	// SHOW LIST OF MATCHES
	app.get('/options', isLoggedIn, function(req, res, done) {
		var selectSQL = "SELECT id, match_date,team1, team2,result, description, venue, freezed FROM bpl_matches order by id";
		var param = [];
		//console.log(req.session.user_id);
		//param.push(anyVal);
		db.doConnect(function(err, connection){ 
			if (err) {
				console.log('error connection');
				return done(err);
			}
			db.doSelect(connection, selectSQL,param,function(err, result) {
				if (err) {
					console.log('Bad error');
					db.doRelease(connection);
					return done(err);
				} 
				else {
					//console.log(result.rows)
					db.doRelease(connection);
					//console.log('GOT Something')
					var isAdmin = req.session.admin
					//console.log(isAdmin);
					res.render('options/list', {
						title: 'Matches List', 
						data: result.rows,
						admin: isAdmin,
						messages:{},
						expressFlash: req.flash('success'),
					})	
				}
			});
	
		});	
	})	
	
	// Update the prediction for winner
	app.post('/options/update_old/(:id)', isLoggedIn, function(req, res, done) {
		
		//console.log("hello")
		var selTeam = req.body.optradio
		var matchNo = req.params.id
		var userID = req.session.user_id
		
		//var columnName = 'M' + matchNo		
		var updareQuery = "UPDATE bpl_options SET TEAM_NAME = :selTeam WHERE user_id = :userID AND match_id = :matchNo";
		var params = [selTeam,userID,matchNo]
		//console.log(updareQuery, " ", selTeam, " ",columnName, " ", userID)
		//params.push(anyVal);
		db.doConnect(function(err, connection){ 
			if (err) {
				console.log('error connection');
				return done(err);
			}
			db.doExecute(connection, updareQuery, params, function(err, result) {
				if (err) {
					console.log('Bad error');					
					res.redirect('/options');
					db.doRelease(connection);
					return done(err);
				} 
				else {
					//console.log(result.rows)					
					db.doRelease(connection);					
					var msg = "Bingo!! You made a great choice for Match No:" + matchNo + " with " + selTeam + "! Wish you all the best! "
					console.log(msg)
					req.flash('success', msg);
					res.redirect('/options');
				}
			});
	
		});	
	})

	
	app.post('/options/update/(:id)', isLoggedIn, function(req, res, done) {
		
		//console.log("hello")
		var selTeam = req.body.optradio
		var matchNo = req.params.id
		var userID = req.session.user_id
		
		//var columnName = 'M' + matchNo		
		//var updareQuery = "UPDATE bpl_options SET TEAM_NAME = :selTeam WHERE user_id = :userID AND match_id = :matchNo";
		//var params = [selTeam,userID,matchNo]
		var selectSQL = "SELECT * FROM bpl_options WHERE user_id =:username AND match_id = :matchNo";
		var param = [userID,matchNo];
		//param.push(username.toUpperCase());
		db.doConnect(function(err, connection){  
			if (err) {
				db.doRelease(connection);
				return done(err);
			}
			db.doExecute(connection, selectSQL,param,function(err, result) {
				if (err) {
					db.doRelease(connection);
					return done(err);
				} 
				else {
					if (result.rows.length) {
						//db.doRelease(connection);
						console.log('RECORD EXISTS');
						var updareQuery = "UPDATE bpl_options SET TEAM_NAME = :selTeam WHERE user_id = :userID AND match_id = :matchNo";
						var paramNew = [selTeam,userID,matchNo];
						db.doExecute(connection, updareQuery, paramNew, function(err, result) {
							if (err) {
								console.log('Bad error');					
								res.redirect('/options');
								db.doRelease(connection);
								return done(err);
							} 
							else {
								//console.log(result.rows)				
								db.doRelease(connection);					
								var msg = "Bingo!! You made a great choice for Match No:" + matchNo + " with " + selTeam + "! Wish you all the best! "
								console.log(msg)
								req.flash('success', msg);
								//return done(null, false, req.flash('successMessage', msg));
								res.redirect('/options/predictions');
							}
						});
						
						//return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
					} else {
						console.log('RECORD NOT FOUND AND GOING TO INSERT');
						
						var bindParam = [userID,matchNo,selTeam];						
						var insertQuery = "INSERT INTO BPL_OPTIONS (user_id,match_id,team_name) values(:userID,:matchNo,:selTeam)";
						db.doExecute(connection,insertQuery,bindParam,function(err, insResult) {
							if (err) {
								db.doRelease(connection);
								return done(err);
							} else {
								LOGGER.debug('INSERTION RESULT:'+JSON.stringify(insResult));
								db.doRelease(connection);
								//return done(null,false, req.flash('signupMessage', 'Signed up Successfully!'));
								var msg = "Bingo!! You made a great choice for Match No:" + matchNo + " with " + selTeam + "! Wish you all the best! "
								console.log(msg)
								req.flash('success', msg);
								res.redirect('/options/predictions');
							}
						});
					}
				}
			});
		
		});         
	})
	
	
	app.get('/options/predictions', isLoggedIn, function(req, res, done) {
		//var anyVal = '*';
		
		var userID = req.session.user_id;
		var selectSQL = "SELECT * FROM BPL_FINAL_PRED_SUMMARY_VW where user_id != :userID union SELECT * FROM BPL_FINAL_PRED_SUMMARY_VW12 where user_id = :userID";
		var param = [];
		//console.log(req.session.user_id);
		param.push(userID);
		db.doConnect(function(err, connection){ 
			if (err) {
				console.log('error connection');
				db.doRelease(connection);
				return done(err);
			}
			db.doSelect(connection, selectSQL,param,function(err, result) {
				if (err) {
					console.log('Bad error');
					db.doRelease(connection);
					return done(err);
				} 
				else {
					//console.log(result.rows)
					db.doRelease(connection);					
					res.render('options/predictions', {
						title: 'Current Predictions', 
						data: result.rows,
						admin: "N",
						expressFlash: req.flash('success'),
						messages:{}						
					})
				}
			});
	
		});	
	})			
	
	//Show champion predictions
	app.get('/options/predictchampion', isLoggedIn, function(req, res, done) {
		//var anyVal = '*';
		var selectSQL = "SELECT * FROM bpl_champion";
		var param = [];		
		//param.push(anyVal);
		db.doConnect(function(err, connection){ 
			if (err) {
				console.log('error connection');
				return done(err);
			}
			db.doSelect(connection, selectSQL,param,function(err, result) {
				if (err) {
					console.log('Bad error');
					db.doRelease(connection);
					return done(err);
				} 
				else {
					//console.log(result.rows)
					db.doRelease(connection);					
					res.render('options/predictchampion', {
						title: 'Champion Predictions', 
						data: result.rows,
						admin: isAdmin,
						messages:{}						
					})
				}
			});
	
		});	
	})		
	
	// Update the finals winner
	app.post('/options/updatechamp/(:id)', isLoggedIn, function(req, res, done) {
		
		var selTeam = req.body.optradio
		var userID = req.session.user_id		
		var columnName = 'M' + matchNo
		
		var updareQuery = "UPDATE bpl_champion SET " + columnName + " = :selTeam WHERE user_id = :userID";
		var params = [selTeam,userID]
		//params.push(anyVal);
		db.doConnect(function(err, connection){
			if (err) {
				console.log('error connection');
				return done(err);
			}
			db.doExecute(connection, updareQuery, params, function(err, result) {
				if (err) {
					console.log('Bad error');					
					res.redirect('/options');
					db.doRelease(connection);
					return done(err);
				} 
				else {
					db.doRelease(connection);
					var msg = "That's a great choice!! Successfully updated champion prediction with " + selTeam				
					req.flash('success', msg);
					res.redirect('/options');
				}
			});
	
		});	
	})	
	
	//Show champion predictions
	app.get('/options/points', isLoggedIn, function(req, res, done) {
		//var anyVal = '*';
		var selectSQL = "SELECT * FROM BPL_FINAL_POINTS_SUMMARY_VW";
		var param = [];		
		//param.push(anyVal);
		db.doConnect(function(err, connection){ 
			if (err) {
				console.log('error connection');
				db.doRelease(connection);
				return done(err);
			}
			db.doSelect(connection, selectSQL,param,function(err, result) {
				if (err) {
					console.log('Bad error');
					db.doRelease(connection);
					return done(err);
				} 
				else {
					//console.log(result.rows)
					db.doRelease(connection);					
					res.render('options/points', {
						title: 'Points Summary', 
						data: result.rows,
						admin: "N",
						messages:{}						
					})
				}
			});
	
		});	
	})
	
};	
	//module.exports = app
function isLoggedIn(req,res,next){
		if(req.isAuthenticated())
			return next();
		res.redirect('/login');
}