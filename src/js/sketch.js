import p5 from 'p5'
import Stats from 'stats.js'

let N_LINES = 50
const N_POINTS = 12


var stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

window.setup = function(){  
  var canvas = createCanvas(window.innerWidth, window.innerHeight);
  canvas.id('canvas-' + Math.floor(1000*random()))
  canvas.parent('canvas');
}

window.draw = function(){

  stats.begin();
	
  // background(10, 20, 30);
  background(0);
  
  // N_LINES = map(mouseX, 0, width, 40, 80);

  for (let index = 0; index < N_LINES; index++) {
    const paint = map(index, 0, N_LINES, 0, 255)
    stroke(paint)
    noFill()
    drawLine(index)
  }

  stats.end();
}

window.windowResized = function() {
  resizeCanvas(window.innerWidth, window.innerHeight);
}

function drawLine(index = 0){

  beginShape()
  for (let index_x = 0; index_x < N_POINTS; index_x++) {
    const x = map(index_x, 0 , N_POINTS , -width/8, width + width/4)
    const y =  height * noise( x * 0.001, index * 0.02, frameCount * 0.003)
    curveVertex(x, y)
  }
  endShape()
}