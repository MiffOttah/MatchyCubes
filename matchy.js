"use strict";
var Matchy = {};

Matchy.MAXCOLORS = 5;
Matchy.GRIDSIZE = 14;
Matchy.CssColors = ['red', 'blue', 'yellow', 'green', 'purple'];
Matchy.BuzzCountdown = 0;

$(window).on('load', function(){
    $('#loading').hide();

    Matchy.Score = 0;
    Matchy.Animating = true;
    Matchy.GameTable = $('<table></table>').appendTo('main');
    Matchy.Grid = [];
    Matchy.GridTDs = [];

    for (var i = 0; i < Matchy.GRIDSIZE; i++){
        Matchy.Grid[i] = [];
        Matchy.GridTDs[i] = [];
        var tr = $('<tr></tr>').appendTo(Matchy.GameTable);

        for (var j = 0; j < Matchy.GRIDSIZE; j++){
            Matchy.Grid[i][j] = -1;
            var td = $('<td></td>').appendTo(tr);
            td.attr('data-row', i).attr('data-col', j);
            Matchy.GridTDs[i][j] = td;
            td.click(Matchy.ClickTD);
        }
    }

    var scoreH2 = $('<h2>Score: </h2>').appendTo('main');
    Matchy.ScoreB = $('<b>0</b>').appendTo(scoreH2);

    Matchy.FallBlocks();
});


Matchy.FallBlocks = function(){
    var didAnything = false;

    for (var i = (Matchy.GRIDSIZE - 1); i >= 0; i--){
        for (var j = 0; j < Matchy.GRIDSIZE; j++){
            if (Matchy.Grid[i][j] === -1){
                if (i === 0){
                    Matchy.Grid[i][j] = Math.floor(Math.random() * Matchy.MAXCOLORS);
                } else {
                    Matchy.Grid[i][j] = Matchy.Grid[i - 1][j];
                    Matchy.Grid[i - 1][j] = -1;
                }
                didAnything = true;
            }
        }
    }

    if (didAnything){
        window.setTimeout(Matchy.FallBlocks, 100);
        Matchy.Animating = true;
    } else {
        Matchy.Animating = false;
    }

    Matchy.Paint();
};

Matchy.Paint = function(){
    for (var i = 0; i < Matchy.GRIDSIZE; i++){
        for (var j = 0; j < Matchy.GRIDSIZE; j++){
            if (Matchy.Grid[i][j] === -1){
                Matchy.GridTDs[i][j].css('background-color', 'transparent');
            } else {
                Matchy.GridTDs[i][j].css('background-color', Matchy.CssColors[Matchy.Grid[i][j]]);
            }
        }
    }

    Matchy.ScoreB.text(Matchy.Score);

    Matchy.GameTable.toggleClass('anim', Matchy.Animating);
};

Matchy.ClickTD = function(){
    var row = parseInt($(this).attr('data-row'));
    var col = parseInt($(this).attr('data-col'));

    if (!Matchy.Animating){
        var fades = [];
        Matchy.FindFades(fades, row, col, Matchy.Grid[row][col]);

        if (fades.length > 1){
            
            for (var i in fades){
                var fRow = fades[i] >> 8;
                var fCol = fades[i] & 255;
                Matchy.Grid[fRow][fCol] = -1;
            }

            Matchy.Score += fades.length * (fades.length - 2);

            Matchy.FallBlocks();
        } else {
            Matchy.Buzz(row, col);
        }
    }
};

Matchy.FindFades = function(fades, row, col, color){
    if (row < 0 || col < 0 || row >= Matchy.GRIDSIZE || col >= Matchy.GRIDSIZE) return;

    var uid = row << 8 | col;
    if (Matchy.Grid[row][col] !== color) return;
    if (fades.indexOf(uid) >= 0) return;

    fades.push(uid);

    Matchy.FindFades(fades, row - 1, col, color);
    Matchy.FindFades(fades, row + 1, col, color);
    Matchy.FindFades(fades, row, col - 1, color);
    Matchy.FindFades(fades, row, col + 1, color);
};

Matchy.Buzz = function(row, col){
    if (!Matchy.Animating){
        Matchy.Animating = true;
        Matchy.BuzzCountdown = 6;
    }

    if (Matchy.BuzzCountdown-- > 0){
        var x = Math.floor(Math.random() * 7) - 3;
        var y = Math.floor(Math.random() * 7) - 3;
        Matchy.GridTDs[row][col].css('transform', 'translate(' + x + 'px, ' + y + 'px)');

        window.setTimeout(function(){ Matchy.Buzz(row, col); }, 100);
    } else {
        Matchy.GridTDs[row][col].css('transform', 'translate(0, 0)');
        Matchy.Animating = false;
    }

    Matchy.Paint();
}
