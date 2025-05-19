const canvas = document.getElementById("canvas");
let gameOver = false
const tank_coords = []
const possible_players = ["Red", "Blue", "Green", "Purple", "Yellow", "Black"]
let players_play = [true, true, true, true, true, true]
let players = ["Red", "Blue", "Green", "Yellow", "Black"]
let player_cards = []
let turn = "Red"
let hasAttackedThisTurn = false;
let troopsForDeployment = 0
const possible_phases = ["Deployment", "Combat", "Transfer"]
let phase = "Deployment"
const attackerMaxDice = 3
const defenderMaxDice = 3
let conqueredProvince = false
const ctx = canvas.getContext("2d");
const bgr = document.getElementById("bgr")
const continents = [
    { provinces: [26, 27, 28, 29, 30, 31, 32], bonus: 5 },
    { provinces: [18, 19, 20, 21, 22, 23, 24, 25], bonus: 5 },
    { provinces: [13, 14, 15, 16, 17], bonus: 3 },
    { provinces: [7, 8, 9, 10, 11, 12], bonus: 3 },
    { provinces: [5, 4, 6], bonus: 2 },
    { provinces: [0, 1, 2, 3], bonus: 2 },
    { provinces: [33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44], bonus: 7 }
]

canvas.addEventListener("click", e => {
    xy = getMousePos(canvas, e)
    getProvinceFromCoordinates(xy.x, xy.y).then(index => { fromProvince = index; console.log(fromProvince); renderState() })
})

canvas.addEventListener("contextmenu", e => {
    e.preventDefault()
    xy = getMousePos(canvas, e)
    getProvinceFromCoordinates(xy.x, xy.y).then(index => { toProvince = index; console.log(toProvince); renderState() })
})

setTimeout(function () {
    let img = document.getElementById("background")
    ctx.drawImage(img, 0, 0)
    drawTanks()
    renderState()
}, 15)

let fromProvince = undefined
let toProvince = undefined

function showToolTip(index, x, y) {
    let province = provinces[index]
    if (!province) {
        return;
    }
    tooltip = document.createElement("div")
    let provinceName = document.createElement("b")
    provinceName.innerText = province.name
    let provinceOwner = document.createElement("div")
    provinceOwner.innerText = "Owner: " + province.owner
    let provinceStrength = document.createElement("div")
    provinceStrength.innerHTML = "Army: " + province.armies
    tooltip.appendChild(provinceName)
    tooltip.appendChild(provinceOwner)
    tooltip.appendChild(provinceStrength)
    tooltip.classList.add("tooltip")
    tooltip.style = "position: absolute; top: " + y + "px; left: " + x + "px;"
    document.body.classList.add('no-cursor');
    document.body.appendChild(tooltip)

}

function renderState() {
    const attackDiv = document.getElementById("attack")
    const deploymentDiv = document.getElementById("deploy")
    const transferDiv = document.getElementById("transfer")
    const nextPhaseButton = document.getElementById("next-phase-btn")
    if (phase == "Combat") {
        attackDiv.style.display = "block"
    }
    else {
        attackDiv.style.display = "none"

    }
    if (phase == "Deployment") {
        deploymentDiv.style.display = "block"
    }
    else {
        deploymentDiv.style.display = "none"
    }
    if (phase == "Transfer") {
        transferDiv.style.display = "block"
        nextPhaseButton.innerText = "Next player"
    }
    else {
        transferDiv.style.display = "none"
        nextPhaseButton.innerText = "Next phase"
    }
    if (gameOver) {
        nextPhaseButton.innerText = "New game"
    }
    const from = document.getElementById("province-from")
    if (provinces[fromProvince]) {
        from.innerText = provinces[fromProvince].name + " (" + provinces[fromProvince].armies + ")"
    }
    else {
        from.innerText = ""
    }
    const to = document.getElementById("province-to")
    if (provinces[toProvince]) {
        to.innerText = provinces[toProvince].name + " (" + provinces[toProvince].armies + ")"
    }
    else {
        to.innerText = ""
    }
    const deployTo = document.getElementById("deployment-province")
    if (provinces[fromProvince]) {
        deployTo.innerText = provinces[fromProvince].name
    }
    else {
        deployTo.innerText = ""
    }
    const deploymentAvailable = document.getElementById("deployment-available")
    deploymentAvailable.innerText = troopsForDeployment
    const turnDisplay = document.getElementById("turn")
    turnDisplay.innerText = turn
    const phaseDisplay = document.getElementById("phase")
    phaseDisplay.innerText = phase
    const transferFrom = document.getElementById("transfer-from")
    if (provinces[fromProvince]) {
        transferFrom.innerText = provinces[fromProvince].name
    }
    else {
        transferFrom.innerText = ""
    }
    const transferTo = document.getElementById("transfer-to")
    if (provinces[toProvince]) {
        transferTo.innerText = provinces[toProvince].name
    }
    else {
        transferTo.innerText = ""
    }
    const turnInCardsButton = document.getElementById("turn-in-cards-btn")
    turnInCardsButton.style.display = "none"
    turnInCardsButton.innerText = "Turn in cards"
    let num = howManyCardsWhenTurningIn()
    if (num > 0) {
        turnInCardsButton.style.display = "block"
        turnInCardsButton.innerText = "Turn in cards (+"+num+")"
    }
    renderIntel()
    renderCards()
    renderCanvas()
}

function renderCanvas() {
    let img = document.getElementById("background")
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0)
    drawTanks()
}

var timeout;
var tooltip = undefined;

document.onmousemove = function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    clearTimeout(timeout);
    if (tooltip) {
        document.body.removeChild(tooltip)
        tooltip = undefined
    }
    document.body.classList.remove('no-cursor')
    timeout = setTimeout(function () {
        xy = getMousePos(canvas, e);
        getProvinceFromCoordinates(xy.x, xy.y).then(index => {
            showToolTip(index, mouseX, mouseY);
        })
    }, 1000);
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: Math.floor((evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width),
        y: Math.floor((evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height)
    };
}

