
const fs = require('fs');
const redisODB = require('.');

var obj = JSON.parse( fs.readFileSync('./package.json').toString() ) ;

//Set Options
let options= {
    host : '127.0.0.1',
    port : '6379',
    db : 3
}

//redis Hash Key
var key = 'TEST'; 

//Add Data to ODB
redisODB.set(key,obj, function(err, res){
    console.log(JSON.stringify(res,0,4));
    console.log('\n');
}, options );


//get a subset of the object keys....
var searchKey = ['keywords', 'dependencies' ] ;

//Get Data from ODB
redisODB.get(key, searchKey, function(err, res){    
    console.log(JSON.stringify(res,0,4));
}, options );


