// Define o tamanho de cada espaço do grid
const gridSpace = 30;

// Declaração de variáveis
let fallingPiece;
let gridPieces = [];
let lineFades = [];
let gridWorkers = [];

let currentScore = 0;
let currentLevel = 1;
let linesCleared = 0;

let ticks = 0;
let updateEvery = 10;
let updateEveryCurrent = 10;
let pauseGame = false;
let gameOver = false;

// Defina as bordas da área do jogo
const gameEdgeLeft = 150;
const gameEdgeRight = 450;

// Defina as cores das peças
const colors = [
  '#dca3ff',
  '#ff90a0',
  '#80ffb4',
  '#ff7666',
  '#70b3f5',
  '#b2e77d',
  '#ffd700',
];

// Helpers de grid <-> pixels
function getNumCols() {
  return (gameEdgeRight - gameEdgeLeft) / gridSpace;
}

function getNumRows() {
  return Math.floor(height / gridSpace);
}

function pixelToCol(px) {
  return Math.round((px - gameEdgeLeft) / gridSpace);
}

function pixelToRow(py) {
  return Math.round(py / gridSpace);
}

function colToPixel(col) {
  return gameEdgeLeft + col * gridSpace;
}

function rowToPixel(row) {
  return row * gridSpace;
}

// Função de configuração chamada uma vez no início
function setup() {
  createCanvas(600, 540);

  fallingPiece = new PlayPiece();
  fallingPiece.resetPiece();

  textFont('Ubuntu');
}

// Função Draw chamada repetidamente
function draw() {
  const colorDark = '#0d0d0d';
  const colorLight = '#304550';
  const colorBackground = 'gray';

  background(colorBackground);

  fill(25);
  noStroke();
  rect(gameEdgeRight, 0, 150, height);

  fill(colorBackground);
  rect(450, 80, 150, 70);
  rect(460, 405, 130, 5, 5);
  rect(460, 210, 130, 60, 5, 5);
  rect(460, 280, 130, 60, 5, 5);

  fill(colorLight);
  rect(450, 85, 150, 20);
  rect(450, 110, 150, 4);
  rect(450, 140, 150, 4);

  fill(colorBackground);
  rect(460, 60, 130, 35, 5, 5);

  strokeWeight(3);
  noFill();
  stroke(colorLight);
  rect(465, 65, 120, 25, 5, 5);
  rect(465, 410, 120, 120, 5, 5);
  rect(465, 215, 120, 50, 5, 5);
  rect(465, 285, 120, 50, 5, 5);

  fill(25);
  noStroke();
  textSize(24);
  textAlign(CENTER);
  text("Score", 525, 85);
  text("Level", 525, 238);
  text("Lines", 525, 308);

  textSize(24);
  textAlign(RIGHT);
  text(currentScore, 560, 135);
  text(currentLevel, 560, 260);
  text(linesCleared, 560, 330);

  stroke(colorDark);
  line(gameEdgeRight, 0, gameEdgeRight, height);

  // Mostra as peças caindo
  fallingPiece.show();

  // Acelera a queda das peças se caso a seta para baixo do teclado for pressionada
  if (keyIsDown(DOWN_ARROW)) {
    updateEvery = 2;
  } else {
    updateEvery = updateEveryCurrent;
  }

  // Atualiza o estado do jogo
  if (!pauseGame) {
    ticks++;
    if (ticks >= updateEvery) {
      ticks = 0;

      // sempre se move exatamente 1 célula
      fallingPiece.fall();
    }
  }

  // Mostra as peças do grid
  for (let i = 0; i < gridPieces.length; i++) {
    gridPieces[i].show();
  }

  // Mostra as fading lines
  for (let i = 0; i < lineFades.length; i++) {
    lineFades[i].show();
  }

  // Processa o grid workers do código
  if (gridWorkers.length > 0) {
    gridWorkers[0].work();
  }

  // Explicação dos controles do jogo
  textAlign(CENTER);
  fill(255);
  noStroke();
  textSize(14);
  text("Controls:\n↑\n← ↓ →\n", 75, 155);
  text("Left and Right:\nmove side to side", 75, 230);
  text("Up:\nrotate", 75, 280);
  text("Down:\nfall faster", 75, 330);
  text("R:\nreset game", 75, 380);


  // Mostra o texto de Game Over
  if (gameOver) {
    fill(colorDark);
    textSize(54);
    textAlign(CENTER);
    text("Game Over!", 300, 270);
  }

  // Desenha a borda do game
  strokeWeight(3);
  stroke('#304550');
  noFill();
  rect(0, 0, width, height);
}

