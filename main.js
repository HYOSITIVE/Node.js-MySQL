// Last Modification : 2021.02.12
// by HYOSITIVE
// based on Opentutorials - Node.js & MySQL - 6

var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var mysql = require('mysql');
var db = mysql.createConnection({
	host:'localhost',
	user:'root',
	password:'111111',
	database:'opentutorials'
});
db.connect();

var app = http.createServer(function(request,response){
    var _url = request.url;
	var queryData = url.parse(_url, true).query;
	var pathname = url.parse(_url, true).pathname;
	
	// root, 즉 path가 없는 경로로 접속했을 때 - 정상 접속
	if (pathname === '/') {
		if(queryData.id === undefined) { // 메인 페이지
			// SQL문의 실행 결과가 callback function의 두 번째 인자에 저장
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
		
		else { // 컨텐츠를 선택한 경우
			db.query(`SELECT * FROM topic`, function(error, topics) {
				if (error) {
					throw error;
				}
				db.query(`SELECT * FROM topic WHERE id=?`,[queryData.id], function(error2, topic) {
					// SQL문의 ?에 두 번째 인자의 값이 들어감. 해킹으로 인한 데이터 유출 방지
					if (error2) {
						throw error2;
					}
					// topic이 배열로 return되기 때문에, 첫 번째 원소를 명시해주어야 함
					var title = topic[0].title;
					var description = topic[0].description;
					var list = template.list(topics);
					var html = template.HTML(title, list,
						`<h2>${title}</h2>${description}`,
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
	}
	// 새로운 컨텐츠 생성
	else if(pathname === '/create') { 
		db.query(`SELECT * FROM topic`, function(error, topics) {
			var title = 'Create';
			var list = template.list(topics);
			var html = template.HTML(title, list,
				`
				<form action="/create_process" method="post">
					<p><input type ="text" name="title" placeholder="title"></p>
					<p><textarea name="description" placeholder="description"></textarea></p>
					<p><input type="submit"></p>
				</form>`,
				`<a href="/create">create</a>`
				);
			response.writeHead(200);
			response.end(html);
		});
	}

	// 컨텐츠 생성 작업
	else if(pathname === '/create_process') { 
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
				[post.title, post.description, 1],
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

	// 업데이트
	else if(pathname === '/update') { 
		fs.readdir('./data', function(error, filelist) {
			var	filteredId = path.parse(queryData.id).base;			
			fs.readFile(`data/${fileteredId}`, 'utf8', function(err, description) {
				var title = queryData.id;
				var list = template.list(filelist);
				var html = template.HTML(title, list,
					/*
					form을 수정 해 update 기능 구현
					파일 이름 수정을 대비해 사용자가 수정하는 정보(원본 파일명)와 우리가 수정하고자 하는 정보(변경된 파일명)를 구분해서 전송
					HTML의 hidden type을 활용. hidden type 태그의 id에 원본 파일명 저장
					*/
					`
					<form action="/update_process" method="post">
						<input type="hidden" name="id" value="${title}">
						<p><input type ="text" name="title" placeholder="title" value="${title}"></p>
						<p>
							<textarea name="description" placeholder="description">${description}</textarea>
						</p>
						<p>
							<input type="submit">
						</p>
					</form>
					`,
					`<a href="/create">create</a> <a href="/update?id=${title}">update</a>` // home이 아닐 경우 update 기능 존재, 수정할 파일 명시 위해 id 제공
					);
				response.writeHead(200);
				response.end(html);
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
			var id = post.id;
			var title = post.title;
			var description = post.description;
			// 기존 파일명(id), 새 파일명(title)을 활용해 파일명 변경. 내용 변경을 위해 callback 함수 호출
			fs.rename(`data/${id}`, `data/${title}`, function(error) {
				fs.writeFile(`data/${title}`, description, 'utf-8', function(err) {
					response.writeHead(302, {Location: `/?id=${title}`}); // redirection
					response.end();
				});
			});
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
			var id = post.id;
			var	filteredId = path.parse(id).base;
			fs.unlink(`data/${filteredId}`, function(error) {
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