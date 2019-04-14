$(document).ready(function() {


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
