import { Point } from "./state";

declare global {
  interface Config {
    pathCost: number;
    factoryCost: number;
    startingEnergy: number;
  }
}

interface Vertex {
  x: number;
  y: number;
  z: number;
  id: number;
}

interface Edge {
  v1: Vertex;
  v2: Vertex;
  owner: 'blue' | 'red' | null;
}

interface PlayerState {
  energy: number;
  network: Point;
  flattened_nodes: Map<string, Point>;
}

let config: Config = { pathCost: 2, factoryCost: 5, startingEnergy: 10 };

export class App {
  #red: PlayerState = { energy: 0, network: new Point("", false), flattened_nodes: new Map() };
  #blue: PlayerState = { energy: 0, network: new Point("", false), flattened_nodes: new Map() };
  #currentPlayer: 'blue' |'red' = 'blue';


  #svg: SVGSVGElement | null = null;
  #vertices: Vertex[] = [];
  #edges: Edge[] = [];

  constructor() {
  }

  getId(v: Vertex): string {
    return `${v.x}${v.y}${v.z}`;
  }

  generateGraph() {
    const s = 3;
    this.#vertices = [];
    for (let x = -s; x <= s; x++) {
      for (let y = Math.max(-s, -x - s); y <= Math.min(s, -x + s); y++) {
        const z = -x - y;
        this.#vertices.push({ x, y, z, id: this.#vertices.length});
      }
    }
  
    const offsets: [number, number, number][] = [
      [1, -1, 0], [-1, 1, 0],
      [1, 0, -1], [-1, 0, 1],
      [0, 1, -1], [0, -1, 1]
    ];
    const vertexMap = new Map<string, Vertex>();
    this.#vertices.forEach(v => vertexMap.set(`${v.x},${v.y},${v.z}`, v));
    this.#edges = [];
    this.#vertices.forEach(v => {
      offsets.forEach(offset => {
        const nx = v.x + offset[0];
        const ny = v.y + offset[1];
        const nz = v.z + offset[2];
        const key = `${nx},${ny},${nz}`;
        if (vertexMap.has(key)) {
          const n = vertexMap.get(key)!;
          if (v.id < n.id) {
            this.#edges.push({ v1: v, v2: n, owner: null });
          }
        }
      });
    });
  }

  render() {
    const size = 30;
    function posX(v: Vertex): number {
      return 200 + size * (3 / 2 * v.x);
    }
  
    function posY(v: Vertex): number {
      return 200 + size * (Math.sqrt(3) / 2 * v.x + Math.sqrt(3) * v.y);
    }

    if (!this.#svg) throw new Error('INVALID REFERENCE GIVEN!');
  
    this.#svg.innerHTML = '';
  
    this.#edges.forEach(e => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', posX(e.v1).toString());
      line.setAttribute('y1', posY(e.v1).toString());
      line.setAttribute('x2', posX(e.v2).toString());
      line.setAttribute('y2', posY(e.v2).toString());
  
      // check if line is either blue or red
      const v1Id = this.getId(e.v1);
      const v2Id = this.getId(e.v2);
  
      const isBlueValid = this.#blue.flattened_nodes.has(v1Id) &&
        (this.#blue.flattened_nodes.get(v1Id)!._parent?._id === v2Id ||
        this.#blue.flattened_nodes.get(v1Id)!._children.some(child => child._id === v2Id));
  
      const isRedValid = this.#red.flattened_nodes.has(v1Id) &&
        (this.#red.flattened_nodes.get(v1Id)!._parent?._id === v2Id ||
        this.#red.flattened_nodes.get(v1Id)!._children.some(child => child._id === v2Id));
  
      if (isBlueValid) {
        line.setAttribute('stroke', 'blue');
      } else if (isRedValid) {
        line.setAttribute('stroke', 'red');
      } else {
        line.setAttribute('stroke', '#4B5563');
      }
      line.setAttribute('stroke-width', '5');
      line.addEventListener('click', () => this.handleEdgeClick(e));
      this.#svg!.appendChild(line);
    });
  
    this.#vertices.forEach(v => {
      const blue_factory = this.isVertexFactory(v, 'blue');
      const red_factory = this.isVertexFactory(v, 'red');
         
  
      if (blue_factory || red_factory) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', (posX(v) - 10).toString());
        rect.setAttribute('y', (posY(v) - 10).toString());
        rect.setAttribute('width', '20');
        rect.setAttribute('height', '20');
        rect.setAttribute('fill', red_factory ? 'red' : 'blue');
        this.#svg!.appendChild(rect);
      } else {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', posX(v).toString());
        circle.setAttribute('cy', posY(v).toString());
        circle.setAttribute('r', '5');
        circle.setAttribute('fill', '#E5E7EB');
        circle.addEventListener('click', () => this.handleVertexClick(v));
        this.#svg!.appendChild(circle);
      }
    });
  
    let energyText = document.getElementById('energyText') as SVGTextElement | null;
    if (!energyText) {
      energyText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      energyText.setAttribute('id', 'energyText');
      energyText.setAttribute('x', '10');
      energyText.setAttribute('y', '30');
      energyText.setAttribute('fill', '#E5E7EB');
      energyText.setAttribute('font-size', '16');
      this.#svg!.appendChild(energyText);
    }
    const energy = this.#currentPlayer === 'blue' ? this.#blue.energy : this.#red.energy;
    energyText.textContent = `${this.#currentPlayer}'s turn - Energy: ${energy}`;
  }

  initGame(svgElement: SVGSVGElement) {
    this.#currentPlayer = 'blue';

    this.#svg = svgElement;
    this.generateGraph();

    const blueStart = this.#vertices.find(v => v.x === 0 && v.y === 3 && v.z === -3)!;
    const redStart = this.#vertices.find(v => v.x === 0 && v.y === -3 && v.z === 3)!;
  
    const blueRoot = new Point(this.getId(blueStart), true);
    const redRoot = new Point(this.getId(redStart), true);
  
    this.#red = {
      energy: config.startingEnergy,
      network: redRoot,
      flattened_nodes: new Map([[this.getId(redStart), redRoot]])
    };

    this.#blue = {
      energy: config.startingEnergy,
      network: blueRoot,
      flattened_nodes: new Map([[this.getId(blueStart), blueRoot]])
    };
    this.#currentPlayer = 'blue';
    this.render();
    this.setupEventListeners();
  }

  handleGraphCut(opponent: 'blue' | 'red', sharedVertices: string[]) {
    function cutAtNearestCommonAncestor(lineage1: Point[], lineage2: Point[]) {
      const smaller = lineage1.length < lineage2.length ? lineage1 : lineage2;
      const larger = lineage1.length < lineage2.length ? lineage2 : lineage1;
      
      const minLength = smaller.length;
      for (let i = 0; i < minLength; i++) {
        if (lineage1[i] !== lineage2[i]) {
          lineage1[i].deleteBranchFromHere();
          lineage2[i].deleteBranchFromHere();
          return;
        }
  
        if (i === minLength -1) {
          larger[minLength].deleteBranchFromHere();
          return;
        }
      }
      throw new Error('the points dont have anything in common!');
    }
  
    function updateFlattenedNodes(state: PlayerState) {
      let resultant = new Map<string, Point>();
      console.log(state.network);
  
      function traverse(node: Point) {
        resultant.set(node._id, node)
        node._children.forEach(child => traverse(child));
      }
  
      traverse(state.network);
  
      // Update the flattened_nodes map with the new resultant list
      state.flattened_nodes.clear();
      state.flattened_nodes = resultant;
    }
    
    const updateEdgesAfterCut = (state: PlayerState) => {
      this.#edges.forEach(e => {
        const v1Id = this.getId(e.v1);
        const v2Id = this.getId(e.v2);
        if (!state.flattened_nodes.has(v1Id) || !state.flattened_nodes.has(v2Id)) {
          e.owner = null;
        }
      });
    }
  
    if (sharedVertices.length < 2) return; // Only proceed if exactly two vertices are shared
  
    const opponentState = opponent === 'blue' ? this.#blue : this.#red;
  
    const [v1Id, v2Id] = sharedVertices;
    const v1Point = opponentState.flattened_nodes.get(v1Id)!;
    const v2Point = opponentState.flattened_nodes.get(v2Id)!;
  
    cutAtNearestCommonAncestor(v1Point.getLineage(), v2Point.getLineage());
  
    // Update the opponent's flattened_nodes
    updateFlattenedNodes(opponentState);
  
    // Update edges to reflect the cut
    updateEdgesAfterCut(opponentState);
  }

  handleVertexClick(v: Vertex) {
    const playerState = this.#currentPlayer === 'blue' ? this.#blue : this.#red;
    const vId = this.getId(v);
  
    if (
      playerState.flattened_nodes.has(vId) &&
      playerState.energy >= config.factoryCost &&
      !this.isVertexFactory(v, this.#currentPlayer === 'blue' ? 'red' : 'blue')
    ) {
      playerState.energy -= config.factoryCost;
      const point = playerState.flattened_nodes.get(vId)!;
      point.makeFactory();
      this.render();
    }
  }

  handleEdgeClick(e: Edge) {
    const getSharedVertices = (): string[] => {
          const blueNodes = new Set(this.#blue.flattened_nodes.keys());
          const redNodes = new Set(this.#red.flattened_nodes.keys());
          const shared = [...blueNodes].filter(id => redNodes.has(id));
          return shared;
        };
    if (e.owner) return;
    const playerState = this.#currentPlayer === 'blue' ? this.#blue : this.#red;
    const opponentState = this.#currentPlayer === 'blue' ? this.#red : this.#blue;
  
    const v1Id = this.getId(e.v1);
    const v2Id = this.getId(e.v2);
  
    if (playerState.energy < config.pathCost) {
      console.log("Not enough energy");
      return;
    }
  
    let parentPoint: Point | undefined;
    let childId: string;
  
    if (playerState.flattened_nodes.has(v1Id) && !playerState.flattened_nodes.has(v2Id)) {
      parentPoint = playerState.flattened_nodes.get(v1Id)!;
      childId = v2Id;
    } else if (playerState.flattened_nodes.has(v2Id) && !playerState.flattened_nodes.has(v1Id)) {
      parentPoint = playerState.flattened_nodes.get(v2Id)!;
      childId = v1Id;
    } else {
      console.log("Invalid move: Both vertices in network (cycle) or neither in network");
      return;
    }
  
    if (!parentPoint.getIfNotTooFar()) {
      console.log("Invalid move: Too far from factory");
      return;
    }
  
    const newPoint = new Point(childId, false, parentPoint);
    parentPoint.addChild(newPoint);
    playerState.flattened_nodes.set(childId, newPoint);
  
    e.owner = this.#currentPlayer;
    playerState.energy -= config.pathCost;
  
    // Check for shared vertices and trigger cut if necessary
    const sharedVertices = getSharedVertices();
    if (sharedVertices.length === 2) {
      this.handleGraphCut(this.#currentPlayer === 'blue' ? 'red' : 'blue', sharedVertices);
    }
  
    if (childId === opponentState.network._id) { // if root
      alert(`${this.#currentPlayer.toUpperCase()} wins!`);
    }
  
    this.render();
  }

  isVertexFactory(v: Vertex, opponent: 'blue' | 'red'): boolean {
    const opponentState = opponent === 'blue' ? this.#blue : this.#red;
    const vertex_hash = this.getId(v);
    const factory_node = opponentState.flattened_nodes.get(vertex_hash);
  
    return (factory_node !== undefined && factory_node._isFactory);
  }

  collectEnergy(player: 'blue' | 'red') {
    const playerState = player === 'blue' ? this.#blue : this.#red;
    let energy = 0;
  
    // Helper function to check if a point has any descendant factories
    function hasDescendantFactory(point: Point): boolean {
      if (point._isFactory) return true; // Found a factory (direct or deeper)
      for (const child of point._children) {
        if (hasDescendantFactory(child)) return true;
      }
      return false;
    }
  
    // Iterate over all nodes in the network
    const network = [...playerState.flattened_nodes.values()];
    network.forEach(node => {
      if (node._isFactory) {
        const hasDescendant = node._children.some(child => hasDescendantFactory(child));
        if (hasDescendant) {
          energy += 1; // Fixed 1 energy if there are descendant factories
        } else {
          energy += node._children.length; // Energy equal to number of direct children
        }
      }
    });
  
    playerState.energy += energy;
  }

  setupEventListeners() {
    // collecting energy every turn
    document.getElementById('endTurn')!.addEventListener('click', () => {
      this.#currentPlayer = this.#currentPlayer === 'blue' ? 'red' : 'blue';
      this.collectEnergy(this.#currentPlayer);
      this.render();
    });
  
    document.getElementById('resetGame')!.addEventListener('click', () => {
      this.initGame(this.#svg!); // Reuses initGame for simplicity
    });
  }
}