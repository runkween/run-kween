// Motion detections stuff
let mediaDevices;
let canvasSource;
let canvasBlended;
let contextSource;
let contextBlended;
let video;
let timeOut, lastImageData;
let interval;

//User name
var userName;
var userNameComponent;


//Game stuff
var myGamePiece;
var myObstacles = [];
var roadMarkers = [];
var myScore;
var myGameArea;
var milliePiece;

//the  iced tea
var icedTea = new Image();
icedTea.src = "assets/objects/iced-coffee.png";

//User image
var userPic = new Image();
userPic.src = "assets/profiles/jc-crying.png"

//Millie imabe
var mbb = new Image();
mbb.src = "assets/profiles/mbb.png"

function startGame() {
    myGameArea = {
        parkDiv : document.getElementById("park-div"),
        canvas : document.getElementById("myCanvas"),
        start : function() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.context = this.canvas.getContext("2d");
            this.context.fillStyle = "pink"
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            document.body.insertBefore(this.canvas, document.body.childNodes[0]);
            this.frameNo = 0;
            this.interval = setInterval(updateGameArea, 20);
            this.started = true;
            this.score = 0;
            },
        clear : function() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.fillStyle = "pink"
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        },
        stop : function(){
            this.started = false;
            clearInterval(this.interval);
        },
        resume : function(){
            this.interval = setInterval(updateGameArea, 20);
            this.started = true;
        }
    }
    //add markers before the games starts
    let markerX = 40
    for (i = 0; i < 8; i += 1) {
        roadMarkers.push(new component(40, 20, "white", markerX, window.innerHeight * 0.2 - 10));
        roadMarkers.push(new component(40, 20, "white", markerX, window.innerHeight * 0.8 - 10));
        markerX += 40 * 4
    }
    // Add the user picture
    myGamePiece = new component(200, 300, "red", window.innerWidth / 4, window.innerHeight / 2 - 150 , "image", userPic);
    //Add the username below the picture
    const userNameWidth = getTextWidth("30px Consolas", userName);
    userNameComponent = new component("30px", "Consolas", "black", window.innerWidth / 4 + 100 - userNameWidth/2, window.innerHeight / 2 - 150 + 300 + 16, "text");
    //Add millie
    milliePiece = new component(300, 300, "red", 0, window.innerHeight / 2 - 150 , "image", mbb);
    //myGamePiece.gravity = 0.05;
    myScore = new component("30px", "Consolas", "black", window.innerWidth * 0.8 , 20 + 50, "text");
    myGameArea.start();
}

function component(width, height, color, x, y, type, image) {
    this.type = type;
    this.image = image;
    this.score = 0;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;    
    this.x = x;
    this.y = y;
    this.gravity = 0;
    this.gravitySpeed = 0;
    this.update = function() {
        ctx = myGameArea.context;
        if (this.type == "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);

        } else if (this.type == "image"){
            myGameArea.context.drawImage(this.image, this.x, this.y, this.width, this.height)
        
        } else {
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    this.newPos = function() {
        this.gravitySpeed += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed;
        this.hitBottom();
    }
    this.hitBottom = function() {
        var rockbottom = myGameArea.canvas.height - this.height;
        if (this.y > rockbottom) {
            this.y = rockbottom;
            this.gravitySpeed = 0;
        }
    }
    this.crashWith = function(otherobj) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var crash = true;
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
            crash = false;
        }
        return crash;
    }
}


    //Function to return the width
function getTextWidth(fontName, text) {
    const fontCanvas = document.getElementById("font-canvas");
    const context = fontCanvas.getContext("2d");
    context.font = fontName;
    let metrics = context.measureText(text);
    return metrics.width;
}

function updateGameArea() {
    var x, height, gap, minHeight, maxHeight, minGap, maxGap;
    for (i = 0; i < myObstacles.length; i += 1) {
        if (myGamePiece.crashWith(myObstacles[i])) {
            myObstacles.shift();
            myGameArea.score += 1;
        } 
    }
    myGameArea.clear();
    myGameArea.frameNo += 1;
    if (myGameArea.frameNo == 1 || everyinterval(150)) {
        width = myGameArea.canvas.width;
        height = myGameArea.canvas.height;
        minHeight = 20;
        maxHeight = 200;
        height = 20;
        minGap = 50;
        maxGap = 200;
        gap = 20;
        myObstacles.push(new component(100, 100, "white", width, myGameArea.canvas.height / 2 - 50 , "image", icedTea));
        roadMarkers.push(new component(40, 20, "white", width, myGameArea.canvas.height * 0.2 - 10));
        roadMarkers.push(new component(40, 20, "white", width, myGameArea.canvas.height * 0.8 - 10));
        //myObstacles.push(new component(10, x - height - gap, "green", x, height + gap));
    }
    for (i = 0; i < myObstacles.length; i += 1) {
        myObstacles[i].x += -1;
        myObstacles[i].update();
    }

    for (i = 0; i < roadMarkers.length; i += 1) {
        roadMarkers[i].x += -1;
        roadMarkers[i].update();
    }
    //Update the score
    myScore.text="SCORE: " + myGameArea.score;
    myScore.update();
    //Update the user name
    userNameComponent.text = userName;
    userNameComponent.update();
    //myGamePiece.newPos();
    myGamePiece.update();
    milliePiece.update();
}

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) {return true;}
    return false;
}

