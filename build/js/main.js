$(document).ready(function() {
  
  // Load data into IndexDB
  initDB()


  // If they change the value in the input get new words
  $("#number").on('change paste input', function(){
    populateEncoding($(this).val())
  })

  // Toggle the navigation visibility
  $("nav h1").click(function() {
    $('nav').toggleClass('active')
    if (!$("nav").hasClass('active')) {
      gtag('event', 'Nav');
    }
  })

})

// This processes the input when it is changed
var debouncedKeys = debounce(function() {

  // Get the current value
  let text = $("#number").val();

  // If it's anything other than nothing, add a loading
  // class to the body, that we'll remove when we're done loading
  if (text) {
    $("body").addClass('loading')
  }

  // SetTimeout so the user can keep entering numbers
  setTimeout(function(){
    populateWords(text);
    gtag('event', 'Lookup', {'value' : text.length });
  });

}, 250);

// Add our function to input, paste, and delete
window.addEventListener('input', debouncedKeys);
window.addEventListener('paste', debouncedKeys);
window.addEventListener('delete', debouncedKeys);


function initDB() {
// Make an indexeddb database and load it up
// with words.csv so we can query it from there
// instead loading the file into memory everytime

  alasql.options.cache = true;
  alasql('CREATE INDEXEDDB DATABASE IF NOT EXISTS words;\
        ATTACH INDEXEDDB DATABASE words; \
        DROP TABLE IF EXISTS words; \
        CREATE TABLE words(word, number, length); \
        SELECT * INTO words FROM CSV("/words.csv")');
}

function populateWords(number) {
  // Take a number and add all the HTML with
  // all the matching words to the page

  // Clear out the word list
  $("#words").html("")

  // Map the number to encoded sounds
  populateEncoding(number)

  // Get all the number bits
  var allNumbers = numberSpreader(number)

  // For each of our number bits...
  for (var i = 0, len = allNumbers.length; i < len; i += 1) {

    // Get the sub-number and its offset
    var thisNumber = allNumbers[i].spreadNumber
    var thisOffset = allNumbers[i].offset

    // Add 'z' to the query becaus Alasql sucks at handling numbers
    // that are actually strings, so I put a `z` in front of all the 
    // numbers in the DB and now it works.
    var queryNumber = "z" + thisNumber

    // Build the query
    // Pass in the number we've encoded and 
    var query = 'SELECT word,number,length,'+ thisOffset +' AS targetOffset FROM words WHERE number="' + queryNumber + '" LIMIT 16'

    // Get word, the number (cast as a string so it includes the leading zeros),
    // The expected length, our input number, and the offset (this is for ease of piecing things together later)
    // From the word list stored in IndexedDB where the number matches what we're looking for
    alasql([query])
    .then(function(res){

      for (i = 0; i < res[0].length; i++) { 

        // Add an <li> to the word list
        $("#words").append("<li onClick='toggleSelected(this)' data-offset="+res[0][i].targetOffset+" data-encoded='"+ res[0][i].length +"' class='span-"+ res[0][i].length +" offset-"+ res[0][i].targetOffset +"'>" + res[0][i].word + "</li>")

        // If this is the last word in the set of results
        if( i == (res[0].length - 1)) { 

          // Sort the list
          sortList()
          $("body").removeClass('loading')

          // If there are 16 results, we'll assume there are more
          if (i == 15) {
            $("#words").append("<li onClick='addWords(this)' data-offset="+res[0][i].targetOffset+" data-value="+ res[0][i].number.replace("z", "") +" data-encoded='"+ (res[0][i].length) +"' class='more span-"+ res[0][i].length +" offset-"+ res[0][i].targetOffset +"'>more</li>")
          }
        }
      }
    }).catch(function(err){
      // Or whoops
      console.log('Error:', err);
    });
  }
}

