var crypto = require('crypto');
var algorithm = 'aes256'; // or any other algorithm supported by OpenSSL
var key = 'fa7ec3d6eadedd4ce0f76d754bc4a962';
var text =JSON.stringify({id:'ewtqerwqewteyuwqtyuetwqyue',userType:'sdsdsd',date:new Date()}) ;

var cipher = crypto.createCipher(algorithm, key);
var encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');

console.log(encrypted);






var decipher = crypto.createDecipher(algorithm, key);
var decrypted = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');


console.log(JSON.parse(decrypted).userType);