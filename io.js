function resizeWindow()
{

	container.width = window.innerWidth;
	container.height = window.innerHeight;

	game.lineWidth = 4;

}

function resizeWindowCallback()
{
	if (resizeTimer)
	{
		clearTimeout(resizeTimer);
	}
	resizeTimer = setTimeout(resizeWindow, 100);
}

function unsupported()
{
	document.getElementById("error-text").innerHTML = "Sorry, but you're using an unsupported browser and can't play this game.";
	container = null;
	game = null;
}

function fatalError(info)
{
	document.getElementById("error-text").innerHTML = "A fatal error has occured: " + info + " Sorry. Try playing on a different browser.";
	container = null;
	game = null;
}

function debugLog(log)
{
	document.getElementById("error-text").innerHTML += log;
}

function key(which)
{
	for (var char=0; char<which.length; char++)
	{
		if (keys[which.charCodeAt(char)])
		{
			return true;
		}
	}
	return false;
}

// General Javascript help

function backUp(check, value)
{
	if (typeof check == "undefined")
	{
		return value;
	}
	return check;
}

// Input Handling

function mouseDown(event)
{

	// var x = event.clientX / tileWidth;
	// var y = event.clientY / tileHeight;
	// var direction = event.button == 0 ? 2 : 0.5;
	mouse.x = event.clientX;
	mouse.y = event.clientY;
	mouse.button = event.button;
	mouse.active = true;

}

function mouseUp(event)
{

	mouse.active = false;

}

function mouseMove(event)
{

	mouse.x = event.clientX;
	mouse.y = event.clientY;

}

function keyDown(event)
{
	if (!keys[event.keyCode])
	{
		// Don't act on repeats:
	}
	// Do act on repeats:
	keys[event.keyCode] = true;
}

function keyUp(event)
{
	keys[event.keyCode] = false;
}


// Rendering

function renderTile(x, y)
{

	var tileType = getTile([x, y]);
	var tile = levels[level].entities[tileType];

	if (tile)
	{

		var placeX = x * tileSize - camera.x;
		var placeY = y * tileSize - camera.y;
		var draw = null;

		if (tile.animation)
		{
			var frame = getAnimationFrame(tile.animation,
				quadrantSpeed(getQuadrant(x, y)));
			if (frame)
			{
				draw = frame;
			}
		}
		else if (tile.image)
		{
			draw = tile.image;
		}

		if (draw)
		{
			game.drawImage(draw, placeX, placeY);
		}

	}

}

function everyEntity(what)
{
	for (var key in levels[level].entities)
	{
		if (levels[level].entities.hasOwnProperty(key))
		{
			what(levels[level].entities[key]);
		}
	}
}

function averageEntity(weight, type)
{

    var totalX = 0;
    var totalY = 0;
    var count = 0;

    everyEntity(function(e){
        if (typeof e.x != "undefined" && typeof e.y != "undefined" &&
            typeof e.image != "undefined" && e.image.complete &&
			(typeof type == "undefined" || e.type == type))
        {
			var power = backUp(e.power, 1);
            totalX += (e.x + e.image.width / 2) * power;
            totalY += (e.y + e.image.height / 2) * power;
            count += 1 * power;
        }
    });

    totalX += controlled.x * count * weight;
    totalY += controlled.y * count * weight;
    count += count * weight;

    totalX /= count;
    totalY /= count;

	return [totalX, totalY];

}

function updateCamera()
{

	var center = averageEntity(2.5);

    camera.x = center[0] - container.width / 2;
    camera.y = center[1] - container.height / 2;

}
