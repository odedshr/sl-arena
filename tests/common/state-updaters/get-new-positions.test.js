import { describe, expect } from '@jest/globals';

import getNewPosition from '../../../docs/js/common/state-updaters/get-new-position.js';
import { EdgeType } from '../../../docs/js/common/types/Arena.js';
import { Direction } from '../../../docs/js/common/types/Units.js';

describe('getNewPosition', () => {
    const dimensions = { width: 5, height: 5 };
    const position = { x: 2, y: 2 };

    it('should return the new position moving north', () => {
        const newPosition = getNewPosition(position, Direction.north, dimensions, EdgeType.wall);
        expect(newPosition).toEqual({ x: 2, y: 1 });
    });

    it('should return null if moving out of bounds with edge type death', () => {
        const newPosition = getNewPosition({ x: 0, y: 0 }, Direction.north, dimensions, EdgeType.death);
        expect(newPosition).toBeNull();
    });

    it('should loop around the grid if edge type is loop', () => {
        const newPosition = getNewPosition({ x: 4, y: 4 }, Direction.east, dimensions, EdgeType.loop);
        expect(newPosition).toEqual({ x: 0, y: 4 });
    });

    it('should not move if hitting a wall on the grid edge', () => {
        const newPosition = getNewPosition({ x: 4, y: 4 }, Direction.east, dimensions, EdgeType.wall);
        expect(newPosition).toEqual({ x: 4, y: 4 });
    });

    it('should return the new position moving southEast', () => {
        const newPosition = getNewPosition(position, Direction.southEast, dimensions, EdgeType.wall);
        expect(newPosition).toEqual({ x: 3, y: 3 });
    });

    it('should handle looping around the grid vertically', () => {
        const newPosition = getNewPosition({ x: 2, y: 4 }, Direction.south, dimensions, EdgeType.loop);
        expect(newPosition).toEqual({ x: 2, y: 0 });
    });

    it('should return null if moving out of bounds vertically with edge type death', () => {
        const newPosition = getNewPosition({ x: 2, y: 0 }, Direction.north, dimensions, EdgeType.death);
        expect(newPosition).toBeNull();
    });

    it('should handle wrapping around diagonally with edge type loop', () => {
        const newPosition = getNewPosition({ x: 4, y: 4 }, Direction.southEast, dimensions, EdgeType.loop);
        expect(newPosition).toEqual({ x: 0, y: 0 });
    });
});