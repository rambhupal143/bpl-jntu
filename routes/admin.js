var LOGGER = require('log4js').getLogger("sms");
var db = require("../config/oracledb.js");

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
			//var userID = req.session.user_id		
			
			var updareQuery = 'update bpl_matches SET result = :result , freezed = :freezed where id = :matchNo';
			var params = [selTeam,freezeVal,matchNo]
			
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
					//return done(err);
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
		} else {
			res.redirect('/options');
		}
	});

	// SHOW LIST OF MATCHES
	app.get('/admin', isLoggedIn, function(req, res, done) {
		var selectSQL = "SELECT id, to_char(match_date,'DD-MON-YY hh:mm') as match_date,team1, team2,result, description, venue, freezed FROM bpl_matches " + 
				"where result is null union all SELECT id, to_char(match_date,'DD-MON-YY hh:mm') as match_date,team1, team2,result, description, venue, freezed FROM " +
				"bpl_matches where result is not null";
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
							messages:{},
							expressFlash: req.flash('success')
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
							admin: isAdmin,
							messages:{},
							expressFlash: req.flash('success')
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