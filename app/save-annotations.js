var jsdom = require('jsdom');
const fs = require('fs');


var saveRASH = function(htmlFilePath, annotationsData, callback) {
  fs.readFile(htmlFilePath, 'utf8', function(error, html) {
    if( error ){
      // The file is not in the provided dataset
      error.message = "No such file found";
      callback( error, null );
    } else {
      // Create the DOM from the read html file
      jsdom.env(html, [], function (errors, window) {
        // JQuery
        var $ = require('jquery')(window);

        // List of tags "script"
        var head = $('head');
        head.append("<script type='application/ld+json'>"+ JSON.stringify(annotationsData.annotations, null, 4)+"</script>");

        var body = $('body');
        body.html(annotationsData.article);

        // Text inside the body
        // var body =  window.document.getElementsByTagName("body")[0].outerHTML;
        // console.log(window.document.documentElement.outerHTML);

        fs.writeFile(htmlFilePath, window.document.documentElement.outerHTML, function (error){
            if (error){
              throw error
            }else{
              callback(null, true);
            }

        });

        //returnObject.file = window.document.documentElement.outerHTML;
      });
    }
  });
};

var saveDecision = function(htmlFilePath, annotationsData, callback) {
  fs.readFile(htmlFilePath, 'utf8', function(error, html) {
    if( error ){
      // The file is not in the provided dataset
      error.message = "No such file found";
      callback( error, null );
    } else {
      // Create the DOM from the read html file
      jsdom.env(html, [], function (errors, window) {
        // JQuery
        var $ = require('jquery')(window);

        // List of tags "script"
        var head = $('head');
        head.append("<script type='application/ld+json'>"+ JSON.stringify(annotationsData.decision, null, 4)+"</script>");

        // Text inside the body
        // var body =  window.document.getElementsByTagName("body")[0].outerHTML;
        // console.log(window.document.documentElement.outerHTML);

        fs.writeFile(htmlFilePath, window.document.documentElement.outerHTML, function (error){
            if (error){
              throw error
            }else{
              callback(null, true);
            }

        });

        //returnObject.file = window.document.documentElement.outerHTML;
      });
    }
  });
};

module.exports.saveRASH = saveRASH;
module.exports.saveDecision = saveDecision;
