"use strict";

/*//////////////////
//global variables//
//////////////////*/
var canvas = document.getElementById("jumpyCanvas");
var ctx = canvas.getContext("2d");

var started = false;

//cat data
var bx = canvas.width / 2;
var by = canvas.height / 2;
var cx = 150;
var cy = 175;
var mom = 0;
var jumpFlag = false;
var jumpCount = false;
var birdSize = 10;
var score = 0;

//pipe data
var pipes = [];
var buildings = [];
var pipeDelayStart = 1.7 * 100; //amount of time between pipe spawns
var pipeDelay = 0;
var buildingDelayStart = 1.7 * 100;
var buildingDelay = 0;
var pipeWidth = 30;
var buildingWidth = 90;
var pipeColor = "#3CC128";
var gapSizeDef = 150;
var gapStartPoint = 200;

//Define vars for gameplay
var env,lv_state=[],lv_action,lv_reward,lv_score=0,lv_init='X',Q_table = {},f=0,speed=7;

draw();
setInterval(mainLoop, speed);

/*///////
//input//
///////*/
document.addEventListener("keydown", inputHandler, false);
document.addEventListener("click", inputHandler, false);

function inputHandler(e)
{
	if(started)
	{
		// mom = Math.min(mom + 3, 20);
    mom = 50;
    jumpFlag = true;
	}
	else
	{
		bx = canvas.width / 2;
		by = canvas.height / 2;
		mom = 0;
		pipes = [];
    // buildings = [];
		score = 0;
		started = true;
	}
}

function mainLoop()
{
	if(started){
    proc();
		draw();
        if(f>20){
           f=0;    
           play();  
        }
        else{
            f++;
        }
	}
    else{
        //Loop to learn and play
        if(lv_init == 'X'){
           inputHandler(1);
        }
        else{
           play(); 
        }
    }
}


/*/////////////////////////
//changing the game state//
/////////////////////////*/
function proc()
{
	movePipes();
  moveBuildings();
  if(jumpFlag == true && jumpCount < 50){
    cy--;
    jumpCount++;
  }
  else if(jumpFlag == true && jumpCount >= 50){
    cy++;
    jumpCount++;
  }
  if(jumpCount == 100){
    jumpCount = 0;
    jumpFlag = false;
  }

	// by -= mom;
  // cy -= mom;
  // if(cy == 125){
  //   mom = -50;
  // }else{
  //   mom = 0;
  // }

	// mom = Math.max(-50, mom - 0.100);
  checkBuildings();
  if (checkFall()){
    console.log("Nigga alive");
  }
	checkColl();
	checkPipes();
}

function moveBuildings()
{
	buildings.forEach(function(building)
	{
		building.x--;
		// if(!building.scored && building.x < canvas.width / 2)
		// {
		// 	score++;
		// 	building.scored = true;
		// }
	});
}

function movePipes()
{
	pipes.forEach(function(pipe)
	{
		pipe.x--;
		if(!pipe.scored && pipe.x < canvas.width / 2)
		{
			score++;
			pipe.scored = true;
		}
	});
}

function checkFall(){
  var flag = false;
  buildings.forEach(function(building){
    if (building.x <=  171 && building.x >= 81){
      flag = true;
    }
  });
  return flag;
}

function checkColl()
{
	//top/bottom check
	if(by - birdSize < 0 || by + birdSize > canvas.height)
	{
		fail()
	}
	
	//pipe check
	pipes.forEach(function(pipe)
	{
		//check both upper and lower rectangle. birdsize has some extra margin so it doesnt look like you didnt hit the pipe but lost anyway
		if((pointRectDist(bx, by, pipe.x - pipe.width, 0, pipe.width, pipe.gapStart) < birdSize - 2)
			|| (pointRectDist(bx, by, pipe.x - pipe.width, pipe.gapStart + pipe.gapSize, pipe.width, canvas.height - (pipe.gapStart + pipe.gapSize)) < birdSize - 2))
			{
				fail();
			}
	});
}

