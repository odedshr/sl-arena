enum UnitType {
  pawn = 'pawn',
  resource = 'resource',
  nursery = 'nursery',
  wall = 'wall',
  water = 'water'
};

enum Direction {
  north = 'north',
  northEast = 'north_east',
  east = 'east',
  southEast = 'south_east',
  south = 'south',
  southWest = 'south_west',
  west = 'west',
  northWest = 'north_west'
}

enum UnitAction {
  idle = 'idle',
  move = 'move',
  attack = 'attack',
  collect = 'collect',
  produce = 'produce',
  dead = 'dead'
}

type Position = { x: number, y: number };

type Unit = {
  type: UnitType,
  position: Position;
  onBump: UnitAction.idle | UnitAction.move | UnitAction.dead;
}
type ActionableUnit = Unit & {
  id: string,
  owner: number,
  action: UnitAction;
  direction: Direction;
}

type WallElement = Unit & {
  type: UnitType.wall,
  position: Position[],
  onBump: UnitAction.idle
}

type WaterElement = Unit & {
  type: UnitType.water,
  position: Position[],
  onBump: UnitAction.dead
}

export { Unit, UnitType, Direction, UnitAction, Position, WallElement, WaterElement, ActionableUnit };