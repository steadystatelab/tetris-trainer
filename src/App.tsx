import { useState } from 'react';
import { sampleTasks } from './tasks/data/sampleTasks';
import { useTetrisGame } from './hooks/useTetrisGame';
import { useInput } from './hooks/useInput';
import { CanvasBoard } from './components/CanvasBoard';

function App() {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const task = sampleTasks[currentTaskIndex];

  const {
    state: gameState,
    resetTask,
    moveLeft,
    moveRight,
    moveDown,
    rotateCW,
    rotateCCW,
    hardDrop,
    hold
  } = useTetrisGame(task);

  // Bind inputs to game loop
  useInput((action) => {
    switch (action) {
      case 'LEFT': moveLeft(); break;
      case 'RIGHT': moveRight(); break;
      case 'DOWN': moveDown(); break;
      case 'ROT_CW': rotateCW(); break;
      case 'ROT_CCW': rotateCCW(); break;
      case 'HARD_DROP': hardDrop(); break;
      case 'HOLD': hold(); break;
      case 'RESET': resetTask(); break;
    }
  }, { das: 133, arr: 10 });

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#030712',
      color: '#f9fafb',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ maxWidth: '800px', width: '100%', display: 'flex', gap: '2rem', justifyContent: 'center' }}>

        {/* Left column: Controls & Info */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Tetris Mechanics Trainer</h1>
            <select
              value={currentTaskIndex}
              onChange={(e) => {
                setCurrentTaskIndex(Number(e.target.value));
              }}
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: '#1f2937',
                color: 'white',
                border: '1px solid #374151',
                borderRadius: '0.25rem'
              }}
            >
              {sampleTasks.map((t, idx) => (
                <option key={t.id} value={idx}>{t.title} ({t.category})</option>
              ))}
            </select>
          </div>

          <div style={{ backgroundColor: '#111827', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #374151', textAlign: 'left' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'semibold', margin: '0 0 0.5rem 0' }}>{task.title}</h2>
            <p style={{ color: '#9ca3af', marginBottom: '1rem', textAlign: 'left' }}>{task.description}</p>
            {task.hint && (
              <div style={{ backgroundColor: '#1e3a8a', color: '#bfdbfe', padding: '0.5rem', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
                💡 <strong>Hint:</strong> {task.hint}
              </div>
            )}

            <div style={{ marginTop: '1rem' }}>
              <strong style={{ display: 'block', color: '#d1d5db', marginBottom: '0.25rem' }}>Goal:</strong>
              <span style={{ backgroundColor: '#065f46', color: '#a7f3d0', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem' }}>
                {task.targetAction}
              </span>
            </div>
          </div>

          <div style={{ backgroundColor: '#111827', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #374151', fontSize: '0.875rem', color: '#9ca3af', textAlign: 'left' }}>
            <h3 style={{ fontWeight: 'bold', color: 'white', margin: '0 0 0.5rem 0' }}>Controls</h3>
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <li><strong>← / →</strong> : Move</li>
              <li><strong>↑ / X</strong> : Rotate CW</li>
              <li><strong>Z / Ctrl</strong> : Rotate CCW</li>
              <li><strong>↓</strong> : Soft Drop</li>
              <li><strong>Space</strong> : Hard Drop</li>
              <li><strong>C / Shift</strong> : Hold</li>
              <li><strong>R</strong> : Reset Task</li>
            </ul>
          </div>

          <button
            onClick={resetTask}
            style={{
              padding: '0.75rem',
              backgroundColor: '#2563eb',
              color: 'white',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Restart Drill (R)
          </button>
        </div>

        {/* Right column: Game Board */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>

          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', padding: '0 1rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: 'bold' }}>HOLD</div>
              <div style={{ width: '60px', height: '60px', border: '2px solid #374151', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111827' }}>
                {gameState.holdPiece && (
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.5rem' }}>{gameState.holdPiece}</span>
                )}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: 'bold' }}>NEXT</div>
              <div style={{ width: '60px', height: '120px', border: '2px solid #374151', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '10px', gap: '10px', backgroundColor: '#111827' }}>
                 {gameState.queue.slice(0, 3).map((p, i) => (
                    <span key={i} style={{ color: 'white', fontWeight: 'bold' }}>{p}</span>
                 ))}
              </div>
            </div>
          </div>

          <CanvasBoard gameState={gameState} cellSize={30} />

        </div>

      </div>
    </div>
  );
}

export default App;