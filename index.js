#!/usr/bin/env node 

var fs = require('fs');
var co = require('co');
var prompt = require('co-prompt');
var program = require('commander');
var request = require('superagent');
var progress = require('progress');
var chalk = require('chalk');

program
  .arguments("<file>")
  .option("-u username <username>", "The user to authenticate as")
  .option("-p password <password>", "The user's password")
  .action(function(file) {
    co(function *() {
      var username = yield prompt("username:");
      var password = yield prompt.password("password:");

      var fileSize = fs.statSync(file).size;
      var fileStream = fs.createReadStream(file);
      var barOpts = {
        width:20,
        total: fileSize,
        clear: true
      };
      var bar = new progress('uploading [:bar] :percent :etas', barOpts);

      fileStream.on('data', function(chunk) {
        bar.tick(chunk.length);
      });

      request
        .post('https://api.bitbucket.org/2.0/snippets/')
        .auth(username, password)
        .attach('file', fileStream)
        .set('accept', 'application/json')
        .end(function(err,res) {
          if(!err && res) {
            var link = res.body.links.html.href;
            console.log(chalk.bold.cyan('snippet created:') + link);
            process.exit(0);
          }
          var errorMessage;
          if(res && res.status === 401) {
            errorMessage = "Authentication failed! Bad username/password?";
          } else {
            errorMessage = res.text;
          }
          console.log(chalk.red(errorMessage));
          process.exit(1);
        });
    });  
  })
  .parse(process.argv);

