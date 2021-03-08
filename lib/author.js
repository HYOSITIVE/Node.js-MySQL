// Last Modification : 2021.03.08
// by HYOSITIVE
// based on Opentutorials - Node.js & MySQL - 17

var db = require('./db');
const { authorSelect } = require('./template.js');
var template = require('./template.js');
var qs = require('querystring');

exports.home = function(request, response) {
    db.query(`SELECT * FROM topic`, function(error, topics) {
        db.query(`SELECT * FROM author`, function(error2, authors) {
            var title = 'author';
            var list = template.list(topics);
            var html = template.HTML(title, list,
            `
            ${template.authorTable(authors)}
            <style>
                table {
                    border-collapse: collapse;
                }
                td {
                    border:1px solid black;
                }
            </style>
            <form action="/author/create_process" method="post">
                <p>
                    <input type="text" name="name" placeholder="name">
                </p>
                <p>
                    <textarea name="profile" placeholder="description"></textarea>
                </p>
                <p>
                    <input type="submit">
                </p>
            </form>
            `,
            ``
            );
            response.writeHead(200);
            response.end(html);
        });
    });
}

exports.create_process = function(request, response) {
    var body = '';
		// 데이터의 조각을 서버쪽에서 수신할 때마다, 서버는 callback 함수를 호출, data parameter를 통해 수신한 정보 제공
    request.on('data', function(data) {
        body = body + data; // callback이 실행될 때마다 데이터 추가
    });
    // 더 이상 들어올 정보가 없을 때, end에 해당되는 callback 함수 호출, 정보 수신이 끝났다는 뜻
    request.on('end', function() {
        var post = qs.parse(body);
        db.query(`INSERT INTO author (name, profile)
            VALUES(?, ?)`,
            [post.name, post.profile],
            function(error, result) {
                if (error) {
                    throw error;
                }
                response.writeHead(302, {Location: `/author`});
                response.end();
            }
        )
    });
}