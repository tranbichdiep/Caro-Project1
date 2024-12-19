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
  let score = 0;
  
  // Hàm đếm số quân liên tiếp và số đầu bị chặn
  const countInDirection = (index, dx, dy) => {
    let count = 1;
    let blocked = 0;
    let x = index % size;
    let y = Math.floor(index / size);
    let openEnds = 2;
    
    // Kiểm tra một hướng
    for (let i = 1; i < 5; i++) {
      const newX = x + dx * i;
      const newY = y + dy * i;
      if (newX < 0 || newX >= size || newY < 0 || newY >= size) {
        blocked++;
        openEnds--;
        break;
      }
      const newIndex = newY * size + newX;
      if (squares[newIndex] === squares[index]) {
        count++;
      } else if (squares[newIndex] !== null) {
        blocked++;
        openEnds--;
        break;
      } else {
        break;
      }
    }
    
    // Kiểm tra hướng ngược lại
    x = index % size;
    y = Math.floor(index / size);
    for (let i = 1; i < 5; i++) {
      const newX = x - dx * i;
      const newY = y - dy * i;
      if (newX < 0 || newX >= size || newY < 0 || newY >= size) {
        blocked++;
        openEnds--;
        break;
      }
      const newIndex = newY * size + newX;
      if (squares[newIndex] === squares[index]) {
        count++;
      } else if (squares[newIndex] !== null) {
        blocked++;
        openEnds--;
        break;
      } else {
        break;
      }
    }
    
    return { count, blocked, openEnds };
  };

  const directions = [
    { dx: 1, dy: 0 },  // ngang
    { dx: 0, dy: 1 },  // dọc
    { dx: 1, dy: 1 },  // chéo chính
    { dx: 1, dy: -1 }, // chéo phụ
  ];

  // Đánh giá điểm cho mỗi vị trí
  for (let i = 0; i < squares.length; i++) {
    if (squares[i] === player) {
      for (const { dx, dy } of directions) {
        const { count, blocked, openEnds } = countInDirection(i, dx, dy);
        
        // Tính điểm dựa trên số quân liên tiếp và số đầu bị chặn
        if (count >= 5) {
          score += 10000000; // Thắng
        } else if (count === 4) {
          if (openEnds === 2) score += 500000; // 4 quân 2 đầu mở
          else if (openEnds === 1) score += 10000; // 4 quân 1 đầu mở
        } else if (count === 3) {
          if (openEnds === 2) score += 5000; // 3 quân 2 đầu mở
          else if (openEnds === 1) score += 1000; // 3 quân 1 đầu mở
        } else if (count === 2) {
          if (openEnds === 2) score += 500; // 2 quân 2 đầu mở
          else if (openEnds === 1) score += 100; // 2 quân 1 đầu mở
        }
      }

      // Thêm điểm cho vị trí trung tâm
      const x = i % size;
      const y = Math.floor(i / size);
      const centerDistance = Math.abs(x - 7) + Math.abs(y - 7);
      score += (14 - centerDistance) * 5;
    }
  }

  // Đánh giá phòng thủ
  const opponent = player === 'O' ? 'X' : 'O';
  for (let i = 0; i < squares.length; i++) {
    if (squares[i] === opponent) {
      for (const { dx, dy } of directions) {
        const { count, openEnds } = countInDirection(i, dx, dy);
        
        // Chặn nước đi nguy hiểm của đối thủ
        if (count >= 4) {
          score -= 9000000;
        } else if (count === 3 && openEnds === 2) {
          score -= 800000;
        } else if (count === 3 && openEnds === 1) {
          score -= 300000;
        } else if (count === 2 && openEnds === 2) {
          score -= 100000;
        }
      }
    }
  }

  return score;
};

const minimax = (squares, depth, alpha, beta, isMaximizing) => {
  const winner = calculateWinner(squares);
  if (winner === 'O') return 1000000;
  if (winner === 'X') return -1000000;
  if (depth === 0) {
    return evaluatePosition(squares, isMaximizing ? 'O' : 'X');
  }

  const moves = findBestMoves(squares);
  
  if (isMaximizing) {
    let bestScore = -Infinity;
    for (const move of moves) {
      if (!squares[move]) {
        squares[move] = 'O';
        const score = minimax(squares, depth - 1, alpha, beta, false);
        squares[move] = null;
        bestScore = Math.max(score, bestScore);
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break;
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (const move of moves) {
      if (!squares[move]) {
        squares[move] = 'X';
        const score = minimax(squares, depth - 1, alpha, beta, true);
        squares[move] = null;
        bestScore = Math.min(score, bestScore);
        beta = Math.min(beta, score);
        if (beta <= alpha) break;
      }
    }
    return bestScore;
  }
};

const findBestMoves = (squares) => {
  const size = 15;
  const moves = new Set();
  let hasExistingMoves = false;
  
  // Tìm các ô đã đánh
  for (let i = 0; i < squares.length; i++) {
    if (squares[i]) {
      hasExistingMoves = true;
      const x = i % size;
      const y = Math.floor(i / size);
      
      // Giảm phạm vi tìm kiếm xuống 1 ô
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const newX = x + dx;
          const newY = y + dy;
          const newIndex = newY * size + newX;
          
          if (newX >= 0 && newX < size && 
              newY >= 0 && newY < size && 
              !squares[newIndex]) {
            moves.add(newIndex);
          }
        }
      }
    }
  }

  // Giới hạn số lượng nước đi xem xét
  const moveArray = Array.from(moves);
  if (moveArray.length > 6) {
    // Đánh giá nhanh các nước đi tiềm năng
    const scoredMoves = moveArray.map(move => {
      squares[move] = 'O';
      const quickScore = evaluateQuick(squares, 'O');
      squares[move] = null;
      return { move, score: quickScore };
    });
    
    scoredMoves.sort((a, b) => b.score - a.score);
    return scoredMoves.slice(0, 6).map(m => m.move);
  }
  
  return hasExistingMoves ? moveArray : [112];
};

// Thêm hàm đánh giá nhanh
const evaluateQuick = (squares, player) => {
  const size = 15;
  let score = 0;
  const opponent = player === 'O' ? 'X' : 'O';
  
  // Chỉ kiểm tra các hướng chính và pattern nguy hiểm
  const directions = [
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 }
  ];

  for (let i = 0; i < squares.length; i++) {
    if (squares[i]) {
      const x = i % size;
      const y = Math.floor(i / size);
      
      if (squares[i] === player) {
        // Tính điểm tấn công cơ bản
        for (const { dx, dy } of directions) {
          let count = 1;
          for (let step = 1; step < 5; step++) {
            const newX = x + dx * step;
            const newY = y + dy * step;
            if (newX < 0 || newX >= size || newY < 0 || newY >= size) break;
            if (squares[newY * size + newX] === player) count++;
            else break;
          }
          score += Math.pow(10, count);
        }
      } else {
        // Tính điểm phòng thủ cơ bản
        for (const { dx, dy } of directions) {
          let count = 1;
          for (let step = 1; step < 5; step++) {
            const newX = x + dx * step;
            const newY = y + dy * step;
            if (newX < 0 || newX >= size || newY < 0 || newY >= size) break;
            if (squares[newY * size + newX] === opponent) count++;
            else break;
          }
          if (count >= 3) score -= Math.pow(10, count + 1);
        }
      }
    }
  }
  
  return score;
};

export { calculateWinner, minimax, findBestMoves }; 