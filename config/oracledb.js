var log = require('log4js').getLogger("oracledb");


module.exports = function(pool) {
  var oracledb = require("oracledb");
  var doConnect = function(callback) {

    log.debug("INFO: Module getConnection() called - attempting to retrieve a connection using the node-oracledb driver");

    pool.getConnection(function(err, connection) {

      
      if (err) { 
        console.log("ERROR: Cannot get a connection: ", err);
        return callback(err);
      }

     
      if (typeof pool !== "undefined") {
        log.debug("INFO: Connections open: " + pool.connectionsOpen);
        log.debug("INFO: Connections in use: " + pool.connectionsInUse);
      }

      
		doExecute(connection, "SELECT SYS_CONTEXT('userenv', 'sid') AS session_id FROM DUAL", {}, function(err, result) {

        
        if (err) {
          log.debug("ERROR: Unable to determine Oracle SESSION ID for this transaction: ", err);
          releaseConnection(connection);
          return callback(err);
        }
       
        log.debug("INFO: Connection retrieved from the database, SESSION ID: ", result.rows[0][0]);        
        return callback(err, connection);

      });

    });

  }



  
  var doExecute = function(connection, sql, params, callback) {
	//console.log(sql, "---", params)
    connection.execute(sql, params, { autoCommit: true}, function(err, result) {      
      if (err) {
        log.error("ERROR: Unable to execute the SQL: ", err);        
        return callback(err);
      }      
      return callback(err, result);
    });

  }  

  var doSelect = function(connection, selectSQL, params, callback) {
  //var doSelect = function(connection, sql, params,start,limit, callback) {
    	//var selectSQL = "SELECT * FROM ( SELECT A.*,ROWNUM ID FROM ("+sql+") A WHERE ROWNUM <= "+limit+" ) WHERE ID >= "+start;
	//log.debug('Final Select SQL:'+selectSQL);
	connection.execute(selectSQL, params,{outFormat: oracledb.OBJECT}, function(err, result) {      
      if (err) {
        log.error("ERROR: Unable to execute the SQL: ", err);        
        return callback(err);
      }

      
      return callback(err, result);

    });

  }
  
  var doCommit = function(connection, callback) {
    connection.commit(function(err) {
      if (err) {
        log.error("ERROR: Unable to COMMIT transaction: ", err);
      }
      return callback(err, connection);
    });
  }
  
  var doRelease = function(connection) {

    connection.release(function(err) {
      if (err) {
        //log.error("ERROR: Unable to RELEASE the connection: ", err);
      } else {
		  log.debug('Connection has been released..');
	  }
      return;
    });

  }
  
  
  var doBulkPredict = function(connection, userID, params, callback) {
	  
	var matchids = [];
	var teamnames = [];
	var userids = [];
	//console.log(params);
	for (var key in params) {
		m_id = parseInt(key.replace("match_",""));
		matchids.push(m_id);
		teamnames.push(params[key]);
		userids.push(userID);
	};
	
	connection.execute(
		` declare			
			type matchid_aat is table of number
			  index by pls_integer;
			type teamname_aat is table of varchar2(20)
			  index by pls_integer;
			type userid_aat is table of varchar2(20)
			  index by pls_integer;  
			
			l_matchids   matchid_aat := :matchids;
			l_teamnames userid_aat := :teamnames;
			l_userids   userid_aat := :userids;
			
		  begin   					  
			forall x in l_matchids.first .. l_matchids.last 
			  insert into bpl_options (user_id, match_id, team_name) values(l_userids(x), l_matchids(x), l_teamnames(x));
		  end;`,
		{		  
		  matchids: {
			type: oracledb.NUMBER,
			dir: oracledb.BIND_IN,
			val: matchids
		  },
		  teamnames: {
			type: oracledb.STRING,
			dir: oracledb.BIND_IN,
			val: teamnames
		  },
		  userids: {
			type: oracledb.STRING,
			dir: oracledb.BIND_IN,
			val: userids
		  },
		},
		{
		  autoCommit: true
		},
		function(err, result) {
		  if (err) {console.log(err); callback(err);}
		  
		  console.log('Success. Inserted ');
		  return callback(err, result);
		}
	);

  } 
 
  module.exports.doConnect  	= doConnect;
  module.exports.doExecute  	= doExecute;
  module.exports.doCommit   	= doCommit;
  module.exports.doRelease  	= doRelease;
  module.exports.doSelect   	= doSelect;
  module.exports.doBulkPredict	= doBulkPredict;

}

