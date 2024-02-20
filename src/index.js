import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import dragDrop from 'drag-drop'

let scene, camera, renderer, controls, heatmapMaterial

init()
animate()

function init() {
  // Set up scene
  scene = new THREE.Scene()

  // Set up camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(5, 5, 5)

  // Set up renderer
  renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  // Set up controls
  controls = new OrbitControls(camera, renderer.domElement)

  // Set up lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
  directionalLight.position.set(5, 5, 5)
  scene.add(directionalLight)

  // Set up heatmap material
  heatmapMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })

  // Set up drag-and-drop for GLB file
  dragDrop('body', (files) => {
    const file = files[0]
    if (file.type === 'model/gltf+json' || file.type === 'model/gltf-binary') {
      loadModel(file)
    } else {
      console.error('Invalid file type. Please upload a GLB file.')
    }
  })
}

function loadModel(file) {
  const loader = new GLTFLoader()
  loader.load(
    URL.createObjectURL(file),
    (gltf) => {
      const mesh = gltf.scene.children[0]
      mesh.material = heatmapMaterial
      scene.add(mesh)
      updateHeatmap(mesh)
    },
    undefined,
    (error) => {
      console.error('Error loading model:', error)
    }
  )
}

function updateHeatmap(mesh) {
  const geometry = mesh.geometry
  const positions = geometry.attributes.position.array
  const colors = []

  for (let i = 0; i < positions.length; i += 3) {
    const height = positions[i + 2]
    const color = new THREE.Color(0xff0000) // Red color for demonstration
    color.setHSL((height + 5) / 10, 1, 0.5) // Adjust color based on height
    colors.push(color.r, color.g, color.b)
  }

  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  heatmapMaterial.vertexColors = THREE.VertexColors
}

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}
