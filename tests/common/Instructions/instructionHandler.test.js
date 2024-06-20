import { jest, describe, expect } from '@jest/globals';

jest.unstable_mockModule('../../../docs/js/common/arena/arena.js', () => ({
    addArena: jest.fn(),
    addPlayer: jest.fn(),
    getArena: jest.fn(),
    getPlayerArena: jest.fn(),
    setPlayerArena: jest.fn(),
}));

jest.unstable_mockModule('../../../docs/js/common/Instructions/unitCommandHandler.js', () => ({ default: jest.fn()}));
jest.unstable_mockModule('../../../docs/js/common/Instructions/broadcast.js', () => ({ default: jest.fn()}));
jest.unstable_mockModule('../../../docs/js/common/Instructions/startGameHandler.js', () => ({ default: jest.fn()}));
jest.unstable_mockModule('../../../docs/js/common/Instructions/sendFail.js', () => ({ default: jest.fn()}));

const {default: handle} = await import ('../../../docs/js/common/Instructions/instructionHandler');
const { InstructionType } = await import ( '../../../docs/js/common/Instructions/Instruction.js');
const { ArenaStatus } = await import ( '../../../docs/js/common/types/Arena.js');
const { MessageType } = await import ( '../../../docs/js/common/Messages/Message.js');
const {
    addArena,
    addPlayer,
    getArena,
    getPlayerArena,
    setPlayerArena,
} = await import ( '../../../docs/js/common/arena/arena.js');
const { PlayerType } = await import ( '../../../docs/js/common/types/Player.js');
const {default:handleUnitCommand} = await import ( '../../../docs/js/common/Instructions/unitCommandHandler.js');
const {default:broadcast} = await import ( '../../../docs/js/common/Instructions/broadcast.js');
const {default:startGame} = await import ( '../../../docs/js/common/Instructions/startGameHandler.js');
const {default:sendFail} = await import ( '../../../docs/js/common/Instructions/sendFail.js');

describe('handle function', () => {
    let sendMock;

    beforeEach(() => {
        sendMock = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should handle arena_create instruction', () => {
        const instruction = {
            type: InstructionType.arena_create,
            arenaName: 'TestArena',
            playerName: 'Player1',
            callback: 'callbackId',
        };
        const arenaId = 'arena1';
        addArena.mockReturnValue(arenaId);

        handle(instruction, 'player1', sendMock);

        expect(addArena).toHaveBeenCalledWith('TestArena', 'Player1', 'player1', sendMock);
        expect(sendMock).toHaveBeenCalledWith({
            callback: 'callbackId',
            type: MessageType.arena_created,
            arenaId,
        });
    });

    it('should handle arena_join instruction when arena exists and is in init status', () => {
        const instruction = {
            type: InstructionType.arena_join,
            arenaId: 'arena1',
            playerName: 'Player1',
            callback: 'callbackId',
        };
        const mockArena = {
            status: ArenaStatus.init,
            players: {},
        };
        getArena.mockReturnValue(mockArena);

        handle(instruction, 'player1', sendMock);

        expect(getArena).toHaveBeenCalledWith('arena1');
        expect(addPlayer).toHaveBeenCalledWith(mockArena, 'player1', 'Player1', PlayerType.human, sendMock);
        expect(broadcast).toHaveBeenCalledWith(mockArena, { type: MessageType.player_joined, playerName: 'Player1' }, 'player1', 'callbackId');
    });

    it('should handle arena_join instruction when arena does not exist', () => {
        const instruction = {
            type: InstructionType.arena_join,
            arenaId: 'arena1',
            playerName: 'Player1',
            callback: 'callbackId',
        };
        getArena.mockReturnValue(null);

        handle(instruction, 'player1', sendMock);

        expect(sendFail).toHaveBeenCalledWith(sendMock, InstructionType.arena_join, `arena doesn't exist`);
    });

    it('should handle arena_leave instruction', () => {
        const instruction = {
            type: InstructionType.arena_leave,
            callback: 'callbackId',
        };
        const mockArena = {
            players: {
                player1: { name: 'Player1' },
            },
            status: ArenaStatus.init,
        };
        getPlayerArena.mockReturnValue(mockArena);

        handle(instruction, 'player1', sendMock);

        expect(broadcast).toHaveBeenCalledWith(mockArena, { type: MessageType.player_left, playerName: 'Player1' }, 'player1', 'callbackId');
        expect(setPlayerArena).toHaveBeenCalledWith('player1', null);
        expect(mockArena.status).toBe(ArenaStatus.finished);
    });

    it('should handle unknown instruction type', () => {
        const instruction = { type: 'unknown_type' };

        handle(instruction, 'player1', sendMock);

        expect(sendFail).toHaveBeenCalledWith(sendMock, 'unknown_type', 'unknown instruction');
    });

    it('should handle arena_list_users instruction', () => {
        const instruction = {
            type: InstructionType.arena_list_users,
            callback: 'callbackId',
        };
        const mockArena = {
            players: {
                player1: { name: 'Player1' },
                player2: { name: 'Player2' },
            },
        };
        getPlayerArena.mockReturnValue(mockArena);

        handle(instruction, 'player1', sendMock);

        expect(sendMock).toHaveBeenCalledWith({
            callback: 'callbackId',
            type: MessageType.arena_player_list,
            players: ['Player1', 'Player2'],
        });
    });

    it('should handle arena_list_units instruction', () => {
        const instruction = {
            type: InstructionType.arena_list_units,
            callback: 'callbackId',
        };
        const mockArena = {
            players: {
                player1: { units: { unit1: {}, unit2: {} } },
            },
        };
        getPlayerArena.mockReturnValue(mockArena);

        handle(instruction, 'player1', sendMock);

        expect(sendMock).toHaveBeenCalledWith({
            callback: 'callbackId',
            type: MessageType.player_unit_list,
            units: [{}, {}],
        });
    });

    it('should handle arena_start_game instruction', () => {
        const instruction = {
            type: InstructionType.arena_start_game,
        };

        handle(instruction, 'player1', sendMock);

        expect(startGame).toHaveBeenCalledWith('player1', sendMock);
    });

    it('should handle unit_command instruction', () => {
        const instruction = {
            type: InstructionType.unit_command,
            commands: ['move', 'attack'],
        };

        handle(instruction, 'player1', sendMock);

        expect(handleUnitCommand).toHaveBeenCalledWith(['move', 'attack'], 'player1', sendMock);
    });
});
