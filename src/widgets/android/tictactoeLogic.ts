export type Mark = 'X' | 'O' | '';
export type Outcome = 'win' | 'loss' | 'draw' | null;

export type TttState = {
  board: Mark[];
  outcome: Outcome;
  wins: number;
  losses: number;
  draws: number;
};

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function freshState(prev?: TttState): TttState {
  return {
    board: ['', '', '', '', '', '', '', '', ''],
    outcome: null,
    wins: prev ? prev.wins : 0,
    losses: prev ? prev.losses : 0,
    draws: prev ? prev.draws : 0,
  };
}

function winnerOf(board: Mark[]): Mark {
  for (const [a, b, c] of LINES) {
    if (board[a] !== '' && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return '';
}

function isFull(board: Mark[]): boolean {
  return board.every((c) => c !== '');
}

function findLineMove(board: Mark[], mark: Mark): number {
  for (const line of LINES) {
    const marks = line.filter((i) => board[i] === mark).length;
    const empty = line.filter((i) => board[i] === '');
    if (marks === 2 && empty.length === 1) return empty[0];
  }
  return -1;
}

function computerMove(board: Mark[]): number {
  let move = findLineMove(board, 'O');
  if (move >= 0) return move;
  move = findLineMove(board, 'X');
  if (move >= 0) return move;
  if (board[4] === '') return 4;
  const free: number[] = [];
  board.forEach((c, i) => {
    if (c === '') free.push(i);
  });
  return free[Math.floor(Math.random() * free.length)];
}

export function applyTap(state: TttState, index: number): TttState {
  if (state.outcome !== null) return freshState(state);
  if (index < 0 || index > 8 || state.board[index] !== '') return state;

  const board = [...state.board];
  board[index] = 'X';

  if (winnerOf(board) === 'X') {
    return { ...state, board, outcome: 'win', wins: state.wins + 1 };
  }
  if (isFull(board)) {
    return { ...state, board, outcome: 'draw', draws: state.draws + 1 };
  }

  board[computerMove(board)] = 'O';

  if (winnerOf(board) === 'O') {
    return { ...state, board, outcome: 'loss', losses: state.losses + 1 };
  }
  if (isFull(board)) {
    return { ...state, board, outcome: 'draw', draws: state.draws + 1 };
  }
  return { ...state, board };
}

export function parseState(raw: string | null): TttState {
  if (raw === null) return freshState();
  try {
    const data = JSON.parse(raw) as Partial<TttState> | null;
    if (data === null || typeof data !== 'object') return freshState();
    const okBoard =
      Array.isArray(data.board) &&
      data.board.length === 9 &&
      data.board.every((c) => c === 'X' || c === 'O' || c === '');
    const num = (n: unknown): number =>
      typeof n === 'number' && Number.isFinite(n) && n >= 0 ? n : 0;
    const outcome =
      data.outcome === 'win' ||
      data.outcome === 'loss' ||
      data.outcome === 'draw'
        ? data.outcome
        : null;
    return {
      board: okBoard ? (data.board as Mark[]) : freshState().board,
      outcome: okBoard ? outcome : null,
      wins: num(data.wins),
      losses: num(data.losses),
      draws: num(data.draws),
    };
  } catch {
    return freshState();
  }
}
