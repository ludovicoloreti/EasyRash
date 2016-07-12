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


    // function createId(element){
    //   element.setAttribute('id', 'parent-'+count)
    //   count++;
    //   return element.getAttribute('id');
    // }

    // function insertNote(note,active) {
    //   // Creo un range
    //   var r = document.createRange()
    //   var node = $('#'+note.node)[0];
    //   // Setto il range
    //   r.setStart(node,note.start);
    //   r.setEnd(node,note.end)
    //   // Creo lo span
    //   var span = document.createElement('span')
    //   span.setAttribute('id',note.id);
    //   span.setAttribute('data-toggle', 'modal');
    //   span.setAttribute('data-target', '#comment-modal');
    //   span.setAttribute('class','highlight');
    //   // Avvolgo il range con lo span
    //   r.surroundContents(span)
    //   $compile(span)(scope);
    // }


    // // indexOf method added for range selection pourposes
    // NodeList.prototype.indexOf = function(n) {
    //   var i=-1;
    //   while (this.item(i) !== n) {i++} ;
    //   return i
    // }
    //
    // function compatibleExtremes(n) {
    //   var res = (n.anchorNode.parentElement === n.focusNode.parentElement  && n.type=='Range');
    //   console.log(res);
    //   return res;
    // }
    //
    // function findExtremes(selection){
    //   extremes = {};
    //   var selectionLength = selection.toString().length;
    //   var parentLength = selection.anchorNode.parentElement.innerText.length;
    //   extremes.start = selection.anchorOffset;
    //   extremes.end = extremes.start + selectionLength;
    //
    //   return extremes;
    //
    // }
