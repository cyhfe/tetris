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
    x: 1,
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

console.table(arena)
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

window.addEventListener("keydown", (e) => {
  console.log(e.key)
  switch (e.key) {
    case "ArrowLeft": {
      player.pos.x <= 0 ? player.pos.x : player.pos.x--
      break
    }
    case "ArrowRight": {
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
