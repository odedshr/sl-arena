var ArenaName;
(function (ArenaName) {
    ArenaName["default"] = "default";
    ArenaName["tutorial_01"] = "tutorial_01";
    ArenaName["tutorial_02"] = "tutorial_02";
    ArenaName["tutorial_03"] = "tutorial_03";
})(ArenaName || (ArenaName = {}));
;
var ArenaStatus;
(function (ArenaStatus) {
    ArenaStatus["init"] = "init";
    ArenaStatus["started"] = "started";
    ArenaStatus["finished"] = "finished";
})(ArenaStatus || (ArenaStatus = {}));
;
var EdgeType;
(function (EdgeType) {
    EdgeType["death"] = "death";
    EdgeType["wall"] = "wall";
    EdgeType["loop"] = "loop";
})(EdgeType || (EdgeType = {}));
var FogOfWar;
(function (FogOfWar) {
    FogOfWar["none"] = "none";
    FogOfWar["human"] = "human";
    FogOfWar["ai"] = "ai";
    FogOfWar["both"] = "both";
})(FogOfWar || (FogOfWar = {}));
;
export { ArenaName, ArenaStatus, EdgeType, FogOfWar };
