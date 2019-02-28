# bpl-jntu
bpl with oracle db
#--------------------------------------------------------------
Developers  : 	Rambhupal Kottam
				Madhan P
Date		:	28 Feb 2019			
#--------------------------------------------------------------


Installation steps:

1. Install npm (https://nodejs.org/en/)
2. Install oracle client (I used 12c) and configure tnsnames for the oracle db
	open cmd --> type 'netca' --> Local Net Service configuration
2. create a directory (Eg: C:\bpl)
3. Open cmd and run the below,
	npm install
	npm install ejs
	npm install express
	npm install express-session
	npm install path
	npm install serve-favicon
	npm install morgan
	npm install cookie-parser
	npm install body-parser
	npm install passport
	npm install connect-flash
	npm install oracledb
	npm install log4js
	npm install debug
	npm install messages
4. Copy/Replace the git directories under above acreated folder 
5. 	Modify the below config files as needed,
	\bpl-jntu\config
		dbconfig.js --> Oracle DB config
		log4js.js   --> Logs
		passport.js --> Login oracle table/fields
		
--------------------------------------------------------------------
How to run?

1. open cmd and change to app.js directory
2. type 'node app.js' (By default 3000 port is used)
3. Open chrome and use localhost:3000 to access home page
		
	
	