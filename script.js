//Pobieranie elementu canvas z pliku index.html i tworzenie kontekstu
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
const key = {
    q: false
}
let currentMap = 'a';
let lastFrame = 0;
let deltaTime = 1;
const global = {
    scale: {
        x: 2,
        y: 2
    },
    translation: {
        x: -canvas.width / 2,
        y: -canvas.height
    }
}
let frame;
let lastFullScreen;
let time = Date.now();

//wyswietlanie mapy
const stage = {
    a: {
        arrowRotations: [90, 90, 180, 180, 270, 270, 0, 0, 270, 270, 270, 180, 180, 270, 270, 0, 0, 0, 90],
        imgSrc: "img/tlo1.png",
        collisionsTab: getCollisions(collisions.background1.parse2d(), this.arrowRotations).collisions,
        checkpointsTab: getCollisions(collisions.background1.parse2d()).checkpoints,
        roadTab: getCollisions(collisions.background1.parse2d()).road,
        checkpointOrder: [4, 5, 13, 14, 3, 6, 12, 15, 16, 7, 11, 8, 9, 10, 2, 17, 1, 0, 18], //kolejnosc checkpointow dla mapy a
        amountOfObstacles: 12

    }
}

stage[currentMap].checkpointsTab = reorderArray(stage[currentMap].checkpointsTab, stage[currentMap].checkpointOrder);
for (let i = 0; i < stage[currentMap].checkpointsTab.length; i++) {
    stage[currentMap].checkpointsTab[i].index = i;
    stage[currentMap].checkpointsTab[i].rotation = convertToRadians(stage[currentMap].arrowRotations[i]);
}

//ustawienie mapy jako tlo
const background = new Image();
background.src = stage[currentMap].imgSrc;

// Tworzenie nowej instancji klasy Player dla gracza
const player = new Player({
    position: {
        x: 550,
        y: 400
    },
    color: 'red',
    imageSrc: "assets/img/player1.png"
})

const obstacles = [];
const bots = [];
const botsColor = ['orange', 'darkGreen', 'pink', 'violet'];
const behavior = ['sprinter', 'stabilny', 'agresor', 'taktyk'];

//  for (let i = 0; i < 4; i++) {
//     let row = Math.floor(i / 2); // Rząd (0 lub 1)
//     let col = i % 2;             // Kolumna (0 lub 1)

//    bots.push(new Bot(
//        {
//            position: {
//                x: 300 + (col * 150) - global.translation.x,
//                y: 330 + (row * 75) - global.translation.y
//            },
//            color: botsColor[i],
//            behavior: behavior[i],
//            index: i

//        }
//    ));
// }

// bot do debugowania
bots.push(new Bot(
    {
        position: {
            x: 300 - global.translation.x,
            y: 315 - global.translation.y
        },
        color: "orange",
        behavior: "stabilny",
        index: 0
    }
));

const obstaclesType = [{
    type: "oil",
    color: "black"
},
{
    type: "traffic cone",
    color: "orange"
},
{
    type: "hole",
    color: "gray"
},
];

for (let i = 0; i < 12; i++) {
    const position = stage[currentMap].roadTab[Math.floor(Math.random() * stage[currentMap].roadTab.length) + 1].position;
    obstacles.push(new Obstacle({
        position,
        width: 8 * global.scale.x,
        height: 8 * global.scale.y,
        type: obstaclesType[Math.floor(i / 4)]
    }))
}

const speedometer = new Sprite({
    position: {
        x: 1500,
        y: 550
    },
    imageSrc: "assets/img/speedometer/speedometer.png",
    scale: {
        x: 0.5,
        y: 0.5
    }
})

const pointer = new Sprite({     // Po angielsku to chyba pointer xd (chodzi o wskazówke do prędkościomierza)
    position: {
        x: 1690,
        y: 725
    },
    imageSrc: "assets/img/speedometer/wskaznik.png",
    scale: {
        x: 0.5,
        y: 0.5
    },
    translation: {
        x: 857.5,
        y: 375
    },
    isMovingWithTranslation: true
})

const allCars = [player, ...bots];

const offset = 3; // offset do tworzenia cieni

