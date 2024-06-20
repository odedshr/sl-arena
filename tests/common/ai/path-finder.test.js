import { getPathToNearestTarget, isValidPosition, getNextPosition } from '../../../docs/js/common/ai/path-finder.js';
import { Direction } from '../../../docs/js/common/types/Units.js';

describe('path-finder functions', () => {
    const dimensions = { width: 3, height: 3 };

    describe('isValidPosition', () => {
        const obstacles = [
            [0, 0, 1],
            [0, 1, 0],
            [0, 0, 0]
        ];
    
        it('should return true for valid positions within grid boundaries', () => {
            expect(isValidPosition({x:0, y:0}, dimensions, obstacles, false)).toBe(true);
            expect(isValidPosition({x:2, y:1}, dimensions, obstacles, false)).toBe(true);
        });

        it('should return false for invalid positions out of grid boundaries', () => {
            expect(isValidPosition({x:-1, y:0}, dimensions, obstacles, false)).toBe(false);
            expect(isValidPosition({x:3, y:0}, dimensions, obstacles, false)).toBe(false);
            expect(isValidPosition({x:0, y:-1}, dimensions, obstacles, false)).toBe(false);
            expect(isValidPosition({x:0, y:3}, dimensions, obstacles, false)).toBe(false);
        });

        it('should return false for positions blocked in the grid', () => {
            expect(isValidPosition({x:2, y:0}, dimensions, obstacles, false)).toBe(false);
            expect(isValidPosition({x:1, y:1}, dimensions, obstacles, false)).toBe(false);
        });

        it('should handle looping positions correctly', () => {
            expect(isValidPosition({x:-2, y: 0}, dimensions, obstacles, true)).toBe(true);
            expect(isValidPosition({x:3,  y:0}, dimensions, obstacles, true)).toBe(true);
            expect(isValidPosition({x:0,  y:-1}, dimensions, obstacles, true)).toBe(true);
            expect(isValidPosition({x:0,  y:3}, dimensions, obstacles, true)).toBe(true);
        });
    });

    describe('getNextPosition', () => {
        it('should return the next position without looping', () => {
            expect(getNextPosition({ x: 1, y: 1 }, { x: 1, y: 0 }, dimensions, false)).toEqual({ x: 2, y: 1 });
        });

        it('should return the next position with looping', () => {
            expect(getNextPosition({ x: 2, y: 2 }, { x: 1, y: 1 }, dimensions, true)).toEqual({ x: 0, y: 0 });
            expect(getNextPosition({ x: 0, y: 0 }, { x: -1, y: -1 }, dimensions, true)).toEqual({ x: 2, y: 2 });
        });
    });

    describe('getPathToNearestTarget', () => {
        it('should return the path to the nearest target', () => {
            const start = { x: 0, y: 0 };
            const targets = [{ x: 2, y: 2 }];
            const terrain = [
                [0, 0, 0],
                [0, 1, 0],
                [0, 0, 0]
            ];
            const path = getPathToNearestTarget(start, targets, terrain, false);

            expect(path).toEqual([
                { distance: 1, origin: { x: 0, y: 0 }, position: { x: 1, y: 0 }, forward: Direction.east, backward: Direction.west },
                { distance: 2, origin: { x: 1, y: 0 }, position: { x: 2, y: 1 }, forward: Direction.southEast, backward: Direction.northWest },
                { distance: 3, origin: { x: 2, y: 1 }, position: { x: 2, y: 2 }, forward: Direction.south, backward: Direction.north },
            ]);
        });

        it('should return an empty array if no path to target is found', () => {
            const start = { x: 0, y: 0 };
            const targets = [{ x: 2, y: 2 }];
            const terrain = [
                [0, 1, 0],
                [0, 1, 0],
                [0, 1, 0]
            ];
            expect(getPathToNearestTarget(start, targets, terrain, false)).toEqual([]);
        });

        it('should handle looping grid correctly', () => {
            const start = { x: 0, y: 0 };
            const targets = [{ x: 2, y: 2 }];
            const terrain = [
                [0, 1, 0],
                [0, 1, 0],
                [0, 1, 0]
            ];
            expect(getPathToNearestTarget(start, targets, terrain, true)).toEqual([
                { distance: 1, origin: { x: 0, y: 0 }, position: { x: 2, y: 2 }, forward: Direction.southWest, backward: Direction.northEast }
            ]);
        });

        it('should should the nearest target', () => {
            const start = { x: 0, y: 0 };
            const targets = [{ x: 3, y: 0 },{ x:3, y:3 }];
            const terrain = [
                [0, 1, 0, 0],
                [0, 1, 1, 0],
                [0, 0, 0, 0],
                [0, 1, 0, 0]
            ];
            expect(getPathToNearestTarget(start, targets, terrain, false)).toEqual([
                { distance: 1, origin: { x: 0, y: 0 }, position: { x: 0, y: 1 }, forward: Direction.south, backward: Direction.north },
                { distance: 2, origin: { x: 0, y: 1 }, position: { x: 1, y: 2 }, forward: Direction.southEast, backward: Direction.northWest },
                { distance: 3, origin: { x: 1, y: 2 }, position: { x: 2, y: 2 }, forward: Direction.east, backward: Direction.west },
                { distance: 4, origin: { x: 2, y: 2 }, position: { x: 3, y: 3 }, forward: Direction.southEast, backward: Direction.northWest },
            ]);
        });
    });
});