const provinces = [
    {
        name: "Sombor",
        rgb: [158, 242, 255],
        owner: "Red",
        armies: 10,
        boundingBox: {
            width: 91,
            height: 44,
            x: 34,
            y: 101
        },
        adjacencies: [1, 2, 3, 4, 5]
    },
    {
        name: "Apatin",
        rgb: [86, 224, 255],
        owner: "Green",
        armies: 10,
        boundingBox: {
            width: 36,
            height: 53,
            x: 41,
            y: 166
        },
        adjacencies: [0, 2]
    },
    {
        name: "Odžaci",
        rgb: [201, 255, 248],
        owner: "Blue",
        armies: 1,
        boundingBox: {
            width: 57,
            height: 40,
            x: 77,
            y: 208
        },
        adjacencies: [0, 1, 3, 39, 37, 38]
    },
    {
        name: "Kula",
        rgb: [137, 249, 255],
        owner: "Yellow",
        armies: 1,
        boundingBox: {
            width: 47,
            height: 52,
            x: 128,
            y: 158
        },
        adjacencies: [0, 2, 39, 6, 5, 4]
    },
    {
        name: "Subotica",
        rgb: [40, 126, 255],
        owner: "Yellow",
        armies: 1,
        boundingBox: {
            width: 65,
            height: 75,
            x: 162,
            y: 24
        },
        adjacencies: [0, 5, 7, 8]
    },
    {
        name: "Bačka Topola",
        rgb: [89, 127, 255],
        owner: "Black",
        armies: 1,
        boundingBox: {
            width: 87,
            height: 35,
            x: 144,
            y: 112
        },
        adjacencies: [0, 3, 4, 6, 42, 9, 8]
    },
    {
        name: "Mali Iđos",
        rgb: [107, 114, 255],
        owner: "Red",
        armies: 1,
        boundingBox: {
            height: 40,
            width: 32,
            x: 188,
            y: 150
        },
        adjacencies: [3, 5, 39, 41, 42]
    },
    {
        name: "Kanjiža",
        rgb: [199, 0, 255],
        owner: "Green",
        armies: 1,
        boundingBox: {
            height: 58,
            width: 40,
            x: 245,
            y: 21
        },
        adjacencies: [4, 8, 11, 10]
    },
    {
        name: "Senta",
        rgb: [197, 91, 255],
        owner: "Blue",
        armies: 1,
        boundingBox: {
            height: 25,
            width: 60,
            x: 241,
            y: 90
        },
        adjacencies: [4, 5, 9, 11, 7]
    },
    {
        name: "Ada",
        rgb: [182, 122, 255],
        owner: "Yellow",
        armies: 1,
        boundingBox: {
            width: 57,
            height: 23,
            x: 247,
            y: 125
        },
        adjacencies: [5, 42, 13, 12, 11, 8]
    },
    {
        name: "Novi Kneževac",
        rgb: [243, 20, 255],
        owner: "Red",
        armies: 1,
        boundingBox: {
            width: 47,
            height: 37,
            x: 289,
            y: 27
        }
        ,
        adjacencies: [7, 11]
    },
    {
        name: "Čoka",
        rgb: [219, 63, 255],
        owner: "Red",
        armies: 1,
        boundingBox: {
            width: 34,
            height: 41,
            x: 299,
            y: 73
        },
        adjacencies: [7, 8, 9, 10, 12]
    },
    {
        name: "Kikinda",
        rgb: [224, 100, 255],
        owner: "Red",
        armies: 1,
        boundingBox: {
            height: 50,
            width: 55,
            x: 355,
            y: 104
        },
        adjacencies: [9, 11, 13, 14, 15, 16]
    },
    {
        name: "Novi Bečej",
        rgb: [251, 255, 61],
        owner: "Red",
        armies: 1,
        boundingBox: {
            height: 47,
            width: 47,
            x: 302,
            y: 161
        }
        ,
        adjacencies: [9, 12, 14, 43, 42]
    },
    {
        name: "Zrenjanin",
        rgb: [255, 247, 30],
        owner: "Red",
        armies: 1,
        boundingBox: {
            width: 74,
            height: 66,
            x: 340,
            y: 250
        },
        adjacencies: [12, 13, 15, 17, 18, 19, 31, 32, 33, 43]
    },
    {
        name: "Žitište",
        rgb: [245, 255, 73],
        owner: "Red",
        armies: 1,
        boundingBox: {
            width: 70,
            height: 26,
            x: 382,
            y: 199
        },
        adjacencies: [12, 14, 16, 17]
    },
    {
        name: "Nova Crnja",
        rgb: [249, 255, 188],
        owner: "Red",
        armies: 1,
        boundingBox: {
            height: 25,
            width: 45,
            x: 404,
            y: 155
        },
        adjacencies: [12, 15]
    },
    {
        name: "Sečanj",
        rgb: [255, 252, 130],
        owner: "Red",
        armies: 1,
        boundingBox: {
            height: 40,
            width: 56,
            x: 433,
            y: 251
        },
        adjacencies: [14, 15, 19, 20, 21]
    },
    {
        name: "Opovo",
        rgb: [255, 119, 155],
        owner: "Red",
        armies: 1,
        boundingBox: {
            height: 30,
            width: 38,
            x: 376,
            y: 349
        },
        adjacencies: [14, 19, 25]
    },
    {
        name: "Kovačica",
        rgb: [255, 150, 174],
        owner: "Red",
        armies: 1,
        boundingBox: {
            height: 40,
            width: 46,
            x: 414,
            y: 326
        },
        adjacencies: [14, 17, 18, 20, 25]
    },
    {
        name: "Alibunar",
        rgb: [255, 175, 218],
        owner: "Red",
        armies: 1,
        boundingBox: {
            height: 50,
            width: 56,
            x: 470,
            y: 330
        },
        adjacencies: [17, 19, 21, 22, 24, 25]
    },
    {
        name: "Plandište",
        rgb: [255, 132, 163],
        owner: "Red",
        armies: 1,
        boundingBox: {
            height: 30,
            width: 62,
            x: 489,
            y: 287
        },
        adjacencies: [17, 20, 22]
    },
    {
        name: "Vršac",
        rgb: [255, 119, 151],
        owner: "Red",
        armies: 1,
        boundingBox: {
            height: 57,
            width: 42,
            x: 547,
            y: 322
        },
        adjacencies: [20, 21, 23, 24]
    },
    {
        name: "Bela Crkva",
        rgb: [255, 150, 204],
        owner: "Red",
        armies: 1,
        boundingBox: {
            height: 20,
            width: 69,
            x: 551,
            y: 398
        },
        adjacencies: [22, 24]
    },
    {
        name: "Kovin",
        rgb: [255, 124, 174],
        owner: "Red",
        armies: 1,
        boundingBox: {
            height: 50,
            width: 60,
            x: 487,
            y: 416
        },
        adjacencies: [20, 22, 23, 25]
    },
    {
        name: "Pančevo",
        rgb: [255, 117, 149],
        owner: "Red",
        armies: 1,
        boundingBox: {
            height: 71,
            width: 37,
            x: 425,
            y: 393
        },
        adjacencies: [18, 19, 20, 24]
    },
    {
        name: "Šid",
        rgb: [145, 255, 183],
        owner: "Red",
        armies: 1,
        boundingBox: {
            height: 50,
            width: 40,
            x: 84,
            y: 344
        },
        adjacencies: [27, 37]
    },
    {
        name: "Sremska Mitrovica",
        rgb: [104, 255, 122],
        owner: "Red",
        armies: 10,
        boundingBox: {
            height: 65,
            width: 46,
            x: 161,
            y: 346
        },
        adjacencies: [26, 37, 36, 28, 29]
    },
    {
        name: "Irig",
        rgb: [114, 255, 86],
        owner: "Red",
        armies: 1,
        boundingBox: {
            height: 24,
            width: 46,
            x: 222,
            y: 345
        },
        adjacencies: [27, 29, 32, 34, 35, 36]
    },
    {
        name: "Ruma",
        rgb: [113, 255, 48],
        owner: "Red",
        armies: 1,
        boundingBox: {
            height: 23,
            width: 51,
            x: 231,
            y: 381
        },
        adjacencies: [27, 28, 32, 31, 30]
    },
    {
        name: "Pećinci",
        rgb: [119, 255, 122],
        owner: "Red",
        armies: 1,
        boundingBox: {
            height: 67,
            width: 34,
            x: 268,
            y: 418
        },
        adjacencies: [29, 31]
    },
    {
        name: "Stara Pazova",
        rgb: [137, 255, 79],
        owner: "Red",
        armies: 1,
        boundingBox: {
            height: 22,
            width: 48,
            x: 300,
            y: 385
        },
        adjacencies: [30, 29, 32, 14]
    },
    {
        name: "Inđija",
        rgb: [81, 255, 7],
        owner: "Red",
        armies: 1,
        boundingBox: {
            height: 33,
            width: 51,
            x: 283,
            y: 340
        },
        adjacencies: [28, 29, 31, 14, 33, 34, 35]
    },
    {
        name: "Titel",
        rgb: [255, 177, 33],
        owner: "Red",
        armies: 1,
        boundingBox: {
            height: 28,
            width: 30,
            x: 304,
            y: 297
        },
        adjacencies: [35, 43, 14, 32]
    },
    {
        name: "Sremski Karlovci",
        rgb: [255, 170, 50],
        owner: "Red",
        armies: 1,
        boundingBox: {
            height: 13,
            width: 14,
            x: 260,
            y: 325
        },
        adjacencies: [28, 32, 35]
    },
    {
        name: "Novi Sad",
        rgb: [255, 147, 33],
        owner: "Red",
        armies: 1,
        boundingBox: {
            height: 36,
            width: 64,
            x: 206,
            y: 281
        },
        adjacencies: [28, 32, 33, 34, 36, 44, 39, 40, 43]
    },
    {
        name: "Beočin",
        rgb: [255, 127, 35],
        owner: "Red",
        armies: 1,
        boundingBox: {
            height: 15,
            width: 53,
            x: 175,
            y: 324
        },
        adjacencies: [27, 28, 35, 37, 44]
    },
    {
        name: "Bačka Palanka",
        rgb: [255, 163, 102],
        owner: "Red",
        armies: 1,
        boundingBox: {
            height: 37,
            width: 48,
            x: 115,
            y: 276
        },
        adjacencies: [38, 2, 39, 44, 36, 27, 26]
    },
    {
        name: "Bač",
        rgb: [255, 179, 81],
        owner: "Red",
        armies: 1,
        boundingBox: {
            height: 28,
            width: 40,
            x: 69,
            y: 257
        },
        adjacencies: [2, 37]
    },
    {
        name: "Vrbas",
        rgb: [255, 194, 109],
        owner: "Red",
        armies: 1,
        boundingBox: {
            height: 30,
            width: 34,
            x: 177,
            y: 207
        },
        adjacencies: [2, 3, 6, 41, 40, 35, 44, 37]
    },
    {
        name: "Temerin",
        rgb: [255, 204, 122],
        owner: "Red",
        armies: 1,
        boundingBox: {
            height: 25,
            width: 25,
            x: 239,
            y: 240
        },
        adjacencies: [35, 39, 41, 43]
    },
    {
        name: "Srbobran",
        rgb: [255, 196, 58],
        owner: "Red",
        armies: 1,
        boundingBox: {
            height: 37,
            width: 29,
            x: 216,
            y: 192
        },
        adjacencies: [6, 42, 43, 40, 39]
    },
    {
        name: "Bečej",
        rgb: [255, 197, 117],
        owner: "Red",
        armies: 1,
        boundingBox: {
            height: 60,
            width: 28,
            x: 254,
            y: 154
        },
        adjacencies: [5, 6, 9, 13, 41, 43]
    },
    {
        name: "Žabalj",
        rgb: [255, 185, 81],
        owner: "Red",
        armies: 1,
        boundingBox: {
            height: 38,
            width: 47,
            x: 275,
            y: 238
        },
        adjacencies: [13, 14, 35, 40, 41, 42, 33]
    },
    {
        name: "Bački Petrovac",
        rgb: [255, 172, 84],
        owner: "Red",
        armies: 1,
        boundingBox: {
            height: 24,
            width: 24,
            x: 172,
            y: 263
        },
        adjacencies: [35, 36, 37, 39]
    }
]

