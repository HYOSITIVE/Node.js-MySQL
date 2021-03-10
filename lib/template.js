// Last Modification : 2021.03.08
// by HYOSITIVE
// based on Opentutorials - Node.js & MySQL - 18.1

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
		  <a href="/author">author</a>
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
	authorSelect:function(authors, author_id) {
		var tag = '';
		var i = 0;
		while(i < authors.length) {
			var selected = '';
			if (authors[i].id === author_id) {
				selected = ' selected';
			}
			// option 태그에 selected라는 속성을 부여. HTML은 selected 속성이 있는 값을 기본적으로 선택
			tag += `<option value="${authors[i].id}"${selected}>${authors[i].name}</option>`
			i++;
		}
		return `
			<select name="author">
				${tag}
			</select>
			`
	},
	authorTable:function(authors) {
		var tag = '<table>';
		var i = 0;
		while (i < authors.length) {
			tag += `
			<tr>
				<td>${authors[i].name}</td>
				<td>${authors[i].profile}</td>
				<td><a href="/author/update?id=${authors[i].id}">update</a></td>
				<td>delete</td>
			</tr>
			`
			i++;
		}
		tag += '</table>'
		return tag;
	}
}