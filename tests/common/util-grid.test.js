import { describe, expect } from '@jest/globals';

const { createGrid } = await import ('../../docs/js/common/util-grid.js');
const { UnitType } = await import ('../../docs/js/common/types/Units.js');

describe('createGrid', () => {
    it('should create an empty grid of given dimensions', () => {
        const dimensions = { width: 5, height: 5 };
        const units = [];
        const grid = createGrid(dimensions, units);

        expect(grid.length).toBe(5);
        expect(grid[0].length).toBe(5);
        grid.forEach(row => {
            row.forEach(cell => {
                expect(cell).toEqual([]);
            });
        });
    });

    it('should place non-wall units correctly on the grid', () => {
        const dimensions = { width: 5, height: 5 };
        const units = [
            { type: UnitType.barrack, position: { x: 1, y: 1 } },
            { type: UnitType.resource, position: { x: 2, y: 2 } }
        ];
        const grid = createGrid(dimensions, units);

        expect(grid[1][1]).toEqual([units[0]]);
        expect(grid[2][2]).toEqual([units[1]]);
    });

    it('should draw wall units correctly on the grid', () => {
        const dimensions = { width: 5, height: 5 };
        const units = [
            { type: UnitType.wall, position: [{ x: 0, y: 0 }, { x: 4, y: 0 }] }
        ];
        const grid = createGrid(dimensions, units);

        for (let x = 0; x <= 4; x++) {
            expect(grid[0][x]).toEqual([units[0]]);
        }
    });

    it('should handle multiple wall units correctly on the grid', () => {
        const dimensions = { width: 5, height: 5 };
        const units = [
            { type: UnitType.wall, position: [{ x: 0, y: 0 }, { x: 4, y: 0 }] },
            { type: UnitType.wall, position: [{ x: 0, y: 0 }, { x: 0, y: 4 }] }
        ];
        const grid = createGrid(dimensions, units);

        for (let x = 0; x <= 4; x++) {
            expect(grid[0][x]).toContain(units[0]);
        }
        for (let y = 0; y <= 4; y++) {
            expect(grid[y][0]).toContain(units[1]);
        }
    });

    it('should not overwrite cells when placing multiple units', () => {
        const dimensions = { width: 5, height: 5 };
        const units = [
            { type: UnitType.barrack, position: { x: 1, y: 1 } },
            { type: UnitType.resource, position: { x: 1, y: 1 } }
        ];
        const grid = createGrid(dimensions, units);

        expect(grid[1][1]).toEqual([units[0], units[1]]);
    });
});
