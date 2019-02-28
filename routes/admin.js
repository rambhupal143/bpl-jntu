//var bcrypt = require('bcrypt-nodejs');
//var express = require('express')
//var app = express()

module.exports = function(app,passport) {	
	
	app.post('/admin/update/(:id)', isLoggedIn, function(req, res, next) {
		//res.send(req.body.optradio);
		//console.log("Hello")
		var isAdmin = req.session.admin
		if (isAdmin == 'Y') {	
			freezeVal = 'N'
			var selTeam = req.body.optradio
			var freeze = req.body.freeze
			if (freeze == 'on') {
				freezeVal = 'Y'
			}		
			var matchNo = req.params.id
			var userID = req.session.user_id		
			
			var match = {
				result: selTeam,
				freezed: freezeVal
			}
			var update_sql = 'update bpl_matches SET ? where id = '+matchNo;
			//updareQuery = "UPDATE bpl_matches SET " + result + "=" + "'" + selTeam + "'" + " WHERE id = " + userID
			console.log(req.body)
				
			req.getConnection(function(error, conn) {
				conn.query(update_sql,match, function(err, result) {
					//if(err) throw err
					if (err) {
						req.flash('error', err)
						
						// render to views/user/add.ejs
						res.redirect('/admin')
					} else {
						var msg = "Successfully updated Match No:" + matchNo + " with " + selTeam + " and Freezed to " + freezeVal;
						req.flash('success', msg)
						// render to views/user/add.ejs
						res.redirect('/admin')
					}
				})
			 })
		} else {
			res.redirect("/Options")
		}
	})

	// SHOW LIST OF MATCHES
	app.get('/admin', isLoggedIn, function(req, res, next) {
		req.getConnection(function(error, conn) {
			conn.query('SELECT * FROM bpl_matches ORDER BY id',function(err, rows, fields) {
				//if(err) throw err
				var isAdmin = req.session.admin
				if (isAdmin == 'Y') {					
					if (err) {
						req.flash('error', err)
						res.render('admin/list', {
							title: 'Matches List', 
							data: ''
						})
					} else {
						// render to views/user/list.ejs template file
						res.render('admin/list', {
							title: 'Matches List', 
							data: rows,
							admin: 'Y'
						})
					}
				} else {
					//req.flash('error', "You are not allowed to access this page")
					res.redirect("/Options")
				}
			})
		})
	})
	
	app.get('/admin/users', isLoggedIn, function(req, res, next) {
		req.getConnection(function(error, conn) {
			conn.query('SELECT * FROM bpl_users ORDER BY user_id',function(err, rows, fields) {
				//if(err) throw err
				var isAdmin = req.session.admin
				if (isAdmin == 'Y') {					
					if (err) {
						req.flash('error', err)
						res.render('admin/user', {
							title: 'BPL Players', 
							data: ''
						})
					} else {
						// render to views/user/list.ejs template file
						res.render('admin/user', {
							title: 'BPL Players', 
							data: rows,
							admin: 'Y'
						})
					}
				} else {
					//req.flash('error', "You are not allowed to access this page")
					res.redirect("/Options")
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