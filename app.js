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
  let loader;

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

    loader = new GLTFLoader();

    // load default model for AR interactions
    loadARModel('office_chair.glb');

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

  function loadARModel(url, preferredScale = 0.5) {
    if (!loader) loader = new GLTFLoader();
    // keep reference to loader-loaded scene for cloning when placing in AR
    loader.load(url, (gltf) => {
      model = gltf.scene;
      // set a reasonable default scale for models (adjust as needed)
      try { model.scale.set(preferredScale, preferredScale, preferredScale); } catch (e) {}
      console.log('AR model loaded:', url);
    }, undefined, (err) => { console.error('Error loading AR model', err); });
  }

  // Expose a setter so other scripts can change which GLTF is used for AR placement
  // Accepts optional preferredScale to apply immediately after loading
  window.setARModel = function(url, preferredScale) {
    if (!url) return;
    loadARModel(url, typeof preferredScale === 'number' ? preferredScale : 0.5);
  };

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
});
