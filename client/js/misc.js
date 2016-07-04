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



// SELECTION


  // $scope.highlight = function() {
  //   // Get the selection
  //   var s = selection()
  //   console.log(s)
  //   // Get the anchor's parent element
  //   var dad = s.anchorNode.parentElement
  //   // var guida = s.anchorNode.substringData(s.anchorOffset,20)
  //   if (compatibleExtremes(s)) { // compatibleExtremes(s)
  //     var spanId = 'span-'+ ($('#article-container span').length+1)
  //     // Prendo l'elemento dal padre in base all'indexOf
  //     var pos = dad.childNodes.indexOf(s.anchorNode);
  //     var extremes = findExtremes(s);
  //     console.log(extremes);
  //     var n = {
  //       id: spanId,
  //       node: dad.id ? dad.id: createId(dad),
  //       pos: pos,
  //       // guide: guida,
  //       // start:   Math.max(s.anchorOffset,s.focusOffset),
  //       // end: Math.min(s.anchorOffset,s.focusOffset)
  //       start: extremes.start,
  //       end: extremes.end
  //     }
  //     insertNote(n,true)
  //   }else {
  //     var message = "Uncorrect selection";
  //     showErrors(message);
  //   }
  //
  // };
