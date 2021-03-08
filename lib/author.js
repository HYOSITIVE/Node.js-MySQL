// Last Modification : 2021.03.08
// by HYOSITIVE
// based on Opentutorials - Node.js & MySQL - 16

var db = require('./db');
const { authorSelect } = require('./template.js');
var template = require('./template.js');

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
            `,
            `<a href="/create">create</a>`
            );
            response.writeHead(200);
            response.end(html);
        });
    });
}