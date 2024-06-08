var MessageType;
(function (MessageType) {
    MessageType["server_status"] = "server_status";
    MessageType["ping"] = "ping";
    MessageType["arena_created"] = "arena_created";
    MessageType["player_joined"] = "player_joined";
    MessageType["operation_failed"] = "operation_failed";
    MessageType["player_left"] = "player_left";
    MessageType["arena_player_list"] = "arena_player_list";
    MessageType["player_unit_list"] = "player_unit_list";
    MessageType["game_started"] = "game_started";
    MessageType["game_status"] = "game_status";
})(MessageType || (MessageType = {}));
export { MessageType };