function getProvinceFromRgb(rgb) {
    xd = provinces.findIndex(province => province.rgb[0] === rgb[0] && province.rgb[1] === rgb[1] && province.rgb[2] === rgb[2])
    // console.log(xd, provinces[xd])
    if (xd == -1) { xd = undefined }
    return xd
}

function getProvinceFromCoordinates(x, y) {

    return new Promise((resolve, reject) => {
        const temp_canvas = document.createElement("canvas");
        const pic = new Image();

        pic.onload = function () {
            temp_canvas.width = pic.width;
            temp_canvas.height = pic.height;
            const ctx = temp_canvas.getContext("2d");

            ctx.drawImage(pic, 0, 0);

            const p = ctx.getImageData(x, y, 1, 1).data;
            const rgb = [p[0], p[1], p[2]];

            const province = getProvinceFromRgb(rgb);
            resolve(province);
        };

        pic.onerror = function (err) {
            reject("Image failed to load: " + err);
        };

        pic.src = 'http://localhost:8000/bgr.bmp';
    });
}

function drawTanks() {
    for (let p = 0; p < provinces.length; p++) {
        if (!tank_coords[p]) {
            tank_coords.push([])
        }
        let province = provinces[p]
        for (let i = 0; i < province.armies; i++) {
            let img = document.getElementById("tank-" + province.owner.toLowerCase())
            y = 0
            x = 0
            if (!tank_coords[p][i]) {
                x = Math.max(province.boundingBox.x, Math.floor(Math.random() * province.boundingBox.width) + province.boundingBox.x - img.width)
                y = Math.max(province.boundingBox.y, Math.floor(Math.random() * province.boundingBox.height) + province.boundingBox.y - img.height)
                while (tank_coords[p].includes({ x, y })) {
                    x = Math.max(province.boundingBox.x, Math.floor(Math.random() * province.boundingBox.width) + province.boundingBox.x - img.width)
                    y = Math.max(province.boundingBox.y, Math.floor(Math.random() * province.boundingBox.height) + province.boundingBox.y - img.height)
                }
                tank_coords[p].push({ x, y })
            }
            else {
                x = tank_coords[p][i].x
                y = tank_coords[p][i].y
            }
            ctx.drawImage(img, x, y)
        }
    }
}

