const canvas = document.getElementById("canvas")
const context = canvas.getContext("2d")

const WIDTH = 240
const HEIGHT = 400

canvas.width = WIDTH
canvas.height = HEIGHT

context.scale(20, 20)

const matrix = [
  [0, 0, 0],
  [1, 1, 1],
  [0, 1, 0],
]

function merge(arena, player) {
  for (let i = 0; i < player.matrix.length; i++) {
    for (let j = 0; j < player.matrix[i].length; j++) {
      arena[player.pos.y + i][player.pos.x + j] = matrix[i][j]
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

const player = {
  pos: {
    x: 0,
    y: 0,
  },
  matrix,
}

function draw() {
  drawMatrix(player.matrix, player.pos)
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

const arena = createMatrix(12, 20)

let lastTime = 0
let dropCounter = 0
let dropInterval = 1000
function update(time = 0) {
  if (time - lastTime > dropInterval) {
    player.pos.y <= HEIGHT - player.matrix.length - 1
      ? player.pos.y++
      : player.pos.y
    lastTime = time
  }
  resetCanvas()
  draw()
  requestAnimationFrame(update)
}

function collide(arena, player) {
  for (let i = 0; i < player.matrix.length; i++) {
    for (let j = 0; j < player.matrix[i].length; j++) {
      if (
        player.matrix[i][j] !== 0 &&
        arena[player.pos.y + i] &&
        arena[player.pos.y + i][player.pos.x + j] !== 0
      ) {
        return true
      }
    }
  }
  return false
}

window.addEventListener("keydown", (e) => {
  console.log(e.key)
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
      player.pos.y++
      break
    }
    case "ArrowUp": {
      player.pos.y--
      break
    }
  }
})

update()

merge(arena, player)

console.table(arena)
