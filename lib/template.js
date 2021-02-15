// Last Modification : 2021.02.15
// by HYOSITIVE
// based on Opentutorials - Node.js & MySQL - 10

module.exports = {
	HTML:function(title, list, body, control) { // update 기능을 위해 control이라는 parameter 추가
		return `
		<!doctype html>
		<html>
		<head>
		  <title>WEB2 - ${title}</title>
		  <meta charset="utf-8">
		</head>
		<body>
		  <h1><a href="/">WEB</a></h1>
		  ${list}
		  ${control}
		  ${body}
		</body>
		</html>
		`;
	},
	list:function(topics) {
		// filelist를 활용해 list 자동 생성
		var list = '<ul>';
		var i = 0;
		while(i < topics.length) {
			list = list + `<li><a
			href="/?id=${topics[i].id}">${topics[i].title}</a></li>`;
			i = i + 1;
		}
		list = list + '</ul>';
		return list;
	},
	authorSelect:function(authors) {
		var tag = '';
		var i = 0;
		while(i < authors.length) {
			tag += `<option value="${authors[i].id}">${authors[i].name}</option>`
			i++;
		}
		return `
			<select name="author">
				${tag}
			</select>
			`
	}
}