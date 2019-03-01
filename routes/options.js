//var bcrypt = require('bcrypt-nodejs');
//var express = require('express')
//var app = express()
var LOGGER = require('log4js').getLogger("sms");
var db = require("../config/oracledb.js");

module.exports = function(app,passport) {
	
	app.post('/options/update/(:id)', isLoggedIn, function(req, res, next) {
		//res.send(req.body.optradio);
		//console.log("Hello")
		var selTeam = req.body.optradio
		var matchNo = req.params.id
		var userID = req.session.user_id
		//console.log(req.session.user_id)
		
		var columnName = 'm' + matchNo 	

		updareQuery = "UPDATE bpl_options SET " + columnName + "=" + "'" + selTeam + "'" + " WHERE user_id = " + userID
		//console.log(updareQuery)
			
		req.getConnection(function(error, conn) {
			conn.query(updareQuery, function(err, result) {
				//if(err) throw err
				if (err) {
					req.flash('error', err)
					
					// render to views/user/add.ejs
					res.redirect('/options')
				} else {
					var msg = "Successfully updated Match No:" + matchNo + " with " + selTeam + "! Wish you all the best! "
					req.flash('success', msg)
					//req.flash('success', 'Data updated successfully!')
					
					// render to views/user/add.ejs
					res.redirect('/options')
				}
			})
		 })
	})

	// SHOW LIST OF MATCHES
	app.get('/options', isLoggedIn, function(req, res, done) {
		//var anyVal = '*';
		var selectSQL = "SELECT id, match_date,team1, team2,result, description, venue, freezed FROM bpl_matches order by id";
		var param = [];
		console.log(req.session.user_id);
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
					console.log(result.rows)
					//if (result.rows.length) {
						db.doRelease(connection);
						console.log('GOT Something')
						var isAdmin = req.session.admin
						console.log(isAdmin);
						//if (isAdmin == 'N') {
						//	res.redirect('/logout')
						//} else {
							//req.flash('error', err)
						res.render('option/list', {
							title: 'Matches List', 
							data: result.rows,
							admin: isAdmin,
							messages:{}
						})							
						//}	
					//}
					
					//return done(null, result.rows);
				}
			});
	
		});	
	})	
	
	
	
	app.get('/options_old', isLoggedIn, function(req, res, next) {
		req.getConnection(function(error, conn) {
			conn.query('SELECT * FROM bpl_matches ORDER BY id',function(err, rows, fields) {
				//if(err) throw err
				var isAdmin = req.session.admin
				if (isAdmin == 'Y') {
					res.redirect('/logout')
				} else {	
					if (err) {
						req.flash('error', err)
						res.render('option/list', {
							title: 'Matches List', 
							data: ''
						})
					} else {
						// render to views/user/list.ejs template file
						res.render('option/list', {
							title: 'Matches List', 
							data: rows,
							admin: 'Y'
						})
					}
				}	
			})
		})
	})
	
	app.get('/options/predictions', isLoggedIn, function(req, res, next) {
		req.getConnection(function(error, conn) {
			conn.query('SELECT * FROM bpl_predictions_vw',function(err, rows, fields) {
				//if(err) throw err
				if (err) {
					req.flash('error', err)
					res.render('option/prediction', {
						title: 'Current Predictions', 
						data: ''
					})
				} else {
					// render to views/user/list.ejs template file
					res.render('option/prediction', {
						title: 'Current Predictions', 
						data: rows
					})
				}
			})
		})
	})
	
	//Show champion predictions
	app.get('/options/predictchampion', isLoggedIn, function(req, res, next) {
		req.getConnection(function(error, conn) {
			conn.query('SELECT * FROM bpl_champion',function(err, rows, fields) {
				//if(err) throw err
				if (err) {
					req.flash('error', err)
					res.render('option/predictchampion', {
						title: 'Champion Predictions', 
						data: ''
					})
				} else {
					// render to views/user/list.ejs template file
					res.render('option/predictchampion', {
						title: 'Champion Predictions', 
						data: rows
					})
				}
			})
		})
	})
	
	app.post('/options/updatechamp/(:id)', isLoggedIn, function(req, res, next) {
		//res.send(req.body.optradio);
		//console.log("Hello")
		var selTeam = req.body.optradio
		//var matchNo = req.params.id
		var userID = req.session.user_id
		//console.log(req.session.user_id)
		
		var columnName = 'm' + matchNo 	

		updareQuery = "UPDATE bpl_champion SET " + champ + "=" + "'" + selTeam + "'" + " WHERE user_id = " + userID
		//console.log(updareQuery)
			
		req.getConnection(function(error, conn) {
			conn.query(updareQuery, function(err, result) {
				//if(err) throw err
				if (err) {
					req.flash('error', err)
					
					// render to views/user/add.ejs
					res.redirect('/options')
				} else {
					var msg = "Successfully updated champion prediction with " + selTeam
					req.flash('success', msg)
					//req.flash('success', 'Data updated successfully!')
					
					// render to views/user/add.ejs
					res.redirect('/options')
				}
			})
		 })
	})
	
	app.get('/options/points', isLoggedIn, function(req, res, next) {
		req.getConnection(function(error, conn) {
			conn.query('SELECT * FROM bpl_points_summary_vw',function(err, rows, fields) {
				//if(err) throw err
				if (err) {
					req.flash('error', err)
					res.render('option/points', {
						title: 'Points Summary', 
						data: ''
					})
				} else {
					// render to views/user/list.ejs template file
					res.render('option/points', {
						title: 'Points Summary', 
						data: rows
					})
				}
			})
		})
	})

};	
	//module.exports = app
function isLoggedIn(req,res,next){
		if(req.isAuthenticated())
			return next();
		res.redirect('/login');
}