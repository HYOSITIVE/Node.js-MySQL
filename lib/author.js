// Last Modification : 2021.03.10
// by HYOSITIVE
// based on Opentutorials - Node.js & MySQL - 19

var db = require('./db');
const { authorSelect } = require('./template.js');
var template = require('./template.js');
var qs = require('querystring');
var url = require('url');
//const { query } = require('./db');

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
                    <input type="submit" value="create">
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

exports.update = function(request, response) {
    db.query(`SELECT * FROM topic`, function(error, topics) {
        db.query(`SELECT * FROM author`, function(error2, authors) {
            var _url = request.url;
            var queryData = url.parse(_url, true).query;
            db.query(`SELECT * FROM author WHERE id=?`, [queryData.id], function(error3, author) {
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
                <form action="/author/update_process" method="post">
                    <p>
                        <input type="hidden" name="id" value="${queryData.id}">
                    <p>
                        <input type="text" name="name" value="${author[0].name}" placeholder="name">
                    </p>
                    <p>
                        <textarea name="profile" placeholder="description">${author[0].profile}</textarea>
                    </p>
                    <p>
                        <input type="submit" value="update">
                    </p>
                </form>
                `,
                ``
                );
                response.writeHead(200);
                response.end(html);
            });
        });
    });
}

exports.update_process = function(request, response) {
    var body = '';
    request.on('data', function(data) {
        body = body + data;
    });
    request.on('end', function() {
        var post = qs.parse(body);
        db.query(`UPDATE author SET name=?, profile=? WHERE id=?`,
            [post.name, post.profile, post.id],
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

exports.delete_process = function(request, response) {
    var body = '';
    request.on('data', function(data) {
        body = body + data;
    });
    request.on('end', function() {
        var post = qs.parse(body);
        // author을 삭제했을 경우, 해당 author의 글까지 같이 삭제
        db.query(
            `DELETE FROM topic WHERE author_id=?`,
            [post.id],
            function(error1, result1){
                if(error1) {
                    throw error1;
                }
                db.query(
                    `DELETE FROM author WHERE id=?`,
                    [post.id],
                    function(error2, result2) {
                        if (error2) {
                            throw error2;
                        }
                        response.writeHead(302, {Location: `/author`});
                        response.end();
                    }
                )
            }
        )
    });
}