import { jest, describe, expect } from '@jest/globals';

jest.unstable_mockModule('../../../docs/js/common/arena/arena.js', () => ({
    addResource: jest.fn(),
    forEachArena: jest.fn(),
    removeResource: jest.fn(),
    removeUnit: jest.fn()
}));

jest.unstable_mockModule('../../../docs/js/common/state-updaters/barracks-handler.js', () => ({ default: jest.fn()}));
jest.unstable_mockModule('../../../docs/js/common/state-updaters/pawn-handler.js', () => ({ default: jest.fn()}));

const { default: updateState}  = await import('../../../docs/js/common/state-updaters/state-updater.js');
const { MessageType }  = await import( '../../../docs/js/common/Messages/Message.js');
const { ArenaStatus }  = await import( '../../../docs/js/common/types/Arena.js');
const { UnitAction, UnitType }  = await import( '../../../docs/js/common/types/Units.js');
const { addResource, forEachArena, removeUnit }  = await import( '../../../docs/js/common/arena/arena.js');
const { default: handleBarrackUnit }  = await import( '../../../docs/js/common/state-updaters/barracks-handler.js');
const { default: handlePawnUnit }  = await import( '../../../docs/js/common/state-updaters/pawn-handler.js');

function isGameOver(arena) {
    const players = Object.values(arena.players);
    const playersWithBarracks = players.filter(player => (Object.values(player.units)).some(unit => unit.type === UnitType.barrack));
    return playersWithBarracks.length <= 1;
}

describe('updateState', () => {
    let mockArena;

    beforeEach(() => {
        mockArena = {
            tick: 0,
            status: ArenaStatus.started,
            players: {
                0: {
                    id: 0,
                    units: {
                        unit1: { type: UnitType.barrack, action: UnitAction.idle },
                        unit2: { type: UnitType.pawn, action: UnitAction.idle }
                    },
                    resources: 0,
                    send: jest.fn()
                },
                1: {
                    id: 1,
                    units: {
                        unit3: { type: UnitType.barrack, action: UnitAction.idle },
                        unit4: { type: UnitType.pawn, action: UnitAction.idle }
                    },
                    resources: 0,
                    send: jest.fn()
                }
            },
            grid: [
                [[], [], []],
                [[], [], []],
                [[], [], []]
            ],
            obstacles: [],
            resources: [],
            spec: {
                details: {
                    dimensions: { width: 3, height: 3 },
                    features: {},
                    messages: {
                        lose: "{playerName} lost!",
                        start: "Game Started. It's worth knowing that the map's edge is a wall",
                        tie: "Tie!",
                        win: "{playerName} won!",
                    },   
                },
                resourceProbability: 1.0,// Always add resource in test
                isGameOver
            }
        };
        forEachArena.mockImplementation(callback => callback(mockArena));
    });

    it('should increment the arena tick', () => {
        updateState();
        expect(mockArena.tick).toBe(1);
    });

    it('should remove dead units', () => {
        mockArena.players[0].units.unit1.action = UnitAction.dead;
        updateState();
        expect(removeUnit).toHaveBeenCalledWith(mockArena.players[0].units.unit1, mockArena);
    });

    it('should handle units by type', () => {
        updateState();
        expect(handlePawnUnit).toHaveBeenCalledWith(mockArena.players[0].units.unit2, mockArena);
        expect(handleBarrackUnit).toHaveBeenCalledWith(mockArena.players[0].units.unit1, mockArena);
    });

    it('should add resources if the probability allows', () => {
        updateState();
        expect(addResource).toHaveBeenCalled();
    });

    it('should send updates to players', () => {
        updateState();
        expect(mockArena.players[0].send).toHaveBeenCalledWith(expect.objectContaining({
            type: MessageType.game_status,
            status: mockArena.status,
            playerId: 0,
            resources: 0,
            units: expect.any(Array),
            tick: 1
        }));
    });

    it('should end the game if only one player has barracks', () => {
        const mockArena2 = {
            ...mockArena,
            players: {
                0: {
                    ...mockArena.players[0],
                    units: {
                        unit1: { type: UnitType.barrack, action: UnitAction.idle }
                    }
                },
                1: {
                    ...mockArena.players[1],
                    units: {
                        unit1: { type: UnitType.pawn, action: UnitAction.idle }
                    }
                }
            }
        };
        forEachArena.mockImplementation(callback => callback(mockArena2));
        updateState();
        expect(mockArena2.status).toBe(ArenaStatus.finished);
    });
});