function checkBuildings()
{
	buildingDelay = Math.max(buildingDelay - 1, 0)
  if(buildings.length == 0 && buildingDelay === 0)
	{
		buildingDelay = buildingDelayStart;
		buildings[0] = 
					{		x 			:  150,
							width 		: 	buildingWidth,
              id        :   Math.floor(Math.random() * 10) + 1,
							scored		:	false
					};
    buildings[1] = 
    {		x 			:  buildings[0].x + buildingWidth + 100,
        width 		: 	buildingWidth,
        id        :   Math.floor(Math.random() * 10) + 1,
        scored		:	false
    };
    buildings[2] = 
    {		x 			:  buildings[1].x + buildingWidth + 100,
        width 		: 	buildingWidth,
        id        :   Math.floor(Math.random() * 10) + 1,
        scored		:	false
    };
	}
	else if(buildings.length < 3 && buildingDelay === 0)
	{
		buildingDelay = buildingDelayStart;
		buildings[buildings.length] = 
					{		x 			: 	buildings[buildings.length - 1].x + buildingWidth + 100,
							width 		: 	buildingWidth,
              id        :   Math.floor(Math.random() * 10) + 1,
							scored		:	false
					};
	}

	if(buildings.length >= 1 && buildings[0].x <= -90)
	{
		buildings.shift();
	}

}

function checkPipes()
{
	pipeDelay = Math.max(pipeDelay - 1, 0)
	if(pipes.length < 3 && pipeDelay === 0)
	{
		pipeDelay = pipeDelayStart;
		pipes[pipes.length] = 
					{		x 			: 	canvas.width + pipeWidth,
							width 		: 	pipeWidth,
							gapStart 	:	200,
							gapSize		:	150,
							scored		:	false
					};
	}

	if(pipes.length >= 1 && pipes[0].x <= 0)
	{
		pipes.shift();
	}

}

function fail()
{
		started = false;
}

/*/////////////////////////////
//drawing stuff to the screen//
/////////////////////////////*/
function draw()
{
	ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBuildings();
	drawPipes();
	drawBird();
  drawCat();
	drawScore();
}

function drawBuildings(){
  buildings.forEach(function(building){
    const image = document.getElementById('source' + building.id.toString());
    ctx.beginPath();
    ctx.drawImage(image, building.x, 205, 90, 115);
    ctx.closePath();
  });
}

function drawPipes()
{
	pipes.forEach(function(pipe)
	{
		ctx.beginPath();
		ctx.rect(pipe.x, 0, -pipe.width, pipe.gapStart);
		ctx.fillStyle = pipeColor;
		ctx.fill();
		ctx.closePath();
		
		ctx.beginPath();
		ctx.rect(pipe.x, pipe.gapStart + pipe.gapSize, -pipe.width, canvas.height - (pipe.gapStart + pipe.gapSize));
		ctx.fillStyle = pipeColor;
		ctx.fill();
		ctx.closePath();
	});
}

function drawCat(){
  
  const image = document.getElementById('cat');
  ctx.beginPath();
  ctx.drawImage(image, cx, cy, 42, 30);
  ctx.closePath();

}

function drawBird()
{
	ctx.beginPath();
	ctx.arc(bx, by, birdSize, 0, Math.PI*2);
	ctx.fillStyle = "#0095DD";
	ctx.fill();
	ctx.closePath();
}

function drawScore()
{
	ctx.fillStyle = "#000000"
	ctx.font = "32px serif";
	ctx.textAlign = "center"
	ctx.fillText(score, canvas.width / 2, 50);
	if(!started)
	{
		ctx.font = "25px serif"
		ctx.fillText("You lost.", canvas.width / 2, canvas.height / 2 - 50)
		ctx.fillText("Press any key to try again.", canvas.width / 2, canvas.height / 2)
	}
}


function randomBetween(min, max) //not an npm package
{
	return Math.random() * (max - min) + min;
}

function pointRectDist(px, py, rx, ry, rwidth, rheight)
{
    var cx = Math.max(Math.min(px, rx+rwidth ), rx);
    var cy = Math.max(Math.min(py, ry+rheight), ry);
    return Math.sqrt( (px-cx)*(px-cx) + (py-cy)*(py-cy) );
}


