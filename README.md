# bpl
BPL
--------------------------------------------------------------
Developers  : 	Rambhupal Kottam
		Madhan Potluri
Date	    :	28 Feb 2019			
--------------------------------------------------------------

Project: 
	Node.js, Express JS (EJs) with Oracle DB

Installation steps:

1. Install npm (https://nodejs.org/en/)
2. Install oracle client (I used 12c) and configure tnsnames for the oracle db
	open cmd --> type 'netca' --> Local Net Service configuration
2. create a directory (Eg: C:\bpl)
	
3. Copy/Replace the git directories under above acreated folder 

4. Open cmd in the same directory and run npm install

	This comamnd will ensure installing all the dependency modules.
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
		
	
	
