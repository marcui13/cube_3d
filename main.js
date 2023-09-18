import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';

// Crea la escena
const scene = new THREE.Scene();

// Crea la cámara
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Crea el renderizador
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Array de materiales para las caras del cubo
const materials = [];

// Texturas iniciales (puedes cambiarlas según tus preferencias)
const initialTextures = [
    'brick',
    'pavement',
    'pine',
    'brick',
    'pavement',
    'pine'
];

// Declara un array para mantener un seguimiento de las texturas seleccionadas
const selectedTextures = [...initialTextures];

// Función para cargar las opciones del select con nombres de archivos de texturas
const loadTextureOptions = (selectId, materialIndex) => {
    const textureSelect = document.getElementById(selectId);
    const textureFolder = '/textures/'; // Ruta de la carpeta de texturas

    // Realiza una solicitud fetch para obtener la lista de archivos de texturas
    fetch(`${textureFolder}lista_de_texturas.json`) // Asegúrate de tener un archivo JSON que enumere tus texturas
        .then(response => response.json())
        .then(data => {
            data.textures.forEach(texture => {
                const option = document.createElement('option');
                option.value = texture + '.jpg'; // Agrega la extensión ".jpg"
                option.text = texture;
                textureSelect.appendChild(option);
            });
            // Establece la textura inicial al cargar las opciones
            const texture = new THREE.TextureLoader().load(`${textureFolder}${initialTextures[materialIndex]}.jpg`);
            materials[materialIndex] = new THREE.MeshBasicMaterial({ map: texture });
            textureSelect.value = initialTextures[materialIndex] + '.jpg'; // Agrega la extensión ".jpg"
        })
        .catch(error => console.error('Error al cargar las texturas:', error));
};

// Llama a la función para cargar las opciones para cada select
for (let i = 0; i < 6; i++) {
    loadTextureOptions(`textureSelect${i}`, i);
}

// Crea un cubo de Rubik
const cubeSize = 1;
const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
const rubikCube = new THREE.Mesh(cubeGeometry, materials);
scene.add(rubikCube);

// Agregar una luz direccional
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Agregar una luz ambiental
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Variables para la animación
let rotationSpeed = 0.02;
let isRotating = true;

// Variables para controlar la cámara con las flechas del teclado
const moveDistance = 0.1;

// Función para manejar la animación
const animate = () => {
    requestAnimationFrame(animate);

    if (isRotating) {
        // Rota el cubo de Rubik
        rubikCube.rotation.x += rotationSpeed;
        rubikCube.rotation.y += rotationSpeed;
    }

    // Llama a la función para actualizar la tabla de controles en cada cuadro
    updateControlsTable();

    renderer.render(scene, camera);
};

// Controlar la animación con la tecla "R"
document.addEventListener('keydown', (event) => {
    if (event.key === 'r' || event.key === 'R') {
        isRotating = !isRotating;
    }
});

// Controlar la velocidad de rotación con las teclas "+" y "-"
document.addEventListener('keydown', (event) => {
    if (event.key === '+') {
        rotationSpeed += 0.01;
    } else if (event.key === '-') {
        rotationSpeed -= 0.01;
    }
});

// Controlar la cámara con las flechas del teclado
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
            camera.position.x += moveDistance;
            break;
        case 'ArrowRight':
            camera.position.x -= moveDistance;
            break;
        case 'ArrowUp':
            camera.position.y -= moveDistance;
            break;
        case 'ArrowDown':
            camera.position.y += moveDistance;
            break;
    }
});

// Función para manejar el cambio de textura de una cara específica
const handleTextureChange = (index) => {
    return () => {
        const select = document.getElementById(`textureSelect${index}`);
        const selectedTexture = select.options[select.selectedIndex].value;

        // Actualiza el array de texturas seleccionadas
        selectedTextures[index] = selectedTexture;

        // Cargar la nueva textura
        const texture = new THREE.TextureLoader().load(`/textures/${selectedTexture}`);

        // Crear un nuevo material con la textura seleccionada
        const newMaterial = new THREE.MeshBasicMaterial({ map: texture });

        // Reemplazar el material de la cara del cubo con el nuevo material
        rubikCube.material[index] = newMaterial;

        // Llama a la función para actualizar los selectores de textura
        updateTextureSelectors();
    };
};

// Escuchar el evento de cambio en cada selector de textura
for (let i = 0; i < 6; i++) {
    const textureSelect = document.getElementById(`textureSelect${i}`);
    textureSelect.addEventListener('change', handleTextureChange(i));
}

// Función para actualizar los valores de los selectores de textura
const updateTextureSelectors = () => {
    for (let i = 0; i < 6; i++) {
        const select = document.getElementById(`textureSelect${i}`);
        select.value = selectedTextures[i];
    }
};

// Función para actualizar la tabla de controles con los parámetros del cubo
const updateControlsTable = () => {
    const table = document.getElementById('controlsTable');

    // Limpia la tabla existente
    table.innerHTML = '';

    // Crea filas y celdas para los parámetros deseados
    const params = [
        { name: 'Posición X', value: rubikCube.position.x.toFixed(2) },
        { name: 'Posición Y', value: rubikCube.position.y.toFixed(2) },
        { name: 'Posición Z', value: rubikCube.position.z.toFixed(2) },
        { name: 'Rotación X', value: (rubikCube.rotation.x * 180 / Math.PI).toFixed(2) },
        { name: 'Rotación Y', value: (rubikCube.rotation.y * 180 / Math.PI).toFixed(2) },
        { name: 'Rotación Z', value: (rubikCube.rotation.z * 180 / Math.PI).toFixed(2) },
    ];

    params.forEach(param => {
        const row = table.insertRow();
        const nameCell = row.insertCell(0);
        const valueCell = row.insertCell(1);
        nameCell.innerHTML = param.name;
        valueCell.innerHTML = param.value;
    });
};

// Función para manejar el zoom con el mouse
const handleMouseWheel = (event) => {
    // Ajusta la velocidad de zoom según tu preferencia
    const zoomSpeed = 0.05;

    // Calcula la cantidad de zoom en función de la dirección de la rueda
    const zoomDelta = event.deltaY > 0 ? -zoomSpeed : zoomSpeed;

    // Limita el valor del zoom para evitar que la cámara se aleje demasiado
    if (camera.position.z + zoomDelta > 1 && camera.position.z + zoomDelta < 10) {
        camera.position.z += zoomDelta;
    }
};

// Agregar un evento para el zoom con el mouse
renderer.domElement.addEventListener('wheel', handleMouseWheel);

// Agregar OrbitControls para mover la cámara con el mouse
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

// Función para configurar los valores iniciales de los
const setupTextureSelectors = () => {
    for (let i = 0; i < 6; i++) {
        const select = document.getElementById(`textureSelect${i}`);
        select.value = selectedTextures[i];
    }
};

// Llama a la función de configuración inicial de los
setupTextureSelectors();

animate();
