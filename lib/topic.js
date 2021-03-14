// Last Modification : 2021.03.14
// by HYOSITIVE
// based on Opentutorials - Node.js & MySQL - 21

var db = require('./db');
var template = require('./template.js');
var url = require('url');
var qs = require('querystring');
var sanitizeHtml = require('sanitize-html');

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
        // 이 방법으로 구현한다면, url을 통한 SQL Injection이 가능해짐
        var sql = `SELECT * FROM topic LEFT JOIN author ON topic.author_id = author.id WHERE topic.id=${queryData.id}`;
        // console.log(sql);
        
        // SQL문의 ?에 두 번째 인자의 값이 들어감. SQL Injection 방지
        // ${db.escape(queryData.id)}와 같은 방법으로도 SQL Injection 방지 가능
        db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id = author.id WHERE topic.id=?`,[queryData.id], function(error2, topic) {
            if (error2) {
                throw error2;
            }
            // topic이 배열로 return되기 때문에, 첫 번째 원소를 명시해주어야 함
            var title = topic[0].title;
            var description = topic[0].description;
            var list = template.list(topics);
            var html = template.HTML(title, list,
                `<h2>${sanitizeHtml(title)}</h2>${sanitizeHtml(description)}
                <p>by ${sanitizeHtml(topic[0].name)}</p>`,
                // 사용자 입력값은 모두 sanitize 처리
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

exports.update = function(request, response) {
    var _url = request.url;
	var queryData = url.parse(_url, true).query;
    db.query(`SELECT * FROM topic`, function(error, topics) {
        db.query(`SELECT * FROM topic WHERE id=?`,[queryData.id], function(error2, topic) {
            if (error2) {
                throw error2;
            }
            db.query(`SELECT * FROM author`, function(error2, authors) {
                var list = template.list(topics);
                var html = template.HTML(sanitizeHtml(topic[0].title), list,
                    `
                    <form action="/update_process" method="post">
                        <input type="hidden" name="id" value="${topic[0].id}">
                        <p><input type ="text" name="title" placeholder="title" value="${sanitizeHtml(topic[0].title)}"></p>
                        <p>
                            <textarea name="description" placeholder="description">${sanitizeHtml(topic[0].description)}</textarea>
                        </p>
                        <p>
                            ${template.authorSelect(authors, topic[0].author_id)}
                        </p>
                        <p>
                            <input type="submit">
                        </p>
                    </form>
                    `,
                    `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>` // home이 아닐 경우 update 기능 존재, 수정할 파일 명시 위해 id 제공
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
			db.query(`UPDATE topic SET title=?, description=?, author_id=? WHERE id=?`, [post.title, post.description, post.author, post.id], function(error, result) {
				response.writeHead(302, {Location: `/?id=${post.id}`});
				response.end();
			})
		});
}

exports.delete_process = function(request, response) {
    var body = '';
		request.on('data', function(data) {
			body = body + data;
		});
		request.on('end', function() {
			var post = qs.parse(body);
			db.query('DELETE FROM topic WHERE id = ?', [post.id], function(error, result) {
				if (error) {
					throw error;
				}
				response.writeHead(302, {Location: `/`}); // Home으로 Redirection
				response.end();
			});
		});
}