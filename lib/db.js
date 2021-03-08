// Last Modification : 2021.03.08
// by HYOSITIVE
// based on Opentutorials - Node.js & MySQL - 13


var mysql = require('mysql');
var db = mysql.createConnection({
	host:'localhost',
	user:'root',
	password:'111111',
	database:'opentutorials'
});
db.connect();
module.exports = db; // 하나의 API만 외부에서 사용 가능