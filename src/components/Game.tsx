import { useEffect, useRef } from 'react';
import { App } from '../game/game';

export function Game() {
  const svgRef = useRef<SVGSVGElement>(null);

  let app = new App();

  useEffect(() => {
    if (svgRef.current) {
      if (!svgRef.current.dataset.initialized) {
        app.initGame(svgRef.current);
        svgRef.current.dataset.initialized = 'true';
      }
    }
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <svg
          ref={svgRef}
          width="400"
          height="400"
          className="bg-slate-900 rounded-lg"
          viewBox="0 0 400 400"
        />
      </div>
      
      <div className="flex gap-4">
        <button
          id="endTurn"
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-colors"
        >
          End Turn
        </button>
        <button
          id="resetGame"
          className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg font-medium transition-colors"
          onClick={() => {
            console.log('starting a new game!');
            if (svgRef.current) {
              app = new App();
              app.initGame(svgRef.current);
            }
          }}
        >
          Reset Game
        </button>
      </div>
    </div>
  );
}