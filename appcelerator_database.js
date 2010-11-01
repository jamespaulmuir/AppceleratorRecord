var AppceleratorDatabase = function(){

	var name;
	var tableName;
  var api = {};
  this.db = null;
	this.createSQL = null;
	this.databaseExists = false;
	this.tableExists = false;

	this.initialize = function(args){
		this.tableName = args.tableName;
		this.name = args.name;
		this.createSQL = args.createSQL;
		this.db = Ti.Database.open(this.name);
		this.databaseExists = true;
		if( !this.tableExists ){ this.createTable(); }
	};
	
	this.createTable = function(){
		var sql = "CREATE TABLE IF NOT EXISTS " + this.tableName + ' ' + this.createSQL;
		this.db.execute(sql);
		this.tableExists = true;
	};
  
  this.columnNames = function(){
	
  	var sql = "SELECT * FROM sqlite_master WHERE tbl_name = '"+this.tableName+"'";
  	var resultSet = this.db.execute(sql);
  	if( !resultSet.isValidRow() ){ logger("INVALID RESULTSET!!"); return; }
		
  	while (resultSet.isValidRow()) {
  		var h = {};
  		for(var i=0; i<resultSet.fieldCount(); i++){ h[resultSet.fieldName(i)] = resultSet.field(i); }
    	resultSet.next();
    }


  	var columns = [];
  	h.sql.match(/\({1}.*\){1}/)[0].replace('(', '').replace(')','').split(/,/).each(function(c){
  		columns.push( c.match(/\s*(\w*)\s/)[0].match(/\s*([a-zA-Z_]*)/)[0].replace(' ', '') );
  	});
	
  	return columns;
  };
  
  return this;

};