import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.1/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.161.1/examples/jsm/loaders/GLTFLoader.js';
import { ARButton } from 'https://cdn.jsdelivr.net/npm/three@0.161.1/examples/jsm/webxr/ARButton.js';


document.addEventListener('DOMContentLoaded', () => {
  // Camera Access
  const video = document.getElementById('camera');
  navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: "environment" } }, audio: false })
    .then(stream => { video.srcObject = stream; })
    .catch(error => { console.error("Error accessing camera:", error); });

  // Three.js + AR Setup
  let camera, scene, renderer, model;

  init();

  function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);

    document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] }));

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    const loader = new GLTFLoader();
    loader.load('office_chair.glb', (gltf) => {
      model = gltf.scene;
      model.scale.set(0.5, 0.5, 0.5); // initial scale
    });

    // AR Hit Test (place model on tap)
    const controller = renderer.xr.getController(0);
    controller.addEventListener('select', () => {
      if (model) {
        const clone = model.clone();
        clone.position.set(0, 0, -1).applyMatrix4(controller.matrixWorld);
        clone.quaternion.setFromRotationMatrix(controller.matrixWorld);
        scene.add(clone);
      }
    });
    scene.add(controller);



    renderer.setAnimationLoop(() => { renderer.render(scene, camera); });
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
});
