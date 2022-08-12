const mapData = {
    minX: 0,
    maxX: 30,
    minY: 0,
    maxY: 26,
    blockedSpaces: {
        "0x4": true,
        "0x5": true,
        "1x5": true,
        "2x6": true,
        "3x6": true,
        "4x0": true,
        "4x5": true,
        "4x6": true,
        "5x0": true,
        "5x5": true,
        "5x13": true,
        "6x1": true,
        "6x2": true,
        "6x12": true,
        "6x13": true,
        "6x14": true,
        "7x2": true,
        "7x10": true,
        "7x11": true,
        "7x12": true,
        "10x25": true,
        "11x25": true,
        "12x6": true,
        "12x23": true,
        "12x24": true,
        "12x25": true,
        "13x6": true,
        "13x7": true,
        "13x22": true,
        "13x23": true,
        "13x24": true,   
        "13x25": true,
        "14x5": true,
        "14x25": true,
        "18x12": true,
        "19x12": true,
        "20x12": true,
        "21x13": true,
        "21x3": true,
        "22x3": true,
        "23x3": true,
        "24x4": true,
        "24x5": true,
        "24x6": true,
        "25x5": true,
    },
    // connect enemyCoords to database
    enemyCoords: {},
    bulletTimeoutSpeed: 150
}

function drawGrass(){
    const gameContainer = document.querySelector(".game-container");
    const tileGrass = document.createElement("div");
    tileGrass.classList.add("Grass", "grid-cell");
    tileGrass.innerHTML = (`<div class="Grass_sprite grid-cell"></div>`);
    gameContainer.appendChild(tileGrass);
}

function drawWalls(){
    const gameContainer = document.querySelector(".game-container");

    // for each blockedSpace in mapData - create a wall div
    const blockedSpacesArray = Object.keys(mapData.blockedSpaces);
    for(let i = 0; i < blockedSpacesArray.length; i++){
        const tileWall = document.createElement("div");
        tileWall.classList.add("Wall", "grid-cell");
        tileWall.innerHTML = (`<div class="Wall_sprite grid-cell"></div>`);
        var blockedSpace = blockedSpacesArray[i];
        const x = returnX(blockedSpace);
        const y = returnY(blockedSpace);
        
        const left = 8 * x + "px";
        const top = 8 * y + "px";
        tileWall.style.transform = `translate3d(${left}, ${top}, 0)`;
        gameContainer.appendChild(tileWall);
    }
}

function returnX(coords){
    return coords.split("x")[0];
}

function returnY(coords){
    return coords.split("x")[1];
}