const names = [];

function createName() {
    // make sure name cannot be the same
    const num = Math.floor(Math.random() * 10).toString() + Math.floor(Math.random() * 10).toString() + Math.floor(Math.random() * 10).toString(); 
    if(!names.includes(num)){
        names.push(num);
        return 'Player' + num;
    }
    else{
        createName();
    }
}

function getKeyString(x, y){
    return `${x}x${y}`;
}

function isSolid(x, y){
    const blockedNextSpace = mapData.blockedSpaces[getKeyString(x, y)];
    const blockedNextSpaceEnemy = mapData.enemyCoords[getKeyString(x, y)];

    return(
        blockedNextSpace || blockedNextSpaceEnemy || x >= mapData.maxX || x < mapData.minX || y >= mapData.maxY || y < mapData.minY
    )
}

function spawnNewEnemy(){
    const enemySpawns = getEnemySpawn();
    for(let i = 0; i < enemySpawns.length; i++){
        var x = enemySpawns[i].x;
        var y = enemySpawns[i].y;
        var direction = enemySpawns[i].direction;
        enemyRef = firebase.database().ref(`enemies/${getKeyString(x, y)}`);
        enemyRef.set({
            x,
            y,
            direction
        });
    }
}

function getPlayerSpawn(){
    const arrayCoords = [{x:1, y:1},{x:1, y:2},{x:1, y:3},{x:2, y:1},{x:2, y:2},{x:2, y:3},{x:3, y:1},{x:3, y:2},{x:3, y:3},{x:4, y:2}];
    return arrayCoords[Math.floor(Math.random() * 10)];
}

function getEnemySpawn(){
    const level = getCurrentLevel();
    switch(level){
        case 1:
            return level1Map.enemySpawns;
        case 2:
            return level2Map.enemySpawns;
        default:
            // returns empty array - game ended
            return [];
    }
}

function getCurrentLevel(){
    const currentLevelRef = firebase.database().ref(`level`);
    let level;
    currentLevelRef.on("value", (snapshot) => {
        level = snapshot.val();
    })
    return Object.values(level)[0];
}

function setLevelUp(){
    const currentLevelRef = firebase.database().ref(`level`);
    let level = getCurrentLevel() + 1;

    currentLevelRef.set({level});
    console.log("Level up! - level " + level);
    spawnNewEnemy();
}

function eliminatedAllEnemies(){
    const allEnemiesRef = firebase.database().ref(`enemies`);
    var eliminatedAllEnemies = false;
    // returns true if 0 enemy alive
    allEnemiesRef.on("value", (snapshot) => {
        if(snapshot.val() === null){
            console.log("all enemies are eliminated");
            eliminatedAllEnemies = true;
        }
    })
    return eliminatedAllEnemies;
}