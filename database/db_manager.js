
var db = require("./db");

exports.isDBConnected = function(){
	if(DB && DB._state == 'connected'){
		return true;
	}
	return false;
};

exports.FindIntoDB = function(collectionName, option, callback){
    DB.collection(collectionName, function(err, collection) {
    	if(err){
    		console.log("DB Find Error:", err);
    		callback([]);
    	}else{
    		collection.find(option).sort({_id:-1}).toArray(function(err, results){
				if(!err){
					callback(results);
				}else{
					console.log("Query Find Error:", err);
					callback([]);
				}
			});
    	}
	});
};

exports.insertIntoDB = function(collection,dataObj,callback){
	DB.collection(collection, {safe:true}, function(err, collection) {
		if(err){
			console.log("Insert DB Collection Error:", err);
			callback(false);
		}else{
			collection.insert(dataObj, {safe:true}, function(err, result){
				if(err || !result){
					console.log("Insert Query Error:", err);
					callback(false);
				}else{
					callback(true);
				}
			});
		}
	});
};

