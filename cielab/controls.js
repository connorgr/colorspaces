function updateRotate() {
  var roll = +d3.select('#control-roll').property('value'),
      pitch = +d3.select('#control-pitch').property('value'),
      yaw = +d3.select('#control-yaw').property('value');

  rotateRoll = roll;
  rotatePitch = pitch;
  rotateYaw = yaw;

  renderLabMesh(pitch, yaw, roll);
}

$(document).ready(function() {
  d3.select('#control-roll').on('input', updateRotate);
  d3.select('#control-pitch').on('input', updateRotate);
  d3.select('#control-yaw').on('input', updateRotate);
});
