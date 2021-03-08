// Last Modification : 2021.03.08
// by HYOSITIVE
// based on Opentutorials - Node.js & MySQL - 14

var db = require('./db');
var template = require('./template.js');
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