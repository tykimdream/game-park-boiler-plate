import { useCallback, useState } from 'react';

interface TicTacToeProps {
  isPaused: boolean;
  onGameOver: (score: number) => void;
}

type CellValue = 'X' | 'O' | null;

const checkWinner = (board: CellValue[]): CellValue => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

export const TicTacToe = ({ isPaused, onGameOver }: TicTacToeProps) => {
  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
  const [isXTurn, setIsXTurn] = useState(true);

  const winner = checkWinner(board);
  const isDraw = !winner && board.every((cell) => cell !== null);

  const handleClick = useCallback(
    (index: number) => {
      if (isPaused || board[index] || winner) {
        return;
      }

      const newBoard = [...board];
      newBoard[index] = isXTurn ? 'X' : 'O';
      setBoard(newBoard);
      setIsXTurn(!isXTurn);

      const newWinner = checkWinner(newBoard);
      const newIsDraw = !newWinner && newBoard.every((cell) => cell !== null);

      if (newWinner === 'X') {
        onGameOver(100);
      } else if (newWinner === 'O' || newIsDraw) {
        onGameOver(0);
      }
    },
    [board, isXTurn, isPaused, winner, onGameOver],
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-lg font-semibold">
        {winner ? `${winner} 승리!` : isDraw ? '무승부!' : `${isXTurn ? 'X' : 'O'} 차례`}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, i) => (
          <button
            key={i}
            className="flex h-20 w-20 items-center justify-center rounded border-2 text-3xl font-bold"
            onClick={() => handleClick(i)}
          >
            {cell}
          </button>
        ))}
      </div>
    </div>
  );
};
