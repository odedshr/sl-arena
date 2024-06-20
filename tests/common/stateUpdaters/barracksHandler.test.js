import { jest, describe, expect } from '@jest/globals';

jest.unstable_mockModule('../../../docs/js/common/arena/arena.js', () => ({
    addUnit: jest.fn()
}));

const { UnitAction, UnitType }  = await import ( '../../../docs/js/common/types/Units.js');
const { addUnit }  = await import ( '../../../docs/js/common/arena/arena.js');
const { default: handleBarrackUnit } = await import ('../../../docs/js/common/stateUpdaters/barracksHandler.js');

describe('handleBarrackUnit', () => {
    let mockUnit;
    let mockArena;
    let mockPlayer;

    beforeEach(() => {
        mockUnit = {
            action: UnitAction.idle,
            owner: 'player1',
            position: { x: 2, y: 2 },
            direction: 'north',
            type: UnitType.barrack
        };

        mockPlayer = {
            resources: 5,
            id: 'player1',
            units: {}
        };

        mockArena = {
            players: {
                'player1': mockPlayer
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

    it('should not produce a pawn if resources are zero', () => {
        mockUnit.action = UnitAction.produce;
        mockPlayer.resources = 0;
        handleBarrackUnit(mockUnit, mockArena);

        expect(addUnit).not.toHaveBeenCalled();
        expect(mockUnit.action).toBe(UnitAction.idle);
    });

    it('should not change unit action if it is not producing', () => {
        mockUnit.action = UnitAction.idle;

        handleBarrackUnit(mockUnit, mockArena);

        expect(addUnit).not.toHaveBeenCalled();
        expect(mockUnit.action).toBe(UnitAction.idle);
    });

    it('should produce a pawn and decrease player resources when action is produce and resources are available', () => {
        mockUnit.action = UnitAction.produce;
        mockPlayer.resources = 5;

        handleBarrackUnit(mockUnit, mockArena);

        expect(addUnit).toHaveBeenCalledWith(mockArena, 'player1', UnitType.pawn, { x: 2, y: 2 }, UnitAction.move, 'north');
        expect(mockPlayer.resources).toBe(4);
    });

    it('should set unit action to idle when resources become zero', () => {
        mockUnit.action = UnitAction.produce;
        mockPlayer.resources = 1;

        handleBarrackUnit(mockUnit, mockArena);

        expect(addUnit).toHaveBeenCalledWith(mockArena, 'player1', UnitType.pawn, { x: 2, y: 2 }, UnitAction.move, 'north');
        expect(mockPlayer.resources).toBe(0);
        expect(mockUnit.action).toBe(UnitAction.idle);
    });
});
