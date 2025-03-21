

// Funkcja odpowiada za zamianę stopni na radiany używane w rotacjach na canvas
function convertToRadians(angle) {
    return (angle * Math.PI / 180);
}

//funkcja ktora jest warukiem innej funkcji
function checkCollisionsCondition(corners, object) {
    if (corners.rt.y <= object.position.y + object.height &&
        corners.lt.y >= object.position.y + object.height &&
        corners.rt.x <= object.position.x + object.width &&
        corners.lt.x >= object.position.x + object.width) {
        return "collision"
    }
}

//funkcja ktora sprawdza kolizje
function getCollisions(collisions) {
    const checkpointsTab = [];
    const collisionsTab = [];
    const roadTab = [];
    const iceTab = [];
    let witdhMultiplier, heightMultipler;
    for (let i = 1; i < collisions.length; i++) {
        for (let j = 0; j < collisions[i].length; j++) {
            //okreslanie rodzaju hitboxa
            if (collisions[i - 1][j] == 1) {
                witdhMultiplier = 1;
                heightMultipler = 8;
            }
            else if (collisions[i][j - 1] == 1) {
                witdhMultiplier = 8;
                heightMultipler = 1;
            }

            if (collisions[i][j] == 4) {
                collisionsTab.push(new collisionBlock({
                    position: {
                        x: j * 8,
                        y: i * 8
                    },
                    width: 8,
                    height: 8,
                    color: 'rgba(0, 0, 255, 0.5)',
                }))
            }
            //ustalenie miejsca z checkpointem
            else if (collisions[i][j] == 2) {
                checkpointsTab.push(new CheckpointBlock({
                    position: {
                        x: j * 8,
                        y: i * 8
                    },
                    width: 8 * witdhMultiplier,
                    height: 8 * heightMultipler,
                    color: 'rgba(255,255,00, 0.5)',
                    isPassed: false,
                }))
            }
            else if (collisions[i][j] == 3) {
                roadTab.push(new collisionBlock({
                    position: {
                        x: j * 8,
                        y: i * 8
                    },
                    width: 8,
                    height: 8,
                    color: 'rgba(255, 255, 255, 0.5)'
                }))
            }
            else if (collisions[i][j] == 5) {
                iceTab.push(new collisionBlock({
                    position: {
                        x: j * 8,
                        y: i * 8
                    },
                    width: 8,
                    height: 8,
                    color: 'rgba(0, 255, 255, 0.5)'
                }))
            }
        }
    }
    return { collisions: collisionsTab, checkpoints: checkpointsTab, road: roadTab, ice: iceTab };
}

function reorderArray(arr, order) {
    let reordered = new Array(arr.length); // Tworzymy nową tablicę o tej samej długości
    order.forEach((newPosition, currentIndex) => {
        reordered[newPosition] = arr[currentIndex]; // Umieszczamy element na poprawnej pozycji zgodnej z kolejnoscia na trasie
    });

    return reordered;
}

//sprawdzamy czy jest fullscreen
function checkIfFullScreen() {
    return document.fullscreenElement !== null;
}

//sprawdzamy strone pozycji z
function getSidePosition(target, offset) {
    return {
        x: target.position.x + Math.cos(target.angle + Math.PI / 2) * offset,
        y: target.position.y + Math.sin(target.angle + Math.PI / 2) * offset
    };
}

//zwracamy kierunek
function returnDirection(obj1, obj2) {
    if (obj1.hr.x < obj2.hl.x) return "right";
    if (obj1.hl.x > obj2.hr.x) return "left";
    if (obj1.hr.y < obj2.hl.y) return "down";
    if (obj1.hl.y > obj2.hr.y) return "up";
}

// isDifferent dodałem, ponieważ czasem trochę inaczej zapisuje obiekty a nie chce mi się tego zmieniać
function getObjectsToCollisions(obj, isDifferent = false, angle = 0, isInRadians = false, scale = { x: 1, y: 1 }, translation = { x: 0, y: 0 }) {
    if (!isInRadians) angle = convertToRadians(angle);
    if (!isDifferent) {
        return {
            x: obj.position.x * scale.x + translation.x,
            y: obj.position.y * scale.y + translation.y,
            width: obj.width * scale.x,
            height: obj.height * scale.y,
            angle: angle
        }
    }
    return {
        position: {
            x: obj.position.x * scale.x + translation.x,
            y: obj.position.y * scale.y + translation.y,
        },
        width: obj.width * scale.x,
        height: obj.height * scale.y,
        angle: angle
    }
}

function isCollidingButtons(mouse, button) {
    const scaledWidth = button.width * button.scale.x;
    const scaledHeight = button.height * button.scale.y;

    const offsetX = (scaledWidth - button.width) / 2;
    const offsetY = (scaledHeight - button.height) / 2;

    const scaledX = button.position.x - offsetX + button.translation.x;
    const scaledY = button.position.y - offsetY + button.translation.y;

    return (
        mouse.x > scaledX &&
        mouse.x < scaledX + scaledWidth &&
        mouse.y > scaledY &&
        mouse.y < scaledY + scaledHeight
    );
}

function shadowText(text, position, offset, size, textAllign = "center", textBaseline = "middle", font = "Press Start 2P") {
    c.font = `${size}px "${font}"`;
    c.textAlign = textAllign;
    c.textBaseline = textBaseline;
    c.fillStyle = "black";
    c.fillText(text, position.x + offset, position.y + offset);
    c.fillStyle = "white";
    c.fillText(text, position.x, position.y);
}

function getTime(time) {
    let minutes = parseInt(time / 60000);
    let seconds = parseInt((time % 60000) / 1000);

    // dodaje zero z przodu, jak minuty, albo sekundy są jednocyfrowe
    minutes = minutes.toString().padStart(2, "0");
    seconds = seconds.toString().padStart(2, "0");

    return `${minutes}:${seconds}`;
}

