const canvas = document.getElementById("canvas")
const context = canvas.getContext("2d")

const WIDTH = 240
const HEIGHT = 400

canvas.width = WIDTH
canvas.height = HEIGHT

context.scale(20, 20)

// const matrix = [
//   [0, 0, 0],
//   [1, 1, 1],
//   [0, 1, 0],
// ]

const tetrominoes = {
  I: [
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
  ],
  T: [
    [0, 0, 0],
    [1, 1, 1],
    [0, 1, 0],
  ],
  // z: [
  //   [0, 0, 0],
  //   [1, 1, 1],
  //   [0, 1, 0],
  // ],
  // s: [
  //   [0, 0, 0],
  //   [1, 1, 1],
  //   [0, 1, 0],
  // ],
}

function rotate(matrix) {
  const copy = JSON.parse(JSON.stringify(matrix))
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      matrix[j][i] = copy[i][j]
    }
  }
  matrix.forEach((r) => r.reverse())
}

// [1, 2, 3],
// [4, 5, 6],
// [7, 8, 9],

// [7, 4, 1],
// [8, 5, 2],
// [9, 6, 3],

// 1, 2,3 , 4,
// 5, 6,7,8
// 9,10,11,12,
// 13,14,15,16

// 13,9 5 1
// 14 10 6 2
// 15 11 7 3
// 16 12 8 4

function merge(arena, player) {
  for (let i = 0; i < player.matrix.length; i++) {
    for (let j = 0; j < player.matrix[i].length; j++) {
      if (player.matrix[i][j] !== 0) {
        arena[player.pos.y + i][player.pos.x + j] = player.matrix[i][j]
      }
    }
  }
  // console.table(arena)
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = "red"
        context.fillRect(x + offset.x, y + offset.y, 1, 1)
      }
    })
  })
}

const initPlayer = {
  pos: {
    x: 0,
    y: 0,
  },
  matrix: createPlayerMatrix(),
}

let player = { ...initPlayer }

function resetPlayer() {
  player.pos.y = 0
  player.matrix = createPlayerMatrix()
  dropCounter = 0
}

function createPlayerMatrix() {
  const index = Math.floor(Object.keys(tetrominoes).length * Math.random())
  return tetrominoes[Object.keys(tetrominoes)[index]]
}

function draw() {
  drawMatrix(player.matrix, player.pos)
  drawMatrix(arena, { x: 0, y: 0 })
}

function clearLine(arena) {
  for (let i = 0; i < arena.length; i++) {
    for (let j = 0; j < arena[i].length; j++) {
      if (arena[i][j] === 0) break
      if (j === arena[i].length - 1) {
        arena.unshift(arena.splice(i, 1).fill(0))
      }
    }
  }
}

function resetCanvas() {
  context.fillStyle = "#000"
  context.fillRect(0, 0, WIDTH, HEIGHT)
}

// [
//   [0,0,0],
//   [0,0,0],
//   [0,0,0],
// ]
function createMatrix(w, h) {
  const matrix = Array.from(new Array(h), () => {
    return new Array(w).fill(0)
  })
  return matrix
}

let arena = createMatrix(12, 20)

let lastTime = 0
let dropCounter = 0
let dropInterval = 1000
function update(time = 0) {
  const deltaTime = time - lastTime
  dropCounter += deltaTime
  if (dropCounter > dropInterval) {
    playerDrop()
    dropCounter = 0
  }
  lastTime = time

  resetCanvas()
  draw()
  requestAnimationFrame(update)
}

function playerDrop() {
  const nextPlayerPos = {
    ...player,
    pos: {
      ...player.pos,
      y: player.pos.y + 1,
    },
  }

  if (collide(arena, nextPlayerPos)) {
    merge(arena, player)
    clearLine(arena)
    resetPlayer()
  } else {
    player.pos = nextPlayerPos.pos
  }
}

function collide(arena, player) {
  for (let i = 0; i < player.matrix.length; i++) {
    for (let j = 0; j < player.matrix[i].length; j++) {
      // player有方块的点
      if (!player.matrix[i][j]) continue

      //player有方块的点不在arena中
      if (
        arena[player.pos.y + i] === undefined ||
        arena[player.pos.y + i][player.pos.x + j] === undefined
      ) {
        return true
      }

      //player有方块的点跟在arena中的点
      if (
        arena[player.pos.y + i] &&
        arena[player.pos.y + i][player.pos.x + j]
      ) {
        return true
      }
    }
  }
  return false
}

window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowLeft": {
      const nextPlayerPos = {
        ...player,
        pos: {
          ...player.pos,
          x: player.pos.x - 1,
        },
      }
      if (collide(arena, nextPlayerPos)) break
      player.pos.x--
      break
    }
    case "ArrowRight": {
      const nextPlayerPos = {
        ...player,
        pos: {
          ...player.pos,
          x: player.pos.x + 1,
        },
      }
      if (collide(arena, nextPlayerPos)) break
      player.pos.x++
      break
    }
    case "ArrowDown": {
      const nextPlayerPos = {
        ...player,
        pos: {
          ...player.pos,
          y: player.pos.y + 1,
        },
      }
      if (collide(arena, nextPlayerPos)) break
      player.pos = nextPlayerPos.pos
      break
    }
    case "ArrowUp": {
      rotate(player.matrix)

      break
    }
  }
})

function isOver() {
  if (player.pos.y === 0 && collide(arena, player)) {
    alert("you lose")
    init()
  }
}

update()

function init() {
  arena = createMatrix(12, 20)
  player = { ...initPlayer }
}
