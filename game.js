// @license magnet:?xt=urn:btih:0effb8f70b3b6f5f70ff270deftileHeight27c3f7705f85&dn=lgpl-3.0.txt General GNU Public License 3.0
// Inserts game into <canvas id="game"></canvas>

// Global Variables

var container;
var game;

var sounds = {};

var keys = new Array(256);
var mouse = { x:0, y:0, button:0, active:false };

var lastTime = 0;

var levels;
var level = 0;
var levelWorlds = [];

var camera = { x: 0, y : 0, old : [], lastQuadX : 1, lastQuadY : 1 };

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
	game.fillStyle = "#FFF"

	window.requestAnimationFrame(update);

	return true;

}

function initializeWorld()
{

	levels = [

		{

			tiles : [
				"[ r r r r r r r r r r r r r r r ]",
				"c f g f f f f g f f f f l l f f c",
				"c f g f l f f f f g f f f l g f c",
				"c f f f g f f l f f g l f f f f c",
				"c f f f f f f l l f f g l f g l c",
				"c f l f f f g f f f f f g f f f c",
				"c f l f f f g f f f f f g f f f c",
				"c g l f g l f g l g g f f f l f c",
				"c f l f g f f f l f f f f g f f c",
				"c f f f g f f f l f f f l f f f c",
				"{ r r r r r r r r r r r r r r r }"
			],
			entities : new Object()

		},

		{

			tiles : [],
			entities : {

			}

		}

	];

	for (var i=0; i<levels.length; i++)
	{
		for (var y=0; y<levels[i].tiles.length; y++)
		{
			levels[i].tiles[y] = (levels[i].tiles[y]).split("");
			for (var x=0; x<levels[i].tiles[y].length; x++)
			{
                var tile = levels[i].tiles[y][x];
				if (tile == " ")
				{
					levels[i].tiles[y].splice(x, 1);
					x -= 1;
				}
                else if (tile != "-")
                {
                    levels[i].entities[tile] = new Entity("assets/" + tile + ".png");
                }
			}
		}
	}

	var acc = 5000;
	var mil = 1000;
	var speed = acc / mil / mil;
	var resistance = 0.99
    var big = new Entity("assets/big.png", 0, 0, updateBig, "big", "big", speed, resistance);
	big.aggressive = true;
	big.maxHealth = 700;
	big.health = big.maxHealth;
	big.spawnSafe();
	levels[0].entities.big = big;

    for (var i=0; i<20; i++)
    {

		var acc = 6000;
		var speed = acc / mil / mil;
		var resistance = 0.9925;

		e = new Entity("assets/swarm.png", 0, 0, updateAI, "enemy", "swarm", speed, resistance);
		e.aggressive = true;
		e.maxHealth = 5;
		e.health = e.maxHealth;
		e.key = i;

		e.spawnSafe();

		levels[0].entities[i] = e;

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

	var x = controlled.x;
	var y = controlled.y;

    if (key("A"))
    {
        controlled.xVel -= controlled.speed * delta;
    }
    if (key("D") || key("E"))
    {
        controlled.xVel += controlled.speed * delta;
    }
    if (key("S") || key("O"))
    {
        controlled.yVel += controlled.speed * delta;
    }
    if (key("W") || keys[188])
    {
        controlled.yVel -= controlled.speed * delta;
    }

	controlled.xVel *= Math.pow(controlled.resistance, delta);
	controlled.yVel *= Math.pow(controlled.resistance, delta);

	x += controlled.xVel * delta;
	y += controlled.yVel * delta;

	if (mouse.active)
	{

		knockback = shoot(controlled, mouse.x + camera.x, mouse.y + camera.y, "enemy", 1, 4, 1, 1, 100);

		x += knockback[0];
		y += knockback[1];

	}
	if (typeof controlled.cool == "undefined")
	{
		controlled.cool = 0;
	}
	controlled.cool -= delta;

	controlled.handleCollisions(x, y, ["g", "c", "r"]);

	if (controlled.health <= 0)
	{
		delete levels[level].entities[controlled.key];
		for (var k in levels[level].entities)
		{
			if (levels[level].entities.hasOwnProperty(k))
			{
				var e = levels[level].entities[k];
				if (e.type == "enemy" && e.name != "bullet" && e.health > 0)
				{
					controlled = e;
					break;
				}
			}
		}
		if (controlled.health < 0)
		{
			window.location.href = "lose"
		}
	}

	if (controlled.collideTile(controlled.x, controlled.y, ["l"]))
	{
		controlled.health -= 0.01 * delta;
	}

    everyEntity(function(e){
        if (typeof e.update != "undefined")
        {
            e.update(e, delta);
			e.keepInScreen();
			if (typeof e.health != "undefined")
			{
				e.alpha = e.health / e.maxHealth * 0.8 + 0.2;
			}
        }
    });

	updateCamera(delta);

	render(delta);

}

function updateAI(self, delta)
{

    if (self != controlled)
    {

		if (Math.random() < 0.01)
		{
			self.aggressive = !self.aggressive;
		}

		var big = levels[level].entities.big;

		var xDist = self.x - big.x;
		var yDist = self.y - big.y;

		var close = 256;

		var variation = 0.02;

		self.xVel += (self.speed * (xDist < 0 ? 1 : -1) * (self.aggressive ? 1 : -1) + (Math.random() - 0.5) * variation) * delta;
    	self.yVel += (self.speed * (yDist < 0 ? 1 : -1) * (self.aggressive ? 1 : -1) + (Math.random() - 0.5) * variation) * delta;

		self.xVel *= Math.pow(self.resistance, delta);
		self.yVel *= Math.pow(self.resistance, delta);

		var x = self.x;
		var y = self.y;
		x += self.xVel * delta;
		y += self.yVel * delta;

		if (self.aggressive)
		{
			shoot(self, big.x, big.y, "enemy", 1, 4, 1, 1, 100);
		}
		if (typeof self.cool == "undefined")
		{
			self.cool = 0;
		}
		self.cool -= delta;

		collides = ["g", "c", "r", "l"]
		if (Math.random() < 0.005)
		{
			collides = ["g", "c", "r"]
		}
		if (self.collideTile(self.x, self.y, ["l"]))
		{
			collides = ["g", "c", "r"]
			self.health -= 0.1 * delta;
		}
		self.handleCollisions(x, y, collides);

		if (self.health <= 0)
		{
			delete levels[level].entities[self.key];
		}

    }

}


function updateBig(self, delta)
{

	if (Math.random() < 0.01)
	{
		self.aggressive = !self.aggressive;
	}

	var center = averageEntity(2, "enemy");

	self.xVel += (self.x < center[0] ? -1 : 1) * (self.aggressive ? -1 : 1) * self.speed * delta;
	self.yVel += (self.y < center[1] ? -1 : 1) * (self.aggressive ? -1 : 1) * self.speed * delta;

	self.xVel *= Math.pow(self.resistance, delta);
	self.yVel *= Math.pow(self.resistance, delta);

	var x = self.x;
	var y = self.y;

	if (self.aggressive)
	{
		if (Math.random() < 0.75)
		{

			var dX = center[0];
			var dY = center[1];

			if (Math.random() < 0.6)
			{

				var target;
				var count = 0;
				for (var e in levels[level].entities)
				{
					if (Math.random() < 1/++count*(e == controlled ? 5 : 1))
					{
						target = e;
					}
				}
				dX = target.x;
				dY = target.y;

			}

			knockback = shoot(self, center[0], center[1], "big", 1, 4, 1, 5, 150);
			x += knockback[0];
			y += knockback[1];

		}
	}
	if (typeof self.cool == "undefined")
	{
		self.cool = 0;
	}
	self.cool -= delta;

	x += self.xVel * delta;
	y += self.yVel * delta;

	collides = ["g", "c", "r", "l"]
	if (Math.random() < 0.01)
	{
		collides = ["g", "c", "r"]
	}
	if (self.collideTile(self.x, self.y, ["l"]))
	{
		collides = ["g", "c", "r"]
		self.health -= 0.1 * delta;
	}
	if (self.handleCollisions(x, y, collides))
	{
		if (Math.random() < 0.1)
		{
			self.aggressive = true;
		}
	}

	if (self.health <= 0)
	{
		self.alpha = 0;
		window.location.href = "win";
	}

}

function updateBullet(self, delta)
{

	self.x += self.xVel * delta;
	self.y += self.yVel * delta;
	self.power *= Math.pow(self.resistance, delta);
	self.alpha = self.power / self.maxPower;

	if (self.alpha <= 0 || self.collideTile(self.x, self.y, ["g", "c", "r"]))
	{
		delete levels[level].entities[self.key];
	}

	var other = "enemy"
	if (self.type == "enemy")
	{
		other = "big";
	}

	other = self.collideWorld(self.x, self.y, [other]);

	if (other)
	{

		other.health -= self.power;
		if (Math.random() < 0.5)
		{
			other.aggressive = false;
		}

		delete levels[level].entities[self.key];

	}

}

function shoot(entity, towardsX, towardsY, type, speed, accuracy, knockback, power, cool)
{

	if (entity.cool <= 0)
	{

		var startX = entity.x + entity.image.width / 2;
		var startY = entity.y + entity.image.height / 2;

		var dX = (towardsX - startX);
		var dY = (towardsY - startY);
		var length = Math.sqrt(dX*dX + dY*dY) / speed;
		dX /= length;
		dY /= length;
		dX += (Math.random() - 0.5) / accuracy;
		dY += (Math.random() - 0.5) / accuracy;

		var image = "assets/bullet.png";
		if (type == "big")
		{
			image = "assets/big-bullet.png";
		}
		var bullet = new Entity(image, startX, startY, updateBullet, type, "bullet", 0, 0.996, dX, dY);
		bullet.maxPower = power;
		bullet.power = bullet.maxPower;
		var key = Math.random();
		bullet.key = key;
		levels[level].entities[key] = bullet;
		entity.cool = cool;

		return [-1 * dX * knockback * delta, -1 * dY * knockback * delta];

	}

	return [0, 0];

}


// @license-end
