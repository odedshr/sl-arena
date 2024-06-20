import { MessageType } from "../Messages/Message.js";
function sendFail(send, instruction, reason, callback) {
    return send({ callback, type: MessageType.operation_failed, instruction, reason: reason });
}
export default sendFail;
