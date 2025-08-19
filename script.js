// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(50, 50, 50);
directionalLight.castShadow = false;
// directionalLight.shadow.mapSize.width = 2048;
// directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

// Ground - Main playable area
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x45a80c });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Extended ground for landscape
const extendedGroundGeometry = new THREE.PlaneGeometry(800, 800);
const extendedGroundMaterial = new THREE.MeshLambertMaterial({ color: 0x1791e3 });
const extendedGround = new THREE.Mesh(extendedGroundGeometry, extendedGroundMaterial);
extendedGround.rotation.x = -Math.PI / 2;
extendedGround.position.y = -0.1;
scene.add(extendedGround);

// Fence around the map
function createFence() {
    const fenceHeight = 3;
    const fenceGeometry = new THREE.BoxGeometry(1, fenceHeight, 1);
    const fenceMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    
    for (let i = -50; i <= 50; i += 5) {
        // Top and bottom fences
        const fenceTop = new THREE.Mesh(fenceGeometry, fenceMaterial);
        fenceTop.position.set(i, fenceHeight/2, 50);
        fenceTop.castShadow = true;
        scene.add(fenceTop);
        
        const fenceBottom = new THREE.Mesh(fenceGeometry, fenceMaterial);
        fenceBottom.position.set(i, fenceHeight/2, -50);
        fenceBottom.castShadow = true;
        scene.add(fenceBottom);
        
        // Left and right fences
        const fenceLeft = new THREE.Mesh(fenceGeometry, fenceMaterial);
        fenceLeft.position.set(-50, fenceHeight/2, i);
        fenceLeft.castShadow = true;
        scene.add(fenceLeft);
        
        const fenceRight = new THREE.Mesh(fenceGeometry, fenceMaterial);
        fenceRight.position.set(50, fenceHeight/2, i);
        fenceRight.castShadow = true;
        scene.add(fenceRight);
    }
}
createFence();

// Background landscape
function createLandscape() {
    // Mountains around the entire perimeter
    for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2;
        const distance = 200 + Math.random() * 100;
        const mountainGeometry = new THREE.ConeGeometry(15 + Math.random() * 10, 25 + Math.random() * 15, 8);
        const mountainMaterial = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
        const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
        mountain.position.set(
            Math.cos(angle) * distance,
            12.5,
            Math.sin(angle) * distance
        );
        scene.add(mountain);
    }
    
    // Clouds scattered around the sky
    for (let i = 0; i < 20; i++) {
        const cloudGroup = new THREE.Group();
        
        // Create cloud parts
        for (let j = 0; j < 4; j++) {
            const cloudGeometry = new THREE.SphereGeometry(2 + Math.random() * 3, 8, 6);
            const cloudMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
            const cloudPart = new THREE.Mesh(cloudGeometry, cloudMaterial);
            cloudPart.position.set(
                (Math.random() - 0.5) * 12,
                Math.random() * 2,
                (Math.random() - 0.5) * 6
            );
            cloudGroup.add(cloudPart);
        }
        
        cloudGroup.position.set(
            (Math.random() - 0.5) * 400,
            20 + Math.random() * 10,
            (Math.random() - 0.5) * 400
        );
        scene.add(cloudGroup);
    }
}
createLandscape();

// Trees - Load GLB model
const loader = new THREE.GLTFLoader();
let treeModel = null;