// Função chamada quando a chave é pressionada
function keyPressed() {
  if (keyCode === 82) {
    // 'R' key
    resetGame();
  }

  if (!pauseGame) {
    if (keyCode === LEFT_ARROW) {
      fallingPiece.input(LEFT_ARROW);
    } else if (keyCode === RIGHT_ARROW) {
      fallingPiece.input(RIGHT_ARROW);
    }
    if (keyCode === UP_ARROW) {
      fallingPiece.input(UP_ARROW);
    }
  }
}

// Classe para a fallin piece
class PlayPiece {
  constructor() {
    this.pos = createVector(0, 0); // pixel position do canto esquerdo superior do "bloco lógico"
    this.rotation = 0;
    this.pieceType = Math.floor(Math.random() * 7); // gera a primeira peça
    this.nextPieceType = Math.floor(Math.random() * 7); // gera a próxima
    this.pieces = [];
    this.nextPieces = [];
    this.orientation = [];
    this.fallen = false;
  }

  // Geração da próxima peça (preview)
  generateNextPieces() {
    this.nextPieces = [];
    const nextPoints = orientPoints(this.nextPieceType, 0);

    const previewBoxCenterX = 525;
    const previewBoxCenterY = 470;

    const xs = nextPoints.map(p => p[0]);
    const ys = nextPoints.map(p => p[1]);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const pieceWidth = (maxX - minX + 1) * gridSpace;
    const pieceHeight = (maxY - minY + 1) * gridSpace;

    const offsetX = previewBoxCenterX - pieceWidth / 2 - minX * gridSpace;
    const offsetY = previewBoxCenterY - pieceHeight / 2 - minY * gridSpace;

    for (let i = 0; i < 4; i++) {
      this.nextPieces.push(
        new Square(
          offsetX + nextPoints[i][0] * gridSpace,
          offsetY + nextPoints[i][1] * gridSpace,
          this.nextPieceType
        )
      );
    }
  }

  // Fazendo a peça cair (sempre 1 célula por vez)
  fall() {

    // se não há colisão, desce 1 célula
    if (!this.futureCollision(0, gridSpace, this.rotation)) {
        this.addPos(0, gridSpace);
        this.fallen = true;
    } 
    else {
        // caso haja colisão
        if (!this.fallen) {
            // Checa se a colisão ocorreu no topo do campo (mesmo com row < 0)
            // significa que não havia espaço para spawnar a peça
            this.commitShape(true); // força commit antes de encerrar
            pauseGame = true;
            gameOver = true;
        } 
        else {
            // senão, apenas fixa a peça
            this.commitShape();
        }
    }
  }

