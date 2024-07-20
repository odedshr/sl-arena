import distance from "../../common/distance.js";
import { Dimensions } from "../../common/types/Arena.js";
import { Grid, GridRow } from "../../common/types/Grid.js";
import { ActionableUnit, MovingUnit, Position, Unit, UnitType } from "../../common/types/Units.js";
import { createGrid, getEmptyUnitGrid } from "../../common/util-grid.js";

const FOG_DISTANCE = 5;

let isFogEnabled = false;
let dimensions:Dimensions;
let fog:Grid<boolean>;
let obstacleCodes:Grid<number>;
let obstacles:Unit[] = [];
let staticElements:Grid<Unit[]>;
const playerUnits:Unit[] = [];
const movingUnits: MovingUnit[] = [];

function initGrid(gridDimensions:Dimensions, fogEnabled:boolean) {
    dimensions = gridDimensions;
    isFogEnabled = fogEnabled;
    if (fogEnabled) {
        fog = Array(dimensions.height).fill(false).map(() => Array(dimensions.width).fill(false));
    }
}

function updateState(units:Unit[], playerId:number) {
    const oldPositions: Map<string, Position> = new Map();

    movingUnits.forEach(unit => oldPositions.set(unit.id, unit.position));
    movingUnits.splice(0, movingUnits.length);
    playerUnits.splice(0, playerUnits.length);

    staticElements = getEmptyUnitGrid(dimensions);

    units.forEach(unit => {
        const { type, position} = unit;
        if ((unit as ActionableUnit).owner===playerId) {
            playerUnits.push(unit);
        }
        if (type === UnitType.wall || type === UnitType.water) {
            if (!obstacleCodes) {
                obstacles.push(unit);
            }
        } else if (type === UnitType.pawn) {
            movingUnits.push({
                ...unit,
                oldPosition: oldPositions.get((unit as ActionableUnit).id) as Position} as MovingUnit);
        } else {
            staticElements[position.y][position.x].push(unit);
        }
        
    });

    if (!obstacleCodes) {
        obstacleCodes = compileObstacles(obstacles, dimensions);
    }
    if (isFogEnabled) {
        updateFog();
    }
}

function updateFog() {
    fog.forEach((row,y)=>row.forEach((_, x)=>{
        fog[y][x] = !playerUnits.some(unit => (distance({x, y}, unit.position) <= FOG_DISTANCE));
    }));
}

function isFogged (position:Position):boolean {
    if (!isFogEnabled || position.y >= fog.length) {
        return false;
    }

    return fog[position.y][position.x];
}

function getCell(position:Position):Unit[] {
    const { x, y } = position
    return staticElements[y][x];
}

function compileObstacles(obstacles:Unit[], dimensions:Dimensions):Grid<number> {
    const { width, height } = dimensions;
    const grid = createGrid(dimensions, obstacles);
    const codes = new Array(width).fill(0).map(() => new Array(height).fill(0));
    grid.forEach((row, y) => row.forEach((units, x) => {
        if (units.length) {
            codes[y][x] = getImageCode(grid,row,x,y);
        }
    }));

    return codes;
}

function getImageCode(grid: Grid<Unit[]>, row: GridRow<Unit[]>, x: number, y: number) {
    let value = 0;
    if (y - 1 >= 0 && grid[y - 1][x].length) {
      value += 1;
    }
    if (x + 1 < row.length && grid[y][x + 1].length) {
      value += 10;
    }
    if (y + 1 < grid.length && grid[y + 1][x].length) {
      value += 100;
    }
    if (x - 1 >= 0 && grid[y][x - 1].length) {
      value += 1000;
    }
  
    return value;
}

function getObstacles():Unit[] {
    return obstacles || [];
}

function getObstacleCodes():Grid<number> {
    return obstacleCodes || [];
}

function getStaticElements():Grid<Unit[]> {
    return staticElements || [];
}

function getMovingUnits():MovingUnit[] {
    return movingUnits || [];
}

export { initGrid, updateState, isFogged, getCell, getObstacles, getObstacleCodes, getMovingUnits, getStaticElements };
