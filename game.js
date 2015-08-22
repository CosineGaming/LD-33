// Inserts game into <canvas id="game"></canvas>
// @license magnet:?xt=urn:btih:0effb8f70b3b6f5f70ff270deftileHeight27c3f7705f85&dn=lgpl-3.0.txt Lesser GNU Public License 3.0

// Global Variables

var container;
var game;

var sounds = {};

var keys = new Array(256);

var lastTime = 0;

var levels;
var level = 0;
var levelWorlds = [];

var camera = { x: 0, y : 0 };

var tileSize = 128;

// var lastSpace = false;
var resizeTimer = false;

var controlled;

// Entry point

window.onload = initialize;

// Fundamental Functions

function initialize()
{

	container = document.getElementById("game");
	if (!container.getContext || !container.getContext("2d"))
	{
		unsupported();
		return false;
	}
	game = container.getContext("2d");

	container.setAttribute("tabindex", "0");
	container.focus();
	container.addEventListener("mousedown", mouseDown);
	container.addEventListener("mouseup", mouseUp);
	container.addEventListener("contextmenu", function(event){event.preventDefault();});
	container.addEventListener("mousemove", mouseMove);
	container.addEventListener("keydown", keyDown);
	container.addEventListener("keyup", keyUp);

	initializeWorld();

	resizeWindow();
	window.onresize = resizeWindowCallback;

	game.font = "20px white Candara";
	game.fillStyle = "#000"

	window.requestAnimationFrame(update);

	return true;

}

function initializeWorld()
{

	levels = [

		{
			tiles : [
				"- - - - - - - - - - - - - - - - - -",
				"- - - - - - - - - - - - - - - - - -",
				"- - - - - - - i - - - - - - - - - -",
				"- g - t - - - - - - - - - - - - - -",
				"- - - m - - i - - - - - i - - - - -",
				"- i - b - - i - - - - - i - - - - i",
				"- - - - - - - - - - - - - i - - - -",
				"- - - - - - - - - - - - - - i - - -",
				"- - i - - - - - - - - - - - - t - -",
				"- - - - - - - - - l h r - - - m - -",
				"- - - - - - - - - - - - - - - m - -",
				"- - - - - - i - - - - - - - - m - -",
				"- - - - - - - - - i - - - - - b - -",
				"- - - - - - - i - - - - - - - - - -",
				"- - i - - - - - i - - - - - - - - -",
				"- - - - - - i - - - - - - - - i - -",
				"- - - l h h h r - - - - - - - - - -",
				"- - - - - - - - - - - - - - - - - -"
			],
			entities : new Object()
		}

	];

	for (var i=0; i<levels.length; i++)
	{
		for (var y=0; y<levels[i].tiles.length; y++)
		{
			levels[i].tiles[y] = (levels[i].tiles[y]).split("");
			for (var x=0; x<levels[i].tiles[y].length; x++)
			{
				if (levels[i].tiles[y][x] == " ")
				{
					levels[i].tiles[y].splice(x, 1);
					if (Math.random() < 0.5)
						levels[i].tiles[y][x] = "g"
					else
						levels[i].tiles[y][x] = "-"
				}
			}
		}
	}

    levels[0].entities["player"] = new Entity("assets/hero.png", 0, 0, "player", "player");
    levels[0].entities["g"] = new Entity("assets/tile.png");

    controlled = levels[0].entities["player"];

}

function render(updateTime)
{

	if ("game" in window)
	{
		game.clearRect(0, 0, container.width, container.height);
	}
	else
	{
		// We can't render if we don't have a game.
		return;
	}

	// levels[level].background.render();

	for (var y=0; y<levels[level].tiles.length; y++)
	{
		for (var x=0; x<levels[level].tiles[y].length; x++)
		{
			renderTile(x, y);
		}
	}

	everyEntity(function(entity){entity.render();});

	var displayFps = true;

	if (displayFps)
	{
		game.fillText(String(Math.round(updateTime)), 20, 20);
	}

}

function update(totalTime)
{

	window.requestAnimationFrame(update);

	delta = totalTime - lastTime;

    if (key("A"))
    {
        controlled.x -= 1 * delta;
    }
    if (key("E"))
    {
        controlled.x += 1 * delta;
    }
    if (key("O"))
    {
        controlled.y += 1 * delta;
    }
    if (keys[188])
    {
        controlled.y -= 1 * delta;
    }

    var totalX = 0;
    var totalY = 0;
    var count = 0;

    everyEntity(function(e){
        if (typeof e.x != "undefined" && typeof e.y != "undefined")
        {
            totalX += e.x;
            totalY += e.y;
            count += 1;
        }
    });

    totalX /= count;
    totalY /= count;

    camera.x = totalX - container.width / 2;
    camera.y = totalY - container.height / 2;


	render(delta);

	lastTime = totalTime;

}


// @license-end
