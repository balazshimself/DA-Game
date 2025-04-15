export class Point {
  _children: Point[];
  _parent: Point | null = null;
  _isFactory: boolean = false;
  _id: string;

  constructor(id: string, isFactory: boolean, parent?: Point) {
    this._children = [];
    this._id = id;
    this._isFactory = isFactory;
    if (parent) this._parent = parent;
  }

  addChild(point: Point) {
    point._parent = this;
    this._children.push(point);
  }

  makeFactory() {
    this._isFactory = true;
  }

  deleteBranchFromHere() {
    if (this._parent && this._parent._children) {
      this._parent._children = this._parent._children.filter(child => child !== this);
    }
    this._children.forEach((child) => child.deleteBranchFromHere());
    this._children = [];
    this._parent = null;
  }

  getLineage(lineage: Point[] = []): Point[] {
    lineage.push(this);
    if (!this._parent) return lineage.reverse();
    if (lineage.length > 100) throw new Error("TOO BIG OF A LINEAGE!");
    return this._parent.getLineage(lineage);
  }

  getIfNotTooFar(distance: number = 0): boolean {
    return true;
  //   if (this._isFactory) {
  //     return this._children.length === 0 || this._children.length > distance;
  //   }
  //   if (!this._parent) {
  //     throw new Error("NINCSEN ENNEK SZÜLŐJE!");
  //   }
  //   return this._parent.getIfNotTooFar(distance + 1);
  }
}