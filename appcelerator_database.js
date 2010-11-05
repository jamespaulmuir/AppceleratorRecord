var AppceleratorDatabase = function(){

	var name;
	var tableName;
  var api = {};
  this.db = null;
	this.createSQL = null;
	this.databaseExists = false;

	this.initialize = function(args){
		this.tableName = args.tableName;
		this.name = args.name;
		this.createSQL = args.createSQL;
		this.indexes = args.indexes;
		this.db = Ti.Database.open(this.name);
	};
	
	this.createTable = function(){
		var SQL = "CREATE TABLE IF NOT EXISTS " + this.tableName + ' ' + this.createSQL;
		this.db.execute(SQL);
	};
	
	this.firstColumnValue = function(SQL){
		var resultSet = this.db.execute(SQL);
		var x = resultSet.field(0);
		resultSet.close();
    return x;
	};
  
  this.columnNames = function(){
  	var SQL = "SELECT * FROM sqlite_master WHERE tbl_name = '"+this.tableName+"' AND sql LIKE 'CREATE TABLE%'";
  	var resultSet = this.db.execute(SQL);
  	if( !resultSet.isValidRow() ){ Ti.API.notice("INVALID RESULTSET!!"); return; }
		
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

	this.columnExists = function(column){
		return this.columnNames().indexOf(column) >= 0;
	};
  
  return this;

};