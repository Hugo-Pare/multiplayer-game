const mapData = {
    minX: 0,
    maxX: 30,
    minY: 0,
    maxY: 26,
    // connect enemyCoords to database
    blockedSpaces: {
        "7x4": false,
        "7x5": false
    },
    enemyCoords: {}
}

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

function getPlayerSpawn(){
    const arrayCoords = [{x:3, y:2},{x:5, y:2},{x:7, y:2},{x:9, y:2},{x:11, y:2},{x:13, y:2},{x:15, y:2},{x:17, y:2},{x:19, y:2},,{x:21, y:2}];
    return arrayCoords[Math.floor(Math.random() * 10)];
}

function getEnemySpawn(){
    const arrayCoords = [{x:3, y:20},{x:5, y:20},{x:7, y:20},{x:9, y:20},{x:11, y:20},{x:13, y:20},{x:15, y:20},{x:17, y:20},{x:19, y:20},{x:21, y:20}];
    return arrayCoords[Math.floor(Math.random() * 10)];
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
    const { x, y } = getEnemySpawn();
    enemyRef = firebase.database().ref(`enemies/${getKeyString(x, y)}`);
    enemyRef.set({x, y});
}

(function(){

    let playerId;
    let playerRef;
    let playerElements = {};
    let players = {};

    let enemies = {};
    let enemyElements = {};

    const gameContainer = document.querySelector(".game-container");

    function handleArrowPress(xChange=0, yChange=0){
        const newX = players[playerId].x + xChange;
        const newY = players[playerId].y + yChange;

        if(!isSolid(newX, newY)){
            // move to next space
            players[playerId].x = newX;
            players[playerId].y = newY;
            if(xChange === 1){
                players[playerId].direction = "right";
            }
            if(xChange === -1){
                players[playerId].direction = "left";
            }
            if(yChange === 1){
                players[playerId].direction = "down";
            }
            if(yChange === -1){
                players[playerId].direction = "up";
            }
            playerRef.set(players[playerId]);
        }
    }
 
    function initGame(){
        new KeyPressListener("ArrowUp", () => handleArrowPress(0,-1));
        new KeyPressListener("ArrowDown", () => handleArrowPress(0,1));
        new KeyPressListener("ArrowLeft", () => handleArrowPress(-1,0));
        new KeyPressListener("ArrowRight", () => handleArrowPress(1,0));

        const allPlayersRef = firebase.database().ref(`players`);
        const allEnemiesRef = firebase.database().ref(`enemies`);

        allPlayersRef.on("value", (snapshot) => {
            // fires whenever a change occures
            players = snapshot.val() || {};

            Object.keys(players).forEach((key) => {
                const characterState = players[key];
                // issue here, should be : playerElements[key];
                let element = playerElements[characterState.name];

                // update DOM
                element.querySelector(".Character_name").innerText = characterState.name;
                element.setAttribute("data-direction", characterState.direction);

                const left = 8 * characterState.x + "px";
                const top = 8 * characterState.y - 4 + "px";

                element.style.transform = `translate3d(${left}, ${top}, 0)`;
            });
        })

        allPlayersRef.on("child_added", (snapshot) =>{
            // fires whenever a new node is added to the tree (new player)
            const addedPlayer = snapshot.val();
            const characterElement = document.createElement("div");
            characterElement.classList.add("Character", "grid-cell");

            characterElement.innerHTML = (`
                <div class="Character_sprite grid-cell"></div>    
                <div class="Character_name-container">
                    <span class="Character_name"></span>
                </div>
                <div class="Character_you-arrow></div>
            `);
            //playerElements[addedPlayer.id] = characterElement;
            playerElements[addedPlayer.name] = characterElement;

            // fill initial state
            characterElement.querySelector(".Character_name").innerText = addedPlayer.name;
            characterElement.setAttribute("data-direction", addedPlayer.direction);

            const left = 8 * addedPlayer.x + "px";
            const top = 8 * addedPlayer.y - 4 + "px";
            characterElement.style.transform = `translate3d(${left}, ${top}, 0)`;
            gameContainer.appendChild(characterElement);
        })

        allPlayersRef.on("child_removed", (snapshot) => {
            const removedName = snapshot.val().name;
            gameContainer.removeChild(playerElements[removedName]);
            delete playerElements[removedName];
        })

        allEnemiesRef.on("value", (snapshot) => {
            enemies = snapshot.val() || {};
            var enemyArray = Object.keys(enemies);
            var updatedEnemyCoords = [];

            for(let i = 0; i < enemyArray.length; i++){
                updatedEnemyCoords.push([enemyArray[i], true])
            }

            var updatedEnemyCoordsObj = Object.fromEntries(updatedEnemyCoords);
            mapData.enemyCoords = updatedEnemyCoordsObj;
        });

        allEnemiesRef.on("child_added", (snapshot) => {
            const enemy = snapshot.val();
            const key = getKeyString(enemy.x, enemy.y);
            const enemyElement = document.createElement("div");
            enemyElement.classList.add("Enemy", "grid-cell");
            enemyElement.innerHTML = `<div class="Enemy_sprite grid-cell"></div>`;

            const left = 8 * enemy.x + "px";
            const top = 8 * enemy.y - 4 + "px";
            enemyElement.style.transform = `translate3d(${left}, ${top}, 0)`;

            enemyElements[key] = enemyElement;
            gameContainer.appendChild(enemyElement);
        })

        allEnemiesRef.on("child_removed", (snapshot) => {
            const {x, y} = snapshot.val();
            const key = getKeyString(x, y);
            gameContainer.removeChild(enemyElements[key]);
            delete enemyElements[key];
        })

        allEnemiesRef.on("value", (snapshot) => {
            // fires whenever a change occures
            enemies = snapshot.val() || {};

            Object.keys(enemies).forEach((key) => {
                let enemyState = enemyElements[key];

                const left = 8 * enemyState.x + "px";
                const top = 8 * enemyState.y + 3 + "px";
            });
        })

        spawnNewEnemy();
    }

    firebase.auth().onAuthStateChanged((user) => {
        console.log(user);
        if(user){
            // logged in
            playerId = user.uid;
            playerRef = firebase.database().ref(`players/${playerId}`);
            
            const name = createName();
            const {x, y} = getPlayerSpawn();

            playerRef.set({
                name,
                direction: "right",
                score: 0,
                x,
                y
            })

            playerRef.onDisconnect().remove();

            initGame();
        }
        else{
            // logged out
        }
    })

    firebase.auth().signInAnonymously().catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;

        console.log(errorCode, errorMessage);
    });
})();