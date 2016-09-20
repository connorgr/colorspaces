// TODO: try to list vertices on surface of RGB cube so you can animate
//    between color spaces – take list of RGB points, create all triangles.
//    That way you have a 1-1 mapping between triangles in different spaces

// Declare the vertices and colors for the Lab mesh
var vertices = [],
    cubeVertices = [],
    i,j,k;

function rgbToLab(r,g,b) {
  return d3.lab(d3.rgb(r,g,b));
}
for(i = 0; i < 255; i+=51) {
  for(j = 0; j < 255; j+=51) {
    for(k = 0; k < 255; k+=51) {
      var pt_i, pt_j, pt_k,
          lab = rgbToLab(i,j,k);
      pt_j = lab.l/100; // make sure that y = l
      pt_i = lab.a/100;
      pt_k = lab.b/100;

      vertices.push(new THREE.Vector3(pt_i, pt_j, pt_k));
      cubeVertices.push(new THREE.Vector3(i/255,j/255,k/255));
    }
  }
}

// use the same points to create a convex geometry
function getFaceColorsLab(f, geom) {
  function ptToRGB(pt) {
    var l = pt.y*100, a = pt.x*100, b = pt.z*100,
        rgb = d3.lab(l,a,b).rgb(),
        c = 'rgb('+rgb.r+','+rgb.g+','+rgb.b+')';
    return new THREE.Color(c);
  }
  var vs = [geom.vertices[f.a],
            geom.vertices[f.b],
            geom.vertices[f.c]
  ];
  return vs.map(ptToRGB);
}
function getFaceColorsRGB(f, geom) {
  function ptToRGB(pt) {
    var r = pt.x*255, g = pt.y*255, b = 255 - pt.z*255,
        c = 'rgb('+r+','+g+','+b+')';
    return new THREE.Color(c);
  }
  var vs = [geom.vertices[f.a],
            geom.vertices[f.b],
            geom.vertices[f.c]
  ];
  return vs.map(ptToRGB);
}
function createMesh(geom, getFaceColors, showWireframe) {
  for ( var i = 0; i < geom.faces.length; i ++ ) {
    geom.faces[i].vertexColors = getFaceColors(geom.faces[i], geom);
  }

  var meshMaterial = new THREE.MeshBasicMaterial({
    vertexColors: THREE.VertexColors
  });

  meshMaterial.side = THREE.DoubleSide;
  var wireFrameMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    opacity: showWireframe ? 0.1 : 0,
    transparent: true
  });
  wireFrameMat.wireframe = true;

  // create a multimaterial
  var mesh = THREE.SceneUtils.createMultiMaterialObject(geom, [meshMaterial, wireFrameMat]);

  return mesh;
}

var hullGeometry = new THREE.ConvexGeometry(vertices);
var hullMesh = createMesh(hullGeometry, getFaceColorsLab, false);

// create axis lines for Lab
var lineMaterial = new THREE.LineBasicMaterial({
  color: 0x000000
});

var axis_Lab_L_Geom = new THREE.Geometry(),
    axis_Lab_a_Geom = new THREE.Geometry(),
    axis_Lab_b_Geom = new THREE.Geometry();

axis_Lab_L_Geom.vertices.push(new THREE.Vector3(0, -0.6, 0));
axis_Lab_L_Geom.vertices.push(new THREE.Vector3(0, 0.6, 0));
axis_Lab_a_Geom.vertices.push(new THREE.Vector3(-1, 0, 0));
axis_Lab_a_Geom.vertices.push(new THREE.Vector3(1,0, 0));
axis_Lab_b_Geom.vertices.push(new THREE.Vector3(0, 0, -1));
axis_Lab_b_Geom.vertices.push(new THREE.Vector3(0,0, 1));

var axis_Lab_L = new THREE.Line(axis_Lab_L_Geom, lineMaterial),
    axis_Lab_a = new THREE.Line(axis_Lab_a_Geom, lineMaterial),
    axis_Lab_b = new THREE.Line(axis_Lab_b_Geom, lineMaterial),
    axis_Lab = new THREE.Group();
axis_Lab.add(axis_Lab_L);
axis_Lab.add(axis_Lab_a);
axis_Lab.add(axis_Lab_b);

// RGB Cube points
var points = [
  new THREE.Vector3( 1, 1, 1 ),
	new THREE.Vector3( 1, 1, 0 ),
	new THREE.Vector3( 0, 1, 0 ),
	new THREE.Vector3( 0, 1, 1 ),
	new THREE.Vector3( 1, 0, 1 ),
	new THREE.Vector3( 1, 0, 0 ),
	new THREE.Vector3( 0, 0, 0 ),
	new THREE.Vector3( 0, 0, 1 )
];

rgbCube = createMesh(new THREE.ConvexGeometry(points), getFaceColorsRGB, false);

