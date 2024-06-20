import { MessageType, OperationErrorMessage,SendMessageMethod } from "../Messages/Message.js";
import { InstructionType } from "./Instruction.js";

function sendFail(send: SendMessageMethod, instruction: InstructionType, reason: string, callback?: number) {
    return send({ callback, type: MessageType.operation_failed, instruction, reason: reason } as OperationErrorMessage)
  }

export default sendFail;