function showCombat(combatStats) {
    const parent = document.getElementById("attack-stats")
    parent.innerHTML = ""
    const attackerRolls = document.createElement("div")
    attackerRolls.innerText = "Attacker rolls: " + combatStats.attackerDice
    const defenderRolls = document.createElement("div")
    defenderRolls.innerText = "Defender rolls: " + combatStats.defenderDice
    const attackerLoses = document.createElement("div")
    attackerLoses.innerText = "Attacker loses: " + combatStats.attackersToSubstract
    const defenderLoses = document.createElement("div")
    defenderLoses.innerText = "Defender loses: " + combatStats.defendersToSubstract

    parent.appendChild(attackerRolls)
    parent.appendChild(defenderRolls)
    parent.appendChild(attackerLoses)
    parent.appendChild(defenderLoses)

}

function attack() {
    from = provinces[fromProvince];
    to = provinces[toProvince]
    if (!to.adjacencies.includes(fromProvince)) {
        alert("You can only attack adjecent provinces")
        return;
    }
    if (from.owner === to.owner) {
        alert("You can't attack your own provinces")
        return;
    }
    if (from.armies < 2) {
        alert("You can't attack with just 1 army")
        return;
    }
    combatStats = rollDice(from, to)
    showCombat(combatStats)
    hasAttackedThisTurn = true
    if (to.armies < 1) {
        let defeatedPlayer = to.owner
        to.owner = from.owner
        setTimeout(() => {
            let aNumber = Number(prompt("Transfer troops (1-" + (from.armies - 1) + ")"))
            console.log(aNumber)
            while (aNumber < 1 || aNumber > from.armies - 1) {
                aNumber = Number(prompt("Transfer troops (1-" + (from.armies - 1) + ")"))
            }
            to.armies += aNumber
            from.armies -= aNumber
            conqueredProvince = true
            if (playerIsDead(defeatedPlayer)) {
                transferCards(defeatedPlayer, turn)
            }
            renderState()
            checkWin()
        }, 0)
    }
    else {
        renderState()
    }
}

