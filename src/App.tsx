import React, { useEffect } from 'react';
import { Gamepad2 } from 'lucide-react';
import { Game } from './components/Game';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <header className="p-6 border-b border-slate-700">
        <div className="container mx-auto flex items-center gap-2">
          <Gamepad2 className="w-8 h-8 text-blue-400" />
          <h1 className="text-2xl font-bold">DA-Game</h1>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="bg-slate-800 rounded-lg shadow-xl p-8 max-w-3xl mx-auto">
          <Game />
        </div>
      </main>
    </div>
  );
}

export default App;