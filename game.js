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
                if (Math.random() < 0.5)
                    levels[i].tiles[y][x] = "g"
                else
                    levels[i].tiles[y][x] = "-"
                var tile = levels[i].tiles[y][x];
				if (tile == " ")
				{
					levels[i].tiles[y].splice(x, 1);
				}
                else if (tile != "-")
                {
                    levels[i].entities[tile] = new Entity("assets/" + tile + ".png");
                }
			}
		}
	}

    levels[0].entities.big = new Entity(null, 0, 0);

    for (var i=0; i<10; i++)
    {

        var pixelsPerSec = 1000;
        var speed = pixelsPerSec / 1000.0;

        levels[0].entities[i] = new Entity("assets/hero.png",
            levelWidth() * tileSize * Math.random(), levelHeight() * tileSize * Math.random(),
            AIUpdate, "swarm", speed);

    }

    controlled = levels[0].entities[0];

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

	lastTime = totalTime;

    if (key("A"))
    {
        controlled.x -= controlled.speed * delta;
    }
    if (key("E"))
    {
        controlled.x += controlled.speed * delta;
    }
    if (key("O"))
    {
        controlled.y += controlled.speed * delta;
    }
    if (keys[188])
    {
        controlled.y -= controlled.speed * delta;
    }

    everyEntity(function(e){
        if (typeof e.update != "undefined")
        {
            e.update(e, delta);
        }
    });


    var totalX = 0;
    var totalY = 0;
    var count = 0;

    everyEntity(function(e){
        if (typeof e.x != "undefined" && typeof e.y != "undefined" &&
            typeof e.image != "undefined" && e.image.complete)
        {
            totalX += e.x + e.image.width / 2;
            totalY += e.y + e.image.height / 2;
            count += 1;
        }
    });

    var weight = 7;
    totalX += controlled.x * count * weight;
    totalY += controlled.y * count * weight;
    count += count * weight;

    totalX /= count;
    totalY /= count;

    camera.x = totalX - container.width / 2;
    camera.y = totalY - container.height / 2;

	render(delta);

}

function AIUpdate(self, delta)
{

    if (self != controlled)
    {
        self.x += self.speed * delta * (self.x < levels[level].entities.big.x ? 1 : -1);
        self.y += self.speed * delta * (self.y < levels[level].entities.big.y ? 1 : -1);
    }

}


// @license-end
