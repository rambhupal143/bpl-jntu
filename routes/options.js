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
		var userID = req.session.user_id;
		var selectSQL = "select id, to_char(match_date,'DD-MON-YY hh:mm') as match_date,team1, team2,result, venue, to_char(last_updated_time,'DD-MON-YY hh:mm') " + 
		" as last_updated_time, team_name,freezed from ( " + 
		"select bm.*,bo.team_name,bo.last_updated_time from bpl_matches bm join bpl_options bo on bm.id = bo.match_id and bo.user_id = '" + userID +
		"' union " + 
		"select bm.*,null,null from bpl_matches bm where bm.id not in (select bm.id from bpl_matches bm join bpl_options bo on bm.id=bo.match_id and bo.user_id = '"+ userID +"') " +
		") where result is null";
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
					res.setHeader('X-Username', req.session.header_name);
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
								var msg = req.session.header_name + "! " + selTeam + " is updated for Match No:" + matchNo + " Wish u all the best!";
								console.log(msg);
								res.setHeader('X-Username', req.session.header_name);
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
								var msg = req.session.header_name + "! " + selTeam + " is updated for Match No:" + matchNo + " Wish u all the best!";
								console.log(msg);
								res.setHeader('X-Username', req.session.header_name);
								req.flash('success', msg);
								res.redirect('/options/predictions');
							}
						});
					}
				}
			});
		
		});         
	})
	
	
	
	app.post('/options/update', isLoggedIn, function(req, res, done) {
		
		//console.log("hello")
		
		
		//var selTeam = req.body.optradio_11
		var reqBody = req.body;		
		var userID = req.session.user_id;
		
		var matchIDs = "(";
		for (var key in reqBody) {
			m_id = key.replace("match_","");			
			matchIDs += m_id + ",";
			console.log(matchIDs);
		};
		//console.log(matchIDs);
		matchIDs = matchIDs.slice(0, -1);
		//matchIDs.deleteCharAt(matchIDs.length() - 1);
		matchIDs = matchIDs + ")";
		var params = [userID];
		//console.log(matchIDs);
		
		db.doConnect(function(err, connection){  
			if (err) {
				return done(err);
			}		
			
			selectSQL = "DELETE FROM bpl_options where user_id = :userID and match_id in " + matchIDs;
			//selectSQL = "DELETE FROM bpl_options where match_id > 13";
			//console.log(selectSQL);
			db.doExecute(connection, selectSQL,params,function(err, result) {
				if (err) {
					db.doRelease(connection);
					console.log('Bad error');					
					res.redirect('/options');
					return done(err);
				} 
				else {					
					db.doBulkPredict(connection, userID, reqBody, function(err, result) {
						if (err) {
							console.log('Bad error');					
							res.redirect('/options');
							db.doRelease(connection);
							return done(err);
						} 
						else {
							//console.log(result.rows)				
							db.doRelease(connection);					
							//var msg = req.session.header_name + "! " + selTeam + " is updated for Match No:" + matchNo + " Wish u all the best!";
							var optionsCount = Object.keys(reqBody).length;
							var msg = req.session.header_name + "! " + JSON.stringify(reqBody) + " Options have been updated!";
							console.log(msg);
							res.setHeader('X-Username', req.session.header_name);
							req.flash('success', msg);
							//return done(null, false, req.flash('successMessage', msg));
							res.redirect('/options');
						}
					});
				}
			});	
		});         
	})
	
	
	
	// Show the current choice of predictions
	app.get('/options/predictions', isLoggedIn, function(req, res, done) {
		//var anyVal = '*';
		var userID = req.session.user_id
		var isAdmin = req.session.admin
		var selectSQL = "SELECT * FROM MYPRED_VW WHERE user_id != :userID union SELECT * FROM MYPRED12_VW WHERE user_id = :userID";
		var param = [];
		//console.log(req.session.user_id);
		param.push(userID);
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
					res.setHeader('X-Username', req.session.header_name);
					res.render('options/predictions', {
						title: 'Current Predictions', 
						data: result.rows,
						admin: isAdmin,
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
		var isAdmin = req.session.admin
		var selectSQL = "SELECT * FROM MYPOINTS_VW";
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
					res.setHeader('X-Username', req.session.header_name);
					res.render('options/points', {
						title: 'Points Summary', 
						data: result.rows,
						admin: isAdmin,
						expressFlash: req.flash('success'),
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