function addWords(target) {
  // Shows the rest of the words when some aren't displayed

  // Get the class/offset combination we're dealing with
  // Then add a `remove` class to all the original results
  var classes = $(target).attr('class')
    classes = classes.replace("more ", "");
    var targetClasses = "." + classes.replace(" ", ".");
    $(targetClasses).addClass("remove")

  // Get the number and offset
  var thisNumber = "z" + $(target).data('value')
  var thisOffset = $(target).data('offset')

  // Build the query
  var query = 'SELECT word,number,length, '+ thisOffset +' AS targetOffset FROM words WHERE number="' + thisNumber + '";'

  // Look up all the results for this number
  alasql([query])
      .then(function(res){

        for (i = 0; i < res[0].length; i++) { 
          // Add an <li> to the word list
          $("#words").append("<li onClick='toggleSelected(this)' data-offset="+res[0][i].targetOffset+" data-encoded='"+ res[0][i].length +"' class='span-"+ res[0][i].length +" offset-"+ res[0][i].targetOffset +"'>" + res[0][i].word + "</li>")
        }
        // Then sort the list after adding the new items
        sortList()
      }).catch(function(err){
        // Or whoops
        console.log('Error:', err);
      });

  // Remove all the original results flagged for removal
  $(".remove").remove()

  // Log event in GA
  tag('event', 'More');
}

function sortList() {
  // Sorts the word list first by digits encoded
  // then by postiion in the overall number

  var wordList = $("#words li");

  // THE HEAT OF THE MEAT!
  wordList.sort(function(a,b) {
    if ($(b).attr("data-encoded") == $(a).attr("data-encoded")) {
      // If they're the same number of digits sort by position (i.e., offset)
      return $(a).attr("data-offset")-$(b).attr("data-offset")
    } else {
      // Otherwise sort by how many digits the word covers (i.e., digits encoded)
      return $(b).attr("data-encoded")-$(a).attr("data-encoded")
    }
  })

  // Now replace the word list with our updated HMTL
  $("#words").html(wordList);
}


function toggleSelected(e) {
  // Adds and removes the `selected` class
  // which highlights and pins the word

  $(e).toggleClass('selected')
  tag('event', 'Select', {'value' : $(e).html() });
}


function populateEncoding(number) {
  // Update encoded letters under the input
  // to reflect the value of the input number

  // Clear out what's in the encoded letters right now
  $("#encoded").html('')

  var output = []
  var sNumber = number.toString() || '12345678901';

  for (var i = 0, len = sNumber.length; i < len; i += 1) {
      // Slice up the number into individual digits
      // And add an <li> with the encoded equivalent

      output.push(+sNumber.charAt(i));
      $("#encoded").append('<li>'+ encodeNumber( sNumber.charAt(i) ) +'</li>')
  }
}


function numberSpreader(number) {
  // Turn our main number into an array of all its sub-numbers
  // and their respective offsets
  // Eg: 123 -> [[123,0],[12,0],[23,1],[1,0],[2,1],[3,2]]

  var fullNumber = number.toString();
  var counter = fullNumber.length;
  var output = [];

  while (counter > 0) {
    // If we've still got digits left on the counter
    // run this loop again

    var subNumber = fullNumber;
    var subCounter = 0;

    while (subCounter <= (fullNumber.length - counter)) {
      // Add the sub-number (i.e. spreadNumber) and how many places
      // it is from the start of the full number (i.e. offset) to the results
      output.push({'spreadNumber': (fullNumber.substr(subCounter,counter)), 'offset': subCounter})
      subCounter++;
    }

    counter--;
  }

  return output;
}

function encodeNumber(number) {
  // Major system encode the number into
  // its primary encoding

  switch(number) {
    case '0':
      return 'S';
      break;
    case '1':
      return 'T';
      break;
    case '2':
      return 'N';
      break;
    case '3':
      return 'M';
      break;
    case '4':
      return 'R';
      break;
    case '5':
      return 'L';
      break;
    case '6':
      return 'J';
      break;
    case '7':
      return 'K';
      break;
    case '8':
      return 'F';
      break;
    case '9':
      return 'P';
      break;
    default:
      return 'Error: supply number 0-9'
  }
}

// FROM https://davidwalsh.name/javascript-debounce-function
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};