function accelerate(n) {
    myGamePiece.gravity = n;
}
//___________________________________GAME STUFF____________________________________________________
function init() {
    mediaDevices = navigator.mediaDevices;
    canvasSource = document.getElementById("canvas-source");
    canvasBlended = document.getElementById("canvas-blended");
    contextSource = canvasSource.getContext('2d');
    contextBlended = canvasBlended.getContext('2d');
    video = document.getElementById("vid");
    // let width = video.width;
    // let height = video.height;
    // contextSource.width = width / 2;
    // contextBlended.width = width / 2;

    mediaDevices.getUserMedia({
        video: true,
        audio: false,
        })
        .then((stream) => {

        // Changing the source of video to current stream.
        video.srcObject = stream;
        video.addEventListener("loadedmetadata", () => {
            video.play();
        });
        })
        .catch(alert);
}

function startMotionDetection() {
    let popupForm = document.getElementById("popup-form");
    popupForm.style.display = "none";
    userName = document.getElementById("username-field").value;
    init()
    startGame()
    interval = window.setInterval(update, 800);
}

function stopMotionDetection(){
    window.clearInterval(interval);
    myGameArea.stop();
}

function update(){
    drawVideo();
    blend()
    checkImageChangeAverage()
}

function blend() {
    let width = canvasSource.width;
    let height = canvasSource.height;
    // get webcam image data
    let sourceData = contextSource.getImageData(width / 4, 0, width * 3/4, height);
    // create an image if the previous image doesn’t exist
    if (!lastImageData) lastImageData = contextSource.getImageData(width / 4, 0, width * 3/4, height);
    // create a ImageData instance to receive the blended result
    let blendedData = contextSource.createImageData(width / 2, height);
    // blend the 2 images
    differenceAccuracy(blendedData.data, sourceData.data, lastImageData.data);
    // draw the result in a canvas
    contextBlended.putImageData(blendedData, 0, 0);
    // store the current webcam image
    lastImageData = sourceData;
}

function fastAbs(value) {
    //equal Math.abs
    return (value ^ (value >> 31)) - (value >> 31);
}

function threshold(value) {
    return (value > 0x15) ? 0xFF : 0;
}

function drawVideo() {
    // let width = canvasSource.width;
    // let height = canvasSource.height;
    contextSource.drawImage(video, 0, 0);
}

function differenceAccuracy(target, data1, data2) {
    if (data1.length != data2.length) return null;
    var i = 0;
    while (i < (data1.length * 0.25)) {
        var average1 = (data1[4*i] + data1[4*i+1] + data1[4*i+2]) / 3;
        var average2 = (data2[4*i] + data2[4*i+1] + data2[4*i+2]) / 3;
        var diff = threshold(fastAbs(average1 - average2));
        target[4*i] = diff;
        target[4*i+1] = diff;
        target[4*i+2] = diff;
        target[4*i+3] = 0xFF;
        ++i;
    }
}

function checkImageChangeAverage() {
    let width = canvasSource.width;
    let height = canvasSource.height;
    var blendedData = contextBlended.getImageData(0, 0, width * 1/2, height);
    var i = 0;
    var average = 0;
    // loop over the pixels
    while (i < (blendedData.data.length * 0.25)) {
        // make an average between the color channel
        average += (blendedData.data[i*4] + blendedData.data[i*4+1] + blendedData.data[i*4+2]) / 3;
        ++i;
    }
          // calculate an average between of the color values of the drum area
          average = Math.round(average / (blendedData.data.length * 0.25));
          console.log(average);
          if (average > 20) {
              if (myGameArea.started === false){
                  myGameArea.resume();
              }
          } else {
              myGameArea.stop();
          }
        
    
}

function drawPNGImage(url, x, y, w, h){
    const image = new Image();
    image.src = url;
    image.onload = () => {
       myGameArea.context.drawImage(image, x, y, w, h)
    }
}
