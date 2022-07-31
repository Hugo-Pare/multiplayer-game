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

(function(){

    let playerId;
    let playerRef;
    let playerElements = {};
    let players = {};

    const gameContainer = document.querySelector(".game-container");

    function handleArrowPress(xChange=0, yChange=0){
        const newX = players[playerId].x + xChange;
        const newY = players[playerId].y + yChange;

        if(true){
            // move to next space
            players[playerId].x = newX;
            players[playerId].y = newY;
            if(xChange === 1){
                players[playerId].direction = "right";
            }
            if(xChange === -1){
                players[playerId].direction = "left";
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

                const left = 16 * characterState.x + "px";
                const top = 16 * characterState.y - 4 + "px";

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

            const left = 16 * addedPlayer.x + "px";
            const top = 16 * addedPlayer.y - 4 + "px";
            characterElement.style.transform = `translate3d(${left}, ${top}, 0)`;
            gameContainer.appendChild(characterElement);
        })

        allPlayersRef.on("child_removed", (snapshot) => {
            const removedKey = snapshot.val().id;
            gameContainer.removeChild(playerElements[removedKey]);
            delete playerElements[removedKey];
        })
    }

    firebase.auth().onAuthStateChanged((user) => {
        console.log(user);
        if(user){
            // logged in
            playerId = user.uid;
            playerRef = firebase.database().ref(`players/${playerId}`);
            
            const name = createName();

            playerRef.set({
                name,
                direction: "right",
                score: 0,
                x: 3,
                y: 3
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