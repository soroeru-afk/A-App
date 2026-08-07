export const buildThreeJsScene = (
  imageBase64: string,
  effectId: string,
  resolution: number,
  lighting: number,
  autoRotate: boolean,
  palette: string[],
  colorSide: string,
  bgColor: string,
  thickness: number,
  isTransparent: boolean = false,
  imageZoom: number = 1.0,
  imagePanX: number = 0,
  imagePanY: number = 0,
): string => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; background: transparent; overflow: hidden; font-family: monospace; }
    canvas { display: block; }
    #loader { position: absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:#8a95a3; letter-spacing:0.3em; font-size:10px; font-weight:bold; }
  </style>
  <script type="importmap">
    {
      "imports": {
        "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
        "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
      }
    }
  </script>
</head>
<body>
<div id="loader">INITIALIZING 3D ENGINE...</div>
<script type="module">
  import * as THREE from 'three';
  import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

  const TEXT_IMAGE_BASE64 = '${imageBase64}';
  const EFFECT = '${effectId}';
  const RESOLUTION = ${resolution};
  const AUTO_ROTATE = ${autoRotate};
  const RAW_PALETTE = ${JSON.stringify(palette)}.filter(c => c && typeof c === 'string' && c.startsWith('#'));
  const PALETTE = RAW_PALETTE.length > 0 ? RAW_PALETTE.map(c => parseInt(c.replace('#', '0x'))) : [0xffffff];
  const COLOR_SIDE = parseInt(('${colorSide}' || '#000000').replace('#', '0x'));
  const BG_COLOR = parseInt(('${bgColor}' || '#000000').replace('#', '0x'));
  const THICKNESS = ${thickness};
  const IS_TRANSPARENT = ${isTransparent};
  let LIGHTING = ${lighting};

  const scene = new THREE.Scene();
  if (IS_TRANSPARENT) {
    scene.background = null;
  } else {
    scene.background = new THREE.Color(BG_COLOR);
  }

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 3000);
  camera.position.set(0, 0, RESOLUTION * 1.5);
  
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0); // Transparent
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.autoRotate = AUTO_ROTATE;
  controls.autoRotateSpeed = 2.0;

  // Add lights
  const makeLights = () => {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4 * LIGHTING);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2 * LIGHTING);
    dirLight.position.set(100, 100, 50);
    scene.add(dirLight);
    
    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.8 * LIGHTING);
    dirLight2.position.set(-100, -50, -50);
    scene.add(dirLight2);
    
    const spotLight = new THREE.SpotLight(0xffffff, 1.5 * LIGHTING);
    spotLight.position.set(0, 100, 100);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);
    
    return [ambientLight, dirLight, dirLight2, spotLight];
  };
  
  const lights = makeLights();

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  scene.environment = pmremGenerator.fromScene(scene).texture;

  // Load image and generate
  const img = new Image();
  img.src = TEXT_IMAGE_BASE64;
  
  let instancedMesh;
  
  img.onload = () => {
    document.getElementById('loader').style.display = 'none';
    const aspect = img.width / img.height;
    
    const h = Math.floor(RESOLUTION / Math.sqrt(aspect));
    const w = Math.floor(h * aspect);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', {willReadFrequently: true});
    
    ctx.drawImage(img, 0, 0, w, h);
    const idata = ctx.getImageData(0,0,w,h);
    const data = idata.data;

    let colorGroups = {};
    PALETTE.forEach(c => colorGroups[c] = []);

    for(let y=0; y<h; y++){
      for(let x=0; x<w; x++){
        const idx = (y*w + x) * 4;
        const a = data[idx+3];
        
        if (a > 64) {
           const px = (x - w/2);
           const py = -(y - h/2);
           const r = data[idx];
           const g = data[idx+1];
           const b = data[idx+2];
           
           let minDist = Infinity;
           let nearestHex = PALETTE[0];
           for (let p=0; p<PALETTE.length; p++) {
               const hex = PALETTE[p];
               const pr = (hex >> 16) & 255;
               const pg = (hex >> 8) & 255;
               const pb = hex & 255;
               const dist = (r-pr)*(r-pr) + (g-pg)*(g-pg) + (b-pb)*(b-pb);
               if (dist < minDist) {
                   minDist = dist;
                   nearestHex = hex;
               }
           }
           colorGroups[nearestHex].push(new THREE.Vector3(px, py, 0));
        }
      }
    }

    const groupKeys = Object.keys(colorGroups).filter(k => colorGroups[k].length > 0);
    if (groupKeys.length === 0) return;

    const group = new THREE.Group();
    scene.add(group);

    const dummy = new THREE.Object3D();

    groupKeys.forEach(hexStr => {
      const hexColor = parseInt(hexStr);
      const points = colorGroups[hexColor];
      let instancedMesh;

      if (EFFECT === 'solid_voxel') {
         const geometry = new THREE.BoxGeometry(0.95, 0.95, THICKNESS);
         const matFace = new THREE.MeshStandardMaterial({ 
           color: hexColor, roughness: 0.8, metalness: 0.0 
         });
         const matSide = new THREE.MeshStandardMaterial({ 
           color: COLOR_SIDE, roughness: 0.9, metalness: 0.0 
         });
         const materials = [matSide, matSide, matSide, matSide, matFace, matFace];
         
         instancedMesh = new THREE.InstancedMesh(geometry, materials, points.length);
         
         points.forEach((p, i) => {
           dummy.position.copy(p);
           dummy.updateMatrix();
           instancedMesh.setMatrixAt(i, dummy.matrix);
         });
         group.add(instancedMesh);
      } 
      else if (EFFECT === 'wireframe_block') {
         const geometry = new THREE.BoxGeometry(1, 1, THICKNESS);
         const material = new THREE.MeshBasicMaterial({ 
           color: hexColor,
           wireframe: true,
           transparent: true,
           opacity: 0.6
         });
         instancedMesh = new THREE.InstancedMesh(geometry, material, points.length);
         points.forEach((p, i) => {
           dummy.position.copy(p);
           dummy.updateMatrix();
           instancedMesh.setMatrixAt(i, dummy.matrix);
         });
         group.add(instancedMesh);
      }
      else if (EFFECT === 'dot_matrix') {
         const geometry = new THREE.SphereGeometry(0.4, 12, 12);
         const material = new THREE.MeshStandardMaterial({ 
           color: hexColor,
           roughness: 0.5,
           metalness: 0.0
         });
         instancedMesh = new THREE.InstancedMesh(geometry, material, points.length);
         points.forEach((p, i) => {
           dummy.position.copy(p);
           dummy.updateMatrix();
           instancedMesh.setMatrixAt(i, dummy.matrix);
         });
         group.add(instancedMesh);
      }
      else if (EFFECT === 'dot_matrix_3d') {
         const geometry = new THREE.CylinderGeometry(0.4, 0.4, THICKNESS, 16);
         geometry.rotateX(Math.PI / 2);
         const faceColorObj = new THREE.Color(hexColor);
         const sideColorObj = faceColorObj.clone().multiplyScalar(0.6); // 60% brightness
         
         const matFace = new THREE.MeshStandardMaterial({ 
           color: hexColor, roughness: 0.5, metalness: 0.0 
         });
         const matSide = new THREE.MeshStandardMaterial({ 
           color: sideColorObj.getHex(), roughness: 0.7, metalness: 0.0 
         });
         const materials = [matSide, matFace, matFace];
         
         instancedMesh = new THREE.InstancedMesh(geometry, materials, points.length);
         points.forEach((p, i) => {
           dummy.position.copy(p);
           dummy.updateMatrix();
           instancedMesh.setMatrixAt(i, dummy.matrix);
         });
         group.add(instancedMesh);
      }
      else if (EFFECT === 'clean_flat') {
         const geometry = new THREE.BoxGeometry(1.05, 1.05, THICKNESS);
         const matFace = new THREE.MeshStandardMaterial({ 
           color: hexColor, roughness: 0.8, metalness: 0.0 
         });
         const matSide = new THREE.MeshStandardMaterial({ 
           color: COLOR_SIDE, roughness: 0.8, metalness: 0.0 
         });
         const materials = [matSide, matSide, matSide, matSide, matFace, matFace];
         
         instancedMesh = new THREE.InstancedMesh(geometry, materials, points.length);
         points.forEach((p, i) => {
           dummy.position.copy(p);
           dummy.updateMatrix();
           instancedMesh.setMatrixAt(i, dummy.matrix);
         });
         group.add(instancedMesh);
      }
    });

    const box = new THREE.Box3().setFromObject(group);
    
    // We calculate camera distance directly from the mathematically required distance to match scaled 2D canvas exactly.
    const baseScale2D = 0.5;
    const finalScale2D = baseScale2D * ${imageZoom};
    const pixelsPerUnit = (img.width * finalScale2D) / w;
    const panUnitX = -(${imagePanX}) / pixelsPerUnit;
    const panUnitY = (${imagePanY}) / pixelsPerUnit;
    const distToFront = window.innerHeight / (2 * Math.tan(22.5 * Math.PI / 180) * pixelsPerUnit);
    
    camera.position.set(panUnitX, panUnitY, distToFront + (THICKNESS / 2));
    controls.target.set(panUnitX, panUnitY, 0);
    controls.update();

    if (!IS_TRANSPARENT) {
       scene.fog = new THREE.Fog(BG_COLOR, distToFront * 0.8, distToFront * 3.0);
    }
  };

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  window.addEventListener('message', (e) => {
    if(e.data.type === 'UPDATE_LIGHT') {
      LIGHTING = e.data.value;
      lights[0].intensity = 0.4 * LIGHTING; // ambient
      lights[1].intensity = 1.2 * LIGHTING; // dir1
      lights[2].intensity = 1.0 * LIGHTING; // dir2
      lights[3].intensity = 2.0 * LIGHTING; // spot
    } else if (e.data.type === 'REQUEST_THUMBNAIL') {
      renderer.render(scene, camera);
      const dataUrl = renderer.domElement.toDataURL('image/png');
      window.parent.postMessage({ type: 'THUMBNAIL_DATA', dataUrl }, '*');
    }
  });

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
</script>
</body>
</html>`;
};
