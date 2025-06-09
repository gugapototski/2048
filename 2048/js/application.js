// Função que retorna o tamanho da grade baseado na dificuldade
function getGridSize(difficulty) {
  switch (difficulty) {
    case 'easy':   return 6; // fácil = 6x6
    case 'medium': return 5; // médio = 5x5
    case 'hard':   return 4; // difícil = 4x4
    default:       return 4;
  }
}

// Função que monta visualmente a grade no DOM, conforme o tamanho
// Função que monta visualmente a grade no DOM, conforme o tamanho
function buildGridVisual(size) {
  const gap = getGapBySize(size);
  const container = document.querySelector('.grid-container');
  container.innerHTML = '';

  const totalWidth = 470;
  const cellSize = (totalWidth - gap * (size - 1)) / size;

  // 1) seta as 3 vars (grid-size, grid-gap e tile-size)
  document.documentElement.style.setProperty('--grid-size', `${size}`);
  document.documentElement.style.setProperty('--grid-gap',  `${gap}px`);
  document.documentElement.style.setProperty('--tile-size', `${cellSize}px`);

  // 2) cria size*size DIVs .grid-cell (sem wrappers de linha)
  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement('div');
    cell.classList.add('grid-cell');
    container.appendChild(cell);
  }
}


function getGapBySize(size) {
  switch (size) {
    case 4: return 15; // 4x4
    case 5: return 10; // 5x5
    case 6: return 5;  // 6x6
    default: return 15;
  }
}

// Variável global para o gameManager
let gameManager = null;

// Função que inicia o jogo com a dificuldade escolhida
function startGame(size) {
  const gap = getGapBySize(size);
  buildGridVisual(size, gap);

  if (gameManager && typeof gameManager.clear === 'function') {
    gameManager.clear();
  }

  gameManager = new GameManager(
    size,
    KeyboardInputManager,
    HTMLActuator,
    LocalStorageManager
  );
  console.log(`Jogo iniciado com grade ${size}x${size} e gap ${gap}px`);
}

// Função para trocar a dificuldade e reiniciar o jogo corretamente
function changeDifficulty(difficulty) {
  const size = getGridSize(difficulty);

  // Limpa o estado salvo
  if (gameManager?.storageManager?.clearGameState) {
    gameManager.storageManager.clearGameState();
  }

  startGame(size);
}

// Eventos dos botões de dificuldade
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-easy')
    .addEventListener('click', () => changeDifficulty('easy'));
  document.getElementById('btn-medium')
    .addEventListener('click', () => changeDifficulty('medium'));
  document.getElementById('btn-hard')
    .addEventListener('click', () => changeDifficulty('hard'));

  // Inicia com a dificuldade padrão (4x4)
  startGame(4);
});