function rollDice(from, to) {
    attackersToSubstract = 0
    defendersToSubstract = 0
    attackerDice = []
    defenderDice = []
    attackerDiceAmount = Math.min(attackerMaxDice, from.armies - 1)
    defenderDiceAmount = Math.min(defenderMaxDice, to.armies)
    for (let i = 0; i < attackerDiceAmount; i++) {
        attackerDice.push(Math.ceil(Math.random() * 6))
    }
    for (let i = 0; i < defenderDiceAmount; i++) {
        defenderDice.push(Math.ceil(Math.random() * 6))
    }
    attackerDice = attackerDice.sort().reverse()
    defenderDice = defenderDice.sort().reverse()
    for (let i = 0; i < Math.min(attackerDiceAmount, defenderDiceAmount); i++) {
        if (attackerDice[i] > defenderDice[i]) {
            defendersToSubstract++;
        }
        else {
            attackersToSubstract++;
        }
    }
    // console.log(attackerDice, defenderDice, attackersToSubstract, defendersToSubstract)
    removeTanks(attackersToSubstract, fromProvince)
    removeTanks(defendersToSubstract, toProvince)

    return { attackerDice, defenderDice, attackersToSubstract, defendersToSubstract }
}

function countTroopsForDeployment(player) {
    if (playerIsDead(player)) {
        return 0
    }
    result = Math.max(3, Math.floor(provinces.filter(province => province.owner === player).length / 3))
    continents.forEach((continent) => {
        const provinceIndexes = continent.provinces;

        // Check if all provinces have the same owner
        const allSameOwner = provinceIndexes.every(index => {
            return provinces[index].owner === player;
        });

        if (allSameOwner) {
            result += continent.bonus
        }
    });
    return result
}

function deploy() {
    const amountElement = document.getElementById("deployment-amount")
    let amount = Number(amountElement.value)
    if (amount > troopsForDeployment) {
        return;
    }
    if (amount < 1) {
        return;
    }
    if (provinces[fromProvince].owner != turn) {
        alert("You can only deploy on your own provinces")
        return;
    }
    provinces[fromProvince].armies += amount;
    troopsForDeployment -= amount;
    renderState()
    if (troopsForDeployment == 0) {
        nextPhase()
    }
    console.log(amount)
}

function nextPhase() {
    if (gameOver) {
        return;
    }
    for (let i = 0; i < possible_phases.length; i++) {
        if (phase == possible_phases[i]) {
            if (i == possible_phases.length - 1) {
                phase = possible_phases[0]
                nextPlayer()
                troopsForDeployment = countTroopsForDeployment(turn)
                clearCombatStats()
                break;
            }
            if (i == 0) {
                let playerIndex = players.indexOf(turn)
                if (troopsForDeployment > 0) {
                    alert("You need to deploy all your troops first!")
                    return;
                }
                if (player_cards[playerIndex].length >= 5) {
                    alert("You must turn in your cards")
                    return;
                }
            }
            if (i == 1) {
                if (!hasAttackedThisTurn) {
                    if (!confirm("You haven't attacked this turn. Skip attack phase?")) {
                        return;
                    }
                }
                if (conqueredProvince) {
                    getCard(turn)
                }
            }
            phase = possible_phases[i + 1]
            break;
        }
    }
    renderState()
}

function nextPlayer() {
    conqueredProvince = false
    hasAttackedThisTurn = false
    const amountElement = document.getElementById("deployment-amount")
    for (let i = 0; i < players.length; i++) {
        if (turn == players[i]) {
            if (i == players.length - 1) {
                turn = players[0]
                amountElement.value = undefined;
                if (playerIsDead(turn)) {
                    nextPlayer()
                }
                break;
            }
            turn = players[i + 1]
            amountElement.value = undefined;
            console.log(playerIsDead())
            if (playerIsDead(turn)) {
                nextPlayer()
            }
            break;
        }
    }
    renderState()
}

function clearCombatStats() {
    const parent = document.getElementById("attack-stats")
    parent.innerHTML = ""
}

function playerIsDead(player) {
    return provinces.filter(province => province.owner === player) < 1
}

function renderIntel() {
    let intelColumn = document.getElementById("intel-column")
    intelColumn.innerHTML = ""
    let title = document.createElement("h2")
    title.innerText = "Intel"
    intelColumn.appendChild(title)
    players.forEach(player => {
        let playerDiv = document.createElement("div")
        let playerName = document.createElement("b")
        playerName.innerText = player
        playerDiv.appendChild(playerName)
        let armyStats = document.createElement("div")
        armyStats.innerText = "Total army: " + getTotalArmy(player) + " (+" + countTroopsForDeployment(player) + ")"
        playerDiv.appendChild(armyStats)
        let provinceCount = document.createElement("div")
        let cardCount = document.createElement("div")
        playerDiv.appendChild(provinceCount)
        cardCount.innerText = "Cards: " + player_cards[players.indexOf(player)].length;
        provinceCount.innerText = "Provinces: " + provinces.filter(province => province.owner === player).length
        playerDiv.appendChild(cardCount)
        if (player == turn) {
            playerDiv.classList.add("player-turn")
            playerDiv.classList.add(player.toLowerCase() + "-border")
        }
        intelColumn.appendChild(playerDiv)
    })
}

function getTotalArmy(player) {
    total = 0
    playerProvinces = provinces.filter(province => province.owner === player)
    playerProvinces.forEach(province => total += province.armies)
    return total
}

function checkWin() {
    deadPlayerCount = 0
    players.forEach(player => {
        if (playerIsDead(player)) {
            deadPlayerCount++;
        }
    })
    if (deadPlayerCount == players.length - 1) {
        gameOver = true
        winner = players.filter(player => !playerIsDead(player))
        alert(winner[0] + " player has won")
    }
}

