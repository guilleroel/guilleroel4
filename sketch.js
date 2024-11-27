let tSize = 140; // Tamaño del texto
let pointCount = 0.2; // Densidad de partículas (entre 0 y 1)
let dia = 100; // Diámetro de interacción del mouse
let textPoints = [];
let particles = []; // Array para partículas dispersas
let magnifySize = 10; // Factor de magnificación cuando el mouse pasa sobre las partículas
let words = ["INSPO", "ARTISTS", "CREATE"]; // Lista de palabras a mostrar
let currentWordIndex = 0; // Índice para recorrer las palabras
let currentWord = words[currentWordIndex]; // Palabra actual a mostrar
let isRevealed = false; // Variable para saber si el texto está revelado
let isResetting = false; // Bandera para saber si las partículas están volviendo a su posición dispersa
let song; // Música de fondo

// Colores para las palabras
let wordColors = {
  "INSPO": [218, 94, 230],   // Rosa
  "ARTISTS": [132, 94, 214], // Purple
  "CREATE": [118, 197, 219] // Orange
};

function preload() {
  font = loadFont("EpiceneDisplay-Regular.otf");
  song = loadSound("Sesame - Dyalla.mp3"); // Cargar la música
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(font);
  textAlign(CENTER, CENTER); // Alinear texto al centro
  generateTextParticles(currentWord); // Generamos las partículas de la palabra inicial

  // Reproducir la música en loop
  if (song) {
    song.loop();
  }
}

function draw() {
  background(0);

  // Dibujar las partículas dispersas que forman la palabra
  for (let i = 0; i < textPoints.length; i++) {
    let p = textPoints[i];
    p.update(true); // Verificar si el mouse está cerca de las partículas del texto
    p.show(true); // Mostrar las partículas del texto
  }

  // Si todas las partículas se han agrupado correctamente, el texto es estático
  let allRevealed = true;
  for (let i = 0; i < textPoints.length; i++) {
    let p = textPoints[i];
    if (!p.isRevealed) {
      allRevealed = false;
    }
  }

  // Cuando todas las partículas se han agrupado, se considera que el texto se ha revelado
  if (allRevealed) {
    isRevealed = true;
    noLoop(); // Detener el dibujo, haciendo el texto estático
  }
}

// Función que maneja el click para regresar las partículas a su posición original
function mousePressed() {
  if (!isResetting) {
    isResetting = true; // Marcar que las partículas están regresando a sus posiciones originales

    // Actualizar el índice para la siguiente palabra en orden
    currentWordIndex = (currentWordIndex + 1) % words.length;
    currentWord = words[currentWordIndex]; // Seleccionar la siguiente palabra en la secuencia

    generateTextParticles(currentWord); // Generar las partículas para la nueva palabra
    loop(); // Volver a empezar el ciclo de animación
  }
}

// Función para generar las partículas de una palabra
function generateTextParticles(word) {
  textPoints = []; // Limpiar las partículas previas

  // Convertimos el texto en puntos
  let bounds = font.textBounds(word, 0, 0, tSize); // Calcular los límites del texto
  let tposX = (width - bounds.w) / 2; // Centrar la palabra horizontalmente
  let tposY = (height + bounds.h) / 2; // Centrar la palabra verticalmente

  let points = font.textToPoints(word, tposX, tposY, tSize, {
    sampleFactor: pointCount,
  });

  // Crear partículas que forman la palabra
  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    // Estas partículas no estarán en su lugar hasta que el mouse pase por encima
    let textPoint = new Particle(pt.x, pt.y, true);
    textPoint.pos = createVector(random(width), random(height)); // Empezar dispersas
    textPoint.originPos = createVector(pt.x, pt.y); // Guardar la posición original
    textPoint.color = wordColors[word]; // Asignar el color correspondiente a la palabra
    textPoints.push(textPoint);
  }
}

class Particle {
  constructor(x, y, isTextParticle) {
    this.pos = createVector(x, y); // Posición inicial
    this.target = createVector(x, y); // Posición donde debe llegar (en este caso, la posición de la letra)
    this.originPos = createVector(x, y); // Guardar la posición original dispersa
    this.vel = createVector(random(-1, 1), random(-1, 1)); // Velocidad aleatoria
    this.acc = createVector(0, 0); // Aceleración inicial
    this.baseSize = 5; // Tamaño base
    this.size = this.baseSize; // Tamaño actual
    this.isTextParticle = isTextParticle; // Si es parte del texto o una partícula flotante
    this.isRevealed = false; // Si la partícula se ha revelado
    this.resettingSpeed = 0.05; // Velocidad con la que las partículas vuelven a su posición dispersa
    this.color = [255, 255, 255]; // Color por defecto (blanco)
  }

  update(isTextParticle) {
    if (this.isTextParticle) {
      // Si el mouse está cerca de la partícula, moverla hacia su posición del texto
      let d = dist(this.pos.x, this.pos.y, mouseX, mouseY);
      if (d < dia) {
        // Lerp para suavizar el movimiento
        this.pos.x = lerp(this.pos.x, this.target.x, 0.1);
        this.pos.y = lerp(this.pos.y, this.target.y, 0.1);
        this.size = lerp(this.size, this.baseSize * magnifySize, 0.1); // Agrandarse suavemente
      } else {
        this.size = lerp(this.size, this.baseSize, 0.1); // Volver al tamaño base
      }

      // Si la partícula está cerca de su posición final, se considera "revelada"
      let distToTarget = dist(this.pos.x, this.pos.y, this.target.x, this.target.y);
      if (distToTarget < 5) {
        this.isRevealed = true;
        this.pos = this.target.copy(); // Aseguramos que la partícula quede en su posición final
      }
    }

    // Si las partículas están volviendo a su posición dispersa, las movemos suavemente
    if (isResetting) {
      this.pos.x = lerp(this.pos.x, this.originPos.x, this.resettingSpeed);
      this.pos.y = lerp(this.pos.y, this.originPos.y, this.resettingSpeed);
      // Si las partículas están cerca de su posición dispersa, detenemos la animación
      if (dist(this.pos.x, this.pos.y, this.originPos.x, this.originPos.y) < 2) {
        isResetting = false;
      }
    }
  }

  show(isTextParticle) {
    if (isTextParticle) {
      if (this.isRevealed) {
        fill(this.color); // Usar el color asignado para cada palabra
      } else {
        fill(255, 150); // Blanco para las partículas no reveladas
      }
    } else {
      fill(255, 150); // Color blanco para las partículas flotantes
    }
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.size, this.size); // Dibujar la partícula
  }

  // Resetear la partícula a su posición original dispersa
  reset() {
    this.pos = createVector(random(width), random(height)); // Volver a posición dispersa
    this.isRevealed = false; // Volver a su estado no revelado
    this.size = this.baseSize; // Restaurar tamaño base
    this.target = this.originPos.copy(); // Restablecer la posición objetivo a su lugar original
  }
}
