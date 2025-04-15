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
              <div className="bg-slate-600 rounded-lg shadow-xl p-8 max-w-3xl mx-auto mt-5">
              Welcome! This is a two player game. The goal is to reach the other players starting position by building a better graph than your opponent's.<br />

              This is a strategic duel where Blue and Red battle to connect networks on a hex grid. Expand with paths/factories, generate energy, and race to link to the opponent’s start! <br />

              <strong>Objective:</strong><br />
              Connect your network to the enemy’s starting vertex first.<br />

              <strong>Setup:</strong><br />
              Hex grid (54 tiles, 37 vertices).<br />
              Each player starts with a factory + energy on opposite sides.<br />

              <strong>Gameplay:</strong><br />
              <em>Paths:</em> Spend energy to build edges connected to your network (no loops).<br />
              <em>Factories:</em> Place on your network vertices; produce energy.<br />
              <em>Energy:</em> Collected each turn. Factories give more energy if directly connected, less if they have descendants.<br />
              <em>Sabotage:</em> Cut opponent’s network when sharing two vertices, removing disconnected sections.<br />
              </div>
        </div>
      </main>
    </div>
  );
}

export default App;