function transfer() {
    console.log(fromProvince)
    if (fromProvince != undefined && toProvince != undefined) {
        const amountElement = document.getElementById("transfer-amount")
        let amount = Number(amountElement.value)
        if (amount > provinces[fromProvince].armies - 1) { return; }
        if (amount < 0) { return }
        if (provinces[fromProvince].owner != turn) {
            alert("You can transfer only from your own provicnes")
            return;
        }
        if (provinces[toProvince].owner != turn) {
            alert("You can transfer only to your own provicnes")
            return;
        }
        if (hasPath(fromProvince, toProvince, turn)) {
            removeTanks(amount, fromProvince)
            provinces[toProvince].armies += amount
            amountElement.value = undefined
            renderState()
            nextPhase()
        }
        else {
            alert("Your provinces need to have a path between them")
        }
    }
}

function hasPath(from, to, player, visited = new Set()) {
    console.log(provinces[from].adjacencies.includes(to))
    if (provinces[from].adjacencies.includes(to)) { console.log("has path!"); return true }
    if (visited.has(from)) { return false; }
    visited.add(from);
    for (let index of provinces[from].adjacencies) {
        if (provinces[index].owner === player) {
            if (hasPath(index, to, player, visited)) {
                return true;
            }
        }
    }
    return false;
}

function removeTanks(amount, provinceIndex) {
    provinces[provinceIndex].armies -= amount
    for (let i = 0; i < amount; i++) {
        tank_coords[provinceIndex].pop()
    }
}

function initialiseGame() {
    //which players play and randomise player order
    players = []
    for (let i = 0; i < possible_players.length; i++) {
        if (players_play[i]) {
            players.push(possible_players[i])
        }
    }
    shuffle(players)
    turn = players[0]
    //assign provinces
    numOfProvincesForPlayer = Math.floor(provinces.length / players.length)
    numOfProvincesPerPlayer = []
    let assignedProvinces = new Set()
    let playerProvinces = []
    for (let i = 0; i < players.length; i++) {
        playerProvinces.push([])
        numOfProvincesPerPlayer.push(numOfProvincesForPlayer)
    }
    for (let i = 0; i < players.length; i++) {
        while (numOfProvincesPerPlayer[i] > 0) {
            randomIndex = Math.floor(Math.random() * provinces.length)
            if (assignedProvinces.has(randomIndex)) { continue }
            playerProvinces[i].push(randomIndex)
            assignedProvinces.add(randomIndex)
            numOfProvincesPerPlayer[i]--;
        }
    }
    for (let i = 0; i < players.length; i++) {
        for (let j = 0; j < playerProvinces[i].length; j++) {

            provinces[playerProvinces[i][j]].owner = players[i]
            provinces[playerProvinces[i][j]].armies = 1
        }
    }
    //handle unassigned provinces
    for (let i = 0; i < provinces.length; i++) {
        if (!assignedProvinces.has(i)) {
            provinces[i].owner = players[Math.floor(Math.random() * players.length)]
            provinces[i].armies = 1
        }
    }
    //assign armies
    armiesForPlayer = 50;
    for (let i = players.length; i > 0; i--) {
        armiesForPlayer -= 5
    }
    for (let i = 0; i < players.length; i++) {
        let armiesOfPlayer = armiesForPlayer - getTotalArmy(players[i])
        while (armiesOfPlayer > 0) {
            provinces[playerProvinces[i][Math.floor(Math.random() * playerProvinces[i].length)]].armies++;
            armiesOfPlayer--;
        }
    }
    troopsForDeployment = countTroopsForDeployment(players[0])
    for (let i = 0; i < players.length; i++) {
        player_cards.push([])
    }
}

initialiseGame()

function shuffle(array) {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
}

