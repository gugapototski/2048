let isImpossibleMode = false; // 1. Adicionar esta variável


// Função que retorna o tamanho da grade baseado na dificuldade
function getGridSize(difficulty) {
  switch (difficulty) {
    case 'easy':   return 6;
    case 'medium': return 5;
    case 'hard':   return 4;
    default:       return 4;
  }
}

// Função que monta visualmente a grade no DOM
function buildGridVisual(size) {
  const gap = getGapBySize(size);
  const container = document.querySelector('.grid-container');
  container.innerHTML = '';

  const totalWidth = 470;
  const cellSize = (totalWidth - gap * (size - 1)) / size;

  document.documentElement.style.setProperty('--grid-size', `${size}`);
  document.documentElement.style.setProperty('--grid-gap',  `${gap}px`);
  document.documentElement.style.setProperty('--tile-size', `${cellSize}px`);

  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement('div');
    cell.classList.add('grid-cell');
    container.appendChild(cell);
  }
}

function getGapBySize(size) {
  switch (size) {
    case 4: return 15;
    case 5: return 10;
    case 6: return 5;
    default: return 15;
  }
}

let gameManager = null;
let winningValue = 2048;
let currentDifficulty = 'hard'; // guarda a dificuldade atual


// Atualiza o título grande do jogo
function updateGameTitle(newTitle) {
  const titleElement = document.querySelector('h1.title');
  if (titleElement) {
    titleElement.textContent = newTitle;
  }
}

// Função para iniciar o jogo, recebe o tamanho e condição de vitória
function startGame(size, winValue = 2048, impossible = false) { // Adicionar parâmetro
  winningValue = winValue;
  buildGridVisual(size);

  if (gameManager && typeof gameManager.clear === 'function') {
    gameManager.clear();
  }
  
  // 4. Passar o modo para o GameManager
  gameManager = new GameManager(
    size,
    KeyboardInputManager,
    HTMLActuator,
    LocalStorageManager,
    winningValue,
    impossible // Passar o novo parâmetro
  );

  updateGameTitle(winningValue);
}

function newGame(difficulty, winValue, impossible = false) { // Adicionar parâmetro
  currentDifficulty = difficulty;
  winningValue = winValue;

  // Atualiza a seleção visual dos botões
  document.querySelectorAll('.button-group button').forEach(btn => {
    let isSelected = false;
    if (impossible && btn.id === 'btn-impossible') {
      isSelected = true;
    } else if (!impossible && btn.id === `btn-${difficulty}`) {
      isSelected = true;
    }
    btn.classList.toggle('selected', isSelected);
  });

  if (gameManager?.storageManager?.clearGameState) {
    gameManager.storageManager.clearGameState();
  }

  const size = getGridSize(difficulty);
  startGame(size, winValue, impossible); // Passar para a função startGame

  if (typeof restart === 'function') {
    restart();
  }
}

// Função para trocar dificuldade (botões)
function changeDifficulty(difficulty) {
  const size = getGridSize(difficulty);

  // Limpa o estado salvo
  if (gameManager?.storageManager?.clearGameState) {
    gameManager.storageManager.clearGameState();
  }

  startGame(size, winningValue);

  updateGameTitle(winningValue);

  // ✅ Simula clique no botão "New Game"
  document.querySelector('.restart-button')?.click();
}



document.addEventListener('DOMContentLoaded', () => {
  // Evento para os botões de dificuldade
 // Modificar os outros botões de dificuldade para desativar o modo impossível
  document.getElementById('btn-easy').addEventListener('click', () => {
    currentDifficulty = 'easy';
    isImpossibleMode = false;
    document.getElementById('invert-controls').checked = false;
    newGame(currentDifficulty, winningValue, false);
  });

  document.getElementById('btn-medium').addEventListener('click', () => {
    currentDifficulty = 'medium';
    isImpossibleMode = false;
    document.getElementById('invert-controls').checked = false;
    newGame(currentDifficulty, winningValue, false);
  });

  document.getElementById('btn-hard').addEventListener('click', () => {
    currentDifficulty = 'hard';
    isImpossibleMode = false;
    document.getElementById('invert-controls').checked = false;
    newGame(currentDifficulty, winningValue, false);
  });

  document.getElementById('btn-impossible').addEventListener('click', () => {
    currentDifficulty = 'hard'; 
    isImpossibleMode = true;
    document.getElementById('invert-controls').checked = true; 
    newGame(currentDifficulty, winningValue, true);
  });


  // Botão New Game (com classe .restart-button)
  const restartButton = document.querySelector('.restart-button');
  if (restartButton) {
    restartButton.addEventListener('click', () => {
      newGame(currentDifficulty, winningValue);
    });
  }

  // Inicia com dificuldade padrão 'hard' (4x4) e winningValue padrão 2048
  newGame(currentDifficulty, winningValue);

  // Dark mode toggle
  const btnDark = document.getElementById('btn-dark-mode');
  btnDark.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    if (document.body.classList.contains('dark')) {
      localStorage.setItem('darkMode', '1');
    } else {
      localStorage.removeItem('darkMode');
    }
  });
  if (localStorage.getItem('darkMode')) {
    document.body.classList.add('dark');
  }

  // Seletor da condição de vitória
  const goalSelector = document.getElementById("winning-tile-selector");
  const goalLabel = document.getElementById("goal-label");

  goalSelector.addEventListener("change", (event) => {
  const selectedGoal = parseInt(event.target.value, 10);
  goalLabel.textContent = `${selectedGoal} tile!`;

  winningValue = selectedGoal; // Atualiza a variável global

  if (gameManager?.storageManager?.clearGameState) {
    gameManager.storageManager.clearGameState();
  }

  const difficulty = document.querySelector('button.selected')?.id?.replace('btn-', '') || 'hard';
  const size = getGridSize(difficulty);
  startGame(size, selectedGoal);

  // ✅ Simula clique no botão "New Game"
  document.querySelector('.restart-button')?.click();
});

});
