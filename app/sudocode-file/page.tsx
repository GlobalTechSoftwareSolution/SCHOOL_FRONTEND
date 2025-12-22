// app/word-grid/page.tsx  (or pages/word-grid.tsx)
// Next.js + TypeScript + Tailwind single-file component

'use client'
import React, { useEffect, useRef, useState, useCallback } from "react";

type Cell = {
  letter: string;
  id: number; // unique id index
  row: number;
  col: number;
};

const DEFAULT_SIZE = 5; // 5x5 grid

// Small sample dictionary. Replace with a larger list or server API for production.
const WORDS = new Set<string>([
  "CAT", "DOG", "BIRD", "TREE", "HOUSE", "HOME", "RATE", "GATE", "MATE",
  "GAME", "GRID", "WORD", "WORDS", "READ", "WRITE", "NOTE", "TONE", "STONE",
  "RING", "SING", "RIDE", "IDEA", "CODE", "TYPE", "STACK", "FLOW", "FIRE",
  "WATER", "EARTH", "AIR", "MATH", "LOGIC", "PLAY", "FUN", "LEARN", "BRAIN",
  // add many more...
]);

// English letter frequencies roughly (for more realistic boards)
const LETTERS = [
  ..."EEEEEEEEEEEEAAAAAAAAAIIIIIIIOOOOOOOONNNNNNRRRRRRTTTTTLLLLSSSSUUUUDDDDGGGBBCCMMPPFFHHVVWWYYKJXQZ"
];

function randLetter() {
  return LETTERS[Math.floor(Math.random() * LETTERS.length)];
}

function indexOf(row: number, col: number, size = DEFAULT_SIZE) {
  return row * size + col;
}

function neighbors(row: number, col: number, size = DEFAULT_SIZE) {
  const res: [number, number][] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr,
        nc = col + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size) res.push([nr, nc]);
    }
  }
  return res;
}

