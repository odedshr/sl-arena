var UnitType;
(function (UnitType) {
    UnitType["pawn"] = "pawn";
    UnitType["resource"] = "resource";
    UnitType["nursery"] = "nursery";
    UnitType["wall"] = "wall";
    UnitType["water"] = "water";
})(UnitType || (UnitType = {}));
;
var Direction;
(function (Direction) {
    Direction["north"] = "north";
    Direction["northEast"] = "north_east";
    Direction["east"] = "east";
    Direction["southEast"] = "south_east";
    Direction["south"] = "south";
    Direction["southWest"] = "south_west";
    Direction["west"] = "west";
    Direction["northWest"] = "north_west";
})(Direction || (Direction = {}));
var UnitAction;
(function (UnitAction) {
    UnitAction["idle"] = "idle";
    UnitAction["move"] = "move";
    UnitAction["attack"] = "attack";
    UnitAction["collect"] = "collect";
    UnitAction["produce"] = "produce";
    UnitAction["dead"] = "dead";
})(UnitAction || (UnitAction = {}));
export { UnitType, Direction, UnitAction };