var FlappyBird = function() { 
 this.reset();
}
FlappyBird.prototype = {
  reset: function() {
    this.fpbrelx = canvas.width + pipeWidth - bx;//horizontal distance from next pipe.
    this.fpbrely = gapStartPoint + gapSizeDef - by;//vertical distance from lower pipe
    this.fpbdora = false;
    this.gamma = 1;//Discount Factor 0.8
    this.alpha = 0.7;//Learning rate 0.1
    //this.Q_table = {};//Already Globally defined
    this.actionSet = {
                      STAY : '0',
                      JUMP : '1'
                     };
    this.s = [];
  },
  getState: function() {
      
     if(pipes.length >0){
        if(bx <= pipes[0].x){this.fpbrelx = parseFloat(parseFloat(pipes[0].x - bx).toFixed(0));}
        else{this.fpbrelx = parseFloat(parseFloat(pipes[1].x - bx).toFixed(0));}
    }
    //this.fpbrelx = 0;
    //this.fpbrely = parseFloat(parseFloat(gapStartPoint + gapSizeDef/2 - by).toFixed(0));
    if(pipes.length >0){//Dynamic Pipe Size
        if(bx <= pipes[0].x){this.fpbrely = parseFloat(parseFloat(pipes[0].gapStart + pipes[0].gapSize/2 - by).toFixed(0));}
        else{this.fpbrely = parseFloat(parseFloat(pipes[1].gapStart + pipes[1].gapSize/2 - by).toFixed(0));}
    }

    this.s = [this.fpbrelx,this.fpbrely,parseFloat(parseFloat(mom).toFixed(1))];
    return this.s;
  },
  implementAction: function(a){
      if(a==1){
       inputHandler(1);
      }
  },
  getQ: function(s, a){
      var config = [ s[0], s[1], s[2], a];
      if (!(config in Q_table)) {
         // If there's no entry in the given Q-table for the given state-action
         // pair, return a default reward score as 0
         return 0;
      }
      return Q_table[config];
  },
  setQ: function(s, a, r){
      var config = [ s[0], s[1], s[2], a];
      if (!(config in Q_table)) {
        Q_table[config] = 0;
      }
      Q_table[config] += r;
  },
  getAction: function(state){

      var rewardForStay = this.getQ(state, this.actionSet.STAY);
      var rewardForJump = this.getQ(state, this.actionSet.JUMP);

      if (rewardForStay > rewardForJump) {
        // If reward for Stay is higher, command the flappy bird to stay
        return this.actionSet.STAY;
      } else if (rewardForStay < rewardForJump) {
        // If reward for Jump is higher, command the flappy bird to jump
        return this.actionSet.JUMP;
      } else {
          return this.actionSet.STAY; 
      }
  },
  rewardTheBird: function(s, a){

      
        var rewardForState=0;
        var futureState = this.getState();
      
      //Try old rewarding method
      if(started == true){
          rewardForState = 1 ;
      }
      else{
          rewardForState = -1000;
      }

        var optimalFutureValue = Math.max(this.getQ(futureState, this.actionSet.STAY), 
                                          this.getQ(futureState, this.actionSet.JUMP));
        var updateValue = this.alpha*(rewardForState + this.gamma * optimalFutureValue - this.getQ(s, a));

        this.setQ(s, a, updateValue);
    }    
}


function play(){
  if(lv_init == 'X'){
     lv_init = '';
     env = new FlappyBird();
     env.reset();
     lv_state   = env.getState();
     lv_action = env.getAction(lv_state); // s is an array of length 3
     env.implementAction(lv_action); 
   }
  else{
    env.rewardTheBird(lv_state,lv_action);//Reward and learn
    if(started == true){
       lv_state   = env.getState();
       lv_action = env.getAction(lv_state); // s is an array of length 3
       env.implementAction(lv_action); 
    }
    else{
        inputHandler(1);
        pipeDelay = 0;
        f=0;
    } 
  }
}
