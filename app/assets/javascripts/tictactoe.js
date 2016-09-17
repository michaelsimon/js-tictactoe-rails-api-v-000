var turn = 0;
var currentGame = 0;

var attachListeners = function() {
  $('tbody').on("click", function(clicked) {
    doTurn(clicked);
  });

  $('#previous').on("click", function() {
    mostRecent();
  });

  $('#save').on("click", function() {
    saveGame();
  });

  $('#games').on("click", 'li', function() {
    var board = $(this).attr("state").split(",");
    populateBoard(board);
    currentGame = $(this).attr("data-gameid");
  });
}

var checkTie = function() {
  var tie = false
  if (turn === 9)
  {
    message('Tie game');
    resetBoard();
    turn = 0;
    saveGame(true);
    tie = true;
  }
  return tie;
}

var populateBoard = function(board) {
  $('td').each(function(index, td){
    $(td).text(board[index]);
  });
}

var currentBoard = function() {
  var state = new Array();
  var cell = $('td').each(function(index, td){
    cell = $(td.innerHTML).selector;
    state.push(cell);
  });
  return state;
}

var mostRecent = function() {
  $.get("/games", function (allGames) {
    var listGames = new String;
    $.each(allGames["games"], function(index, game){
      listGames += "<li data-gameid="+game.id+" state="+game.state+">Game " + game.id+"</li>";
    });
    $('#games').html(listGames);
  });
}

var saveGame = function(won) {
  var data = {game:{state: currentBoard()}};
  if (currentGame === 0) {
    var go = $.post("/games", data).done(function(response){
      currentGame = response.game.id;
      $('#games').append("<li data-gameid="+currentGame+">Game " + currentGame+"</li>");
      message("Game Saved.");
      if (won === true) {
        currentGame = 0;
      }
    });
  } else {
    var go = $.ajax({
      url: '/games/'+currentGame,
      type: 'PATCH',
      data: data
    }).done(function(response){
      message("Game Updated.");
    });
  }
}

var checkWinner = function() {
  var WINNING_POSITIONS = [
    ['{"x": "0", "y": "0"}','{"x": "1", "y": "0"}', '{"x": "2", "y": "0"}'],
    ['{"x": "0", "y": "1"}','{"x": "1", "y": "1"}', '{"x": "2", "y": "1"}'],
    ['{"x": "0", "y": "2"}','{"x": "1", "y": "2"}', '{"x": "2", "y": "2"}'],
    ['{"x": "0", "y": "0"}','{"x": "0", "y": "1"}', '{"x": "0", "y": "2"}'],
    ['{"x": "1", "y": "0"}','{"x": "1", "y": "1"}', '{"x": "1", "y": "2"}'],
    ['{"x": "2", "y": "0"}','{"x": "2", "y": "1"}', '{"x": "2", "y": "2"}'],
    ['{"x": "0", "y": "0"}','{"x": "1", "y": "1"}', '{"x": "2", "y": "2"}'],
    ['{"x": "2", "y": "0"}','{"x": "1", "y": "1"}', '{"x": "0", "y": "2"}']
  ];

  var win = false;
  WINNING_POSITIONS.forEach(function(combo) {
    var combo0x = JSON.parse(combo[0])["x"]
    var combo0y = JSON.parse(combo[0])["y"]

    var combo1x = JSON.parse(combo[1])["x"]
    var combo1y = JSON.parse(combo[1])["y"]

    var combo2x = JSON.parse(combo[2])["x"]
    var combo2y = JSON.parse(combo[2])["y"]
    if
    (
      (
        $('td[data-x="' + combo0x + '"][data-y="' + combo0y + '"]').html() !== '' &&
        $('td[data-x="' + combo1x + '"][data-y="' + combo1y + '"]').html() !== '' &&
        $('td[data-x="' + combo2x + '"][data-y="' + combo2y + '"]').html() !== ''
      )
      &&
      (
        ($('td[data-x="' + combo0x + '"][data-y="' + combo0y + '"]').html() === $('td[data-x="' + combo1x + '"][data-y="' + combo1y + '"]').html()) &&
        ($('td[data-x="' + combo1x + '"][data-y="' + combo1y + '"]').html() === $('td[data-x="' + combo2x + '"][data-y="' + combo2y + '"]').html())
      )
    )
    {
      message("Player " + player() + " Won!");
      saveGame(true);
      turn = 0;
      resetBoard();
      win = true;
    }
  }
);

return win;
}

var player = function() {
  if (turn % 2 === 0) {
    return 'X';
  } else {
    return 'O';
  }
}

var doTurn = function(move) {
  if (updateState(move) === true) {
    if (checkWinner() === false) {
      turn +=1;
      checkTie();
    }
  }
}

var updateState = function(position) {
  if ($(position.target).html() === '') {
    $(position.target).html(player());
    return true;
  }
}

var resetBoard = function() {

  $('td[data-x="0"][data-y="0"]').html('');
  $('td[data-x="1"][data-y="0"]').html('');
  $('td[data-x="2"][data-y="0"]').html('');
  $('td[data-x="0"][data-y="1"]').html('');
  $('td[data-x="1"][data-y="1"]').html('');
  $('td[data-x="2"][data-y="1"]').html('');
  $('td[data-x="0"][data-y="2"]').html('');
  $('td[data-x="1"][data-y="2"]').html('');
  $('td[data-x="2"][data-y="2"]').html('');
}

var message = function(msg) {
  $("#message").text(msg);
}

$(document).ready(function() {
  attachListeners();
});
