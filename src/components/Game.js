import { useState } from 'react';
import Board from './Board';
import { calculateWinner, minimax, findBestMoves } from '../utils/minimax';

const Game = () => {
  const [squares, setSquares] = useState(Array(225).fill(null));
  const [isXNext, setIsXNext] = useState(true);

  const handleClick = (i) => {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }

    const newSquares = squares.slice();
    newSquares[i] = 'X';
    setSquares(newSquares);
    setIsXNext(false);

    // AI move
    setTimeout(() => {
      const aiSquares = newSquares.slice();
      if (!calculateWinner(aiSquares) && aiSquares.includes(null)) {
        let bestScore = -Infinity;
        let bestMove;
        const moves = findBestMoves(aiSquares);
        
        for (const move of moves) {
          if (!aiSquares[move]) {
            aiSquares[move] = 'O';
            const score = minimax(aiSquares, 3, -Infinity, Infinity, false);
            aiSquares[move] = null;
            
            if (score > bestScore) {
              bestScore = score;
              bestMove = move;
            }
          }
        }

        aiSquares[bestMove] = 'O';
        setSquares(aiSquares);
        setIsXNext(true);
      }
    }, 10);
  };

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = `Winner: ${winner}`;
  } else if (!squares.includes(null)) {
    status = 'Draw!';
  } else {
    status = `Next player: ${isXNext ? 'X' : 'O'}`;
  }

  const handleReset = () => {
    setSquares(Array(225).fill(null));
    setIsXNext(true);
  };

  return (
    <div className="game">
      <div className="game-info">
        <div className="status">{status}</div>
        <button className="reset-button" onClick={handleReset}>
          Reset Game
        </button>
      </div>
      <Board squares={squares} onClick={handleClick} />
    </div>
  );
};

export default Game; 