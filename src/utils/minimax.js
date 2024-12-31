const calculateWinner = (squares) => {
  const size = 15;
  // Kiểm tra hàng ngang
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size - 4; col++) {
      const index = row * size + col;
      if (squares[index] &&
          squares[index] === squares[index + 1] &&
          squares[index] === squares[index + 2] &&
          squares[index] === squares[index + 3] &&
          squares[index] === squares[index + 4]) {
        return squares[index];
      }
    }
  }

  // Kiểm tra hàng dọc
  for (let row = 0; row < size - 4; row++) {
    for (let col = 0; col < size; col++) {
      const index = row * size + col;
      if (squares[index] &&
          squares[index] === squares[index + size] &&
          squares[index] === squares[index + size * 2] &&
          squares[index] === squares[index + size * 3] &&
          squares[index] === squares[index + size * 4]) {
        return squares[index];
      }
    }
  }

  // Kiểm tra đường chéo chính
  for (let row = 0; row < size - 4; row++) {
    for (let col = 0; col < size - 4; col++) {
      const index = row * size + col;
      if (squares[index] &&
          squares[index] === squares[index + size + 1] &&
          squares[index] === squares[index + (size + 1) * 2] &&
          squares[index] === squares[index + (size + 1) * 3] &&
          squares[index] === squares[index + (size + 1) * 4]) {
        return squares[index];
      }
    }
  }

  // Kiểm tra đường chéo phụ
  for (let row = 0; row < size - 4; row++) {
    for (let col = 4; col < size; col++) {
      const index = row * size + col;
      if (squares[index] &&
          squares[index] === squares[index + size - 1] &&
          squares[index] === squares[index + (size - 1) * 2] &&
          squares[index] === squares[index + (size - 1) * 3] &&
          squares[index] === squares[index + (size - 1) * 4]) {
        return squares[index];
      }
    }
  }

  return null;
};

const evaluatePosition = (squares, player) => {
  const size = 15;
  const opponent = player === 'O' ? 'X' : 'O';
  let score = 0;

  // Hằng số điểm
  const ATTACK_SCORES = new Map([
    [5, 100000],    // Thắng
    [4, 10000],     // 4 quân
    [3, 5000],      // 3 quân
    [2, 1000],      // 2 quân
    [1, 100]        // 1 quân
  ]);

  const DEFENSE_SCORES = new Map([
    [5, 90000000],  // Phải chặn ngay
    [4, 50000000],  // Rất nguy hiểm
    [3, 10000000],  // Nguy hiểm
    [2, 5000000],   // Cần chú ý
    [1, 1000000]    // Ít nguy hiểm
  ]);

  // Hàm đếm quân liên tiếp và kiểm tra 2 đầu giữ nguyên
  const countInLine = (startIndex, dx, dy, target) => {
    let count = 1;
    let openEnds = 0;
    let x = startIndex % size;
    let y = Math.floor(startIndex / size);
    
    // Kiểm tra đầu trước và sau
    let frontX = x + dx * count;
    let frontY = y + dy * count;
    let backX = x - dx;
    let backY = y - dy;

    if (frontX >= 0 && frontX < size && frontY >= 0 && frontY < size) {
      if (squares[frontY * size + frontX] === null) openEnds++;
    }
    if (backX >= 0 && backX < size && backY >= 0 && backY < size) {
      if (squares[backY * size + backX] === null) openEnds++;
    }

    // Đếm quân liên tiếp
    while (count < 5) {
      x += dx;
      y += dy;
      if (x < 0 || x >= size || y < 0 || y >= size) break;
      if (squares[y * size + x] !== target) break;
      count++;
    }

    return { count, openEnds };
  };

  // Kiểm tra toàn bộ bàn cờ
  for (let i = 0; i < squares.length; i++) {
    if (!squares[i]) continue;

    const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];

    for (const [dx, dy] of directions) {
      // Kiểm tra quân địch (X)
      if (squares[i] === 'X') {
        const { count, openEnds } = countInLine(i, dx, dy, 'X');
        const defenseScore = DEFENSE_SCORES.get(count) || 0;
        score -= defenseScore * (openEnds + 1); // Tăng điểm phòng thủ theo số đầu mở
      }
      
      // Kiểm tra quân ta (O)
      if (squares[i] === 'O') {
        const { count, openEnds } = countInLine(i, dx, dy, 'O');
        const attackScore = ATTACK_SCORES.get(count) || 0;
        score += attackScore * (openEnds + 1); // Tăng điểm tấn công theo số đầu mở
      }
    }
  }

  return score;
};

const findBestMoves = (squares) => {
  const size = 15;
  const moves = new Set();

  // Tìm các vị trí ưu tiên cao
  for (let i = 0; i < squares.length; i++) {
    if (squares[i]) {
      const x = i % size;
      const y = Math.floor(i / size);
      
      // Xem xét vùng 3x3 xung quanh mỗi quân
      for (let dx = -2; dx <= 2; dx++) {
        for (let dy = -2; dy <= 2; dy++) {
          const newX = x + dx;
          const newY = y + dy;
          if (newX >= 0 && newX < size && newY >= 0 && newY < size) {
            const index = newY * size + newX;
            if (!squares[index]) {
              moves.add(index);
            }
          }
        }
      }
    }
  }
  
  return Array.from(moves);
};

const minimax = (squares, depth, alpha, beta, isMaximizing) => {
  const winner = calculateWinner(squares);
  if (winner === 'O') return 1000000000;
  if (winner === 'X') return -1000000000;
  if (depth === 0) return evaluatePosition(squares, isMaximizing ? 'O' : 'X');

  if (isMaximizing) {
    let bestScore = -Infinity;
    const moves = findBestMoves(squares);
    for (const move of moves) {
      if (!squares[move]) {
        squares[move] = 'O';
        const score = minimax(squares, depth - 1, alpha, beta, false);
        squares[move] = null;
        bestScore = Math.max(score, bestScore);
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    const moves = findBestMoves(squares);
    for (const move of moves) {
      if (!squares[move]) {
        squares[move] = 'X';
        const score = minimax(squares, depth - 1, alpha, beta, true);
        squares[move] = null;
        bestScore = Math.min(score, bestScore);
        beta = Math.min(beta, score);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
    }
    return bestScore;
  }
};

export { calculateWinner, minimax, findBestMoves }; 