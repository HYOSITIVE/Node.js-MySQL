// Last Modification : 2021.03.08
// by HYOSITIVE
// based on Opentutorials - Node.js & MySQL - 18.1

var http = require('http');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var db = require('./lib/db');
var topic = require('./lib/topic');
var author = require('./lib/author');

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

	else if(pathname === '/update') { // 업데이트
		topic.update(request, response);
	}

	else if(pathname === '/update_process') { // 업데이트 작업
		topic.update_process(request, response);
	}

	else if(pathname === '/delete_process') { // 삭제
		topic.delete_process(request, response);
	}

	else if(pathname === '/author') {
		author.home(request, response);
	}

	else if(pathname === '/author/create_process') {
		author.create_process(request, response);
	}

	else if(pathname === '/author/update') {
		author.update(request, response);
	}

	else { // 그 외의 경로로 접속했을 때 - 에러
		response.writeHead(404); // 404 : 파일을 찾을 수 없다.
		response.end('Not found');
	}
});
app.listen(3000);