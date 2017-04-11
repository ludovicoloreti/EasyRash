/*
 Save Annotations
 This module is responsible for handling comments and decision write on disk.
 It reades the file, create an HTML representation, add scripts inside the head and
 HTML inside the body.
*/

var jsdom = require('jsdom');
const fs = require('fs');

/*
  This function is used when it comes to save a list of annotations posted by a reviewer.
*/
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

        // Write on disk
        fs.writeFile(htmlFilePath, window.document.documentElement.outerHTML, function (error){
            if (error){
              throw error
            }else{
              callback(null, true);
            }

        });

      });
    }
  });
};

/*
  This function is used when it comes to save the decision posted by a chair.
*/
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

        // Write on disk
        fs.writeFile(htmlFilePath, window.document.documentElement.outerHTML, function (error){
            if (error){
              throw error
            }else{
              callback(null, true);
            }

        });

      });
    }
  });
};

// Export functions
module.exports.saveRASH = saveRASH;
module.exports.saveDecision = saveDecision;
