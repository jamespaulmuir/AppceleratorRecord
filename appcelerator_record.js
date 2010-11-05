var AppceleratorRecord = function(args){

  var api = {databaseName: null, tableName: null, createSQL: null };
	this.errors = [];
	this.databaseName = args.databaseName;
	this.tableName = args.tableName;
	this.indexes = args.indexes || [];
	this.migrations = args.migrations || [];
  this.database = new AppceleratorDatabase();
	this.database.initialize({name: this.databaseName, tableName: this.tableName, createSQL: args.createSQL});
  this.newRecord = true;
	
	//run init() once! inside of app.js to create the table, columns and indexes
	this.init = function(){
		this.database.createTable();
		this.migrate();
		this.createIndexes();
	};
	
	this.createIndexes = function(){
		var localThis = this; // USE INSIDE OF FUNCTIONS
		this.indexes.each(function(columns){
			var index_name = columns.join('_');
			var SQL = "CREATE INDEX IF NOT EXISTS " + index_name + " ON " + localThis.tableName + "(" + columns.join(', ') + ");";
			localThis.database.db.execute(SQL);
		});
	};
	
	this.migrate = function(){
		var localThis = this; // USE INSIDE OF FUNCTIONS
		this.migrations.each(function(column){ localThis.addColumn(column[0], column[1]); });
	};
	
	this.addColumn = function(column, type){
		if( this.database.columnExists(column) ){ return; }
		var SQL = "ALTER TABLE " + this.tableName + " ADD "+ column+ " " + type;
		this.database.db.execute(SQL);
	};
	
	this.load = function(SQL){
		var clones = [];
		var resultSet = this.database.db.execute(SQL);
		if( resultSet.rowCount == 0 ){ return []; };
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

	this.all = function(id){
		var SQL = 'SELECT * FROM '+ this.tableName
		return this.load(SQL);
	};

	this.find = function(id){
		var SQL = 'SELECT * FROM '+ this.tableName +' WHERE id = ' + id;
		return this.load(SQL)[0];
	};
	
	//accepts single values or arrays for the columns & values
	this.findBy = function(columns, values, orderBy){
		if( typeof(columns) != 'object' ){ columns = [columns]; values = [values]; }
		if( columns.length != values.length ){ alert("findBy columns and values arrays do not match lengths"); return null; }
		var conditions = [];
		for(var i=0; i<columns.length; i++){ conditions.push( columns[i] + " = \"" + values[i] + "\"" ); }
		
		//returns single object
		var SQL = "SELECT * FROM "+ this.tableName +" WHERE " + conditions.join(' AND ') + " LIMIT 1";
		if( typeof(orderBy) == 'string' ){ SQL+= " ORDER BY " + orderBy; }
		return this.load(SQL)[0];
	};

	//accepts single values or arrays for the column & value
	this.findAllBy = function(columns, values, orderBy){
		if( typeof(columns) != 'object' ){ columns = [columns]; values = [values]; }
		if( columns.length != values.length ){ alert("findBy columns and values arrays do not match lengths"); return null; }
		var conditions = [];
		for(var i=0; i<columns.length; i++){ conditions.push( columns[i] + " = \"" + values[i] + "\"" ); }
		
		// returns array
		var SQL = "SELECT * FROM "+ this.tableName +" WHERE " + conditions.join(' AND ');
		if( typeof(orderBy) == 'string' ){ SQL+= " ORDER BY " + orderBy; }
		return this.load(SQL);
	};
	
	this.first = function(){
		var SQL = "SELECT * FROM "+ this.tableName +" ORDER BY id LIMIT 1";
		return this.load(SQL)[0];
	};

	this.last = function(){
		var SQL = "SELECT * FROM "+ this.tableName +" ORDER BY id DESC LIMIT 1";
		return this.load(SQL)[0];
	};
	
	this.count = function(){
		var resultSet = this.database.db.execute("SELECT COUNT(*) as count FROM " + this.tableName);
		var c = resultSet.getFieldByName('count');
		resultSet.close();
		return c;
	};

	this.addLocalMethods = function(localApi){
		// !!!!!!!!!
		// User localApi instead of "this"
		// CRUD OPERATIONS BELONG HERE
		// !!!!!!!!!
		
	  localApi.save = function(){
			(this.newRecord == true ? this.saveNew() : this.saveExisting());
	  };
	
		localApi.saveExisting = function(){
			var localThis = this; // USE INSIDE OF FUNCTIONS
			var values = [];
			var columns = localApi.database.columnNames();
			columns = columns.select(function(c){ return ( localThis[c] != null );  });
			columns.each(function(c){  values.push(c + "= \"" + localThis[c] + "\"");  });
			var SQL = "UPDATE " + localApi.tableName + " SET " + values.join(',') + " WHERE id = " + this.id;
			localApi.database.db.execute(SQL);
		};

	  localApi.saveNew = function(){
			var localThis = this; // USE INSIDE OF FUNCTIONS
			var values = [];
			var columns = localApi.database.columnNames();
			columns = columns.select(function(c){ return ( typeof(localThis[c]) != 'undefined' );  });
			columns.each(function(c){ values.push("\"" + localThis[c] + "\""); });
			var SQL = "INSERT INTO " + localApi.tableName + " (" + columns.join(',') + ") VALUES (" + values.join(',') + ")";
			this.database.db.execute(SQL);
			this.newRecord = false;
			this.id = this.database.db.lastInsertRowId;
	  };
	
		localApi.update = function(column, value){
			this[column] = value;
			var SQL = "UPDATE " + localApi.tableName + " SET " + column + " = \"" + value + "\" WHERE id = " + this.id;
			this.database.db.execute(SQL);
		};
	
		localApi.destroy = function(){
			var SQL = "DELETE FROM " + this.tableName + " WHERE id = " + this.id;
			localApi.database.db.execute(SQL);
			
			if( typeof(this.destroyCallback) == 'function' ){
				this.destroyCallback();
			}
		};

	};
	
	return this;

};
