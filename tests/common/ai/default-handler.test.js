import { jest, describe, expect } from '@jest/globals';

// Mock dependencies
jest.unstable_mockModule('../../../dist/common/generators.js', () => ({
    getRandomDirection: jest.fn()
}));
jest.unstable_mockModule('../../../dist/common/ai/path-finder.js', () => ({
    getPathToNearestTarget: jest.fn()
}));
jest.unstable_mockModule('../../../dist/common/util-grid.js', () => ({
    createGrid: jest.fn()
}));

const { default: handler } = await import ('../../../dist/common/ai/default-handler.js');
const { getRandomDirection } = await import ( '../../../dist/common/generators.js');
const { EdgeType } = await import ( '../../../dist/common/types/Arena.js');
const { Direction, UnitAction, UnitType } = await import ( '../../../dist/common/types/Units.js');
const { getPathToNearestTarget } = await import ( '../../../dist/common/ai/path-finder.js');
const { createGrid } = await import ( '../../../dist/common/util-grid.js');

describe('default ai handler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('handler', () => {
        it('should generate commands for barracks and pawns', () => {
            const units = [
                { id: 1, type: UnitType.barrack, owner: 1 },
                { id: 2, type: UnitType.pawn, owner: 1, position: { x: 1, y: 1 } },
                { id: 3, type: UnitType.resource, owner: 2 }
            ];
            const playerId = 1;
            const resources = 2;
            const dimensions = { width: 3, height: 3 };
            const features = { edge: EdgeType.loop };
            
            createGrid.mockReturnValue([
                [undefined, undefined, undefined],
                [undefined, [], undefined],
                [undefined, undefined, undefined]
            ]);
            getRandomDirection.mockReturnValue(Direction.north);
            getPathToNearestTarget.mockReturnValue([{ position: { x: 1, y: 1 }, backward: Direction.north }]);
            
            const commands = handler(units, playerId, resources, dimensions, features);

            expect(commands).toEqual([
                { unitId: 1, action: UnitAction.produce, direction: Direction.north },
                { unitId: 2, action: UnitAction.move, direction: Direction.north }
            ]);
        });

        it('should produce units when barracks and resources are available', () => {
            getRandomDirection.mockReturnValue(Direction.north);
            const units = [
                { id: 1, type: UnitType.barrack, owner: 1, action: UnitAction.idle }
            ];
            const playerId = 1;
            const resources = 1;
            const dimensions = { width: 2, height: 2 };
            const features = { edge: EdgeType.loop };
            createGrid.mockReturnValue([[[], []], [[], []]]);
            const result = handler(units, playerId, resources, dimensions, features);
            expect(result).toEqual([
                { unitId: 1, action: UnitAction.produce, direction: Direction.north }
            ]);
        });

        it('should not produce units when no resources are available', () => {
            const units = [
                { id: 1, type: UnitType.barrack, owner: 1, action: UnitAction.idle }
            ];
            const playerId = 1;
            const resources = 0;
            const dimensions = { width: 2, height: 2 };
            const features = { edge: EdgeType.loop };
            createGrid.mockReturnValue([[[], []], [[], []]]);
            const result = handler(units, playerId, resources, dimensions, features);
            expect(result).toEqual([]);
        });

        it('should generate move commands for pawns towards targets', () => {
            const units = [
                { id: 1, type: UnitType.pawn, owner: 1, action: UnitAction.idle, position: { x: 1, y: 1 } },
                { id: 2, type: UnitType.resource, position: { x: 2, y: 2 } }
            ];
            const playerId = 1;
            const resources = 0;
            const dimensions = { width: 2, height: 2 };
            const features = { edge: EdgeType.loop };
            createGrid.mockReturnValue([[[], []], [[], []]]);
            getPathToNearestTarget.mockReturnValue([{ position: { x: 2, y: 2 } }, { position: { x: 1, y: 1 }, backward: Direction.north }]);
            const result = handler(units, playerId, resources, dimensions, features);
            expect(result).toEqual([
                { unitId: 1, action: UnitAction.move, direction: Direction.north }
            ]);
        });

        it('should handle edge cases when no valid paths are available', () => {
            const units = [
                { id: 1, type: UnitType.pawn, owner: 1, action: UnitAction.idle, position: { x: 1, y: 1 } },
                { id: 2, type: UnitType.resource, position: { x: 2, y: 2 } }
            ];
            const playerId = 1;
            const resources = 0;
            const dimensions = { width: 2, height: 2 };
            const features = { edge: EdgeType.loop };
            createGrid.mockReturnValue([[[], []], [[], []]]);
            getPathToNearestTarget.mockReturnValue(undefined);
            const result = handler(units, playerId, resources, dimensions, features);
            expect(result).toEqual([]);
        });

        it('should handle multiple pawns and targets correctly', () => {
            const units = [
                { id: 1, type: UnitType.pawn, owner: 1, action: UnitAction.idle, position: { x: 1, y: 1 } },
                { id: 2, type: UnitType.pawn, owner: 1, action: UnitAction.idle, position: { x: 2, y: 2 } },
                { id: 3, type: UnitType.resource, position: { x: 3, y: 3 } },
                { id: 4, type: UnitType.barrack, owner: 2, position: { x: 4, y: 4 } }
            ];
            const playerId = 1;
            const resources = 0;
            const dimensions = { width: 5, height: 5 };
            const features = { edge: EdgeType.wall };
            createGrid.mockReturnValue([[[], [], [], [], []], [[], [], [], [], []], [[], [], [], [], []], [[], [], [], [], []], [[], [], [], [], []]]);
            getPathToNearestTarget.mockReturnValueOnce([{ position: { x: 2, y: 2 } }, { position: { x: 3, y: 3 } }, { position: { x: 1, y: 1 }, backward: Direction.north}])
                                .mockReturnValueOnce([{ position: { x: 1, y: 1 } }, { position: { x: 4, y: 4 } }, { position: { x: 2, y: 2 }, backward: Direction.east}]);

            const result = handler(units, playerId, resources, dimensions, features);
            expect(result).toEqual([
                { unitId: 1, action: UnitAction.move, direction: Direction.north },
                { unitId: 2, action: UnitAction.move, direction: Direction.east }
            ]);
        });
    });
});
