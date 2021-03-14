// Last Modification : 2021.03.14
// by HYOSITIVE
// based on Opentutorials - Node.js & MySQL - 20


var mysql = require('mysql');
var db = mysql.createConnection({
	host:'localhost',
	user:'root',
	password:'111111',
	database:'opentutorials',
	// multipleStatements: true : SQL Injectio을 방지하기 위해 일반적으로 false로 설정
});
db.connect();
module.exports = db; // 하나의 API만 외부에서 사용 가능