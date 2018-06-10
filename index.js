#!/usr/bin/env nodei --harmony

var co = require('co');
var prompt = require('co-prompt');
var program = require('commander');
var request = require('superagent');

program
  .arguments("<file>")
  .option("-u username <username>", "The user to authenticate as")
  .option("-p password <password>", "The user's password")
  .action(function(file) {
    co(function *() {
      var username = yield prompt("username:");
      var password = yield prompt.password("password:");
      request
        .post('https://api.bitbucket.org/2.0/snippets/')
        .auth(username, password)
        .attach('file', file)
        .set('accept', 'application/json')
        .end(function(err,res) {
          var link = res.body.links.html.href;
          console.log('snippet created: %s', link);
        });
    });  
  })
  .parse(process.argv);

