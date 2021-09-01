"use strict";

/*//////////////////
//global variables//
//////////////////*/
var canvas = document.getElementById("jumpyCanvas");
var ctx = canvas.getContext("2d");

var started = false;

//cat data
var cx = 150;
var cy = 175;
var jumpFlag = false;
var jumpCount = 0;
var fallFlag = true;
var fallCount = 0;
var score = 0;
var frameCount = 0;

//pipe data
var buildings = [];
var buildingDelayStart = 1.7 * 100;
var buildingDelay = 0;
var buildingWidth = 90;

//Define vars for gameplay
var env, lv_state = [], lv_action, lv_reward, lv_score = 0, lv_init = 'X', Q_table = {}, f = 0, speed = 7;

draw();
setInterval(mainLoop, speed);

/*///////
//input//
///////*/
// document.addEventListener("keydown", inputHandler, false);
// document.addEventListener("click", inputHandler, false);

function inputHandler(e) {
  if (started) {
    jumpFlag = true;
  }
  else {
    cx = 150;
    cy = 175;
    buildings = [];
    score = 0;
    started = true;
  }
}

function mainLoop() {
  if (!fallFlag) {
    if (started) {
      proc();
      draw();
      if (f > 20) {
        f = 0;
        play();
      }
      else {
        f++;
      }
    }
    else {
      //Loop to learn and play
      if (lv_init == 'X') {
        inputHandler(1);
      }
      else {
        play();
      }
    }
  } else {
    if (fallCount < 75) {
      draw();
      fallCount++;
    }
    else if (fallCount == 75) {
      fallCount = 0;
      fallFlag = false;
      fail();
    }
  }
}


/*/////////////////////////
//changing the game state//
/////////////////////////*/
function proc() {

  moveBuildings();

  if (jumpFlag == true && jumpCount < 40) {
    cy--;
    jumpCount++;
  }
  else if (jumpFlag == true && jumpCount >= 40 && jumpCount < 80) {
    jumpCount++;
  }
  else if (jumpFlag == true && jumpCount >= 80) {
    cy++;
    jumpCount++;
  }
  if (jumpCount == 120) {
    jumpCount = 0;
    jumpFlag = false;
  }

  checkBuildings();
  checkFall();
}

function moveBuildings() {
  buildings.forEach(function (building) {
    building.x--;
    if (!building.scored && building.x < cx) {
      score++;
      building.scored = true;
    }
  });
}

function nextBuilding() {
  if (buildings.length > 0) {
    for (var i = 0; i < buildings.length; i++) {
      if (buildings[i].x <= 150) {
        return buildings[i + 1].x;
      }
    }
  } else {
    return 0;
  }
}

function checkFall() {
  var flag = false;
  buildings.forEach(function (building) {
    if (building.x <= 171 && building.x >= 81) {
      flag = true;
    }
  });
  if (!(flag || jumpFlag)) {
    fallFlag = true;
  }
}

function checkBuildings() {
  buildingDelay = Math.max(buildingDelay - 1, 0)
  if (buildings.length == 0 && buildingDelay === 0) {
    buildingDelay = buildingDelayStart;
    buildings[0] =
    {
      x: 150,
      width: buildingWidth,
      id: Math.floor(Math.random() * 8) + 1,
      scored: false
    };
    buildings[1] =
    {
      x: buildings[0].x + buildingWidth + 100,
      width: buildingWidth,
      id: Math.floor(Math.random() * 8) + 1,
      scored: false
    };
    buildings[2] =
    {
      x: buildings[1].x + buildingWidth + 100,
      width: buildingWidth,
      id: Math.floor(Math.random() * 8) + 1,
      scored: false
    };
  }
  else if (buildings.length < 3 && buildingDelay === 0) {
    buildingDelay = buildingDelayStart;
    buildings[buildings.length] =
    {
      x: buildings[buildings.length - 1].x + buildingWidth + 100,
      width: buildingWidth,
      id: Math.floor(Math.random() * 8) + 1,
      scored: false
    };
  }

  if (buildings.length >= 1 && buildings[0].x <= -90) {
    buildings.shift();
  }

}

function fail() {
  started = false;
}

