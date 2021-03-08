// Last Modification : 2021.03.08
// by HYOSITIVE
// based on Opentutorials - Node.js & MySQL - 14.2

var db = require('./db');
var template = require('./template.js');
var url = require('url');
var qs = require('querystring');

exports.home = function(request, response) { // 여러 API를 외부에 제공
    db.query(`SELECT * FROM topic`, function(error, topics) {
        var title = 'Welcome';
        var description = 'Hello, Node.js';
        var list = template.list(topics);
        var html = template.HTML(title, list,
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>`
            );
        response.writeHead(200);
        response.end(html);
    });
}

exports.page = function(request, response) {
    var _url = request.url;
	var queryData = url.parse(_url, true).query;
    db.query(`SELECT * FROM topic`, function(error, topics) {
        if (error) {
            throw error;
        }
        db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id = author.id WHERE topic.id=?`,[queryData.id], function(error2, topic) {
            // SQL문의 ?에 두 번째 인자의 값이 들어감. 해킹으로 인한 데이터 유출 방지
            if (error2) {
                throw error2;
            }
            // topic이 배열로 return되기 때문에, 첫 번째 원소를 명시해주어야 함
            var title = topic[0].title;
            var description = topic[0].description;
            var list = template.list(topics);
            var html = template.HTML(title, list,
                `<h2>${title}</h2>${description}
                <p>by ${topic[0].name}</p>`,
                ` <a href="/create">create</a>
                  <a href="/update?id=${queryData.id}">update</a>
                  <form action="delete_process" method="post">
                      <input type="hidden" name="id" value="${queryData.id}">
                      <input type="submit" value="delete">			
                  </form>`
            );
        response.writeHead(200);
        response.end(html);
        })
    });
}

exports.create = function(request, response) {
    db.query(`SELECT * FROM topic`, function(error, topics) {
        db.query(`SELECT * FROM author`, function(error2, authors) {
            var title = 'Create';
            var list = template.list(topics);
            var html = template.HTML(title, list,
                `
                <form action="/create_process" method="post">
                    <p><input type ="text" name="title" placeholder="title"></p>
                    <p><textarea name="description" placeholder="description"></textarea></p>
                    <p>
                        ${template.authorSelect(authors)}
                    </p>
                    <p><input type="submit"></p>
                </form>`,
                `<a href="/create">create</a>`
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
        db.query(`INSERT INTO topic (title, description, created, author_id)
            VALUES(?, ?, NOW(), ?)`,
            [post.title, post.description, post.author],
            function(error, result) {
                if (error) {
                    throw error;
                }
                response.writeHead(302, {Location: `/?id=${result.insertId}`}); // 삽입한 행의 id값
                response.end();
            }
        )
    });
}