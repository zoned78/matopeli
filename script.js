// script.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const snakeHeadImage = new Image(); // Luodaan uusi kuva-objekti
snakeHeadImage.src = 'snake_head.png'; // Määritellään kuvan polku
const dingSound = document.getElementById('dingSound');
const foodImages = [
  'suklaa.png',
  'sipsipussi.png',
  'karkkipussi.png'
].map(src => {
  const img = new Image();
  img.src = src;
  return img;
});



// Asetukset
const gridSize = 20;
const tileCount = 20;
canvas.width = canvas.height = gridSize * tileCount;

// Mato ja ruoka
let snake = [{ x: 10, y: 10 }];
let food = {
  x: 15,
  y: 15,
  image: foodImages[Math.floor(Math.random() * foodImages.length)]
};
let dx = 0, dy = 0; // Liikesuunnat
let score = 0;

try {
  dingSound.currentTime = 0; // Nollaa äänen alku
  dingSound.play(); // Toista ääni
  console.log('Ääni toimii koodin kautta.');
} catch (error) {
  console.error('Äänen toisto ei onnistu koodin kautta:', error);
}

document.getElementById('up').addEventListener('click', () => {
  if (dy === 0) { dx = 0; dy = -1; }
});

document.getElementById('down').addEventListener('click', () => {
  if (dy === 0) { dx = 0; dy = 1; }
});

document.getElementById('left').addEventListener('click', () => {
  if (dx === 0) { dx = -1; dy = 0; }
});

document.getElementById('right').addEventListener('click', () => {
  if (dx === 0) { dx = 1; dy = 0; }
});

// Peli
function gameLoop() {
  update();
  draw();
  setTimeout(gameLoop, 100);
}

// Päivitä peli
function update() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    updateScoreBoard();

 try {
    dingSound.currentTime = 0; // Nollaa äänen alku
    dingSound.play();
    console.log('Ruoka syöty, ääni toistetaan.');
  } catch (error) {
    console.error('Äänen toisto epäonnistui:', error);
  }

    // Luo uusi ruoka satunnaisella kuvalla
    food = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
      image: foodImages[Math.floor(Math.random() * foodImages.length)]
    };
  } else {
    snake.pop();
  }

  // Tarkista törmäykset
  if (
    head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount ||
    snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)
  ) {
    resetGame();
  }
}

function updateScoreBoard() {
  const scoreElement = document.getElementById('score');
  scoreElement.textContent = `Score: ${score}`;
}

// Piirrä peli
function draw() {

  // Piirrä tausta
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Piirrä käärmeen pää
  const head = snake[0];
  ctx.save();
  ctx.translate((head.x + 0.5) * gridSize, (head.y + 0.5) * gridSize);

  if (dx === 1) ctx.rotate(0);
  else if (dx === -1) ctx.rotate(Math.PI);
  else if (dy === 1) ctx.rotate(Math.PI / 2);
  else if (dy === -1) ctx.rotate(-Math.PI / 2);

  ctx.drawImage(snakeHeadImage, -gridSize / 2, -gridSize / 2, gridSize, gridSize);
  ctx.restore();

  // Piirrä madon vartalo
  ctx.fillStyle = 'lime';
  snake.slice(1).forEach(segment => {
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
  });

  // Piirrä ruoka
  if (food.image) {
    ctx.drawImage(food.image, food.x * gridSize, food.y * gridSize, gridSize, gridSize);
  } else {
    console.error('Ruoka ei sisältänyt kuvaa:', food);
  }
}

// Käynnistä peli
function resetGame() {
  updateHighScores(score); // Tarkista, pääseekö tulos listalle
  snake = [{ x: 10, y: 10 }];
  dx = dy = 0;
  score = 0; // Nollaa pisteet
  updateScoreBoard(); // Päivitä pistetaulu
  food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount),
    image: foodImages[Math.floor(Math.random() * foodImages.length)]
  };
}

function updateHighScores(currentScore) {
  // Hae nykyinen lista tai luo uusi tyhjä lista
  let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

  // Tarkista, pääseekö tulos listalle
  if (highScores.length < 3 || currentScore > highScores[highScores.length - 1].score) {
    // Näytä nimikenttä
    document.getElementById('nameInput').style.display = 'block';

    // Tallenna tilapäinen pistemäärä LocalStorageen
    localStorage.setItem('tempScore', currentScore);
    return; // Odotetaan, että käyttäjä syöttää nimen
  }

  // Päivitä HTML-lista
  const scoreList = document.getElementById('scoreList');
  scoreList.innerHTML = '';
  highScores.forEach(entry => {
    const li = document.createElement('li');
    li.textContent = `${entry.name}: ${entry.score}`;
    scoreList.appendChild(li);
  });

if (highScores.length < 3 || currentScore > highScores[highScores.length - 1].score) {
  console.log('Tulos pääsee high score -listalle!');
  document.getElementById('nameInput').style.display = 'block';
  localStorage.setItem('tempScore', currentScore);
  return;
}
}

  

function saveName() {
  const playerName = document.getElementById('playerName').value || 'Anonymous';
  const currentScore = parseInt(localStorage.getItem('tempScore'), 10);

  let highScores = JSON.parse(localStorage.getItem('highScores')) || [];
  highScores.push({ name: playerName, score: currentScore });

  // Järjestä lista suurimmasta pienimpään
  highScores.sort((a, b) => b.score - a.score);
  highScores = highScores.slice(0, 3);

  // Tallenna lista takaisin LocalStorageen
  localStorage.setItem('highScores', JSON.stringify(highScores));

  // Päivitä HTML-lista
  const scoreList = document.getElementById('scoreList');
  scoreList.innerHTML = '';
  highScores.forEach(entry => {
    const li = document.createElement('li');
    li.textContent = `${entry.name}: ${entry.score}`;
    scoreList.appendChild(li);
  });

  // Piilota nimikenttä ja tyhjennä syötekenttä
  document.getElementById('nameInput').style.display = 'none';
  document.getElementById('playerName').value = '';
}

function resetHighScores() {
  // Poista high score -data LocalStoragesta
  localStorage.removeItem('highScores');

  // Tyhjennä HTML-lista
  const scoreList = document.getElementById('scoreList');
  scoreList.innerHTML = '';

  console.log('High score -lista resetoitu.');
}

let audioActivated = false; // Seurataan, onko ääni aktivoitu

window.addEventListener('keydown', e => {
  if (!audioActivated) {
    // Aktivoi äänen toisto ensimmäisellä näppäimen painalluksella
    try {
      dingSound.play().then(() => {
        console.log('Ääni aktivoitu käyttäjän toiminnan kautta.');
        audioActivated = true;
      }).catch(error => {
        console.error('Äänen aktivointi epäonnistui:', error);
      });
    } catch (error) {
      console.error('Äänen aktivointi epäonnistui:', error);
    }
  }

  if (e.key === 'ArrowUp' && dy === 0) { dx = 0; dy = -1; }
  if (e.key === 'ArrowDown' && dy === 0) { dx = 0; dy = 1; }
  if (e.key === 'ArrowLeft' && dx === 0) { dx = -1; dy = 0; }
  if (e.key === 'ArrowRight' && dx === 0) { dx = 1; dy = 0; }
});

gameLoop();