loader.load('./Tree.glb', 
    function(gltf) {
        treeModel = gltf.scene;
        treeModel.traverse(function(child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        // Add random trees using the loaded model
        for (let i = 0; i < 7; i++) {
            const tree = treeModel.clone();
            tree.position.set(
                Math.random() * 80 - 40,
                0,
                Math.random() * 80 - 40
            );
            tree.scale.set(1, 1, 1);
            scene.add(tree);
        }
    },
    function(progress) {
        console.log('Tree loading progress:', progress);
    },
    function(error) {
        console.log('Tree.glb not found, no trees will be added');
    }
);

// Billboards
function createBillboard(x, z, text) {
    const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 5);
    const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.set(x, 2.5, z);
    pole.castShadow = true;
    scene.add(pole);
    
    const boardGeometry = new THREE.PlaneGeometry(4, 2);
    const boardMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const board = new THREE.Mesh(boardGeometry, boardMaterial);
    board.position.set(x, 6, z);
    board.castShadow = true;
    scene.add(board);
    
    // Add text using canvas texture
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;
    context.fillStyle = '#000000';
    context.font = '24px Arial';
    context.textAlign = 'center';
    context.fillText(text, 128, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    const textMaterial = new THREE.MeshLambertMaterial({ map: texture, transparent: true });
    const textGeometry = new THREE.PlaneGeometry(3, 1.5);
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(x, 6, z + 0.01);
    scene.add(textMesh);
}

const bbText="Drop a mail and say Hi!!!"
// Add billboards
// createBillboard(-20, -20, bbText);


// Mailbox
let mailbox = null;
const mailboxLoader = new THREE.GLTFLoader();
mailboxLoader.load('./Mailbox.glb', 
    function(gltf) {
        mailbox = gltf.scene;
        mailbox.traverse(function(child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        mailbox.position.set(-21, 0, -21);
        mailbox.scale.set(1, 1,1);
        scene.add(mailbox);
    }
);

// Desk
let desk = null;
const deskLoader = new THREE.GLTFLoader();
deskLoader.load('./Desk.glb', 
    function(gltf) {
        desk = gltf.scene;
        desk.traverse(function(child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        desk.position.set(10, 0, 0);
        desk.scale.set(2, 2, 2);
        scene.add(desk);
    }
);

// Phone
let phone = null;
const phoneLoader = new THREE.GLTFLoader();
phoneLoader.load('./Phone.glb', 
    function(gltf) {
        phone = gltf.scene;
        phone.traverse(function(child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        phone.position.set(35, 2.4, -35);
        phone.scale.set(0.3, 0.3, 0.3);
        scene.add(phone);
    }
);

// Grass
const grassLoader = new THREE.GLTFLoader();
grassLoader.load('./Sailboat.glb', 
    function(gltf) {
        const grassModel = gltf.scene;
        grassModel.traverse(function(child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        grassModel.position.set(0, 0, 200);
        grassModel.scale.set(0.7, 0.7, 0.7);
        scene.add(grassModel);
    }
);

// Boxes
let boxes = null;
const boxesLoader = new THREE.GLTFLoader();
boxesLoader.load('./Boxes.glb', 
    function(gltf) {
        boxes = gltf.scene;
        boxes.traverse(function(child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        boxes.position.set(31, 0, 35);
        boxes.scale.set(2, 2, 2);
        scene.add(boxes);
    }
);

// People
const people = [];
const peopleMessages = [
    "You can find Sahan's CV in the desk over there.",
    "Say 'Hi' to Sahan. Go to the Mail box over there!!!",
    "All hail Sahan the GOD!!! Creator of this ugly world!!!",
    "Search that box to find Sahan's Transcript...",
    "Yeah...I met Sahan personally. Good guy, nothin bad. He He...",
    "Whaaaat?? You look good!!!.. Look at us...We are boxes and, ahem... balls!! Yuk...",
    "Sahan got a Bsc.(Hons) at UCSC. So what?",
    "Go over that payphone and connect with Sahan"
];

function createPerson(x, z, message) {
    const person = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.BoxGeometry(0.7, 1.1, 0.35);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.7;
    body.castShadow = true;
    person.add(body);
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.28);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDBAC });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.5;
    head.castShadow = true;
    person.add(head);
    
    // Arms
    const armGeometry = new THREE.BoxGeometry(0.18, 0.7, 0.18);
    const armMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDBAC });
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.55, 1.7, 0);
    leftArm.castShadow = true;
    person.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.55, 1.7, 0);
    rightArm.castShadow = true;
    person.add(rightArm);
    
    // Legs
    const legGeometry = new THREE.BoxGeometry(0.22, 0.8, 0.22);
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.22, 0.55, 0);
    leftLeg.castShadow = true;
    person.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.22, 0.55, 0);
    rightLeg.castShadow = true;
    person.add(rightLeg);
    
    person.position.set(x, 0, z);
    scene.add(person);
    
    people.push({ 
        mesh: person,
        leftArm: leftArm,
        rightArm: rightArm,
        leftLeg: leftLeg,
        rightLeg: rightLeg,
        message: message, 
        position: new THREE.Vector3(x, 0, z),
        direction: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
        speed: 0.02 + Math.random() * 0.02,
        isInteracting: false,
        resumeTime: 0,
        walkTime: Math.random() * Math.PI * 2
    });
}

// Add 7 people
for (let i = 0; i < 8; i++) {
    createPerson(
        Math.random() * 60 - 30,
        Math.random() * 60 - 30,
        peopleMessages[i]
    );
}

// Player - AnimatedHuman GLB model
let player = new THREE.Group();
let playerMixer = null;
let walkAction = null;
let idleAction = null;

const playerLoader = new THREE.GLTFLoader();
playerLoader.load('./Adventurer.glb', 
    function(gltf) {
        const playerModel = gltf.scene;
        playerModel.scale.set(2, 2, 2);
        playerModel.traverse(function(child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        // Setup animations
        if (gltf.animations.length > 0) {
            playerMixer = new THREE.AnimationMixer(playerModel);
            
            // Look for walk and idle animations
            gltf.animations.forEach(clip => {
                if (clip.name.toLowerCase().includes('walk') || clip.name.toLowerCase().includes('run')) {
                    walkAction = playerMixer.clipAction(clip);
                }
                if (clip.name.toLowerCase().includes('idle') || clip.name.toLowerCase().includes('stand')) {
                    idleAction = playerMixer.clipAction(clip);
                }
            });
            
            // If no specific animations found, use first available
            if (!walkAction && gltf.animations[0]) walkAction = playerMixer.clipAction(gltf.animations[0]);
            if (!idleAction && gltf.animations[1]) idleAction = playerMixer.clipAction(gltf.animations[1]);
            if (!idleAction && gltf.animations[0] && !walkAction) idleAction = playerMixer.clipAction(gltf.animations[0]);
            
            // Start with idle animation
            if (idleAction) idleAction.play();
        }
        
        player.add(playerModel);
        console.log('AnimatedHuman loaded successfully');
    },
    function(progress) {
        console.log('AnimatedHuman loading progress:', progress);
    },
    function(error) {
        console.log('AnimatedHuman.glb not found, using fallback');
        createFallbackPlayer();
    }
);

// Fallback player if GLB fails to load
function createFallbackPlayer() {
    const bodyGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.4);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x0066cc });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.8;
    body.castShadow = true;
    player.add(body);
}

player.position.set(0, 0, 0);
scene.add(player);

// Animation variables
let walkTime = 0;
let isWalking = false;

// Camera setup
camera.position.set(0, 10, 10);
let cameraAngle = 0;
let cameraDistance = 8;
let cameraHeight = 5;

// Controls
const keys = {};
let eKeyPressed = false;

document.addEventListener('keydown', (event) => {
    keys[event.code] = true;
    
    // Handle E key press for interaction
    if (event.code === 'KeyE' && !eKeyPressed) {
        eKeyPressed = true;
        if (nearbyPerson && !nearbyPerson.isInteracting) {
            startInteraction(nearbyPerson);
        } else if (nearbyMailbox) {
            sendEmail();
        } else if (nearbyDesk) {
            downloadPDF();
        } else if (nearbyPhone && !phoneMenuOpen) {
            openPhoneMenu();
        } else if (nearbyBoxes) {
            downloadTranscript();
        }
    }
});

document.addEventListener('keyup', (event) => {
    keys[event.code] = false;
    
    if (event.code === 'KeyE') {
        eKeyPressed = false;
    }
});

// Mouse controls for camera
let isMouseDown = false;
let mouseX = 0;

document.addEventListener('mousedown', () => {
    isMouseDown = true;
});

document.addEventListener('mouseup', () => {
    isMouseDown = false;
});

document.addEventListener('mousemove', (event) => {
    if (isMouseDown) {
        cameraAngle -= event.movementX * 0.01;
    }
});

// Touch controls for mobile/touchpad
document.addEventListener('touchstart', (event) => {
    if (event.touches.length === 1) {
        mouseX = event.touches[0].clientX;
    }
});

document.addEventListener('touchmove', (event) => {
    if (event.touches.length === 1) {
        const deltaX = event.touches[0].clientX - mouseX;
        cameraAngle -= deltaX * 0.01;
        mouseX = event.touches[0].clientX;
    }
    event.preventDefault();
});

// Movement and interaction
const moveSpeed = 0.3;
const mapBounds = 45;
let nearbyPerson = null;
let nearbyMailbox = false;
let nearbyDesk = false;
let nearbyPhone = false;
let phoneMenuOpen = false;
let nearbyBoxes = false;

function sendEmail() {
    const subject = "Hi from a visitor";
    const body = "I visited your world! Nice to meet you!";
    const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=sahansalgado10@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailLink, '_blank');
}

function downloadPDF() {
    const link = document.createElement('a');
    link.href = './sahanCV.pdf';
    link.download = 'sahanCV.pdf';
    link.click();
}

function openPhoneMenu() {
    phoneMenuOpen = true;
    const menuDiv = document.createElement('div');
    menuDiv.id = 'phoneMenu';
    menuDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.9);
        color: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 1000;
        font-family: Arial;
    `;
    
    menuDiv.innerHTML = `
        <h3>Social Links</h3>
        <div style="margin: 10px 0; cursor: pointer; padding: 10px; background: #333; border-radius: 5px;" onclick="window.open('https://www.linkedin.com/in/sahan-salgado', '_blank'); closePhoneMenu();">LinkedIn</div>
        <div style="margin: 10px 0; cursor: pointer; padding: 10px; background: #333; border-radius: 5px;" onclick="window.open('https://www.facebook.com/sahan.salgado', '_blank'); closePhoneMenu();">Facebook</div>
        <div style="margin: 10px 0; cursor: pointer; padding: 10px; background: #333; border-radius: 5px;" onclick="window.open('https://github.com/MSWSal', '_blank'); closePhoneMenu();">Github</div>
        <div style="margin: 10px 0; cursor: pointer; padding: 10px; background: #666; border-radius: 5px; text-align: center;" onclick="closePhoneMenu();">Close</div>
    `;
    
    document.body.appendChild(menuDiv);
}

function closePhoneMenu() {
    phoneMenuOpen = false;
    const menu = document.getElementById('phoneMenu');
    if (menu) menu.remove();
}

function downloadTranscript() {
    const link = document.createElement('a');
    link.href = './transcript.pdf';
    link.download = 'transcript.pdf';
    link.click();
}

function startInteraction(person) {
    person.isInteracting = true;
    const interactionDiv = document.getElementById('interaction');
    interactionDiv.innerHTML = person.message;
    
    setTimeout(() => {
        interactionDiv.style.display = 'none';
        person.isInteracting = false;
    }, 3000);
}

function update() {
    const currentTime = Date.now();
    
    // Animate people
    people.forEach(person => {
        if (!person.isInteracting && currentTime > person.resumeTime) {
            // Move person
            const newX = person.mesh.position.x + person.direction.x * person.speed;
            const newZ = person.mesh.position.z + person.direction.z * person.speed;
            
            // Boundary check and direction change
            if (Math.abs(newX) > 40 || Math.abs(newZ) > 40) {
                person.direction.multiplyScalar(-1);
            } else {
                // Check collision with desk and mailbox
                let collision = false;
                
                // Desk collision (center at 10, 0, 0 with radius ~3)
                const deskDistance = Math.sqrt((newX - 10) ** 2 + (newZ - 0) ** 2);
                if (deskDistance < 4) {
                    collision = true;
                }
                
                // Mailbox collision (at -21, 0, -21 with radius ~2)
                const mailboxDistance = Math.sqrt((newX - (-21)) ** 2 + (newZ - (-21)) ** 2);
                if (mailboxDistance < 3) {
                    collision = true;
                }
                
                // Phone collision (at 35, 0, -35 with radius ~2)
                const phoneDistance = Math.sqrt((newX - 35) ** 2 + (newZ - (-35)) ** 2);
                if (phoneDistance < 3) {
                    collision = true;
                }
                
                // Boxes collision (at 0, 0, 0 with radius ~3)
                const boxesDistance = Math.sqrt((newX - 0) ** 2 + (newZ - 0) ** 2);
                if (boxesDistance < 4) {
                    collision = true;
                }
                
                if (collision) {
                    person.direction.multiplyScalar(-1);
                } else {
                    person.mesh.position.x = newX;
                    person.mesh.position.z = newZ;
                    person.position.set(newX, 0, newZ);
                }
                
                // Face movement direction
                person.mesh.rotation.y = Math.atan2(person.direction.x, person.direction.z);
                
                // Walking animation
                person.walkTime += 0.15;
                const swing = Math.sin(person.walkTime) * 0.25;
                
                person.leftLeg.rotation.x = swing;
                person.rightLeg.rotation.x = -swing;
                person.leftArm.rotation.x = -swing * 0.4;
                person.rightArm.rotation.x = swing * 0.4;
            }
            
            // Random direction change
            if (Math.random() < 0.01) {
                person.direction = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
            }
        } else {
            // Stop animation when not moving
            person.leftLeg.rotation.x *= 0.9;
            person.rightLeg.rotation.x *= 0.9;
            person.leftArm.rotation.x *= 0.9;
            person.rightArm.rotation.x *= 0.9;
        }
    });
    
    // Player movement relative to camera direction
    const oldPosition = player.position.clone();
    isWalking = false;
    
    const forward = new THREE.Vector3(-Math.sin(cameraAngle), 0, -Math.cos(cameraAngle));
    const right = new THREE.Vector3(Math.cos(cameraAngle), 0, -Math.sin(cameraAngle));
    
    if (keys['KeyW'] || keys['ArrowUp']) {
        player.position.add(forward.clone().multiplyScalar(moveSpeed));
        isWalking = true;
    }
    if (keys['KeyS'] || keys['ArrowDown']) {
        player.position.add(forward.clone().multiplyScalar(-moveSpeed));
        isWalking = true;
    }
    if (keys['KeyA'] || keys['ArrowLeft']) {
        player.position.add(right.clone().multiplyScalar(-moveSpeed));
        isWalking = true;
    }
    if (keys['KeyD'] || keys['ArrowRight']) {
        player.position.add(right.clone().multiplyScalar(moveSpeed));
        isWalking = true;
    }
    
    // Rotate player to face movement direction
    if (isWalking) {
        let targetAngle = cameraAngle + Math.PI;
        if (keys['KeyS']) targetAngle += Math.PI;
        if (keys['KeyA']) targetAngle += keys['KeyW'] ? Math.PI/4 : keys['KeyS'] ? -Math.PI/4 : Math.PI/2;
        if (keys['KeyD']) targetAngle += keys['KeyW'] ? -Math.PI/4 : keys['KeyS'] ? Math.PI/4 : -Math.PI/2;
        
        player.rotation.y = targetAngle;
    }
    
    // Boundary check
    if (Math.abs(player.position.x) > mapBounds || Math.abs(player.position.z) > mapBounds) {
        player.position.copy(oldPosition);
    }
    
    // Animation handling
    if (playerMixer) {
        if (isWalking) {
            if (walkAction && !walkAction.isRunning()) {
                if (idleAction) idleAction.stop();
                walkAction.play();
            }
        } else {
            if (idleAction && !idleAction.isRunning()) {
                if (walkAction) walkAction.stop();
                idleAction.play();
            }
        }
        playerMixer.update(0.016);
    }
    
    // Camera follow with rotation
    camera.position.x = player.position.x + Math.sin(cameraAngle) * cameraDistance;
    camera.position.z = player.position.z + Math.cos(cameraAngle) * cameraDistance;
    camera.position.y = player.position.y + cameraHeight;
    camera.lookAt(new THREE.Vector3(player.position.x, player.position.y + 2, player.position.z));
    
    // Check for nearby people and mailbox
    nearbyPerson = null;
    nearbyMailbox = false;
    nearbyDesk = false;
    nearbyPhone = false;
    nearbyBoxes = false;
    
    for (const person of people) {
        const distance = player.position.distanceTo(person.position);
        if (distance < 5) {
            nearbyPerson = person;
            break;
        }
    }
    
    if (mailbox) {
        const mailboxDistance = player.position.distanceTo(new THREE.Vector3(-21, 0, -21));
        if (mailboxDistance < 6) {
            nearbyMailbox = true;
        }
    }
    
    if (desk) {
        const deskDistance = player.position.distanceTo(new THREE.Vector3(10, 0, 0));
        if (deskDistance < 6) {
            nearbyDesk = true;
        }
    }
    
    if (phone) {
        const phoneDistance = player.position.distanceTo(new THREE.Vector3(35, 0, -35));
        if (phoneDistance < 6) {
            nearbyPhone = true;
        }
    }
    
    if (boxes) {
        const boxesDistance = player.position.distanceTo(new THREE.Vector3(31, 0, 35));
        if (boxesDistance < 6) {
            nearbyBoxes = true;
        }
    }
    
    // Interaction UI
    const interactionDiv = document.getElementById('interaction');
    if (nearbyPerson && !nearbyPerson.isInteracting) {
        interactionDiv.style.display = 'block';
        interactionDiv.innerHTML = 'Press E to interact';
    } else if (nearbyMailbox) {
        interactionDiv.style.display = 'block';
        interactionDiv.innerHTML = 'Press E to send email';
    } else if (nearbyDesk) {
        interactionDiv.style.display = 'block';
        interactionDiv.innerHTML = 'Press E to download PDF';
    } else if (nearbyPhone && !phoneMenuOpen) {
        interactionDiv.style.display = 'block';
        interactionDiv.innerHTML = 'Press E to open social links';
    } else if (nearbyBoxes) {
        interactionDiv.style.display = 'block';
        interactionDiv.innerHTML = 'Press E to download transcript';
    } else if ((!nearbyPerson || nearbyPerson.isInteracting) && !nearbyMailbox && !nearbyDesk && !nearbyPhone && !nearbyBoxes) {
        if (interactionDiv.innerHTML === 'Press E to interact' || interactionDiv.innerHTML === 'Press E to send email' || interactionDiv.innerHTML === 'Press E to download PDF' || interactionDiv.innerHTML === 'Press E to open social links' || interactionDiv.innerHTML === 'Press E to search for transcript') {
            interactionDiv.style.display = 'none';
        }
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();