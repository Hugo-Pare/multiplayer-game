const levelOneMap = {
    playerSpawns: [],
    enemySpawns: [
        {x:3, y:20, direction: "up"},
        {x:9, y:20, direction: "up"},
        {x:21, y:9, direction: "left"},
    ]
}

function getPlayerSpawn(){
    const arrayCoords = [{x:1, y:1},{x:1, y:2},{x:1, y:3},{x:2, y:1},{x:2, y:2},{x:2, y:3},{x:3, y:1},{x:3, y:2},{x:3, y:3},{x:4, y:2}];
    return arrayCoords[Math.floor(Math.random() * 10)];
}

function getEnemySpawn(){
    return levelOneMap.enemySpawns;
}