function changeLevelProperties() {
    counter = 3;
    global.translation.x = stage[currentMap].startTranslation.x;
    global.translation.y = stage[currentMap].startTranslation.y;
    for (let i = 0; i < stage[currentMap].checkpointsTab.length; i++) {
        stage[currentMap].checkpointsTab[i].index = i;
        stage[currentMap].checkpointsTab[i].rotation = convertToRadians(stage[currentMap].arrowRotations[i]);
        stage[currentMap].checkpointsTab[i].isPassed = false;
    }

    background.src = stage[currentMap].imgSrc;
    foreground.src = stage[currentMap].foregroundSrc;

    obstacles.length = 0;

    for (let i = 0; i < stage[currentMap].amountOfObstacles; i++) {
        const position = stage[currentMap].roadTab[Math.floor(Math.random() * stage[currentMap].roadTab.length) + 1].position;
        obstacles.push(new Obstacle({
            position,
            width: 8 * global.scale.x,
            height: 8 * global.scale.y,
            type: obstaclesType[index],
            imageSrc: obstacleImgSrc[index]
        }))

        if (index == obstaclesType.length - 1) {
            index = 0;
        } else {
            index++;
        }
    }
    player.reset();
    player.position.x = stage[currentMap].playerPos.x;
    player.position.y = stage[currentMap].playerPos.y;
    player.angle = stage[currentMap].rotation;
    bots.forEach((bot, i) => {
        let row = Math.floor(i / 2); // Rząd (0 lub 1)
        let col = i % 2;             // Kolumna (0 lub 1)
        bot.reset();
        bot.position.x = stage[currentMap].botPos.x + (col * 150) - global.translation.x;
        bot.position.y = stage[currentMap].botPos.y + (row * 75) - global.translation.y;
        bot.angle = convertToRadians(stage[currentMap].rotation);
    })

    index = 0;

    for (let i = 0; i < stage[currentMap].amountOfBuffers; i++) {
        const position = stage[currentMap].roadTab[Math.floor(Math.random() * stage[currentMap].roadTab.length) + 1].position;
        obstacles.push(new Obstacle({
            position,
            width: 8 * global.scale.x,
            height: 8 * global.scale.y,
            type: buffersType[index],
            imageSrc: buffersImgSrc[index]
        }))


        if (index == buffersType.length - 1) {
            index = 0;
        } else {
            index++;
        }
    }

}

function addSnow() {
    snowTab.push(new Snow({
        position: {
            x: Math.random() * canvas.width + 1,
            y: 0
        },
        index: snowTab.length,
        radius: Math.random() * 5 + 2,
        velocity: {
            x: Math.random() * 2 - 1,
            y: Math.random() * 2 + 1
        }
    }))
    c.fillStyle = "rgba(224, 247, 250, 0.5)";
    c.fillRect(0, 0, canvas.width, canvas.height);
    snowTab.forEach(snow => {
        snow.update();
    })
    snowTab = snowTab.filter(snow => snow.position.y < canvas.height);
}

// Obsługa przycisków kiedy wcisniety kiedy nie
addEventListener("keydown", (e) => {
    switch (e.key.toLowerCase()) {
        case "a":
            player.key.a = true;
            break;
        case "d":
            player.key.d = true;
            break;
        case "w":
            player.key.w = true;
            break;
        case "s":
            player.key.s = true;
            break;
        case "t":
            player.key.t = true;
            break;
        case " ":
            player.key.space = true;
            break;
        case 'q':
            if (!key.q) key.q = true
            else key.q = false
            break;
    }
})

addEventListener("keyup", (e) => {
    switch (e.key.toLowerCase()) {
        case "a":
            player.key.a = false;
            break;
        case "d":
            player.key.d = false;
            break;
        case "w":
            player.key.w = false;
            break;
        case "s":
            player.key.s = false;
            break;
        case "t":
            player.key.t = false;
            break;
        case " ":
            player.key.space = false;
            break;
        case "m":
            player.money = 10000000000;
            break;
    }
})

// document.querySelector("#fullscreen").addEventListener("click", () => {
//     canvas.requestFullscreen();
//     lastFullScreen = Date.now();
//     animate();
// })

// event listenery do sprawdzania czy gracz najechał lub kliknął na przycisk gdy jest na "End Screenie". Na razie jest tylko jeden, ale może w przysłości będzie
// trzeba więcej
canvas.addEventListener("mousemove", (e) => {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;
    let isHovering = false;
    const buttons = [...endScreenButtons, ...menuButtons, ...tuningButtons, ...carButtons];
    buttons.forEach(button => {
        if (isCollidingButtons({ x: mouseX, y: mouseY }, button) && button.isClickable) {
            canvas.style.cursor = "pointer";
            isHovering = true;
            button.isHovering = true;
            gsap.to(button.scale, {
                x: button.hoverScale.x,
                y: button.hoverScale.y,
                duration: 0.5,
                ease: "power2.out"
            })
        }
        else {
            button.isHovering = false;
            gsap.to(button.scale, {
                x: button.startScale.x,
                y: button.startScale.y,
                duration: 0.5,
                ease: "power2.out"
            })
        }
    })
    if (!isHovering) canvas.style.cursor = "default";
})

canvas.addEventListener("click", (e) => {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;
    const buttons = [...endScreenButtons, ...menuButtons, ...tuningButtons, ...carButtons];
    buttons.forEach(button => {
        if (isCollidingButtons({ x: mouseX, y: mouseY }, button) && button.isClickable) {
            button.click();
        }
    })
})