// create axis lines for RGB
var lineMaterial_red = new THREE.LineBasicMaterial({color: 0xFF0000});
var lineMaterial_green = new THREE.LineBasicMaterial({color: 0x00FF00});
var lineMaterial_blue = new THREE.LineBasicMaterial({color: 0x0000FF});

var axis_rgb_r_Geom = new THREE.Geometry(),
    axis_rgb_g_Geom = new THREE.Geometry(),
    axis_rgb_b_Geom = new THREE.Geometry();

axis_rgb_r_Geom.vertices.push(new THREE.Vector3(-0.75, 0, 0));
axis_rgb_r_Geom.vertices.push(new THREE.Vector3(0.75, 0, 0));
axis_rgb_g_Geom.vertices.push(new THREE.Vector3(0, -0.75, 0));
axis_rgb_g_Geom.vertices.push(new THREE.Vector3(0, 0.75, 0));
axis_rgb_b_Geom.vertices.push(new THREE.Vector3(0, 0, -0.75));
axis_rgb_b_Geom.vertices.push(new THREE.Vector3(0, 0, 0.75));

var axis_rgb_r = new THREE.Line(axis_rgb_r_Geom, lineMaterial_red),
    axis_rgb_g = new THREE.Line(axis_rgb_g_Geom, lineMaterial_green),
    axis_rgb_b = new THREE.Line(axis_rgb_b_Geom, lineMaterial_blue),
    axis_rgb = new THREE.Group();
axis_rgb.add(axis_rgb_r);
axis_rgb.add(axis_rgb_g);
axis_rgb.add(axis_rgb_b);



var labContainer, labRenderer, scene, camera;
var rgbContainer, rgbRenderer, sceneRGBCube, cameraRGBCube;

// create rotation points, h/t http://stackoverflow.com/questions/28848863
var labBox = new THREE.Box3().setFromObject(hullMesh),
    rgbBox = new THREE.Box3().setFromObject(rgbCube);
labBox.center(hullMesh.position);
rgbBox.center(rgbCube.position);
hullMesh.position.multiplyScalar( - 1 );
rgbCube.position.multiplyScalar( - 1 );

var labPivot = new THREE.Group(),
    rgbPivot = new THREE.Group();

labPivot.add(hullMesh);
labPivot.add(axis_Lab);
rgbPivot.add(rgbCube);
rgbPivot.add(axis_rgb);

function renderLabMesh() {
  if(arguments.length == 3) {
    var pitch = arguments[0] * (Math.PI/180),
        yaw = arguments[1] * (Math.PI/180),
        roll = arguments[2] * (Math.PI/180);

    labPivot.rotation.x = pitch;
    labPivot.rotation.y = yaw;
    labPivot.rotation.z = roll;

    rgbPivot.rotation.x = pitch;
    rgbPivot.rotation.y = yaw;
    rgbPivot.rotation.z = roll;
  } else {
    rgbPivot.rotation.y = 90 * (Math.PI/180);
  }
  scene.add(labPivot);
  sceneRGBCube.add(rgbPivot);

  labRenderer.setClearColor( 0xdddddd, 1);
  labRenderer.render( scene, camera );

  rgbRenderer.setClearColor( 0xdddddd, 1);
  rgbRenderer.render( sceneRGBCube, cameraRGBCube );
}

function animate() {
    // requestAnimationFrame(animate);
    renderLabMesh();
}

$(document).ready(function() {
  // set the scene size
  var WIDTH = 400,
      HEIGHT = 400;

  // set some camera attributes
  var VIEW_ANGLE = 45,
      ASPECT = WIDTH / HEIGHT,
      NEAR = 0.1,
      FAR = 10000;

  // get the DOM element to attach to
  // - assume we've got jQuery to hand
  labContainer = d3.select('#labContainer');

  // create a WebGL renderer, camera
  // and a scene
  labRenderer = new THREE.WebGLRenderer();
  labRenderer.setSize(WIDTH, HEIGHT);
  labContainer.node().appendChild(labRenderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
        35,         // Field of view
        WIDTH / HEIGHT,  // Aspect ratio
        0.1,         // Near
        10000       // Far
    );
  camera.position.set( 0, 0, 4 );
  camera.lookAt( scene.position );

  rgbRenderer = new THREE.WebGLRenderer();
  rgbRenderer.setSize(WIDTH, HEIGHT);
  labContainer.node().appendChild(rgbRenderer.domElement);

  sceneRGBCube = new THREE.Scene();
  cameraRGBCube = new THREE.PerspectiveCamera(
        35,         // Field of view
        WIDTH / HEIGHT,  // Aspect ratio
        0.1,         // Near
        10000       // Far
    );
  cameraRGBCube.position.set( 0, 0, 4 );
  cameraRGBCube.lookAt( sceneRGBCube.position );

  animate();
});
