const   redis = require("redis"),  
        dot = require('dot-object'),
        async = require('async');



module.exports = {set, get};

var defaultOptions = {
    host : '127.0.0.1',
    port : '6379',
    db : 1
};

function set( key, obj, cb, options ){
    if(typeof obj !=='object' && typeof key == 'string'){
        throw new Error("Onject Expected!");
    }

    options = Object.assign( defaultOptions , options);

    let redisClient = redis.createClient(options);

    cb = typeof cb == 'function' ? cb : function(){} ;

    let flatObj = dot.dot(obj);
    // let flatObjSize = Object.keys(flatObj).length;

    // console.log(flatObj);

    // console.log(flatObj);
    let multi = redisClient.multi();

    //first remove entire (previous) field to reflect all changes in the object...
    multi.del(key);

    //loop thru the flattened object adding fields..
    for(var i in flatObj){
        if(flatObj[i]){ multi.hset(key, i, flatObj[i] ); }
    }

    //execute with multi
    multi.exec(function(err,res){

        redisClient.quit();

        if(err){  return cb(err, null); }

        return cb( null, flatObj );
        
    });


}

function get( key, fields, cb , options){

    // console.log(field);
    if((typeof fields !=='string' || !fields || Array.isArray(fields)) && typeof key !== 'string'){
        throw new Error("Key & Field values must be strings");
    }

    options = Object.assign( defaultOptions , options);

    fields = Array.isArray(fields) ? fields : [fields];

    //use null if no field
    if(!fields){ fields = [null] }

    // console.log(fields);

    let result = {};

    //run in parallel. Redis is pretty fast for this...
    async.eachLimit(fields, 100, function(field, next){
        // console.log(field, key);

        get_field( key, field, function(err, res){
            // console.log(res);
            if(res){
                let obj = {};
                if(field){  obj[field] = res; }
                else{ obj = res; }
                result = Object.assign(result, obj);
            }            

            next();
        } , options );

    }, function(){

        result = dot.object(result) || null;
        // console.log(result);
        cb(null, result);

    });

}


function get_field( key, field, cb , options ){

    if(field && field.length){

        let redisClient = redis.createClient(options);

        redisClient.hget(key, field, function(err, res){
            
            if(err) return cb(err, null);

            //if null, then get_all & pick from object
            if(!res){

                get_all(key, function(err, res){
                    redisClient.quit();
                    if(err) return cb(err, null);
                    //pick value
                    var val = (res) ? dot.pick( field , res) || null : null;
                    return cb(null, val);

                }, options);

            }
            else{
                redisClient.quit();
                return cb(null, res);
            }

            
        });
    }
    else{
        get_all(key, function(err, res){

            if(err) return cb(err, null);
            cb(null, res); 

        }, options);
    }
}


function get_all(key, cb, options){
    let redisClient = redis.createClient(options);

    redisClient.hgetall(key, function(err, res){
        redisClient.quit();

        if(err) return cb(err, null)

        try{ return cb(null, dot.object(res)); } 
        catch(err){return cb(err, null)}  

    });

}

