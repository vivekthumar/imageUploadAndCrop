
var DBManager = require('../database/db_manager'),
	collectionName = 'data',
 	fs = require('fs'),
    q = require('q'),
	config = require('../config/config.js'),
	Jimp = require('jimp'),
	formidable = require('formidable');

var uploadPath = approot + '/public/uploads/';


exports.fileUpload = function(req,res){
	var timeStamp = Date.now();
	var form = new formidable.IncomingForm();
	form.parse(req);
    form.on('fileBegin', function (name, file){
        file.path = uploadPath + 'original/' + timeStamp + '_' + file.name;
    });

    form.on('file', function (name, file){
        DBManager.insertIntoDB(config.db_name,{data : timeStamp + '_' + file.name},function(results){
			if(results){
				res.send({status : 'success', data : timeStamp + '_' + file.name})
			}else{
				res.send({status : 'Fail'})
			}
		})
    });	
};

exports.getList = function(req,res){
	
	DBManager.FindIntoDB(config.db_name,{},function(results){
		if(results){
			res.send({status : 'success', data : results})
		}else{
			res.send({status : 'Fail'})
		}
	})      
};

exports.getFile = function(req,res){
	//res.send('hi');
	if(!req.body.fileSize && !req.body.fileQuality){
		var file = uploadPath + 'original/'+req.body.fileName;
		if(fs.existsSync(file)){
			return res.send('/uploads/original/'+req.body.fileName)
		}else{
			return res.status(404).json({'message' : 'file not found'})
		}
	}else if(req.body.fileSize && req.body.fileQuality){
		var tmpFolderName = req.body.fileSize + '_' + req.body.fileQuality;
		var tmpFolderPath = uploadPath + tmpFolderName;
		var file = tmpFolderPath + '/' + req.body.fileName;
		file = file.substring(0,file.lastIndexOf('.')) + '.jpg'; 
		var flag = true;
	}else if(req.body.fileSize && !req.body.fileQuality){
		var tmpFolderName = req.body.fileSize;
		var tmpFolderPath = uploadPath + tmpFolderName;
		var file = tmpFolderPath + '/' + req.body.fileName;
	}else if(!req.body.fileSize && req.body.fileQuality){
		var tmpFolderName = req.body.fileQuality;
		var tmpFolderPath = uploadPath + tmpFolderName;
		var file = tmpFolderPath + '/' + req.body.fileName;
		file = file.substring(0,file.lastIndexOf('.')) + '.jpg'
		var flag = true;
	}	

	if(!fs.existsSync(tmpFolderPath)){
		fs.mkdirSync(tmpFolderPath);
	}

	var uploadedFileName = req.body.fileName
	if(flag){
		uploadedFileName = req.body.fileName.substring(0,req.body.fileName.lastIndexOf('.')) + '.jpg';
	}
	if(fs.existsSync(file)){
		res.send('/uploads/'+ tmpFolderName+ '/' +uploadedFileName)
	}else{
		
		
		createImg(uploadPath+'original/',tmpFolderPath,req.body.fileName,uploadedFileName,parseInt(req.body.fileSize),parseInt(req.body.fileQuality),function(responce){
			res.send('/uploads/'+ tmpFolderName+ '/' +uploadedFileName)
		})
		
	}
};

function createImg(oriPath,path,oriName,name,size,quality,cb){
	Jimp.read(oriPath+oriName).then(function (lenna) {
		if(size && quality){
			lenna.resize(size, size).quality(quality).write(path+'/'+name,function(){ cb(name); }); 
		}else if(!size){
			lenna.quality(quality).write(path+'/'+name,function(){ cb(name); }); 
		}else if(!quality){
			lenna.resize(size, size).write(path+'/'+name,function(){ cb(name); }); 
		}
	}).catch(function (err) {
		console.error(err);
	});
	
	
}



