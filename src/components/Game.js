import { useState, useEffect } from 'react';
import Board from './Board';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { calculateWinner, minimax, findBestMoves } from '../utils/minimax';

const Game = () => {
  const [squares, setSquares] = useState(Array(225).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);
  const [moveCount, setMoveCount] = useState(0);
  const [bestRecord, setBestRecord] = useState('-');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  // Đếm ngược thời gian
  useEffect(() => {
    let timer;
    if (isXNext && !calculateWinner(squares)) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isXNext, squares]);

  const handleTimeout = () => {
    setDialogMessage('Hết giờ! Bạn đã thua!');
    setOpenDialog(true);
  };

  const handleClick = (i) => {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }

    const newSquares = squares.slice();
    newSquares[i] = 'X';
    setSquares(newSquares);
    setIsXNext(false);
    setTimeLeft(30); // Reset thời gian
    setMoveCount(prev => prev + 1);

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
            const score = minimax(aiSquares, 2, -Infinity, Infinity, false);
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
  useEffect(() => {
    if (winner === 'X') {
      // Cập nhật kỷ lục
      if (bestRecord === '-' || moveCount < parseInt(bestRecord)) {
        setBestRecord(moveCount.toString());
      }
      setDialogMessage(`Chúc mừng! Bạn đã thắng với ${moveCount} nước đi!`);
      setOpenDialog(true);
    } else if (winner === 'O') {
      setDialogMessage('Máy đã thắng! Cố gắng lần sau nhé!');
      setOpenDialog(true);
    }
  }, [winner]);

  const handleReset = () => {
    setSquares(Array(225).fill(null));
    setIsXNext(true);
    setTimeLeft(30);
    setMoveCount(0);
    setOpenDialog(false);
  };

  let status;
  if (winner) {
    status = `Người thắng: ${winner}`;
  } else if (!squares.includes(null)) {
    status = 'Hòa!';
  } else {
    status = `Lượt tiếp theo: ${isXNext ? 'X' : 'O'}`;
  }

  return (
    <div className="game">
      <div className="game-info">
        <div className="status">{status}</div>
        <div className="timer">Thời gian: {timeLeft}s</div>
        <div className="move-count">Số nước đi: {moveCount}</div>
        <div className="best-record">Kỷ lục: {bestRecord === '-' ? 'Chưa có' : `${bestRecord} nước`}</div>
        <button className="reset-button" onClick={handleReset}>
          Chơi lại
        </button>
      </div>
      <Board squares={squares} onClick={handleClick} />
      
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Kết thúc ván đấu</DialogTitle>
        <DialogContent>
          <p>{dialogMessage}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReset}>Chơi lại</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Game;
