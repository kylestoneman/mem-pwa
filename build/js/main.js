$(document).ready(function() {
  
  // Load data from cache
  initDB()

  // If they change the value in the input get new words
  $("#number").on('change keydown paste input', function(){
    getWords($(this).val());
    console.log($(this).val())
  });

  // If they hit the delete key on the page, check the words
  $('html').keyup(function(e){
      if(e.keyCode == 46) {
        getWords($("#number").val());
      }
  });

})

function initDB() {

  // Make an indexeddb database and load it up
  // with words.csv so we can query it from there
  // instead loading the file into memory everytime
  alasql('CREATE INDEXEDDB DATABASE IF NOT EXISTS words;\
        ATTACH INDEXEDDB DATABASE words; \
        DROP TABLE IF EXISTS words; \
        CREATE TABLE words(word TEXT, number VARCHAR(33), length INTEGER); \
        SELECT * INTO words FROM CSV("/words.csv")');

}

// Cache the data, I think (??)
alasql.options.cache = true;

function getWords(number) {

  // Clear out the word list
  $("#words").html("")

  // Map the number to encoded sounds
  populateEncoding(number)

  // Types are tough :(
  var stringNumber = number

  // This turns our main number into an array of all its sub-numbers
  // and their respective offsets
  // Eg: 123 -> [[123,0],[12,0],[23,1],[1,0],[2,1],[3,2]]
  var allNumbers = numberSpreader(stringNumber)

  for (var i = 0, len = allNumbers.length; i < len; i += 1) {

    var thisNumber = allNumbers[i].spreadNumber
    var thisOffset = allNumbers[i].offset

    console.log(thisNumber)

    // Get word, the number (cast as a string so it includes the leading zeros),
    // The expected length, our input number, and the offset (this is for ease of piecing things together later)
    // From the word list stored in IndexedDB where the number matches what we're looking for
    alasql(['SELECT word,number,length,'+ thisNumber +' AS targetNumber,'+ thisOffset +' AS targetOffset FROM words WHERE number='+ thisNumber.toString() + ' LIMIT 15'])
      .then(function(res){

        var counter = 0;

        for (i = 0; i < res[0].length; i++) { 

          // If the length of the word is what we're expecting, display it
          // This prevents issues with leading zeros and bad db formats
          if (res[0][i].targetNumber.toString().length == res[0][i].length) {
            $("#words").append("<li onClick='toggleSelected(this)' data-encoded='"+ res[0][i].length +"' class='span-"+ res[0][i].length +" offset-"+ res[0][i].targetOffset +"'>" + res[0][i].word + "</li>")
            counter++
          }

          // If this is the last word in the set of results
          if( i == (res[0].length - 1)) { 

            // Sort the whole list
            sortList()

            console.log(counter)

            // If there are 15 results, we'll assume there are more
            // To-do: Actually check if there are more than 15
            if (counter == 14) {
              $("#words").append("<li onClick='toggleSelected(this)' data-encoded='"+ (res[0][i].length) +"' class='more span-"+ res[0][i].length +" offset-"+ res[0][i].targetOffset +"'>+ MORE</li>")
            }

          }
        }

      }).catch(function(err){
        // Or whoops
        console.log('Error:', err);
      });

  }

}


function sortList() {
  var wordList = $("#words li");

  wordList.sort(function(a,b) {
    return $(b).attr("data-encoded")-$(a).attr("data-encoded")
  })

  $("#words").html(wordList);
}


function toggleSelected(e) {
  $(e).toggleClass('selected')
}


function populateEncoding(number) {
  var output = [],
    sNumber = number.toString();

  $("#encoded").html('')

  for (var i = 0, len = sNumber.length; i < len; i += 1) {
      output.push(+sNumber.charAt(i));
      $("#encoded").append('<li>'+ encodeNumber( sNumber.charAt(i) ) +'</li>')
  }
}


function numberSpreader(number) {
  var fullNumber = number.toString();
  var counter = fullNumber.length;
  var output = [];

  while (counter > 0) {
    var subNumber = fullNumber;
    var subCounter = 0;

    while (subCounter <= (fullNumber.length - counter)) {
      output.push({'spreadNumber': (fullNumber.substr(subCounter,counter)), 'offset': subCounter})
      subCounter++;
    }

    counter--;
  }

  return output;
}

function encodeNumber(number) {
  switch(number) {
    case '0':
      return 's';
      break;
    case '1':
      return 't';
      break;
    case '2':
      return 'n';
      break;
    case '3':
      return 'm';
      break;
    case '4':
      return 'r';
      break;
    case '5':
      return 'l';
      break;
    case '6':
      return 'j';
      break;
    case '7':
      return 'k';
      break;
    case '8':
      return 'f';
      break;
    case '9':
      return 'p';
      break;
    default:
      return 'Error: supply number 0-9'
  }
}