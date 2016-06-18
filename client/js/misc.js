/* Containes stuff possibly useful */

// $scope.highlight = function(e){
//   console.log("highlighting")
//
//   var text;
//   if (window.getSelection) {
//       /* get the Selection object */
//       userSelection = window.getSelection()
//
//       /* get the innerText (without the tags) */
//       text = userSelection.toString();
//
//       /* Creating Range object based on the userSelection object */
//       var rangeObject = getRangeObject(userSelection);
//
//       /*
//          This extracts the contents from the DOM literally, inclusive of the tags.
//          The content extracted also disappears from the DOM
//       */
//       contents = rangeObject.extractContents();
//
//       var span = document.createElement("span");
//       span.className = "highlight";
//       span.appendChild(contents);
//
//       /* Insert your new span element in the same position from where the selected text was extracted */
//       rangeObject.insertNode(span);
//
//   } else if (document.selection && document.selection.type != "Control") {
//           text = document.selection.createRange().text;
//   }
// };

// function getRangeObject(selectionObject){
//   try{
//     if(selectionObject.getRangeAt)
//     return selectionObject.getRangeAt(0);
//   }
//   catch(ex){
//     console.log(ex);
//   }
// }