let drawnCards = new Set()
const cards = [
    {
        name: "Sombor",
        img: "sombor.bmp",
        cardType: "Infantry"
    },
    {
        name: "Apatin",
        img: "apatin.bmp",
        cardType: "Cavalry"
    },
    {
        name: "Odžaci",
        img: "odzaci.bmp",
        cardType: "Artillery"
    },
    {
        name: "Kula",
        img: "kula.bmp",
        cardType: "Infantry"
    },
    {
        name: "Subotica",
        img: "subotica.bmp",
        cardType: "Cavalry"
    },
    {
        name: "Bačka Topola",
        img: "backa_topola.bmp",
        cardType: "Artillery"
    },
    {
        name: "Mali Iđoš",
        img: "mali_idjos.bmp",
        cardType: "Infantry"
    },
    {
        name: "Kanjiža",
        img: "kanjiza.bmp",
        cardType: "Cavalry"
    },
    {
        name: "Senta",
        img: "senta.bmp",
        cardType: "Artillery"
    },
    {
        name: "Ada",
        img: "ada.bmp",
        cardType: "Infantry"
    },
    {
        name: "Novi Kneževac",
        img: "novi_knezevac.bmp",
        cardType: "Cavalry"
    },
    {
        name: "Čoka",
        img: "coka.bmp",
        cardType: "Artillery"
    },
    {
        name: "Kikinda",
        img: "kikinda.bmp",
        cardType: "Infantry"
    },
    {
        name: "Novi Bečej",
        img: "novi_becej.bmp",
        cardType: "Cavalry"
    },
    {
        name: "Zrenjanin",
        img: "zrenjanin.bmp",
        cardType: "Artillery"
    },
    {
        name: "Žitište",
        img: "zitiste.bmp",
        cardType: "Infantry"
    },
    {
        name: "Nova Crnja",
        img: "nova_crnja.bmp",
        cardType: "Cavalry"
    },
    {
        name: "Sečanj",
        img: "secanj.bmp",
        cardType: "Artillery"
    },
    {
        name: "Opovo",
        img: "opovo.bmp",
        cardType: "Infantry"
    },
    {
        name: "Kovačica",
        img: "kovacica.bmp",
        cardType: "Cavalry"
    },
    {
        name: "Alibunar",
        img: "alibunar.bmp",
        cardType: "Artillery"
    },
    {
        name: "Plandište",
        img: "plandiste.bmp",
        cardType: "Infantry"
    },
    {
        name: "Vršac",
        img: "vrsac.bmp",
        cardType: "Cavalry"
    },
    {
        name: "Bela Crkva",
        img: "bela_crkva.bmp",
        cardType: "Artillery"
    },
    {
        name: "Kovin",
        img: "kovin.bmp",
        cardType: "Infantry"
    },
    {
        name: "Pančevo",
        img: "pancevo.bmp",
        cardType: "Cavalry"
    },
    {
        name: "Šid",
        img: "sid.bmp",
        cardType: "Artillery"
    },
    {
        name: "Sremska Mitrovica",
        img: "sremska_mitrovica.bmp",
        cardType: "Infantry"
    },
    {
        name: "Irig",
        img: "irig.bmp",
        cardType: "Cavalry"
    },
    {
        name: "Ruma",
        img: "ruma.bmp",
        cardType: "Artillery"
    },
    {
        name: "Pećinci",
        img: "pecinci.bmp",
        cardType: "Infantry"
    },
    {
        name: "Stara Pazova",
        img: "stara_pazova.bmp",
        cardType: "Cavalry"
    },
    {
        name: "Inđija",
        img: "indjija.bmp",
        cardType: "Artillery"
    },
    {
        name: "Titel",
        img: "titel.bmp",
        cardType: "Infantry"
    },
    {
        name: "Sremski Karlovci",
        img: "sremski_karlovci.bmp",
        cardType: "Cavalry"
    },
    {
        name: "Novi Sad",
        img: "novi_sad.bmp",
        cardType: "Artillery"
    },
    {
        name: "Beočin",
        img: "beocin.bmp",
        cardType: "Infantry"
    },
    {
        name: "Bačka Palanka",
        img: "backa_palanka.bmp",
        cardType: "Cavalry"
    },
    {
        name: "Bač",
        img: "bac.bmp",
        cardType: "Artillery"
    },
    {
        name: "Vrbas",
        img: "vrbas.bmp",
        cardType: "Infantry"
    },
    {
        name: "Temerin",
        img: "temerin.bmp",
        cardType: "Cavalry"
    },
    {
        name: "Srbobran",
        img: "srbobran.bmp",
        cardType: "Artillery"
    },
    {
        name: "Bečej",
        img: "becej.bmp",
        cardType: "Infantry"
    },
    {
        name: "Žabalj",
        img: "zabalj.bmp",
        cardType: "Cavalry"
    },
    {
        name: "Bački Petrovac",
        img: "backi_petrovac.bmp",
        cardType: "Artillery"
    },
    {
        name: "Wildcard",
        cardType: "Wildcard"
    },
    {
        name: "Wildcard",
        cardType: "Wildcard"
    },
]

function getCard(player) {
    let playerIndex = players.indexOf(player)
    let randomCardIndex = Math.floor(Math.random() * cards.length)
    while (drawnCards.has(randomCardIndex)) {
        randomCardIndex = Math.floor(Math.random() * cards.length)
    }
    player_cards[playerIndex].push(randomCardIndex)
    drawnCards.add(randomCardIndex)
    console.log(player_cards)
}

function turnInCards() {
    let playerIndex = players.indexOf(turn)
    let infantryCards = []
    let cavalryCards = []
    let artilleryCards = []
    let wildcardCards = []
    for (let i = 0; i < player_cards[playerIndex].length; i++) {
        if (cards[player_cards[playerIndex][i]].cardType == "Infantry") {
            infantryCards.push(player_cards[playerIndex][i]);
        }
        if (cards[player_cards[playerIndex][i]].cardType == "Cavalry") {
            cavalryCards.push(player_cards[playerIndex][i]);
        }
        if (cards[player_cards[playerIndex][i]].cardType == "Artillery") {
            artilleryCards.push(player_cards[playerIndex][i])
        }
        if (cards[player_cards[playerIndex][i]].cardType == "Wildcard") {
            wildcardCards.push(player_cards[playerIndex][i])
        }
    }
    if (wildcardCards.length >= 1 & (infantryCards.length >= 2 || cavalryCards.length >= 2 || artilleryCards.length >= 2)) {

        if (infantryCards.length >= 2) {
            let wildcardCard = wildcardCards.pop()
            let index = player_cards[playerIndex].indexOf(wildcardCard);
            drawnCards.delete(wildcardCard)
            if (index > -1) {
                player_cards[playerIndex].splice(index, 1);
            }
            for (let i = 0; i < 2; i++) {
                const index = player_cards[playerIndex].indexOf(infantryCards[i]);
                if (index > -1) {
                    player_cards[playerIndex].splice(index, 1);
                }
                drawnCards.delete(infantryCards[i])
            }
            troopsForDeployment += 12
            renderState()
            return;
        }
        if (cavalryCards.length >= 2) {
            let wildcardCard = wildcardCards.pop()
            let index = player_cards[playerIndex].indexOf(wildcardCard);
            drawnCards.delete(wildcardCard)
            if (index > -1) {
                player_cards[playerIndex].splice(index, 1);
            }
            for (let i = 0; i < 2; i++) {
                const index = player_cards[playerIndex].indexOf(cavalryCards[i]);
                if (index > -1) {
                    player_cards[playerIndex].splice(index, 1);
                }
                drawnCards.delete(cavalryCards[i])
            }
            troopsForDeployment += 12
            renderState()
            return;
        }
        if (artilleryCards.length >= 2) {
            let wildcardCard = wildcardCards.pop()
            let index = player_cards[playerIndex].indexOf(wildcardCard);
            drawnCards.delete(wildcardCard)
            if (index > -1) {
                player_cards[playerIndex].splice(index, 1);
            }
            for (let i = 0; i < 2; i++) {
                const index = player_cards[playerIndex].indexOf(artilleryCards[i]);
                if (index > -1) {
                    player_cards[playerIndex].splice(index, 1);
                }
                drawnCards.delete(artilleryCards[i])
            }
            troopsForDeployment += 12
            renderState()
            return;
        }
    }
    if (artilleryCards.length >= 1 && cavalryCards.length >= 1 && infantryCards.length >= 1) {
        let artilleryCard = artilleryCards.pop()
        let cavalryCard = cavalryCards.pop()
        let infantryCard = infantryCards.pop()
        let index = player_cards[playerIndex].indexOf(artilleryCard);
        if (index > -1) {
            player_cards[playerIndex].splice(index, 1);
        }
        index = player_cards[playerIndex].indexOf(cavalryCard);
        if (index > -1) {
            player_cards[playerIndex].splice(index, 1);
        }
        index = player_cards[playerIndex].indexOf(infantryCard);
        if (index > -1) {
            player_cards[playerIndex].splice(index, 1);
        }
        drawnCards.delete(artilleryCard)
        drawnCards.delete(cavalryCard)
        drawnCards.delete(infantryCard)
        troopsForDeployment += 10
        renderState()
        return;
    }
    if (artilleryCards.length >= 3) {
        for (let i = 0; i < 3; i++) {
            const index = player_cards[playerIndex].indexOf(artilleryCards[i]);
            if (index > -1) {
                player_cards[playerIndex].splice(index, 1);
            }
            drawnCards.delete(artilleryCards[i])
        }
        troopsForDeployment += 8
        renderState()
        return;
    }
    if (cavalryCards.length >= 3) {
        for (let i = 0; i < 3; i++) {
            const index = player_cards[playerIndex].indexOf(cavalryCards[i]);
            if (index > -1) {
                player_cards[playerIndex].splice(index, 1);
            }
            drawnCards.delete(cavalryCards[i])
        }
        troopsForDeployment += 6
        renderState()
        return;
    }

    if (infantryCards.length >= 3) {
        for (let i = 0; i < 3; i++) {
            const index = player_cards[playerIndex].indexOf(infantryCards[i]);
            if (index > -1) {
                player_cards[playerIndex].splice(index, 1);
            }
            drawnCards.delete(infantryCards[i])

        }
        troopsForDeployment += 4
        renderState()
        return;
    }
}

