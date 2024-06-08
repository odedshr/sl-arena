var ArenaName;
(function (ArenaName) {
    ArenaName["default"] = "default";
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
export { ArenaName, ArenaStatus, EdgeType };
