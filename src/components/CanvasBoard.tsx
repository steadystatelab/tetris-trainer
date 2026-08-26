import React, { useEffect, useRef } from 'react';
import type { GameState } from '../hooks/useTetrisGame';
import type { PieceType, Cell } from '../engine/types';

interface CanvasBoardProps {
  gameState: GameState;
  cellSize?: number;
}

const COLORS: Record<PieceType | 'GARBAGE', string> = {
  T: '#A000F0',
  I: '#00F0F0',
  O: '#F0F000',
  L: '#F0A000',
  J: '#0000F0',
  S: '#00F000',
  Z: '#F00000',
  GARBAGE: '#6B7280',
};

const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const CanvasBoard: React.FC<CanvasBoardProps> = ({ gameState, cellSize = 30 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw parameters
    const cols = 10;
    const visibleRows = 20; // Only render rows 20-39

    // Clear canvas background
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 1;
    for (let x = 0; x <= cols; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellSize, 0);
      ctx.lineTo(x * cellSize, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= visibleRows; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellSize);
      ctx.lineTo(canvas.width, y * cellSize);
      ctx.stroke();
    }

    const drawBlock = (x: number, y: number, cell: Cell, isGhost = false) => {
      if (y < 20 || cell === null) return; // Don't draw above visible area or empty cells

      const renderY = y - 20;
      const baseColor = COLORS[cell];

      ctx.fillStyle = isGhost ? hexToRgba(baseColor, 0.25) : baseColor;
      ctx.fillRect(x * cellSize, renderY * cellSize, cellSize, cellSize);

      // Inner bevel/border for blocks
      ctx.strokeStyle = isGhost ? hexToRgba(baseColor, 0.5) : 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x * cellSize + 1, renderY * cellSize + 1, cellSize - 2, cellSize - 2);
    };

    // 1. Draw static matrix (rows 20-39 only)
    for (let y = 20; y < 40; y++) {
      for (let x = 0; x < 10; x++) {
        if (gameState.matrix[y] && gameState.matrix[y][x]) {
          drawBlock(x, y, gameState.matrix[y][x]);
        }
      }
    }

    // 2. Draw Ghost Piece
    if (gameState.activePiece && gameState.activeShape && gameState.taskStatus === 'IN_PROGRESS') {
      const shape = gameState.activeShape;
      const pos = gameState.ghostPos;
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x] !== null) {
            drawBlock(pos.x + x, pos.y + y, gameState.activePiece, true);
          }
        }
      }
    }

    // 3. Draw Active Piece
    if (gameState.activePiece && gameState.activeShape && gameState.taskStatus === 'IN_PROGRESS') {
      const shape = gameState.activeShape;
      const pos = gameState.activePos;
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x] !== null) {
            drawBlock(pos.x + x, pos.y + y, gameState.activePiece);
          }
        }
      }
    }

    // 4. Draw Status Overlay
    if (gameState.taskStatus === 'PASSED') {
      ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00FF00';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PASSED', canvas.width / 2, canvas.height / 2);
    } else if (gameState.taskStatus === 'FAILED') {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#FF0000';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FAILED', canvas.width / 2, canvas.height / 2);
    }

  }, [gameState, cellSize]);

  return (
    <canvas
      ref={canvasRef}
      width={10 * cellSize}
      height={20 * cellSize}
      style={{
        border: '2px solid #374151',
        borderRadius: '4px',
        backgroundColor: '#111827'
      }}
    />
  );
};