// Last Modification : 2021.03.08
// by HYOSITIVE
// based on Opentutorials - Node.js & MySQL - 14.2

var http = require('http');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var db = require('./lib/db');
var topic = require('./lib/topic');

var app = http.createServer(function(request,response){
    var _url = request.url;
	var queryData = url.parse(_url, true).query;
	var pathname = url.parse(_url, true).pathname;
	
	if (pathname === '/') { // root, 즉 path가 없는 경로로 접속했을 때 - 정상 접속
		if(queryData.id === undefined) { // 메인 페이지
			topic.home(request, response);
		}
		
		else { // 컨텐츠를 선택한 경우
			topic.page(request, response);
		}	
	}
	
	else if(pathname === '/create') {  // 새로운 컨텐츠 생성
		topic.create(request, response);
	}

	else if(pathname === '/create_process') { // 컨텐츠 생성 작업
		topic.create_process(request, response);
	}

	// 업데이트
	else if(pathname === '/update') {
		db.query(`SELECT * FROM topic`, function(error, topics) {
			db.query(`SELECT * FROM topic WHERE id=?`,[queryData.id], function(error2, topic) {
				if (error2) {
					throw error2;
				}
				db.query(`SELECT * FROM author`, function(error2, authors) {
					var list = template.list(topics);
					var html = template.HTML(topic[0].title, list,
						`
						<form action="/update_process" method="post">
							<input type="hidden" name="id" value="${topic[0].id}">
							<p><input type ="text" name="title" placeholder="title" value="${topic[0].title}"></p>
							<p>
								<textarea name="description" placeholder="description">${topic[0].description}</textarea>
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

	// 업데이트 작업
	else if(pathname === '/update_process') { 
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

	// 삭제
	else if(pathname === '/delete_process') { 
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

	// 그 외의 경로로 접속했을 때 - 에러
	else {
		response.writeHead(404); // 404 : 파일을 찾을 수 없다.
		response.end('Not found');
	}
	
});
app.listen(3000);