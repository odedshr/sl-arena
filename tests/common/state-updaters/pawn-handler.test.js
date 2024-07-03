import { jest, describe, expect } from '@jest/globals';

jest.unstable_mockModule('../../../docs/js/common/types/Arena.js', () => ({
    EdgeType: jest.fn(),
    ArenaStatus: jest.fn()
}));

jest.unstable_mockModule('../../../docs/js/common/arena/arena.js', () => ({
    moveUnit: jest.fn()
}));

jest.unstable_mockModule('../../../docs/js/common/state-updaters/get-new-position.js', () => ({ default: jest.fn()}));

const { default: handlePawnUnit} = await import ('../../../docs/js/common/state-updaters/pawn-handler.js');
const { EdgeType } = await import ( '../../../docs/js/common/types/Arena.js');
const { UnitAction, UnitType } = await import ( '../../../docs/js/common/types/Units.js');
const { moveUnit } = await import ( '../../../docs/js/common/arena/arena.js');
const { default: getNewPosition} = await import ( '../../../docs/js/common/state-updaters/get-new-position.js');

describe('handlePawnUnit', () => {
    let mockUnit;
    let mockArena;

    beforeEach(() => {
        mockUnit = {
            action: UnitAction.idle,
            position: { x: 0, y: 0 },
            direction: 'north',
            type: UnitType.pawn
        };
        mockArena = {
            spec: {
                details: {
                    dimensions: { width: 5, height: 5 },
                    features: { edge: EdgeType.wall },
                    messages: {
                        lose: "{playerName} lost!",
                        start: "Game Started. It's worth knowing that the map's edge is a wall",
                        tie: "Tie!",
                        win: "{playerName} won!",
                    },
                }
            },
            grid: [
                [[], [], [], [], []],
                [[], [], [], [], []],
                [[], [], [], [], []],
                [[], [], [], [], []],
                [[], [], [], [], []]
            ]
        };
    });

    it('should return true if the unit action is dead', () => {
        mockUnit.action = UnitAction.dead;
        const result = handlePawnUnit(mockUnit, mockArena);
        expect(result).toBe(true);
    });

    it('should handle unit move action', () => {
        mockUnit.action = UnitAction.move;
        getNewPosition.mockReturnValue({ x: 1, y: 1 });

        const result = handlePawnUnit(mockUnit, mockArena);

        expect(result).toBe(false);
        expect(moveUnit).toHaveBeenCalledWith(mockUnit, mockArena, { x: 1, y: 1 });
    });

    it('should set unit action to dead if new position is null', () => {
        mockUnit.action = UnitAction.move;
        getNewPosition.mockReturnValue(null);

        handlePawnUnit(mockUnit, mockArena);

        expect(mockUnit.action).toBe(UnitAction.dead);
    });

    it('should set unit action to idle if unit hits a wall', () => {
        mockUnit.action = UnitAction.move;
        getNewPosition.mockReturnValue({ x: 0, y: 0 });
        mockArena.grid[0][0] = [{ type: UnitType.wall }];

        handlePawnUnit(mockUnit, mockArena);

        expect(mockUnit.action).toBe(UnitAction.idle);
    });

    it('should set unit action to dead if unit falls into water', () => {
        mockUnit.action = UnitAction.move;
        getNewPosition.mockReturnValue({ x: 1, y: 1 });
        mockArena.grid[1][1] = [{ type: UnitType.water }];

        handlePawnUnit(mockUnit, mockArena);

        expect(mockUnit.action).toBe(UnitAction.dead);
    });

    it('should call moveUnit if new position is valid and does not hit obstacles', () => {
        mockUnit.action = UnitAction.move;
        getNewPosition.mockReturnValue({ x: 1, y: 1 });
        mockArena.grid[1][1] = [];

        handlePawnUnit(mockUnit, mockArena);

        expect(moveUnit).toHaveBeenCalledWith(mockUnit, mockArena, { x: 1, y: 1 });
    });
});
