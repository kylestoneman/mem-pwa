$(document).ready(function() {

// alasql('CREATE INDEXEDDB DATABASE IF NOT EXISTS Atlas');
// alasql('ATTACH INDEXEDDB DATABASE Atlas AS MyAtlas');
// alasql('CREATE TABLE IF NOT EXISTS MyAtlas.City (word string, number number, length number)');
// alasql('SELECT * INTO MyAtlas.City FROM CSV("/words.csv") LIMIT 500');
// var res = alasql('SELECT * FROM MyAtlas.City LIMIT 5');
// console.log(res);

})

alasql.options.cache = true;

function getWords(number, limit) {

  var intNumber = parseInt(number)
  var limitStatement = limit ? ' LIMIT ' + parseInt(limit) : ''

  alasql(['SELECT * FROM CSV("/words.csv") WHERE number=' + intNumber + limitStatement])
    .then(function(res){
      $("#words").html("")
      res[0].forEach(function(word) {
        $("#words").append("<li>" + word.word + "</li>")
      })

    }).catch(function(err){
        console.log('Does the file exist? There was an error:', err);
    });
}

function getWordCount() {
  alasql(['CREATE INDEXEDDB DATABASE IF NOT EXISTS words;'])
    .then(function(res) {
      alasql(['SELECT count(word) FROM words.words GROUP BY word;'])
        .then(function(res) {
          console.log(res)
        })
        .catch(function(err){
          console.log('Does the DB Exist? ', err);
          initDB()
        });
    })
    .catch(function(err){
      console.log(err);
    });
}

function initDB() {

  $("#words").html('Initializing Database')

  alasql([`CREATE INDEXEDDB DATABASE IF NOT EXISTS words;
            ATTACH INDEXEDDB DATABASE words AS words;
            CREATE TABLE IF NOT EXISTS words.words (word string, number number, length number);`])
    .then(function(res) {
        alasql([`SELECT * INTO words.words FROM CSV("/words.csv")`])
          .then(function(res) {
            $("#words").html('Ready!')
            console.log("IMPORTED: ", res)
          })
          .catch(function(err) {
            console.log(err)
          })
    })
    .catch(function(err) {
      console.log(err)
    })

  return true;
}