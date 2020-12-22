import './styl/application.styl'
import skecth from './js/sketch.js'

// Disable zoom on canvas
var canvas = document.getElementById('canvas')
document.addEventListener('touchmove', function (event) {
  if (event.scale !== 1 && event.target.id === 'defaultCanvas0') { event.preventDefault(); }
}, false);

