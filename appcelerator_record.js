var AppceleratorRecord = function(args){

  var api = {databaseName: null, tableName: null, createSQL: null };
	this.errors = [];
	this.databaseName = args.databaseName;
	this.tableName = args.tableName;
  this.database = new AppceleratorDatabase();
	this.database.initialize({name: this.databaseName, tableName: this.tableName, createSQL: args.createSQL});
  this.newRecord = true;
	
	
  this.createTable = function(){
    this.db.execute(this.createSQL);
  };
	
	this.load = function(SQL){
		var clones = [];
		var resultSet = this.database.db.execute(SQL);
		logger("Found " + resultSet.rowCount + " Records");
		if( resultSet.rowCount == 0 ){ this.errors.push('record not found'); return [this]; };
    while(resultSet.isValidRow()) {
			var copy = eval('new ' + this.klass +'()');
			for(var i=0; i<resultSet.fieldCount(); i++){ copy[resultSet.fieldName(i)] = resultSet.field(i); }
			copy.newRecord = false;
			clones.push(copy);
    	resultSet.next();
    }
		resultSet.close();
		
		return clones;
	};

	this.find = function(id){
		var SQL = 'SELECT * FROM '+ this.tableName +' WHERE id = ' + id;
		return this.load(SQL)[0];
	};
	
	this.findBy = function(column, value){
		//returns single object
		var SQL = "SELECT * FROM "+ this.tableName +" WHERE " + column + " = \"" + value + "\" LIMIT 1";
		return this.load(SQL)[0];
	};

	this.findAllBy = function(column, value){
		// returns array
		var SQL = "SELECT * FROM "+ this.tableName +" WHERE " + column + " = \"" + value + "\"";
		return this.load(SQL);
	};

	this.addLocalMethods = function(localApi){
		// !!!!!!!!!
		// User localApi instead of "this"
		// CRUD OPERATIONS BELONG HERE
		// !!!!!!!!!
		
	  localApi.save = function(){
			(localApi.newRecord == true ? localApi.saveNew() : localApi.saveExisting());
	  };
	
		localApi.saveExisting = function(){
			var values = [];
			var columns = localApi.database.columnNames();
			columns = columns.select(function(c){ return ( localApi[c] != null );  });
			columns.each(function(c){  values.push(c + "= \"" + localApi[c] + "\"");  });
			var SQL = "UPDATE " + localApi.tableName + " SET " + values.join(',') + " WHERE id = " + localApi.id;
			localApi.database.db.execute(SQL);
		};

	  localApi.saveNew = function(){
			var values = [];
			var columns = localApi.database.columnNames();
			columns = columns.select(function(c){ return ( typeof(localApi[c]) != 'undefined' );  });
			columns.each(function(c){ values.push("\"" + localApi[c] + "\""); });
			var SQL = "INSERT INTO " + localApi.tableName + " (" + columns.join(',') + ") VALUES (" + values.join(',') + ")";
			localApi.database.db.execute(SQL);
			localApi.newRecord = false;
			localApi.id = localApi.database.db.lastInsertRowId;
	  };
	
		localApi.destroy = function(){
			var SQL = "DELETE FROM " + localApi.tableName + " WHERE id = " + localApi.id;
			localApi.database.db.execute(SQL);
		};

	};
	
	return this;

};
