const pupils = document.querySelectorAll(".pupil");

document.addEventListener("mousemove", (e) => {
  pupils.forEach(pupil => {
    const eye = pupil.parentElement;
    const rect = eye.getBoundingClientRect();

    const eyeCenterX = rect.left + rect.width / 2;
    const eyeCenterY = rect.top + rect.height / 2;

    const angle = Math.atan2(
      e.clientY - eyeCenterY,
      e.clientX - eyeCenterX
    );

    const maxMove = 25;
    const x = Math.cos(angle) * maxMove;
    const y = Math.sin(angle) * maxMove;

    pupil.style.transform = `translate(${x}px, ${y}px)`;
  });
});

let movements = [];
let lastDirection = null;

function getDirection(dx, dy) {
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "RIGHT" : "LEFT";
  } else {
    return dy > 0 ? "DOWN" : "UP";
  }
}

document.addEventListener("mousemove", (e) => {
  const eye = document.querySelector(".eye");
  const rect = eye.getBoundingClientRect();

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const dx = e.clientX - centerX;
  const dy = e.clientY - centerY;

  const direction = getDirection(dx, dy);

  if (direction !== lastDirection) {
    movements.push(direction);
    lastDirection = direction;
    console.log("Movement:", direction);
  }

  // ✅ If 3 movements detected
  if (movements.length === 3) {
    sendPatternToServer(movements);
    movements = []; // reset
  }
});

function sendPatternToServer(pattern) {
  fetch("http://localhost:5000/store-pattern", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      pattern: pattern,
      timestamp: new Date().toISOString()
    })
  })
  .then(res => res.json())
  .then(data => console.log("Stored:", data))
  .catch(err => console.error(err));
}

const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let path = [];
let maxPoints = 30; // number of movements to store

ctx.strokeStyle = "red";
ctx.lineWidth = 3;

document.addEventListener("mousemove", (e) => {
  const x = e.clientX;
  const y = e.clientY;

  // Save movement
  path.push({ x, y });

  // Draw
  if (path.length > 1) {
    ctx.beginPath();
    ctx.moveTo(path[path.length - 2].x, path[path.length - 2].y);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  // When pattern length reached
  if (path.length === maxPoints) {
    savePattern(path);
    path = [];          // reset pattern
    ctx.clearRect(0, 0, canvas.width, canvas.height); // clear drawing
  }
});

function savePattern(pattern) {
  fetch("http://localhost:5000/store-pattern", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      pattern: pattern,
      created_at: new Date().toISOString()
    })
  })
  .then(res => res.json())
  .then(data => console.log("Pattern saved", data))
  .catch(err => console.error(err));
}