  // Reseta a peça atual (agora spawn alinhado por coluna)
  resetPiece() {
    // A peça atual vira a próxima
    this.pieceType = this.nextPieceType;

    // Gera uma nova "próxima" peça para o preview (diferente da atual)
    this.nextPieceType = pseudoRandom(this.pieceType);

    const points = orientPoints(this.pieceType, 0);
    const xs = points.map(p => p[0]);
    const ys = points.map(p => p[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const pieceWidth = maxX - minX + 1;

    const numCols = getNumCols();

    // Calcula a coluna de início (inteira) para que a peça fique centralizada e alinhada à grade
    const leftCol = Math.floor((numCols - pieceWidth) / 2) - minX;

    this.pos.x = colToPixel(leftCol);

    // posiciona a peça duas linhas acima do topo (múltiplo do gridSpace)
    this.pos.y = -2 * gridSpace;

    this.newPoints();
    this.generateNextPieces();
    this.fallen = false;
  }

  // Gera os pontos para a peça (cria os Square em pixels)
  newPoints() {
    const points = orientPoints(this.pieceType, this.rotation);
    this.orientation = points;
    this.pieces = [];

    for (let i = 0; i < points.length; i++) {
      this.pieces.push(new Square(this.pos.x + points[i][0] * gridSpace, this.pos.y + points[i][1] * gridSpace, this.pieceType));
    }
  }

  // Atualiaza a posição da peça atual (snap por cálculo, mantém alinhamento)
  updatePoints() {
    const points = orientPoints(this.pieceType, this.rotation);
    this.orientation = points;

    for (let i = 0; i < 4; i++) {
      this.pieces[i].pos.x = this.pos.x + points[i][0] * gridSpace;
      this.pieces[i].pos.y = this.pos.y + points[i][1] * gridSpace;
    }
  }

  // Adiciona um deslocamento à posição da peça atual
  addPos(x, y) {
    this.pos.x += x;
    this.pos.y += y;

    for (let i = 0; i < 4; i++) {
      this.pieces[i].pos.x += x;
      this.pieces[i].pos.y += y;
    }
  }

  // DETECÇÃO DE COLISÃO: usa col/row (grade) em vez de comparar floats/pixels diretamente
  futureCollision(xOffset, yOffset, rotation) {
    let testPoints = this.orientation;

    if (rotation !== this.rotation) {
      testPoints = orientPoints(this.pieceType, rotation);
    }

    const numCols = getNumCols();
    const numRows = getNumRows();

    for (let i = 0; i < testPoints.length; i++) {
      const testPx = this.pos.x + testPoints[i][0] * gridSpace + xOffset;
      const testPy = this.pos.y + testPoints[i][1] * gridSpace + yOffset;

      const col = pixelToCol(testPx);
      const row = pixelToRow(testPy);

      // colisão com as bordas (colunas) ou chão (linhas)
      if (col < 0 || col >= numCols || row >= numRows) {
        return true;
      }

      // se row < 0 => parte acima da tela, não é colisão com blocos fixos
      if (row >= 0) {
        for (let j = 0; j < gridPieces.length; j++) {
          const other = gridPieces[j];
          const oCol = pixelToCol(other.pos.x);
          const oRow = pixelToRow(other.pos.y);
          if (col === oCol && row === oRow) {
            return true;
          }
        }
      }
    }

    return false;
  }

  // Lidando com as entradas do usuário
  input(key) {
    switch (key) {
      case LEFT_ARROW:
        if (!this.futureCollision(-gridSpace, 0, this.rotation)) {
          this.addPos(-gridSpace, 0);
        }
        break;

      case RIGHT_ARROW:
        if (!this.futureCollision(gridSpace, 0, this.rotation)) {
          this.addPos(gridSpace, 0);
        }
        break;

      case UP_ARROW:
        let newRotation = this.rotation + 1;
        if (newRotation > 3) {
          newRotation = 0;
        }
        if (!this.futureCollision(0, 0, newRotation)) {
          this.rotation = newRotation;
          this.updatePoints();
        }
        break;
    }
  }

  // Mostra a peça atual
  show() {
    for (let i = 0; i < this.pieces.length; i++) {
      this.pieces[i].show();
    }

    for (let i = 0; i < this.nextPieces.length; i++) {
      this.nextPieces[i].show();
    }
  }

  // Commit a forma atual do grid (snap e criar novos Squares fixos)
  commitShape(force = false) {
      for (let i = 0; i < this.pieces.length; i++) {
          const sp = this.pieces[i];
          const col = pixelToCol(sp.pos.x);
          const row = pixelToRow(sp.pos.y);

          // cria um novo Square já alinhado (evita referências compartilhadas)
          const snapped = new Square(colToPixel(col), rowToPixel(row), sp.colorIndex);
          gridPieces.push(snapped);
      }

      // Só gera nova peça se o jogo ainda não acabou
      if (!gameOver && !force) {
          this.resetPiece();
          gridWorkers.push(new GridWorker());
      }
  }

}

// Classe para os quadrados individuais
class Square {
  constructor(x, y, colorIndex) {
    this.pos = createVector(x, y);
    this.colorIndex = colorIndex;
  }

  show() {
    fill(colors[this.colorIndex]);
    stroke(0);
    strokeWeight(2);
    rect(this.pos.x, this.pos.y, gridSpace, gridSpace, 5, 5);
  }
}

// Função que gera peça aleatória diferente da anterior
function pseudoRandom(previous) {
  let newType = Math.floor(Math.random() * 7);
  while (newType === previous) {
    newType = Math.floor(Math.random() * 7);
  }
  return newType;
}

// Função para definir os pontos das peças conforme o tipo e rotação
function orientPoints(type, rotation) {
  const pieces = [
    [[0, 0], [1, 0], [0, 1], [1, 1]],  // quadrado
    [[0, 0], [1, 0], [2, 0], [3, 0]],  // linha horizontal
    [[0, 0], [1, 0], [0, 1], [0, 2]],  // L
    [[0, 0], [0, 1], [1, 1], [2, 1]],  // J
    [[1, 0], [2, 0], [0, 1], [1, 1]],  // S
    [[0, 0], [1, 0], [1, 1], [2, 1]],  // Z
    [[1, 0], [0, 1], [1, 1], [2, 1]],  // T
  ];

  let pts = pieces[type].map(p => [p[0], p[1]]);
  
  for (let r = 0; r < rotation; r++) {
    pts = pts.map(([x, y]) => [y, -x]);
  }

  return pts;
}

// Classe para a lógica de remoção de linhas e outras ações do grid
class GridWorker {
  constructor() {
    this.linesToClear = [];
    this.fadeStep = 0;
  }

  work() {
    // implementa a detecção de linhas cheias aqui
    gridWorkers.shift(); // placeholder
  }
}

// Resetar o jogo
function resetGame() {
  gridPieces = [];
  lineFades = [];
  gridWorkers = [];
  currentScore = 0;
  currentLevel = 1;
  linesCleared = 0;
  ticks = 0;
  updateEvery = 10;
  updateEveryCurrent = 10;
  pauseGame = false;
  gameOver = false;

  fallingPiece.resetPiece();
}