export default function WordGridPage() {
  const [size, setSize] = useState<number>(DEFAULT_SIZE);
  const [grid, setGrid] = useState<Cell[]>([]);
  const [selected, setSelected] = useState<number[]>([]); // array of cell ids in selection order
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [score, setScore] = useState<number>(0);
  const [running, setRunning] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(180); // 3 minutes
  const [showHint, setShowHint] = useState<string | null>(null);
  const touchActive = useRef(false);
  const dragging = useRef(false);

  // generate a new board
  const generateBoard = useCallback((sz = size) => {
    const cells: Cell[] = [];
    for (let r = 0; r < sz; r++) {
      for (let c = 0; c < sz; c++) {
        const id = indexOf(r, c, sz);
        cells.push({
          letter: randLetter(),
          id,
          row: r,
          col: c,
        });
      }
    }
    setGrid(cells);
    setSelected([]);
    setFoundWords(new Set());
    setScore(0);
    setSecondsLeft(180);
    setRunning(true);
    setShowHint(null);
  }, [size]);

  // on mount generate
  useEffect(() => {
    // Wrap in setTimeout to avoid calling setState directly in effect
    const timer = setTimeout(() => {
      generateBoard(DEFAULT_SIZE);
    }, 0);
    return () => clearTimeout(timer);
  }, [generateBoard]);

  // timer
  useEffect(() => {
    if (!running) return;
    if (secondsLeft <= 0) {
      return;
    }
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          // Game over logic
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, secondsLeft]);

  // selection helpers
  function canSelect(cellId: number) {
    if (selected.includes(cellId)) return false; // already used in this attempt
    if (selected.length === 0) return true;
    const lastId = selected[selected.length - 1];
    const last = grid[lastId];
    const next = grid[cellId];
    // adjacency check
    const adj = neighbors(last.row, last.col, size);
    return adj.some(([r, c]) => r === next.row && c === next.col);
  }

  function selectCell(cellId: number) {
    if (!canSelect(cellId)) return;
    setSelected((s) => [...s, cellId]);
  }

  function clearSelection() {
    setSelected([]);
  }

  function submitSelection() {
    const word = selected.map((id) => grid[id].letter).join("").toUpperCase();
    if (word.length < 2) {
      setSelected([]);
      return;
    }
    if (WORDS.has(word) && !foundWords.has(word)) {
      setFoundWords((prev) => new Set(prev).add(word));
      // scoring simple: length^2
      setScore((sc) => sc + word.length * word.length);
      setSelected([]);
      setShowHint(null);
    } else {
      // invalid — small shake feedback could be added
      setSelected([]);
    }
  }

  // touch handlers for swipe selection
  function handlePointerDown(e: React.PointerEvent, id: number) {
    (e.target as Element).setPointerCapture(e.pointerId);
    dragging.current = true;
    touchActive.current = true;
    selectCell(id);
  }
  function handlePointerEnter(_event: React.PointerEvent, id: number) {
    if (!dragging.current) return;
    if (canSelect(id)) selectCell(id);
  }
  function handlePointerUp(_event: React.PointerEvent) { // eslint-disable-line @typescript-eslint/no-unused-vars
    dragging.current = false;
    touchActive.current = false;
    submitSelection();
  }

  // hint: look for any valid word by brute force (small board OK)
  function findAnyWord(): string | null {
    // simple DFS from each cell building words up to length 8
    const visited = new Array(size * size).fill(false);
    let found: string | null = null;

    function dfs(id: number, path: number[], curWord: string) {
      if (found) return;
      visited[id] = true;
      const w = curWord;
      if (w.length >= 2 && WORDS.has(w) && !foundWords.has(w)) {
        found = w;
        visited[id] = false;
        return;
      }
      if (w.length >= 8) {
        visited[id] = false;
        return;
      }
      const cell = grid[id];
      const neigh = neighbors(cell.row, cell.col, size).map(([r, c]) =>
        indexOf(r, c, size)
      );
      for (const nb of neigh) {
        if (visited[nb]) continue;
        dfs(nb, [...path, nb], w + grid[nb].letter);
        if (found) break;
      }
      visited[id] = false;
    }

    for (let i = 0; i < grid.length; i++) {
      dfs(i, [i], grid[i].letter);
      if (found) return found;
    }
    return null;
  }

  function handleHint() {
    const w = findAnyWord();
    if (w) setShowHint(w);
    else setShowHint("No hint found");
    // hide hint after 6s
    setTimeout(() => setShowHint(null), 6000);
  }

  function handleShuffle() {
    // reshuffle letters but keep same size
    generateBoard(size);
  }

  // simple keyboard support: number-keys not needed; user can click letters
  // allow resizing grid
  function changeSize(newSize: number) {
    setSize(newSize);
    generateBoard(newSize);
  }



  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center text-black">
      <div className="max-w-4xl w-full">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Word Grid — Vocabulary Puzzle</h1>
          <div className="flex gap-2 items-center">
            <div className="bg-white p-2 rounded shadow flex gap-2 items-center">
              <button
                onClick={() => generateBoard(size)}
                className="px-3 py-1 rounded border hover:shadow"
              >
                New Game
              </button>
              <button
                onClick={handleShuffle}
                className="px-3 py-1 rounded border hover:shadow"
              >
                Shuffle
              </button>
              <button
                onClick={() => setRunning((r) => !r)}
                className="px-3 py-1 rounded border hover:shadow"
              >
                {running ? "Pause" : "Resume"}
              </button>
            </div>

            <div className="bg-white p-2 rounded shadow flex gap-2 items-center">
              <label className="text-sm">Grid:</label>
              {[4, 5, 6].map((s) => (
                <button
                  key={s}
                  onClick={() => changeSize(s)}
                  className={`px-2 py-1 rounded border ${s === size ? "bg-indigo-600 text-white" : ""}`}
                >
                  {s}×{s}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <section className="md:col-span-2">
            <div className="bg-white p-4 rounded-lg shadow">
              <div
                className={`grid grid-cols-${size} gap-2 touch-none select-none`}
                style={{
                  gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
                }}
              >
                {grid.map((cell) => {
                  const isSelected = selected.includes(cell.id);
                  const isLast = selected[selected.length - 1] === cell.id;
                  return (
                    <div
                      key={cell.id}
                      onPointerDown={(e) => handlePointerDown(e, cell.id)}
                      onPointerEnter={(e) => handlePointerEnter(e, cell.id)}
                      onPointerUp={(e) => handlePointerUp(e, cell.id)}
                      onClick={() => {
                        // click selects as well (desktop)
                        if (!touchActive.current) {
                          if (isSelected && isLast) {
                            // clicking last acts as submit
                            submitSelection();
                          } else {
                            if (canSelect(cell.id)) selectCell(cell.id);
                          }
                        }
                      }}
                      className={`h-20 md:h-24 flex items-center justify-center rounded-lg text-2xl font-semibold cursor-pointer 
                        ${isSelected ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-900"}
                        shadow-sm`}
                      style={{
                        userSelect: "none",
                        touchAction: "none",
                      }}
                    >
                      {cell.letter}
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={submitSelection}
                    className="px-3 py-1 rounded border bg-indigo-600 text-white"
                  >
                    Submit
                  </button>
                  <button onClick={clearSelection} className="px-3 py-1 rounded border">
                    Clear
                  </button>
                  <button onClick={handleHint} className="px-3 py-1 rounded border">
                    Hint
                  </button>
                </div>

                <div className="ml-auto flex items-center gap-4">
                  <div className="text-sm">
                    <div>Time: {Math.max(secondsLeft, 0)}s</div>
                    <div>Score: {score}</div>
                  </div>
                </div>
              </div>

              {showHint && (
                <div className="mt-2 text-sm text-yellow-800 bg-yellow-50 p-2 rounded">{`Hint: ${showHint}`}</div>
              )}
            </div>
          </section>

          <aside>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium">Found words</h3>
              <div className="mt-2 min-h-[120px] max-h-60 overflow-auto">
                {Array.from(foundWords).length === 0 ? (
                  <div className="text-sm text-slate-500">No words yet — find some!</div>
                ) : (
                  <ul className="list-disc list-inside">
                    {Array.from(foundWords)
                      .sort((a, b) => b.length - a.length || a.localeCompare(b))
                      .map((w) => (
                        <li key={w} className="text-sm">
                          {w} ({w.length})
                        </li>
                      ))}
                  </ul>
                )}
              </div>
              <div className="mt-3 text-sm">
                <div>Words dictionary (sample). Replace with a larger list for better gameplay.</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow mt-3">
              <h3 className="font-medium">Tips</h3>
              <ul className="mt-2 text-sm list-disc list-inside">
                <li>Drag across adjacent tiles to form words.</li>
                <li>Submit to score — longer words = more points.</li>
                <li>Change grid size to tweak difficulty (4×4 = faster, 6×6 = deeper).</li>
              </ul>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}