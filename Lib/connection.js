let  mysql = require('mysql'),
     util   = require('util'),
     dbConfig = require('../Config/dbConfig'),
     connection;


async function handleDisconnect() {
    try{
        connection = mysql.createConnection(dbConfig.client);
        connection.query = util.promisify(connection.query);
        await connection.connect();
        await createTables();
        await addAdmins();
        connection.on('error', function(err) {
            console.log('db error', err);
            if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                handleDisconnect();
            }
            else {
                throw err;
            }
        });
    }
    catch(er)
    {
        setTimeout(handleDisconnect, 2000);

    }
};

(async ()=>{
    await handleDisconnect();
})();

async function addAdmins() {

    let admins=[
        {
            email     : 'ishan@stockInventory.com',
            password  :'1e7eebb19ca71233686f26a43bbc18a9',
        },
        {
            email     : 'test@stockInventory.com',
            password  :'1e7eebb19ca71233686f26a43bbc18a9',
        },
        {
            email     : 'live@stockInventory.com',
            password  :'1e7eebb19ca71233686f26a43bbc18a9',
        },
        {
            email     : 'dev@stockInventory.com',
            password  :'1e7eebb19ca71233686f26a43bbc18a9',
        }
    ];

    let sql,data;
    for(let i= 0 ; i< admins.length; i++ )
    {
        sql  = "INSERT INTO `admins` (email,password) VALUES (?, ?) ON DUPLICATE KEY UPDATE email=?, password=? ";
        data  = await connection.query(sql,[admins[i].email,admins[i].password,admins[i].email,admins[i].password]);
    }

    return data;

}


async function createTables() {

    let sql="CREATE TABLE IF NOT EXISTS `admins` ( `id` bigint(20) NOT NULL AUTO_INCREMENT,`email` varchar(50) COLLATE utf8mb4_bin NOT NULL, `password` varchar(50) COLLATE utf8mb4_bin NOT NULL, `accessToken` varchar(300) COLLATE utf8mb4_bin DEFAULT NULL,`isSendPush` TINYINT(1) NOT NULL DEFAULT '1' , `createdDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`id`) USING BTREE, KEY `createdDate` (`createdDate`) USING BTREE, KEY `password` (`password`) USING BTREE, KEY `accessToken` (`accessToken`),UNIQUE KEY `email` (`email`) USING BTREE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;";

    sql = sql +'CREATE TABLE IF NOT EXISTS `variants` ( `id` bigint(20) NOT NULL AUTO_INCREMENT, `itemId` bigint(20) NOT NULL, `name` varchar(200) NOT NULL, `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,`isDeleted` tinyint(1) NOT NULL DEFAULT "0", KEY `name` (`name`), PRIMARY KEY (`id`) USING BTREE)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;';

    sql = sql +'CREATE TABLE IF NOT EXISTS `user` ( `id` bigint(20) NOT NULL AUTO_INCREMENT, `name` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL, `email` varchar(250) NOT NULL, `password` int(11) NOT NULL, `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, `accessToken` varchar(400) NOT NULL, PRIMARY KEY (`id`) USING BTREE, KEY `email` (`email`), KEY `name` (`name`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;';

    sql = sql +'CREATE TABLE IF NOT EXISTS `properties` ( `id` bigint(20) NOT NULL AUTO_INCREMENT, `size` varchar(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL, `clothType` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,`isDeleted` tinyint(1) NOT NULL DEFAULT "0", `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `variantId` bigint(20) NOT NULL, `itemId` bigint(20) NOT NULL, `costPrice` float NOT NULL, `sellingPrice` float NOT NULL, `quanity` int(11) NOT NULL, PRIMARY KEY (`id`) USING BTREE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;';

    sql = sql +'CREATE TABLE IF NOT EXISTS `userLogs` ( `id` bigint(20) NOT NULL AUTO_INCREMENT, `notificationString` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL, `userId` bigint(20) NOT NULL, `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `itemId` bigint(20) DEFAULT NULL, `variantId` bigint(20) DEFAULT NULL, PRIMARY KEY (`id`) USING BTREE, KEY `itemId` (`itemId`), KEY `variantId` (`variantId`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;';

    sql = sql +'CREATE TABLE IF NOT EXISTS `items` ( `id` bigint(20) NOT NULL AUTO_INCREMENT, `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL, `brand` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL, `category` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,`isDeleted` tinyint(1) NOT NULL DEFAULT "0", `productCode` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL, `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`id`) USING BTREE, KEY `name` (`name`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;';

    return await connection.query(sql,[]);
}


module.exports = {
    connection
}