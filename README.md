# JavaScript 实现俄罗斯方块

> learn by doing

今天又写了个经典小游戏：俄罗斯方块，想跟大家分享一下。

## 技术选型

![Jietu20220201-210319-HD.gif](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7250850053bf40fe86791da5a3c630b2~tplv-k3u1fbpfcp-watermark.image?)

- 动画
  - requestAnimationFrame
- 游戏界面
  - canvas
- 数据结构

![0_gJcuJXLaaJGUp2aT.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ba891904d54a496f95be52cf5739f09d~tplv-k3u1fbpfcp-watermark.image?)

```js
// 方块
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
```

```js
// 12 * 20 游戏区网格
// 0代表空白，其他数字代表形状
[
    [0,0,0...], //rows
    [0,0,0...], //rows
    [0,0,0...], //rows
    ...
]
```

## 主要思路

### 缩放 canvs 便于计算

```js
const WIDTH = 240
const HEIGHT = 400

canvas.width = WIDTH
canvas.height = HEIGHT

context.scale(20, 20)

// canvas可以缩放，显示为240*400px
// 我们计算时候就是12*20， 1为一格
```

### 生成数据

```js
// 游戏区
// Array.from生成二维数组
function createMatrix(w, h) {
  const matrix = Array.from(new Array(h), () => {
    return new Array(w).fill(0)
  })
  return matrix
}

// 下落方块
function createPlayer() {
  return {
    pos: {
      x: 0,
      y: 0,
    },
    // 从各种形状中随机生成
    matrix: createPlayerMatrix(),
  }
}
```

### 绘制游戏界面

```js
// 绘制游戏界面，函数实现在下方
function draw() {
  // 清空画布， 绘制背景色
  resetCanvas()

  // 绘制当前落下的方块
  drawMatrix(player.matrix, player.pos)

  // 绘制整个网格（包括已经固定的方块）
  drawMatrix(arena, { x: 0, y: 0 })

  // 背景网格
  drawNet()
}
```

```js
function resetCanvas() {
  context.clearRect(0, 0, WIDTH, HEIGHT)
  context.fillStyle = "#000000"
  context.fillRect(0, 0, WIDTH, HEIGHT)
}
```

```js
function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      // 0为空白不绘制
      if (value !== 0) {
        // 根据形状选择不同颜色
        pickColor(value)

        // 方块样式： 填充矩形
        context.fillRect(
          x + offset.x + 0.1,
          y + offset.y + 0.1,
          1 - 0.2,
          1 - 0.2
        )

        // 方块样式： 白色边框
        context.strokeStyle = "#fff"
        context.lineWidth = 0.1
        context.strokeRect(x + offset.x, y + offset.y, 1, 1)
      }
    })
  })
}

// 背景浅色网格
function drawNet() {
  context.strokeStyle = "#ffffff16"
  context.lineWidth = 0.1
  for (let i = 1; i < 12; i++) {
    context.beginPath()
    context.moveTo(i, 0)
    context.lineTo(i, 20)
    context.stroke()
  }
  for (let i = 1; i < 20; i++) {
    context.beginPath()
    context.moveTo(0, i)
    context.lineTo(12, i)
    context.stroke()
  }
}
```

### 动画

```js
// 动画
let lastTime = 0
let dropCounter = 0
let dropInterval = 1000
function update(time = 0) {
  const deltaTime = time - lastTime
  dropCounter += deltaTime
  if (dropCounter > dropInterval) {
    // 每一秒下落一格
    playerDrop()
    dropCounter = 0
  }
  lastTime = time
  draw()
  requestAnimationFrameId = requestAnimationFrame(update)
}
```

```js
// 每一秒下落一格
function playerDrop() {
  // 更新前判断即将下落的方块，如果有冲突（碰撞），就不下落，固定位置（跟大网格数组合并）
  const nextPlayerPos = {
    ...player,
    pos: {
      ...player.pos,
      y: player.pos.y + 1,
    },
  }

  if (collide(arena, nextPlayerPos)) {
    // 碰撞时合并
    merge(arena, player)
    // （得分，消一列）
    // 如果每一列都不为空
    // 取出这一列，从头部放入一个空数组
    clearLine(arena)
    // 游戏上方重新生成方块
    resetPlayer()
  } else {
    player.pos = nextPlayerPos.pos
  }
}
```

```js
// 判断方块与游戏区是否冲突
function collide(arena, player) {
  for (let i = 0; i < player.matrix.length; i++) {
    for (let j = 0; j < player.matrix[i].length; j++) {
      // player是否在游戏区
      if (!player.matrix[i][j]) continue

      //player有方块的点不在arena中（移出边界）
      if (
        arena[player.pos.y + i] === undefined ||
        arena[player.pos.y + i][player.pos.x + j] === undefined
      ) {
        return true
      }

      //player有方块的点跟在arena中的点（碰撞）
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
```

```js
// 将方块固定到游戏区
function merge(arena, player) {
  for (let i = 0; i < player.matrix.length; i++) {
    for (let j = 0; j < player.matrix[i].length; j++) {
      if (player.matrix[i][j] !== 0) {
        arena[player.pos.y + i][player.pos.x + j] = player.matrix[i][j]
      }
    }
  }
}
```

```js
// 得分，消一列
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
```

### 游戏控制

```js
// 左右移动后判断是否碰撞，更新位置
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

      break
    }
    case "ArrowUp": {
      rotate(player.matrix)

      break
    }
  }
})
```

```js
// 旋转：我觉得是这个项目最有意思的地方

// 二维正方形矩阵
// 第n行变成第n列
// 再把每一列反向
// 就得到顺时针旋转的结果

// 有动画或者手绘一个可能更好理解
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
```

## 总结

以上是以项目完成后的思路去复盘，可能描述得有些笼统。具体细节可以参考完整代码，也欢迎跟我讨论。如果对您有帮助，也可以给个 star。
