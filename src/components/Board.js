import Square from './Square';

const Board = ({ squares, onClick }) => {
  const renderSquare = (i) => {
    return (
      <Square
        value={squares[i]}
        onClick={() => onClick(i)}
      />
    );
  };

  const renderRow = (rowIndex) => {
    const squares = [];
    for (let i = 0; i < 15; i++) {
      squares.push(renderSquare(rowIndex * 15 + i));
    }
    return <div className="board-row">{squares}</div>;
  };

  const rows = [];
  for (let i = 0; i < 15; i++) {
    rows.push(renderRow(i));
  }

  return <div className="board">{rows}</div>;
};

export default Board; 