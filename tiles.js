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