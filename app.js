(function(){ 

    let playerId;
    let playerRef;
    let playerElements = {};
    let players = {};

    let enemies = {};
    let enemyElements = {};

    let bullets = {};
    let bulletElements = {};

    let levelRef;

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

    function handleFire(){
        // wait until player's bullet exploded
        if(players[playerId].shot === false){
            const playerX = players[playerId].x;
            const playerY = players[playerId].y;
            const playerCoords = getKeyString(playerX, playerY); // example : returns "3x3"
            const playerDirection = players[playerId].direction;

            bulletRef = firebase.database().ref(`bullets/${playerId}`);

            switch(playerDirection){
                case "up":
                    var bulletCoords = getKeyString(playerX, playerY - 1);
                    console.log("shoot up - playerCoords : " + playerCoords + " - bulletCoords : " + bulletCoords);
                    bulletRef.set({
                        name: playerId,
                        direction: "up",
                        x: playerX,
                        y: playerY - 1
                    });
                    break;

                case "down":
                    var bulletCoords = getKeyString(playerX, playerY + 1);
                    console.log("shoot down - playerCoords : " + playerCoords + " - bulletCoords : " + bulletCoords);
                    bulletRef.set({
                        name: playerId,
                        direction: "down",
                        x: playerX,
                        y: playerY + 1
                    });
                    break;

                case "left":
                    var bulletCoords = getKeyString(playerX - 1, playerY);
                    console.log("shoot left - playerCoords : " + playerCoords + " - bulletCoords : " + bulletCoords);
                    bulletRef.set({
                        name: playerId,
                        direction: "left",
                        x: playerX - 1,
                        y: playerY
                    });
                    break;

                case "right":
                    var bulletCoords = getKeyString(playerX + 1, playerY);
                    console.log("shoot right - playerCoords : " + playerCoords + " - bulletCoords : " + bulletCoords);
                    bulletRef.set({
                        name: playerId,
                        direction: "right",
                        x: playerX + 1,
                        y: playerY
                    });
                    break;
            }
            players[playerId].shot = true;
            playerRef.set(players[playerId]);
        }
    }
    

    function moveBullet(bullets, key){
        const bullet = bullets[key];
        const x = bullet.x;
        const y = bullet.y;
        const direction = bullet.direction;

        console.log("move bullet (" + bullet.x + "," + bullet.y + ") to the " + bullet.direction);
        bulletRef = firebase.database().ref(`bullets/${key}`);

        var newX;
        var newY;

        switch(direction){
            case "up":
                newX = x;
                newY = y - 1;
                break;
            case "down":
                newX = x;
                newY = y + 1;
                break;
            case "left":
                newX = x - 1;
                newY = y;
                break;
            case "right":
                newX = x + 1;
                newY = y;
                break;
        }

        if(!isSolid(newX, newY)){
            // change bullet coords in 'bullets' database
            bulletRef.set({
                x: newX,
                y: newY,
                name: bullet.name,
                direction: bullet.direction
            });
        }
        else{
            // check if bullet hits an enemy
            const allEnemiesRef = firebase.database().ref(`enemies`);
            allEnemiesRef.on("value", (snapshot) => {
                snapshot.forEach((childSnapshot) => {
                    var childSnapshotVal = childSnapshot.val();
                    // if enemy coords = bullet coords -> remove enemy
                    if(childSnapshotVal.x === newX && childSnapshotVal.y === newY){
                        const enemyRef = firebase.database().ref(`enemies/${getKeyString(childSnapshotVal.x, childSnapshotVal.y)}`);
                        enemyRef.remove();
                    }
                })
            });

            // change shot to false in 'players' database
            players[playerId].shot = false;
            playerRef.set(players[playerId]);

            // destroy bullet
            bulletRef.remove();
        }
    }
 
    function initGame(){
        new KeyPressListener("ArrowUp", () => handleArrowPress(0,-1));
        new KeyPressListener("ArrowDown", () => handleArrowPress(0,1));
        new KeyPressListener("ArrowLeft", () => handleArrowPress(-1,0));
        new KeyPressListener("ArrowRight", () => handleArrowPress(1,0));
        // fire a bullet
        new KeyPressListener("Space", () => handleFire());

        const allPlayersRef = firebase.database().ref(`players`);
        const allEnemiesRef = firebase.database().ref(`enemies`);
        const allBulletsRef = firebase.database().ref(`bullets`);

        drawGrass();
        drawWalls();

        allBulletsRef.on("value", (snapshot) => {
            // fires whenever a change occures
            bullets = snapshot.val() || {};

            Object.keys(bullets).forEach((key) => {
                const bulletState = bullets[key];
                let element = bulletElements[bulletState.name];

                const left = 8 * bulletState.x + "px";
                const top = 8 * bulletState.y + 3 + "px";
                element.style.transform = `translate3d(${left}, ${top}, 0)`;
                setTimeout(() => moveBullet(bullets, key), mapData.bulletTimeoutSpeed);
            });
        })

        allBulletsRef.on("child_added", (snapshot) =>{
            // fires whenever a new node is added to the tree (new player)
            const newBullet = snapshot.val();
            const bulletElement = document.createElement("div");
            bulletElement.classList.add("Bullet", "grid-cell");

            bulletElement.innerHTML = (`<div class="Bullet_sprite grid-cell"></div>`);
            bulletElements[newBullet.name] = bulletElement;

            const left = 8 * newBullet.x + "px";
            const top = 8 * newBullet.y + 3 + "px";
            bulletElement.style.transform = `translate3d(${left}, ${top}, 0)`;
            gameContainer.appendChild(bulletElement);
        })

        allBulletsRef.on("child_removed", (snapshot) => {
            const removedBullet = snapshot.val().name;
            gameContainer.removeChild(bulletElements[removedBullet]);
            delete bulletElements[removedBullet];
        })

        allPlayersRef.on("value", (snapshot) => {
            // fires whenever a change occures
            players = snapshot.val() || {};

            Object.keys(players).forEach((key) => {
                const characterState = players[key];
                let element = playerElements[characterState.name];

                // update DOM
                element.querySelector(".Character_name").innerText = characterState.name;
                element.setAttribute("data-direction", characterState.direction);

                const left = 8 * characterState.x + "px";
                const top = 8 * characterState.y + 3 + "px";
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
            playerElements[addedPlayer.name] = characterElement;

            // fill initial state
            characterElement.querySelector(".Character_name").innerText = addedPlayer.name;
            characterElement.setAttribute("data-direction", addedPlayer.direction);

            const left = 8 * addedPlayer.x + "px";
            const top = 8 * addedPlayer.y + 3 + "px";
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
            
            const direction = enemy.direction;
            // modify direction of enemy tank
            switch(direction){
                case "up":
                    enemyElement.innerHTML = `<div class="Enemy_sprite_up grid-cell"></div>`;
                    break;
                case "down":
                    enemyElement.innerHTML = `<div class="Enemy_sprite_down grid-cell"></div>`;
                    break;
                case "left":
                    enemyElement.innerHTML = `<div class="Enemy_sprite_left grid-cell"></div>`;
                    break;
                case "right":
                    enemyElement.innerHTML = `<div class="Enemy_sprite_right grid-cell"></div>`;
                    break;
            }

            const left = 8 * enemy.x + "px";
            const top = 8 * enemy.y + 3 + "px";
            enemyElement.style.transform = `translate3d(${left}, ${top}, 0)`;

            enemyElements[key] = enemyElement;
            gameContainer.appendChild(enemyElement);
        })

        allEnemiesRef.on("child_removed", (snapshot) => {
            const {x, y} = snapshot.val();
            const key = getKeyString(x, y);
            gameContainer.removeChild(enemyElements[key]);
            delete enemyElements[key];

            if(eliminatedAllEnemies()){
                setLevelUp()
            }
        })

        spawnNewEnemy();
    }

    firebase.auth().onAuthStateChanged((user) => {
        console.log(user);
        if(user){
            // logged in
            playerId = user.uid;
            playerRef = firebase.database().ref(`players/${playerId}`);
            levelRef = firebase.database().ref(`level`);

            const name = createName();
            const {x, y} = getPlayerSpawn();

            playerRef.set({
                name,
                direction: "right",
                x,
                y,
                shot: false
            })
  
            levelRef.set({level: 1});

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