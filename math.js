// Position math

function tilePos(x, y)
{
	return [Math.floor(x / tileSize), Math.floor(y / tileSize)];
}

function getTile(tile)
{
	if (tile[0] >= 0 && tile[0] < levels[level].tiles[0].length &&
		tile[1] >= 0 && tile[1] < levels[level].tiles.length)
	{
		return levels[level].tiles[tile[1]][tile[0]];
	}
	else
	{
		return "-";
	}
}