const scoreDom = document.getElementById("score")
const startDom = document.getElementById("start")
const pauseDom = document.getElementById("pause")
const resetDom = document.getElementById("reset")

const canvas = document.getElementById("canvas")
const context = canvas.getContext("2d")

const WIDTH = 240
const HEIGHT = 400

canvas.width = WIDTH
canvas.height = HEIGHT

context.scale(20, 20)

const tetrominoes = {
  I: [
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
  ],
  O: [
    [2, 2],
    [2, 2],
  ],
  L: [
    [3, 0, 0],
    [3, 0, 0],
    [3, 3, 0],
  ],
  J: [
    [4, 4, 0],
    [4, 0, 0],
    [4, 0, 0],
  ],
  S: [
    [5, 0, 0],
    [5, 5, 0],
    [0, 5, 0],
  ],
  Z: [
    [0, 6, 0],
    [6, 6, 0],
    [6, 0, 0],
  ],
  T: [
    [0, 0, 0],
    [7, 7, 7],
    [0, 7, 0],
  ],
}

let player = createPlayer()

let score = 0

let arena = createMatrix(12, 20)

let lastTime = 0
let dropCounter = 0
let dropInterval = 1000

let requestAnimationFrameId = null

resetCanvas()

startDom.addEventListener("click", (e) => {
  if (!requestAnimationFrameId) {
    update()
  }
})

pauseDom.addEventListener("click", (e) => {
  if (requestAnimationFrameId) {
    cancelAnimationFrame(requestAnimationFrameId)
    requestAnimationFrameId = null
  }
})

resetDom.addEventListener("click", (e) => {
  init()
})

window.addEventListener("keydown", (e) => {
  if (!requestAnimationFrameId) return
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
      // dropCounter = 0

      break
    }
    case "ArrowUp": {
      rotate(player.matrix)

      break
    }
  }
})

function createPlayer() {
  return {
    pos: {
      x: 0,
      y: 0,
    },
    matrix: createPlayerMatrix(),
  }
}

function updateScore() {
  scoreDom.innerHTML = "score " + score
}

function rotate(matrix) {
  const copy = JSON.parse(JSON.stringify(matrix))
  const next = JSON.parse(JSON.stringify(matrix))
  for (let i = 0; i < next.length; i++) {
    for (let j = 0; j < next[i].length; j++) {
      next[j][i] = copy[i][j]
    }
  }
  next.forEach((r) => r.reverse())
  const nextPlayer = {
    ...player,
    matrix: next,
  }
  if (collide(arena, nextPlayer)) return
  player = nextPlayer
}

function merge(arena, player) {
  for (let i = 0; i < player.matrix.length; i++) {
    for (let j = 0; j < player.matrix[i].length; j++) {
      if (player.matrix[i][j] !== 0) {
        arena[player.pos.y + i][player.pos.x + j] = player.matrix[i][j]
      }
    }
  }
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

function resetPlayer() {
  player.pos.x = 0
  player.pos.y = 0
  player.matrix = createPlayerMatrix()
  isOver()
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
        arena.unshift(arena.splice(i, 1)[0].fill(0))
        score++
        updateScore()
      }
    }
  }
}

function resetCanvas() {
  context.fillStyle = "#000"
  context.fillRect(0, 0, WIDTH, HEIGHT)
}

function createMatrix(w, h) {
  const matrix = Array.from(new Array(h), () => {
    return new Array(w).fill(0)
  })
  return matrix
}

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
  requestAnimationFrameId = requestAnimationFrame(update)
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

function isOver() {
  if (player.pos.y === 0 && collide(arena, player)) {
    alert("gameover")
    init()
  }
}

function init() {
  arena = createMatrix(12, 20)
  player = createPlayer()
  score = 0
  updateScore()
}
