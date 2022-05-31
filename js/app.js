// Motion detections stuff
let mediaDevices;
let canvasSource;
let canvasBlended;
let contextSource;
let contextBlended;
let video;
let timeOut, lastImageData;
let interval;


//Game stuff
var myGamePiece;
var myObstacles = [];
var myScore;
var myGameArea;

//the  iced tea
var icedTea = new Image();
icedTea.src = "assets/objects/iced-coffee.png";
// icedTea.onload = () => {
//    myGameArea.context.drawImage(image, x, y, w, h)
// }

function startGame() {
    myGameArea = {
        canvas : document.getElementById("myCanvas"),
        start : function() {
            this.canvas.width = this.canvas.width
            this.canvas.height = this.canvas.height
            this.context = this.canvas.getContext("2d");
            this.context.fillStyle = "pink"
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            document.body.insertBefore(this.canvas, document.body.childNodes[0]);
            this.frameNo = 0;
            this.interval = setInterval(updateGameArea, 20);
            this.started = true;
            },
        clear : function() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.fillStyle = "pink"
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        },
        stop : function(){
            this.started = false;
            clearInterval(this.interval);
        }
    }
    //myGamePiece = new component(100, 100, "red", 120, 360, "image");
    //myGamePiece.gravity = 0.05;
    myScore = new component("30px", "Consolas", "black", 280, 40, "text");
    myGameArea.start();
}

function component(width, height, color, x, y, type) {
    this.type = type;
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
            myGameArea.context.drawImage(icedTea, this.x, this.y, this.width, this.height)
        
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

function updateGameArea() {
    var x, height, gap, minHeight, maxHeight, minGap, maxGap;
    // for (i = 0; i < myObstacles.length; i += 1) {
    //     if (myGamePiece.crashWith(myObstacles[i])) {
    //         return;
    //     } 
    // }
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
        myObstacles.push(new component(100, 100, "white", width/2 - 5, 0, "image"));
        //myObstacles.push(new component(10, x - height - gap, "green", x, height + gap));
    }
    for (i = 0; i < myObstacles.length; i += 1) {
        myObstacles[i].y += 1;
        myObstacles[i].update();
    }
    myScore.text="SCORE: " + myGameArea.frameNo;
    myScore.update();
    //myGamePiece.newPos();
    //myGamePiece.update();
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
                  myGameArea.start();
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
