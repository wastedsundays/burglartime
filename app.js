// document.addEventListener('DOMContentLoaded', () => {

"use strict";
    let burglarCurrentIndex = 239;

    const game = {

        isRunning: false,
        counterStart: 90,
        counter: 90,
        timeBonus: 0,
        intervalId: null,
        duration: 1000,
        hiScore: 2460,
        coinsCollected: 0,
        billsCollected: 0,
        playerScore: 0,
        totalScore: 0,
        playerName: "Player 1",
        difficulty: 1,
        currentScreen: "#splash-screen",
        currentLevel: 1,
        previousScreen: '',


        init: function() {
            //pauses everything
            game.pauseGame();
            //reset level to 1
            game.currentLevel = 1;
            //reset coins and bills
            game.coinsCollected = 0;
            game.billsCollected = 0;
            //clears the grid for the board
            $('.grid').html("");
            //clears the squares array
            squares = [];
            //creates a board (1, based on current level above)
            createBoard();
            burglarCurrentIndex=239;
            squares[burglarCurrentIndex].classList.add('burglar');
            //reset the status display on scoreboard
            statusDisplay.innerHTML = "";
            //sets level indicator on scoreboard to 1
            $('.level-indicator').html(`Lv: ${game.currentLevel}`);
            game.counter = 90;
            game.updateClock();
            game.playerScore = 0;  
            plyrOneDisplay.innerHTML = game.playerScore;  
            //reset the timer on the game music 
            soundPriest.currentTime = 0;
            game.updateHiScore();
            game.switchScreen('#splash-screen');
            game.unMute();   


        },

        switchScreen: function (newScreen) {
            game.currentScreen = newScreen;
            $('.screen').hide();
            $(newScreen).show();
          }, 

        tickTock: function() {
            if(!game.isRunning) {
              return true}
            if(game.counter > 0) {
              game.counter--;
              game.updateClock(); 
            } return
            },

        startGame: function() {
            document.addEventListener('keydown',moveBurglar);
            game.startTimer();
            game.updateHiScore();  
            createCops();
            game.playerScore = game.totalScore;  
            plyrOneDisplay.innerHTML = game.playerScore;   
            soundPriest.play();
        },

        //starts the clock
        startTimer: function() {
            if(game.isRunning === false) {
                game.isRunning = true;
                clearInterval(game.intervalId);
                game.intervalId = window.setInterval(game.tickTock, game.duration);
            } return
        },

        //sets the scoreboard with the player name input. If blank, it defaults to "Player 1: "    
        setPlayerName: function() {
            game.playerName = formText.value;
            if(game.playerName.length >=1){
                document.querySelector('#player-name').innerHTML = game.playerName+": ";
            }else{document.querySelector('#player-name').innerHTML = "Player 1: ";}
        },
        
        //updates the timer on the board
        updateClock: function() {
            document.getElementById('seconds').innerHTML = game.counter;
          },

        updateHiScore: function() {
            if(game.playerScore > game.hiScore) {
                game.hiScore = game.playerScore;
                hiDisplay.innerHTML = game.hiScore;
            }
        },

        //check if time is expired and ends gameplay. goes to end screen.
        checkExpired: function() {
            if (game.counter === 0) {
                game.pauseGame();
                soundCapture.play();
                setTimeout(function(){statusDisplay.innerHTML = 'Time Expired'},100)
                document.getElementById('final-score').innerHTML = game.playerScore;
                setTimeout(function(){game.switchScreen('#end-screen')},3000);
            }
        },

        //check for a board cleared (which will change the vault numbers)
        checkCleared: function() {
            if (game.coinsCollected === totalCoins && game.billsCollected === totalBills) {
                squares[239].classList.remove('vault-door')
                squares[239].classList.add('vault-open')
             }
        },

        //checks if board is cleared AND burglar is back in the vault door
        checkVictory: function() {
            if (game.coinsCollected === totalCoins && game.billsCollected === totalBills && burglarCurrentIndex === 239) {
                game.pauseGame();
                statusDisplay.innerHTML = 'Vault Cleared';
                soundWin.play();
                updateRecap();
                setTimeout(function(){game.switchScreen('#recap-screen')},3000);
            }
        },

        //pauses everything (cops, key presses, music, timer)
        pauseGame: function() {
            game.isRunning = false;
            cops.forEach(cop => clearInterval(cop.timerId))
            document.removeEventListener('keydown',moveBurglar)
            clearInterval(game.intervalId);
            soundPriest.pause();
            statusDisplay.innerHTML = "paused";
        },
        
        //resumes everything (cops, key presses, music, timer)
        resumeGame: function() {
            cops.forEach(cop => moveCop(cop));
            document.addEventListener('keydown',moveBurglar);
            game.startTimer();
            soundPriest.play();
            statusDisplay.innerHTML = "";
        },

        //check for captured - called in both the moveCop and moveBurglar functions
        checkCaptured: function() {
            if (squares[burglarCurrentIndex].classList.contains('cop')) {
                game.pauseGame(); //stops the movements and clock
                soundCapture.play(); //plays the capture sound
                setTimeout(function(){statusDisplay.innerHTML = 'Captured'},500) //displays "captured" on status area
                document.getElementById('final-score').innerHTML = game.playerScore; //updates final score with player score
                setTimeout(function(){game.switchScreen('#end-screen')},3000); //pauses before switching to end screen
            }
        },

        checkTimer: function() {
            //this speeds up the music for the final 20 seconds of the round as a warning
            if (game.counter <= 20) {
                soundPriest.playbackRate = 1.15
            } else {
                soundPriest.playbackRate = 1.00
            }
        },

        muteButton: function() {
            //mutes all the audio elements, or unmutes them, depending on current state.
            if (soundPriest.muted === false) {
                soundPriest.muted = true;
                soundBill.muted = true;
                soundCoin.muted = true;
                soundWin.muted = true;
                soundCapture.muted = true;
                document.getElementById("mute-btn").setAttribute("class","btn btn-warning btn-sm");
            } else {
                soundPriest.muted = false;
                soundBill.muted = false;
                soundCoin.muted = false;
                soundWin.muted = false;
                soundCapture.muted = false;
                document.getElementById("mute-btn").setAttribute("class","btn btn-success btn-sm");
            }
        },

        unMute: function(){
            soundPriest.muted = false;
            soundBill.muted = false;
            soundCoin.muted = false;
            soundWin.muted = false;
            soundCapture.muted = false;
            soundDoor.muted = false;
            document.getElementById("mute-btn").setAttribute("class","btn btn-success btn-sm");
        }
    
        

    }
    //end of game

    const soundCoin = document.getElementById('audio-coin');
    const soundBill = document.getElementById('audio-bill');
    const soundPriest = document.getElementById('audio-music');
    const soundWin = document.getElementById('win-music');
    const soundCapture = document.getElementById('audio-captured');
    const formText = document.querySelector("#form-text");
    const grid = document.querySelector('.grid');
    const plyrOneDisplay = document.getElementById('p1score');
    const hiDisplay = document.getElementById('hi-score');
    const statusDisplay = document.getElementById('status-display');
    /*setting the width of the board. '32' used to calculate up+down.
    left and right are -1, +1. Up is -32, down is +32 */
    const width = 32; //32 x 29
    const height = 21;

    // event listeners for the difficulty buttons. Set difficulty multiplier (for cop speeds), switches to game screen, and starts a 5 second timer to start gameplay

    //splash screen difficulty choosers
    $('#easy-btn').on('click',() => {
        game.difficulty = 1;
        game.setPlayerName();
        game.switchScreen('#game-screen');
        setTimeout(game.startGame,3000);
    })

    $('#med-btn').on('click',() => {
        game.difficulty = 1.5;
        game.setPlayerName();
        game.switchScreen('#game-screen');
        setTimeout(game.startGame,3000);
    })  

    $('#hard-btn').on('click',() => {
        game.difficulty = 2.2;
        game.setPlayerName();
        game.switchScreen('#game-screen');
        setTimeout(game.startGame,3000);
    })  

    $('#instructions-button').on('click',() => {
        game.switchScreen('#help-screen');
        game.previousScreen = '#splash-screen';
    })  

    $('#help-close-btn').on('click',() => {
        game.switchScreen(game.previousScreen);
    })  

    

    $('#continue-btn').on('click',() => {
        game.pauseGame();
        game.currentLevel ++;
        game.coinsCollected = 0;
        game.billsCollected = 0;
        $('.grid').html("");
        squares = [];
        createBoard();
        squares[burglarCurrentIndex].classList.add('burglar');
        statusDisplay.innerHTML = "";
        $('.level-indicator').html(`Lv: ${game.currentLevel}`);
        game.counter = 90;
        game.updateClock();
        game.playerScore = game.totalScore;  
        plyrOneDisplay.innerHTML = game.playerScore;   
        game.updateHiScore();
        game.switchScreen('#game-screen');
        setTimeout(game.startGame,3000);
    })

    $('#retry-btn').on('click',() => {
        game.coinsCollected = 0;
        game.billsCollected = 0;
        $('.grid').html("");
        squares = [];
        createBoard();
        burglarCurrentIndex = 239;
        squares[burglarCurrentIndex].classList.add('burglar');
        statusDisplay.innerHTML = "";
        game.counter = 90;
        game.updateClock();
        game.updateHiScore();    
        game.playerScore = 0;
        game.totalScore = 0;  
        plyrOneDisplay.innerHTML = game.playerScore;   
        game.switchScreen('#game-screen');
        setTimeout(game.startGame,3000);
    })

    $('#quitgame-btn').on('click',() => {
        game.init();
    })


    //Game Screen Buttons

      $('#mute-btn').on('click',()=> {
        game.muteButton();
      })

      $('#game-control-btn').on('click',() => {
          if (game.isRunning === true) {
              game.pauseGame();
              $("#game-control-btn").html("<i class='fas fa-play'></i>");
          } else {
              game.resumeGame();
              $("#game-control-btn").html("<i class='fas fa-pause'></i>");
          }
      })

      $('#game-help-btn').on('click',() => {
        if(game.isRunning === true){
            game.pauseGame();
            $("#game-control-btn").html("<i class='fas fa-play'></i>");
        }
      game.switchScreen('#help-screen');
      game.previousScreen = '#game-screen';
      })

      $('#game-quit-btn').on('click',() => {
          game.init();
      })

    // A bad idea :-)

    //   $('#boss-btn').on('click',() => {
    //       createCops();
    //   })

      game.switchScreen('#splash-screen');
    

      let cops = [];

    //elements



    //layout of grid and contents of each square
     const layout1 = [
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,1,1,1,1,1,0,0,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,0,
        0,1,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0,1,0,
        0,1,0,0,0,2,1,1,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,1,1,2,0,0,0,1,0,
        0,1,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0,1,0,
        0,1,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0,1,0,
        0,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,0,
        0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,3,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,
        0,0,0,0,0,1,1,1,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,1,1,1,0,0,0,0,0,
        0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,
        0,1,1,1,1,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,1,1,1,1,0,
        0,1,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,0,1,0,
        0,1,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,
        0,1,0,0,0,1,0,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,0,0,0,1,0,0,0,1,0,
        0,1,1,1,1,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,1,1,1,1,0,
        0,1,0,0,0,2,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,2,0,0,0,1,0,
        0,1,0,0,0,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,0,0,0,1,0,
        0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,
        0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,
        0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
        ]
     
     const layout2 = [   
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,2,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,2,0,
        0,1,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0,1,0,
        0,1,0,0,0,1,1,1,1,1,1,0,0,1,0,0,0,0,1,0,0,1,1,1,1,1,1,0,0,0,1,0,
        0,1,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,1,0,
        0,1,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,1,0,
        0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
        0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,3,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,
        0,0,0,0,0,1,1,1,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,1,1,1,0,0,0,0,0,
        0,0,0,0,0,1,0,0,1,0,0,1,0,0,1,1,1,1,0,0,1,0,0,1,0,0,1,0,0,0,0,0,
        0,1,1,1,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,1,1,1,1,0,
        0,1,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,0,1,0,
        0,1,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,1,0,
        0,1,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,1,0,
        0,2,1,1,1,1,0,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,0,0,0,1,1,1,1,2,0,
        0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,
        0,1,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,1,0,
        0,1,0,0,0,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,0,0,0,1,0,
        0,1,0,0,0,1,0,0,0,1,0,0,1,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1,0,
        0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
        ]

    const layout3 = [
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,0,
        0,1,0,0,1,0,1,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,1,0,1,0,0,1,0,
        0,2,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,0,
        0,1,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,0,0,0,0,1,0,
        0,1,0,0,0,0,0,0,1,1,1,1,1,0,0,0,1,0,0,1,1,1,1,1,0,0,0,0,0,0,1,0,
        0,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,0,
        0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,
        0,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,0,0,0,
        0,0,0,1,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,1,0,0,0,
        0,1,1,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,1,1,0,
        0,1,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,0,1,0,
        0,1,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,1,0,
        0,1,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,1,0,
        0,1,1,1,1,2,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,2,1,1,1,1,0,
        0,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,
        0,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,
        0,1,1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,1,1,1,1,0,
        0,1,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,1,0,
        0,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
    ]

    const layout4 = [
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,1,1,1,0,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,0,1,1,1,0,
        0,1,0,1,0,1,0,0,1,0,1,0,0,1,1,1,1,1,1,0,0,1,0,1,0,0,1,0,1,0,1,0,
        0,1,0,1,1,2,1,1,1,0,1,0,0,1,0,0,1,0,1,0,0,1,0,1,1,1,2,1,1,0,1,0,
        0,1,0,0,0,1,0,0,1,1,1,1,1,1,0,0,1,0,1,1,1,1,1,1,0,0,1,0,0,0,1,0,
        0,1,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,1,0,0,0,0,1,0,0,1,0,0,0,1,0,
        0,1,1,1,1,1,0,0,1,1,1,0,0,1,1,1,1,1,1,0,0,1,1,1,0,0,1,1,1,1,1,0,
        0,0,1,0,0,0,0,0,1,0,1,0,0,0,0,3,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,
        0,0,1,0,0,1,1,1,1,0,1,1,1,0,0,1,0,0,0,1,1,1,0,1,1,1,1,0,0,1,0,0,
        0,0,1,0,0,1,0,0,1,0,0,0,1,1,1,1,1,1,1,1,0,0,0,1,0,0,1,0,0,1,0,0,
        0,1,1,1,1,1,0,0,1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1,0,0,1,1,1,1,1,0,
        0,2,0,1,0,0,0,0,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,0,0,0,0,1,0,2,0,
        0,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,0,
        0,1,0,0,1,0,0,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,0,0,0,0,1,0,0,1,0,
        0,1,1,1,1,1,0,0,0,1,0,0,1,0,0,0,0,0,0,1,0,0,1,0,0,0,1,1,1,1,1,0,
        0,1,0,0,0,1,1,1,1,1,0,0,1,0,0,0,0,0,0,1,0,0,1,1,1,1,1,0,0,0,1,0,
        0,1,1,1,1,1,0,0,0,1,1,1,1,1,0,0,0,0,1,1,1,1,1,0,0,0,1,1,1,1,1,0,
        0,1,0,0,0,1,1,1,1,1,0,0,0,1,1,1,1,1,1,0,0,0,1,1,1,1,1,0,0,0,1,0,
        0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,
        0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
    ]

    const layout5 = [
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,1,1,1,0,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,0,1,1,1,0,
        0,1,0,1,0,1,0,0,1,0,1,0,0,1,1,1,1,1,1,0,0,1,0,1,0,0,1,0,1,0,1,0,
        0,1,1,1,1,2,1,1,1,0,1,0,0,1,0,0,1,0,1,0,0,1,0,1,1,1,2,1,1,1,1,0,
        0,1,0,1,0,1,0,0,1,1,1,1,1,1,0,0,1,0,1,1,1,1,1,1,0,0,1,0,1,0,1,0,
        0,1,0,1,0,1,1,1,1,0,0,1,0,1,0,0,1,0,1,0,1,0,0,1,0,0,1,0,1,0,1,0,
        0,1,1,1,1,1,0,0,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,0,0,1,1,1,1,1,0,
        0,0,1,0,0,0,0,0,1,0,1,0,0,0,0,3,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,
        0,0,1,1,1,1,1,1,1,0,1,1,1,0,0,1,0,0,0,1,1,1,0,1,1,1,1,1,1,1,0,0,
        0,0,1,0,0,1,0,0,1,0,0,0,1,1,1,1,1,1,1,1,0,0,0,1,0,0,1,0,0,1,0,0,
        0,1,1,1,1,1,0,0,1,1,0,0,1,0,0,0,0,0,0,1,0,0,1,1,0,0,1,1,1,1,1,0,
        0,2,0,0,1,0,0,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,0,0,0,0,1,0,0,2,0,
        0,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,0,
        0,1,0,0,1,0,0,1,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,0,1,0,0,1,0,0,1,0,
        0,1,1,1,1,1,0,1,0,1,0,0,1,0,1,1,1,1,0,1,0,0,1,0,1,0,1,1,1,1,1,0,
        0,1,0,0,0,1,1,1,1,1,0,0,1,0,0,1,0,0,0,1,0,0,1,1,1,1,1,0,0,0,1,0,
        0,1,1,1,1,1,0,0,0,1,1,1,1,1,0,1,0,0,1,1,1,1,1,0,0,0,1,1,1,1,1,0,
        0,1,0,0,0,1,1,1,1,1,0,0,0,1,1,1,1,1,1,0,0,0,1,1,1,1,1,0,0,0,1,0,
        0,1,0,0,0,1,0,0,0,1,1,1,1,1,0,0,1,0,1,1,1,1,1,0,0,0,1,0,0,0,1,0,
        0,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
    ]

        //creating the array that builds the grid for the board
        let squares = []

        /* LEGEND
        0 = WALL
        1 = COIN
        2 = DOLLAR BBILLS
        3 = MAZE DOOR
        9 = UPSIDE DOWN WALL
        */

        let totalCoins = 0
        let totalBills = 0
        // DRAW THE GRID
        function createBoard() {
            if(game.currentLevel===1) {
            for (let i=0; i < layout1.length; i++) {
                const square = document.createElement('div')
                grid.appendChild(square)
                squares.push(square)

                //add layout to the board
                if(layout1[i] === 0) {
                    squares[i].classList.add('wall')
                } else if (layout1[i] === 1) {
                    squares[i].classList.add('coin')
                } else if (layout1[i] === 2) { 
                    squares[i].classList.add('dollar-bill')
                } else if (layout1[i] === 3) {
                    squares[i].classList.add('vault-door')
                } else if (layout1[i] === 9) {
                    squares[i].classList.add('wall-9')
                }
            } 
        } else if(game.currentLevel===2) {
            for (let i=0; i < layout2.length; i++) {
                const square = document.createElement('div')
                grid.appendChild(square)
                squares.push(square)

                //add layout to the board
                if(layout2[i] === 0) {
                    squares[i].classList.add('wall')
                } else if (layout2[i] === 1) {
                    squares[i].classList.add('coin')
                } else if (layout2[i] === 2) { 
                    squares[i].classList.add('dollar-bill')
                } else if (layout2[i] === 3) {
                    squares[i].classList.add('vault-door')
                } else if (layout2[i] === 9) {
                    squares[i].classList.add('wall-9')
                }
            }
        } else if(game.currentLevel===3){
            for (let i=0; i < layout3.length; i++) {
                const square = document.createElement('div')
                grid.appendChild(square)
                squares.push(square)

                //add layout to the board
                if(layout3[i] === 0) {
                    squares[i].classList.add('wall')
                } else if (layout3[i] === 1) {
                    squares[i].classList.add('coin')
                } else if (layout3[i] === 2) { 
                    squares[i].classList.add('dollar-bill')
                } else if (layout3[i] === 3) {
                    squares[i].classList.add('vault-door')
                } else if (layout3[i] === 9) {
                    squares[i].classList.add('wall-9')
                }
            }
        } else if(game.currentLevel ===4){
            for (let i=0; i < layout4.length; i++) {
                const square = document.createElement('div')
                grid.appendChild(square)
                squares.push(square)

                //add layout to the board
                if(layout4[i] === 0) {
                    squares[i].classList.add('wall')
                } else if (layout4[i] === 1) {
                    squares[i].classList.add('coin')
                } else if (layout4[i] === 2) { 
                    squares[i].classList.add('dollar-bill')
                } else if (layout4[i] === 3) {
                    squares[i].classList.add('vault-door')
                } else if (layout4[i] === 9) {
                    squares[i].classList.add('wall-9')
                }
            }

        } else {
            for (let i=0; i < layout5.length; i++) {
                const square = document.createElement('div')
                grid.appendChild(square)
                squares.push(square)

                //add layout to the board
                if(layout5[i] === 0) {
                    squares[i].classList.add('wall')
                } else if (layout5[i] === 1) {
                    squares[i].classList.add('coin')
                } else if (layout5[i] === 2) { 
                    squares[i].classList.add('dollar-bill')
                } else if (layout5[i] === 3) {
                    squares[i].classList.add('vault-door')
                } else if (layout5[i] === 9) {
                    squares[i].classList.add('wall-9')
                }
            }
        }
            //gets the number of coins and bills on the current board (to allow the gates to be closed or opened)
            totalCoins = document.getElementsByClassName('coin').length
            totalBills = document.getElementsByClassName('dollar-bill').length


            
        }


        createBoard()

   
        //starting position of burglar - 239 is vault squares
  
        // let burglarCurrentIndex = 239;

        
        //move the burglar
        /* left will move -1, right +1, up -32 (width), down 32 (width). Width is defined above, as the width of the gameboard.
        32 represents the square directly below the current square. -32 represents the square above. */
        squares[burglarCurrentIndex].classList.add('burglar');

        function moveBurglar(event) {
            event.preventDefault();
            // console.log(event.key);
            // console.log(burglarCurrentIndex);
            squares[burglarCurrentIndex].classList.remove('burglar');
            switch(event.key) {
                    // left
                case "ArrowLeft":
                    if(burglarCurrentIndex % width !== 0 && !squares[burglarCurrentIndex -1].classList.contains('wall') && !squares[burglarCurrentIndex -1].classList.contains('vault-door')) burglarCurrentIndex -=1
                    break
                    // up
                case "ArrowUp":
                    if(burglarCurrentIndex - width >= 0 && !squares[burglarCurrentIndex -width].classList.contains('wall') && !squares[burglarCurrentIndex - width].classList.contains('vault-door')) burglarCurrentIndex -=width
                    break
                case "ArrowRight":
                    // right
                    if(burglarCurrentIndex % width < width -1 && !squares[burglarCurrentIndex +1].classList.contains('wall') && !squares[burglarCurrentIndex +1].classList.contains('vault-door')) burglarCurrentIndex +=1
                    break
                    // down
                case "ArrowDown":
                    if(burglarCurrentIndex + width < width * width && !squares[burglarCurrentIndex +width].classList.contains('wall') && !squares[burglarCurrentIndex + width].classList.contains('vault-door')) burglarCurrentIndex +=width
                    break
            }


            squares[burglarCurrentIndex].classList.add('burglar')

            coinCollected()
            billCollected()
            game.checkCaptured()
            game.checkCleared()
            game.checkVictory()
            game.checkExpired()


            //collection coins. Switch remove 'coin' class from div and add points.
                function coinCollected(){
                    if(squares[burglarCurrentIndex].classList.contains('coin')){
                        soundCoin.play();
                        game.playerScore = game.playerScore+10;
                        plyrOneDisplay.innerHTML = game.playerScore;
                        squares[burglarCurrentIndex].classList.remove('coin');
                        game.coinsCollected++;
                        game.updateHiScore();
                    }
                }
            
            //collection of bills. Switch remove 'dollar-bill' class from div and add points.
                function billCollected(){
                    if(squares[burglarCurrentIndex].classList.contains('dollar-bill')) {
                        game.playerScore = game.playerScore+25
                        soundBill.play();
                        plyrOneDisplay.innerHTML = game.playerScore
                        squares[burglarCurrentIndex].classList.remove('dollar-bill')
                        game.billsCollected++
                        game.updateHiScore()

                        cops.forEach(cop => clearInterval(cop.timerId));
                        setTimeout(function(){cops.forEach(cop => moveCop(cop))},(3000));
                        // cops.forEach(cop => moveCop(cop));
                    }
                }
        }

            //create cop template
