

var Entity = (function()
{

	function Entity(image, x, y, updateFunc, type, name, speed, resistance, xVel, yVel)
	{

		if (typeof image != "undefined")
		{
			this.loadImage(image);
		}
		this.x = x;
		this.y = y;
        this.update = updateFunc;
		this.type = backUp(type, "none");
		this.name = backUp(name, "none");
        this.speed = speed;
		this.resistance = resistance
		this.width = 0;
		this.height = 0;

		this.xVel = backUp(xVel, 0);
		this.yVel = backUp(yVel, 0);

	}

	Entity.prototype.render = function()
	{

		if (typeof this.x != "undefined")
		{

			var draw = false;

			if (this.animation)
			{
				var frame = this.getAnimationFrame();
				if (frame)
				{
					draw = frame;
				}
			}
			else if (this.image)
			{
				if (this.image.complete)
				{
					draw = this.image;
				}
			}

			if (draw)
			{
				var alpha = backUp(this.alpha, 1);
				game.globalAlpha = alpha;
				game.drawImage(draw, this.x - camera.x, this.y - camera.y);
				game.globalAlpha = 1;
			}

		}

	};

	Entity.prototype.loadImage = function(url)
	{
		var image = new Image();
		var loadHandler = function() {
		    this.width = image.width;
		    this.height = image.height;
		}.bind(this);
		image.onload = loadHandler;
		image.src = url;
		this.image = image;
	};

	Entity.prototype.loadAnimation = function(url, count, frameMultiplier, frames, repeat, whenDone, suffix)
	{

		frameMultiplier = backUp(frameMultiplier, 1);
		repeat = backUp(repeat, true);
		suffix = backUp(suffix, ".png");

		this.animation = new Object();
		this.animation.images = [];
		for (var frame=0; frame<count; frame++)
		{
			var image = new Image();
			if (frame == 0)
			{
				var loadHandler = function() {
				    this.width = image.width;
				    this.height = image.height;
				}.bind(this);
				image.onload = loadHandler;
				this.image = image;
			}
			image.src = url + String(frame) + suffix;
			this.animation.images.push(image);
		}

		this.animation.frameMultiplier = frameMultiplier;

		if (typeof frames != "undefined")
		{
			this.animation.frames = frames;
		}
		else
		{
			this.animation.frames = [];
			for (var frame=0; frame<count; frame++)
			{
				this.animation.frames.push(frame);
			}
		}

		this.animation.repeat = repeat;
		this.animation.whenDone = whenDone;

		this.animation.countdown = this.animation.frameMultiplier;
		this.animation.frame = this.animation.frames[0];

	};

	Entity.prototype.getAnimationFrame = function()
	{

		var anime = this.animation;

		if (anime.countdown <= 0)
		{
			anime.countdown = anime.frameMultiplier;
			anime.frame += 1;
		}

		if (anime.frame >= anime.frames.length)
		{
			if (typeof "whenDone" == "function")
			{
				anime.whenDone(anime);
			}
			anime.frame = anime.frames.length - 1;
			if (typeof anime.repeat != "undefined")
			{
				if (anime.repeat)
				{
					anime.frame = 0;
				}
			}
		}

		var frame = anime.images[anime.frames[anime.frame]];
		if (typeof frame != "undefined")
		{
			if (frame.complete)
			{
				return frame;
			}
		}

		return false;

	};

	Entity.prototype.collideTile = function(x, y, types)
	{

		var eX = backUp(x, this.x);
		var eY = backUp(y, this.y);

		var topLeft = tilePos(eX, eY);
		var bottomRight = topLeft;
		if (typeof this.width != "undefined")
		{
			var bottomRight = tilePos(eX + this.width, eY + this.height);
		}

		for (var x=topLeft[0]; x<=bottomRight[0]; x++)
		{
			for (var y=topLeft[1]; y<=bottomRight[1]; y++)
			{
				var tile = getTile([x, y]);
				if (tile != "-")
				{
					if (typeof types == "undefined" || types.indexOf(tile) != -1)
					{
						return new Entity(undefined, x, y, undefined, "tile", tile);
					}
				}
			}
		}
		return false;

	};

	Entity.prototype.collideWorld = function(x, y, types)
	{
		for (var key in levels[level].entities)
		{
			if (levels[level].entities.hasOwnProperty(key))
			{
				other = levels[level].entities[key];
				if (other != this)
				{
					if (this.collideOther(other, x, y))
					{
						if (other.type != "none")
						{
							if (typeof types == "undefined" || types.indexOf(other.type) != -1)
							{
								return other;
							}
						}
					}
				}
			}
		}
		return false;
	};

	Entity.prototype.collideOther = function(other, x, y)
	{

		var eX = backUp(x, this.x);
		var eY = backUp(y, this.y);

		return (eX < other.x + other.width
			&& other.x < eX + this.width
			&& eY < other.y + other.height
			&& other.y < eY + this.height);

	};

	Entity.prototype.collide = function(x, y, types)
	{
		var w = this.collideWorld(x, y, types);
		if (w)
		{
			return w;
		}
		var t = this.collideTile(x, y, types);
		if (t)
		{
			return t;
		}
		return false;
	};

	Entity.prototype.keepInScreen = function()
	{

		if (this.x < 0)
		{
			this.x = 0;
			return true;
		}
		if (this.x >= levelWidth() * tileSize - this.width)
		{
			this.x = levelHeight() * tileSize - this.width;
			return true;
		}
		if (this.y < 0)
		{
			this.y = 0;
			return true;
		}
		if (this.y >= levels[level].tiles.length * tileSize - this.height)
		{
			this.y = levels[level].tiles.length * tileSize - this.height;
			return true;
		}
		return false;

	};

	Entity.prototype.handleCollisions = function(newX, newY, types)
	{

		var goingRight = this.x < newX;
		var goingLeft = this.x > newX;
		var goingDown = this.y < newY;
		var goingUp = this.y > newY;
		var byX = this.collide(newX, this.y, types);
		var byY = this.collide(this.x, newY, types);

		var didCollide = false;

		if (byX.type == "tile")
		{
			byX.x *= tileSize;
			byX.y *= tileSize;
		}
		if (byY.type == "tile")
		{
			byY.x *= tileSize;
			byY.y *= tileSize;
		}

		if (byX)
		{
			didCollide = true;
			var width = tileSize;
			if (byX.width)
			{
				width = byX.width;
			}
			this.xVel = 0;
			this.x = byX.x + width * goingLeft
				- (this.width + 1) * goingRight;
		}
		else
		{
			this.x = newX;
		}
		if (byY)
		{
			didCollide = true;
			var height = tileSize;
			if (byY.height)
			{
				height = byY.height;
			}
			this.yVel = 0;
			this.y = byY.y + height * goingUp
				- (this.height + 1) * goingDown;
		}
		else
		{
			this.y = newY;
		}

		return didCollide;

	};

	Entity.prototype.spawnSafe = function()
	{

		var x = 0;
		var y = 0;
		var t = 0;

		do
		{

			this.x = levelWidth() * tileSize * Math.random();
			this.y = levelHeight() * tileSize * Math.random();

			t = this.collideTile(this.x, this.y, ["g", "c", "r", "[", "]", "{", "}", "l"]);

		}
		while (t)

	}

	return Entity;

})();