function transferCards(fromPlayer, toPlayer) {
    console.log(player_cards)
    let fromIndex = players.indexOf(fromPlayer)
    let toIndex = players.indexOf(toPlayer)
    for (let i = 0; i < player_cards[fromIndex].length; i++) {
        let card = player_cards[fromIndex][i]
        console.log(card)
        player_cards[toIndex].push(card)
    }
    player_cards[fromIndex] = []
    if (player_cards[toIndex].length >= 5) {
        phase = possible_phases[0]
    }
}

function renderCards() {
    const cardsDiv = document.getElementById("my-cards")
    cardsDiv.innerHTML = ""
    let playerIndex = players.indexOf(turn)
    for (let i = 0; i < player_cards[playerIndex].length; i++) {
        let logicCard = cards[player_cards[playerIndex][i]]
        const card = document.createElement("div")
        card.classList.add("card")
        if (logicCard.cardType != "Wildcard") {

            const title = document.createElement("b")
            title.innerText = logicCard.name
            const image = document.createElement("img")
            image.src = "img/province/" + logicCard.img
            image.style = "width: 50px; height 50px;"
            image.alt = logicCard.img
            const cardType = document.createElement("img")
            cardType.src = "img/" + logicCard.cardType + ".bmp"
            cardType.style = "width: 50px; height 50px;"
            cardType.alt = logicCard.cardType

            card.appendChild(title)
            card.appendChild(document.createElement("br"))
            card.appendChild(image)
            card.appendChild(document.createElement("br"))
            card.appendChild(cardType)


        }
        else {
            const infantryImage = document.createElement("img")
            const cavalryImage = document.createElement("img")
            const artilleryImage = document.createElement("img")
            infantryImage.src = "img/Infantry.bmp"
            infantryImage.style = "width: 50px; height 50px;"
            cavalryImage.src = "img/Cavalry.bmp"
            cavalryImage.style = "width: 50px; height 50px;"
            artilleryImage.src = "img/Artillery.bmp"
            artilleryImage.style = "width: 50px; height 50px;"

            card.appendChild(infantryImage)
            card.appendChild(document.createElement("br"))
            card.appendChild(cavalryImage)
            card.appendChild(document.createElement("br"))
            card.appendChild(artilleryImage)
        }
        cardsDiv.appendChild(card)
    }
}

function howManyCardsWhenTurningIn() {
    let playerIndex = players.indexOf(turn)
    let infantryCards = []
    let cavalryCards = []
    let artilleryCards = []
    let wildcardCards = []
    for (let i = 0; i < player_cards[playerIndex].length; i++) {
        if (cards[player_cards[playerIndex][i]].cardType == "Infantry") {
            infantryCards.push(player_cards[playerIndex][i]);
        }
        if (cards[player_cards[playerIndex][i]].cardType == "Cavalry") {
            cavalryCards.push(player_cards[playerIndex][i]);
        }
        if (cards[player_cards[playerIndex][i]].cardType == "Artillery") {
            artilleryCards.push(player_cards[playerIndex][i])
        }
        if (cards[player_cards[playerIndex][i]].cardType == "Wildcard") {
            wildcardCards.push(player_cards[playerIndex][i])
        }
    }

    if (wildcardCards.length >= 1 & (infantryCards.length >= 2 || cavalryCards.length >= 2 || artilleryCards.length >= 2)) { return 12; }
    if (artilleryCards.length >= 1 && cavalryCards.length >= 1 && infantryCards.length >= 1) { return 10; }
    if (artilleryCards.length >= 3) { return 8; }
    if (cavalryCards.length >= 3) { return 6; }
    if (infantryCards.length >= 3) { return 4; }
    return 0;
}