/*/////////////////////////////
//drawing stuff to the screen//
/////////////////////////////*/
function draw() {
  const image = document.getElementById('bg');
  ctx.drawImage(image, 0, 0, 480, 320);

  if (!fallFlag) {
    frameCount++;
    if (frameCount == 900) {
      frameCount = 0;
    }
    drawBuildings();
    drawCat();
    drawScore();
  } else {
    drawBuildings();
    drawFallingCat();
  }
}

function drawBuildings() {
  buildings.forEach(function (building) {
    const image = document.getElementById('source' + building.id.toString());
    ctx.beginPath();
    ctx.drawImage(image, building.x, 205, 90, 115);
    ctx.closePath();
  });
}

function drawCat() {
  if (started) {
    const image = document.getElementById('cat' + (Math.floor(frameCount / 5) % 9).toString());
    ctx.beginPath();
    ctx.drawImage(image, cx, cy, 42, 30);
    ctx.closePath();
  } else {
    const image = document.getElementById('catFall14');
    ctx.beginPath();
    ctx.drawImage(image, cx, 295, 42, 30);
    ctx.closePath();
  }
}

function drawFallingCat() {
  const image = document.getElementById('catFall' + (Math.floor(fallCount / 5) % 15).toString());
  ctx.beginPath();
  ctx.drawImage(image, cx + 21, cy + (Math.floor(fallCount / 5) % 15 + 1) * 8, 42, 30);
  ctx.closePath();
}

function drawScore() {
  ctx.fillStyle = "#000000"
  ctx.font = "32px serif";
  ctx.textAlign = "center"
  ctx.fillText(score, canvas.width / 2, 50);
  if (!started) {
    ctx.font = "25px serif"
    ctx.fillText("You lost.", canvas.width / 2, canvas.height / 2 - 50)
    ctx.fillText("Press any key to try again.", canvas.width / 2, canvas.height / 2)
  }
}

var JumpyCat = function () {
  this.reset();
}

JumpyCat.prototype = {
  reset: function () {
    this.horizontalDistance = 150 + buildingWidth + 100;
    this.gamma = 1;
    this.alpha = 0.7;
    this.actionSet = {
      STAY: '0',
      JUMP: '1'
    };
    this.s = [];
  },
  getState: function () {
    if (buildings.length > 0) {
      this.horizontalDistance = parseFloat(parseFloat(nextBuilding() - 150).toFixed(0));
    }
    this.s = [this.horizontalDistance];
    return this.s;
  },
  implementAction: function (a) {
    if (a == 1) {
      inputHandler(1);
    }
  },
  getQ: function (s, a) {
    var config = [s[0], a];
    if (!(config in Q_table)) {
      // If there's no entry in the given Q-table for the given state-action
      // pair, return a default reward score as 0
      return 0;
    }
    return Q_table[config];
  },
  setQ: function (s, a, r) {
    var config = [s[0], a];
    if (!(config in Q_table)) {
      Q_table[config] = 0;
    }
    Q_table[config] += r;
  },
  getAction: function (state) {

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
  rewardTheCat: function (s, a) {
    var rewardForState = 0;
    var futureState = this.getState();

    //Try old rewarding method
    if (started == true) {
      rewardForState = 1;
    }
    else {
      rewardForState = -1000;
    }

    var optimalFutureValue = Math.max(this.getQ(futureState, this.actionSet.STAY),
      this.getQ(futureState, this.actionSet.JUMP));
    var updateValue = this.alpha * (rewardForState + this.gamma * optimalFutureValue - this.getQ(s, a));

    this.setQ(s, a, updateValue);
  }
}

function play() {
  if (lv_init == 'X') {
    lv_init = '';
    env = new JumpyCat();
    env.reset();
    lv_state = env.getState();
    lv_action = env.getAction(lv_state);
    env.implementAction(lv_action);
  }
  else {
    env.rewardTheCat(lv_state, lv_action);//Reward and learn
    if (started == true) {
      lv_state = env.getState();
      lv_action = env.getAction(lv_state);
      env.implementAction(lv_action);
    }
    else {
      inputHandler(1);
      buildingDelay = 0;
      f = 0;
    }
  }
}