let rotation = 0;
// Funkcja rekurencyjna gry (odpowiedzialna za animacje)
function animate(currentTime) {
    frame = requestAnimationFrame(animate);
    //if (!checkIfFullScreen() && Date.now() - lastFullScreen > 500) {
    //    cancelAnimationFrame(frame)
    //}
    deltaTime = (currentTime - lastFrame) / 1000; // Konwersja na sekundy
    lastFrame = currentTime;
    if (deltaTime > 1 / 30) deltaTime = 1 / 30; // Zapobieganie skokom FPS
    c.clearRect(0, 0, canvas.width, canvas.height)
    c.save();
    c.translate(global.translation.x, global.translation.y);
    c.scale(global.scale.x, global.scale.y);
    c.drawImage(background, 0, 0);
    c.restore();
    if (key.q) {
        //rysowanie scian
        for (let i = 0; i < stage[currentMap].collisionsTab.length; i++) {
            stage[currentMap].collisionsTab[i].draw();
            stage[currentMap].collisionsTab[i].angle += 0.01;
        }
        //rysowanie checkpointow
        for (let i = 0; i < stage[currentMap].checkpointsTab.length; i++) {
            stage[currentMap].checkpointsTab[i].draw();
        }
        //rysowanie drogi
        for (let i = 0; i < stage[currentMap].roadTab.length; i++) {
            stage[currentMap].roadTab[i].draw();
        }

        //rysowanie przeskód
        for (let i = 0; i < obstacles.length; i++) {
            obstacles[i].draw();
            obstacles[i].update();
        }
    }
    player.update(deltaTime);
    //tworzenie obiektu z ktorym byla wykonana kolizja
    if (!player.allObstacles) {
        const position = stage[currentMap].roadTab[Math.floor(Math.random() * stage[currentMap].roadTab.length) + 1].position;
        obstacles.push(new Obstacle({
            position,
            width: 8 * global.scale.x,
            height: 8 * global.scale.y,
            type: player.deletedObstacle
        }))
    }


    for (let i = 0; i < bots.length; i++) {
        bots[i].update(deltaTime);
    }

    for (let i = 0; i < stage[currentMap].checkpointsTab.length; i++) {
        if (i == player.lastCheckpoint + 1) stage[currentMap].checkpointsTab[i].drawArrow();
    }

    //wyswietlanie komunikatu aby wrocic na tor
    if (!player.isOnRoad) {
        c.fillStyle = "rgba(255, 165, 0, 0.9)"
        c.fillRect((canvas.width - 500) / 2, 50, 500, 100)
        c.strokeStyle = "black"
        c.strokeRect((canvas.width - 500) / 2, 50, 500, 100)
        c.fillStyle = "red";
        c.font = '30px "Press Start 2P"';
        c.textAlign = "center";
        c.textBaseline = "middle"
        c.fillText(`Wróć na tor!  ${5 - parseInt((Date.now() - player.lastRoadTime) / 1000)}`, canvas.width / 2, 100);
    }

    // Timer i liczba okrążeń
    // c.fillStyle = "rgba(0, 0, 0, 0.7)";
    // c.fillRect(0, 10, 150, 100);
    const minutes = parseInt((Date.now() - player.startTime) / 60000);
    const seconds = parseInt(((Date.now() - player.startTime) % 60000) / 1000);
    c.font = '30px "Press Start 2P"';
    c.textAlign = "center";
    c.textBaseline = "middle"
    c.fillStyle = "black";
    c.fillText(`${player.laps}/3`, 60 + offset, 70 + offset);
    c.font = '20px "Press Start 2P"';
    c.fillText(`${minutes}:${seconds}`, 75 + offset, 100 + offset);
    c.fillText("LAPS", 50 + offset, 40 + offset);
    c.fillStyle = "white";
    c.font = '30px "Press Start 2P"';
    c.fillText(`${player.laps}/3`, 60, 70);
    c.font = '20px "Press Start 2P"';
    c.fillText(`${minutes}:${seconds}`, 75, 100);
    c.fillText("LAPS", 50, 40);

    // Wskaźnik turbo
    c.fillStyle = "black";
    c.fillRect(714, 515, 300, 25);
    c.fillStyle = "blue";
    c.fillRect(719 + 290 * ((2 - player.turboAmount) / 2), 520, 290 - (290 * ((2 - player.turboAmount) / 2)), 15);

    // Prędkościomierz
    c.save();
    c.globalAlpha = 0.7;
    speedometer.draw();
    pointer.rotation = (1.2 * Math.PI * Math.abs(player.speed) / player.maxSpeed) + rotation;
    if (Math.abs(player.maxSpeed - player.speed) < 0.1 && pointer.rotation <= 1.5 * Math.PI) rotation += 0.005;
    else if (rotation > 0) rotation -= 0.025
    pointer.draw();
    c.restore();
    
    // Sortowanie tablicy po dystansie każdego z samochodu, żeby przypisać im ich miejsca
    allCars.sort((a, b) => (b.distance + b.distanceFromLastCheckpoint) - (a.distance + a.distanceFromLastCheckpoint));
    allCars.forEach((car, i) => car.place = i + 1);

    // Wypisywanie pozycji gracza
    // c.fillStyle = "rgba(0, 0, 0, 0.7)";
    // c.fillRect(canvas.width - 150, 10, 150, 100)
    c.fillStyle = "black";
    c.font = '30px "Press Start 2P"';
    c.fillText(`${player.place}/${allCars.length}`, canvas.width - 80 + offset, 80 + offset);
    c.font = '20px "Press Start 2P"';
    c.fillText("POS", canvas.width - 100 + offset, 40 + offset);
    c.fillStyle = "white"
    c.font = '30px "Press Start 2P"';
    c.textAlign = "center";
    c.textBaseline = "middle"
    c.fillText(`${player.place}/${allCars.length}`, canvas.width - 80, 80);
    c.font = '20px "Press Start 2P"';
    c.fillText("POS", canvas.width - 100, 40);
}
animate();
