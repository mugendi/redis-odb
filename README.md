
# Redis-ODB (Object Database)

[Kyle Davis](https://twitter.com/stockholmux) wrote [this](https://medium.com/@stockholmux/store-javascript-objects-in-redis-with-node-js-the-right-way-1e2e89dbbf64#.vorw6ul8w) beautiful article
 on how to store objects in Redis.

 I have seen at least one module inspired by this article and this is yet another.

 This module inproves on the concept in sevaral important ways.

 1. Kyle talks of the shortcomings of [flat](https://www.npmjs.com/package/flat) and I have used [dot-object](https://www.npmjs.com/package/dot-object) which has a more superior API. Check it out.

 2. I wanted to extend the ability to fetch flattened keys i.e. ```'key1.nestedkey.nestedkey2'``` to being able to fetch *partial* keys like ```'key1.nestedkey.nestedkey2'```. **dot-object** module provides a useful method ```'.pick'``` and we utilize it for such.

 3. Finally, I wanted to have the ability to fetch multiple keys at once and return a well formated *partial* object. Example, for an object like : ```{k1:1, kn:{kn2:{kn3: 300 }}, k3:3, k4:4}```, it would be nice to query for ```['k1','kn.kn2']``` and get an object with only those values. Right?


## How To
Install ```npm install -s redis-odb```. Then go ahead and set/get objects.


```javazcript

const fs = require('fs');
const redisODB = require('.');

//lets use this package.json as our object
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

```
Outputs a *partial* object:

```json

{
    "keywords": [
        "redis",
        "object",
        "database",
        "db"
    ],
    "dependencies": {
        "dot-object": "^1.5.4",
        "async": "^2.1.4",
        "redis": "^2.6.3"
    }
}
```

## API
There are only two methods that you should worry about.

### ```set( key, obj[, cb, options])```
Save object into redis. Requires a string value that acts as the *HASH KEY* in redis.

### ```get( key [, fields, cb , options])```
Retrieve object from redis. Requires a string value that acts as the *HASH KEY* in redis.

### Options
These are the same options that you would pass to ***node-redis***.

## TODO
- Better management of redis connections. Should we close connections after every query or keep connections alive?