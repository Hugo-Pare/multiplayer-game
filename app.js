function createName() {
    return 'Player' + Math.floor(Math.random() * 1000);
}

(function(){

    let playerId;
    let playerRef;

    let playerElements = {};

    const gameContainer = document.querySelector(".game-container");

    function initGame(){
        const allPlayersRef = firebase.database().ref(`players`);

        allPlayersRef.on("value", (snapshot) => {
            // fires whenever a change occures
        })

        allPlayersRef.on("child_added", (snapshot) =>{
            // fires whenever a new node is added to the tree (new player)
            const addedPlayer = snapshot.val();
            const characterElement = document.createElement("div");

            characterElement.classList.add("Character", "grid-cell");

            if(addedPlayer.id === playerId){
                characterElement.classList.add("you");
            }
            characterElement.innerHTML = (`
                <div class="Character_sprite grid-cell"></div>    
                <div class="Character_name-container">
                    <span class="Character_name"></span>
                </div>
                <div class="Character_you-arrow></div>
            `);

            playerElements[addedPlayer.id] = characterElement;

            // fill initial state
            characterElement.querySelector(".Character_name").innerText = addedPlayer.name;
            characterElement.setAttribute("data-direction", addedPlayer.direction);

            const left = 16 * addedPlayer.x + "px";
            const top = 16 * addedPlayer.y - 4 + "px";

            characterElement.style.transform = `translate3d(${left}, ${top}, 0)`;

            gameContainer.appendChild(characterElement);
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