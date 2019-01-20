/**
 * Created by Ishan garg on 30/3/17.
 */
'use strict';

module.exports ={
    test: {
        "host": "localhost",
        "user": process.env.username,
        "password": process.env.password,
        "database": process.env.database,
        "mysqlPORT":3306,
        "multipleStatements": true
    },
    dev : {
        "host": "localhost",
        "user": process.env.username,
        "password": process.env.password,
        "database": process.env.database,
        "mysqlPORT":3306,
        "multipleStatements": true

    },
    live:{
        "host": "localhost",
        "user": process.env.username,
        "password": process.env.password,
        "database": process.env.database,
        "mysqlPORT":"",
        "multipleStatements": true
    },
    client:{
        "host": "localhost",
        "user": process.env.username,
        "password": process.env.password,
        "database": process.env.database,
        "mysqlPORT":"",
        "multipleStatements": true
    }
};