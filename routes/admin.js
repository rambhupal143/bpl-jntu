//var bcrypt = require('bcrypt-nodejs');
//var express = require('express')
//var app = express()

module.exports = function(app,passport) {	
	app.post('/admin/update/(:id)', isLoggedIn, function(req, res, done) {
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
			var updareQuery = 'update bpl_matches SET ? where id = ' + matchNo;
			var params = [matchNo]
			
			db.doConnect(function(err, connection){ 
			if (err) {
				console.log('error connection');
				return done(err);
			}
			db.doExecute(connection, updareQuery, params, function(err, result) {
				if (err) {
					console.log('Bad error');
					db.doRelease(connection);
					res.redirect('/admin')					
					return done(err);
				} 
				else {
					//console.log(result.rows)					
					db.doRelease(connection);					
					var msg = "Bingo! Successfully updated Match No:" + matchNo + " with " + selTeam + " and Freezed to " + freezeVal;
					console.log(msg)
					req.flash('success', msg);
					res.redirect('/admin');
				}
			});
	
		});
	})

	// SHOW LIST OF MATCHES
	app.get('/admin', isLoggedIn, function(req, res, done) {
		var selectSQL = "SELECT * FROM bpl_matches ORDER BY id";
		var param = [];
		var isAdmin = req.session.admin;
		
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
					db.doRelease(connection);
					//console.log('GOT Something')
					
					if (isAdmin == 'Y') {
					//console.log(isAdmin);
						res.render('admin/list', {
							title: 'Matches List', 
							data: result.rows,
							admin: 'Y',
							messages:{}
						})
					} else {
						res.redirect("/Options");
					}
				}
			});
	
		});
	});	
	
	app.get('/admin/users', isLoggedIn, function(req, res, done) {
		var selectSQL = "SELECT * FROM bpl_users ORDER BY user_id";
		var param = [];
		var isAdmin = req.session.admin;
		
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
					db.doRelease(connection);
					//console.log('GOT Something')
					
					if (isAdmin == 'Y') {
					//console.log(isAdmin);						
						res.render('admin/user', {
							title: 'BPL Players',
							data: result.rows,
							admin: 'Y',
							messages:{}
						})
					} else {
						res.redirect("/Options");
					}
				}
			});
	
		});
	});		
			

};	
	//module.exports = app
function isLoggedIn(req,res,done){
		if(req.isAuthenticated())
			return done();
		res.redirect('/login');
}