function attachEvents() {
    let username = 'Martin000';
    const password = '1234';
    const baseUrl = 'https://baas.kinvey.com/';
    const appKey = 'kid_H1wv19gt4';
    const endpoint = 'players';
    let headers = {
        'Authorization': 'Basic ' + btoa(`${username}:${password}`),
        "Content-Type": "application/json"
    };

    let allPlayers = [];
    let selectedPlayer;
    let playerId;

    $('#reload').on('click', reload);
    $('#save').on('click', save);
    $('#addPlayer').on('click', addPlayer);     

    loadPlayers();
    async function loadPlayers(){
        $('#players').empty();
        await $.ajax({
            method: 'GET',
            url: baseUrl + 'appdata/' + appKey + '/' + endpoint,
            headers
        }).then((players) => {
            allPlayers = players;
            console.log(players);
            
            for(let player of players){

                //create player div
                let $currentPlayerDiv = $(`
                    <div class="player" data-id="${player._id}">
                        <div class="row">
                            <label>Name:</label>
                            <label class="name">${player.name}</label>
                        </div>
                        <div class="row">
                            <label>Money:</label>
                            <label class="money">${player.money}</label>
                        </div>
                        <div class="row">
                            <label>Bullets:</label>
                            <label class="bullets">${player.bullets}</label>
                        </div>                    
                </div>`);

                //create play and delete buttons
                let $playBtn = $('<button class="play">Play</button>');
                let $deleteBtn = $('<button class="delete">Delete</button>');  
                //add event listeners
                $playBtn.on('click', play);
                $deleteBtn.on('click', deletePlayer);

                //append elements
                $currentPlayerDiv.append($playBtn);
                $currentPlayerDiv.append($deleteBtn);               
                $('#players').append($currentPlayerDiv);
            }                       
            
        })
        .catch((err) => {
            renderError();
        });
    }

    async function addPlayer(){
        let newPlayName = $('#addName').val();

        try{
            await $.ajax({
                method: 'POST',
                url: baseUrl + 'appdata/' + appKey + '/' + endpoint,
                headers,
                data: JSON.stringify({
                    name: newPlayName,
                    money: 500,
                    bullets: 6
                })
            });
            valid();
            $('#addName').val('');
            loadPlayers();
        }
        catch(err){
            renderError();
        }
    }

    function play() {
        $('#save').css('display', 'block');
        $('#reload').css('display', 'block');
        $('#canvas').css('display', 'block'); 

        let currentPlayerId = $(this).parent().data('id');

        selectedPlayer = allPlayers.filter((currentPalyer) => currentPalyer._id == currentPlayerId)[0];        
        playerId = currentPlayerId;


        clearInterval(canvas.intervalId);
        loadCanvas(selectedPlayer);        
        valid();
    }
    
    async function deletePlayer() {
        try{
            const currentPlayerId = $(this).parent().data('id');
            await $.ajax({
                method: 'DELETE',
                url: baseUrl + 'appdata/' + appKey + '/' + endpoint + '/' + currentPlayerId,
                headers,             
            });
            
            loadPlayers();
            valid();                     
        }
        catch(err){
            renderError();
        }        
    }
    
    function reload(){
        if(selectedPlayer.money >= 60){
            selectedPlayer.money -= 60;
            selectedPlayer.bullets += 6;
            valid();
        }else if(selectedPlayer.bullets === 0){
            $('#lose').text('LOSE!');
			cleanMessage();
        }
    }
    
    async function save(){        
        try{
            await $.ajax({
                method: 'PUT',
                url: baseUrl + 'appdata/' + appKey + '/' + endpoint + '/' + playerId,
                headers,
                data: JSON.stringify(
                {
                    name: selectedPlayer.name,
                    money: selectedPlayer.money,
                    bullets: selectedPlayer.bullets
                })
            });
            loadPlayers();
            valid();
        }
        catch(err){
            renderError();
        }
    }

    function valid(){
        $('#valid').text('CORRECT!');        
    }

    function renderError(){
        $('#error').text('ERROR!');        
    }
    function cleanMessage(){
        $('#error').text('');
        $('#valid').text('');
		$('#lose').text('');
    }
}