function createCops(){
            // let cops = [];

                class Cop {
                    constructor(className, startIndex, speed) {
                        this.className = className
                        this.startIndex = startIndex
                        this.speed = speed
                        this.currentIndex = startIndex
                        this.timerId = NaN
                    }
                }
                //cop 'names', starting squares, and speed
                cops = [
                    new Cop('barbrady',33,(250/game.difficulty)),
                    new Cop('wiggum',62, (300/game.difficulty)),
                    new Cop('drebin',609,(400/game.difficulty)),
                    new Cop('kimble',638,(200/game.difficulty))
                ]               

                //'draw' the cops on the grid
                cops.forEach(cop => {
                    squares[cop.currentIndex].classList.add(cop.className)
                    squares[cop.currentIndex].classList.add('cop')
                })
           
                //calls the function that moves cops randomly
                cops.forEach(cop => moveCop(cop))
            }


                //function to move cops
                function moveCop(cop) {
                    const directions = [-1, +1, width, -width]
                    let direction = directions[Math.floor(Math.random()* directions.length)]
                    
                    cop.timerId = setInterval(function() {
                        //if the next square doesn't have a wall and doesn't have a cop, you can go here
                        if (!squares[cop.currentIndex + direction].classList.contains('wall') /* && !squares[cop.currentIndex + direction].classList.contains('cop')*/) {
                            squares[cop.currentIndex].classList.remove(cop.className, 'cop') 
                            cop.currentIndex += direction
                            squares[cop.currentIndex].classList.add(cop.className, 'cop')
                            } else direction=directions[Math.floor(Math.random() * directions.length)]
                            //checks to see if burglar has been captured or cleared the board and escaped
                            game.checkCaptured()
                            game.checkCleared()
                            game.checkVictory()
                            game.checkExpired()
                            game.checkTimer()
                    }, cop.speed)                
                }




                function updateRecap() {
                    document.getElementById('recap-message').innerHTML = `Level ${game.currentLevel} complete!`;
                    game.totalScore = game.playerScore + (game.counter*10)
                    document.getElementById('level-score').innerHTML = game.playerScore;
                    document.getElementById('time-left').innerHTML = (game.counter*10);
                    document.getElementById('new-total-score').innerHTML = game.totalScore; 

                }

                soundCoin.preLoad = true;
                soundCoin.loop = false;
                soundBill.preLoad = true;
                soundBill.loop = false;
                soundPriest.preLoad = true;
                soundPriest.loop = true;//this one is the music, so we want it to loop if the game goes on
                soundCapture.preLoad = true;
                soundCapture.loop = false;
                soundWin.loop = false;
                soundWin.preLoad = true;

                
        
        // document.addEventListener('keydown',moveBurglar);

// })