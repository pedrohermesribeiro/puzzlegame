let currentImage = null;
let pieces = [];
let piecePositions = []; // Tracks which piece is in each board cell (or null if empty)
let availablePieces = []; // Tracks pieces in the column
let corretas = 0;
let total = 0;
document.getElementById("corretas").textContent = "Certas: "+ corretas;
document.getElementById("total").textContent = "Tentativas: " + total;

// Load images from backend
async function loadImageLibrary() {
    try {
        const response = await fetch('/api/puzzle/images', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const images = await response.json();
        const select = document.getElementById('image-select');
        select.innerHTML = '<option value="">Selecione uma imagem</option>';
        images.forEach(image => {
            const option = document.createElement('option');
            option.value = image.path;
            option.textContent = image.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading image library:', error);
        alert('Falha ao carregar a biblioteca de imagens. Tente novamente.');
    }
}

// Process image (library or uploaded)
function processImage(img, cuts) {
    const canvas = document.getElementById('puzzle-canvas');
    const ctx = canvas.getContext('2d');
    const gridSize = Math.sqrt(cuts);
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    pieces = [];
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const pieceCanvas = document.createElement('canvas');
            pieceCanvas.width = img.width / gridSize;
            pieceCanvas.height = img.height / gridSize;
            const pieceCtx = pieceCanvas.getContext('2d');
            pieceCtx.drawImage(
                img,
                j * (img.width / gridSize),
                i * (img.height / gridSize),
                img.width / gridSize,
                img.height / gridSize,
                0,
                0,
                img.width / gridSize,
                img.height / gridSize
            );
            pieces.push({ dataUrl: pieceCanvas.toDataURL(), correctIndex: i * gridSize + j });
        }
    }
    initializePuzzle(cuts);
}

// Initialize puzzle
function initializePuzzle(cuts) {
    piecePositions = Array(cuts).fill(null); // Board starts empty
    //piecePositions = Array(cuts).fill(null).map(() => ({ pieceIndex: null, rotation: 0 }));
    availablePieces = Array.from({ length: cuts }, (_, i) => i); // All pieces in column
    shuffle(availablePieces); // Shuffle pieces
    renderBoard(cuts);
    renderPieceColumn(cuts);
}

// Render puzzle board (empty grid)


// Render puzzle board (empty grid)
function renderBoard(cuts) {
    const board = document.getElementById('puzzle-board');
    board.innerHTML = '';
    board.style.display = 'grid';
    board.style.gridTemplateColumns = `repeat(${Math.sqrt(cuts)}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${Math.sqrt(cuts)}, 1fr)`;
        
    for (let i = 0; i < cuts; i++) {
        const cell = document.createElement('div');
        cell.className = 'puzzle-cell';
        cell.dataset.index = i;
        cell.addEventListener('dragover', dragOver);
        cell.addEventListener('drop', (e) => dropOnBoard(e, i));
        if (piecePositions[i] !== null) {
            cell.style.backgroundImage = `url(${pieces[piecePositions[i]].dataUrl})`;
            cell.draggable = true;
            cell.addEventListener('dragstart', (e) => dragStart(e, i));
            if (piecePositions[i] === i) {
                // Peça na posição correta: aplica o efeito de brilho
                cell.classList.add('glow-effect');
                // Remove a classe após a animação (2 segundos, ajustável)
                setTimeout(() => {
                    cell.classList.remove('glow-effect');
                }, 2000);
                //corretas = corretas + 1;
            }
            if (piecePositions[i] !== i) {
                // Peça na posição correta: aplica o efeito de brilho
                cell.classList.add('glow-effect1');
                // Remove a classe após a animação (2 segundos, ajustável)
                setTimeout(() => {
                    cell.classList.remove('glow-effect1');
                }, 2000);
            }
            
        }
        
        board.appendChild(cell); // Adiciona a célula ao tabuleiro
        
    }
    if(availablePieces.length === cuts){
        total = 0;
    }else{
        total = total + 1;
    }
    corretas = 0;
    renderProgress(corretas,total);
}

function renderProgress(corretas,total) {
    for(i=0;i < piecePositions.length -1;i++){
        if(piecePositions[i] === i) corretas = corretas + 1;
    }
    document.getElementById("corretas").textContent = "Certas: "+ corretas;
    document.getElementById("total").textContent = "Tentativas: " + total;
}

// Render piece column
function renderPieceColumn(cuts) {
    const column = document.getElementById('piece-column');
    column.innerHTML = '';
    const gridSize = Math.sqrt(cuts);
    const pieceSize = 400 / gridSize; // Match board cell size (400px / gridSize)
    availablePieces.forEach((pieceIndex,i) => {
        const pieceElement = document.createElement('div');
        pieceElement.className = 'puzzle-piece';
        pieceElement.style.width = `${pieceSize}px`; // Same as board cell
        pieceElement.style.minHeight = `${pieceSize}px`; // Same as board cell
        /*pieceElement.style.width = `80%`; // Same as board cell
        pieceElement.style.minHeight = `15%`; // Same as board cell*/
        pieceElement.style.margin = '2% 0'; // Small margin for spacing
        //console.log("pieceIndex",pieceIndex,i,"pieces",pieces)
        pieceElement.style.backgroundImage = `url(${pieces[pieceIndex].dataUrl})`;
        //pieceElement.style.backgroundImage = `url(${pieces[piecePositions[i]].dataUrl})`;
        pieceElement.draggable = true;
        pieceElement.dataset.pieceIndex = pieceIndex;
        pieceElement.addEventListener('dragstart', (e) => dragStart(e, pieceIndex, true));
        column.appendChild(pieceElement);
    });
    // Log content height for debugging
    console.log('Piece size:', pieceSize, 'Total height:', availablePieces.length * (pieceSize + 10));
}

// Drag-and-drop functions
function dragStart(e, index, fromColumn = false) {
    e.dataTransfer.setData('text', JSON.stringify({ index, fromColumn }));
}

function dragOver(e) {
    e.preventDefault();
}


async function dropOnBoard(e, cellIndex) {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text'));
    const { index, fromColumn } = data;

    if (fromColumn) {
        // Drag from column to board
        if (piecePositions[cellIndex] === null) {
            piecePositions[cellIndex] = index;
            availablePieces = availablePieces.filter(p => p !== index);
        } else {
            availablePieces.push(piecePositions[cellIndex]);
            piecePositions[cellIndex] = index;
            availablePieces = availablePieces.filter(p => p !== index);
        }
    } else {
        // Drag from board to board
        if (piecePositions[cellIndex] === null) {
            piecePositions[cellIndex] = piecePositions[index];
            piecePositions[index] = null;
        } else {
            [piecePositions[cellIndex], piecePositions[index]] = [piecePositions[index], piecePositions[cellIndex]];
        }
    }

    renderBoard(document.getElementById('cuts').value);
    renderPieceColumn(document.getElementById('cuts').value);

    // Validate puzzle
    try {
        const response = await fetch('/api/puzzle/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ piecePositions: piecePositions.map(p => p !== null ? p : -1), cuts: parseInt(document.getElementById('cuts').value) })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.text();
        if (result === 'Correto!') {
            alert('Parabéns! Você montou o puzzle!');
        }
    } catch (error) {
        console.error('Error verifying puzzle:', error);
    }
}

// Shuffle array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Start puzzle
function startPuzzle() {
    const cuts = parseInt(document.getElementById('cuts').value);
    const imageSelect = document.getElementById('image-select').value;
    const imageUpload = document.getElementById('image-upload').files[0];
    const previewImage = document.getElementById('preview-image');

    if (imageUpload) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                currentImage = img;
                previewImage.src = img.src; // Atualiza miniatura
                previewImage.style.display = 'block';
                processImage(img, cuts);
            };
        };
        reader.readAsDataURL(imageUpload);
    } else if (imageSelect) {
        const img = new Image();
        img.src = imageSelect;
        img.onload = () => {
            currentImage = img;
            previewImage.src = img.src; // Atualiza miniatura
            previewImage.style.display = 'block';
            processImage(img, cuts);
        };
        img.onerror = () => alert('Falha ao carregar a imagem da biblioteca.');
    } else {
        alert('Selecione ou carregue uma imagem!');
    }
}

// Event listeners
document.getElementById('image-select').addEventListener('change', () => {
    if (document.getElementById('image-select').value) {
        document.getElementById('image-upload').value = '';
    }
});
document.getElementById('image-upload').addEventListener('change', () => {
    if (document.getElementById('image-upload').files[0]) {
        document.getElementById('image-select').value = '';
    }
});
document.getElementById('cuts').addEventListener('change', () => {
    if (currentImage) {
        startPuzzle();
    }
});




// Initialize
loadImageLibrary();