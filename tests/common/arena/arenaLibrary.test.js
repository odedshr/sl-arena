import {jest, describe, expect } from '@jest/globals';

jest.unstable_mockModule('../../../docs/js/common/generators.js', () => ({
    getRandomArenaId: jest.fn(() => 'test-arena-id')
}));

jest.unstable_mockModule('../../../docs/js/common/arena/arena.js', () => ({
    addUnit: jest.fn()
}));

jest.unstable_mockModule('../../../docs/js/common/util-grid.js', () => ({ createGrid: jest.fn(() => 'mock-grid')}));

const { setupArena, setupUnits } = await import('../../../docs/js/common/arena/arenaLibrary.js');
const { ArenaStatus, EdgeType, FogOfWar } = await import( '../../../docs/js/common/types/Arena.js');
const { Direction, UnitAction, UnitType } = await import( '../../../docs/js/common/types/Units.js');
const { addUnit } = await import( '../../../docs/js/common/arena/arena.js');
const { createGrid } = await import( '../../../docs/js/common/util-grid.js');

describe('setupArena', () => {
    it('should setup an arena with the given name and owner', () => {
        const arenaName = 'default';
        const owner = 'test-owner';
        
        const arena = setupArena(arenaName, owner);
        
        expect(arena).toEqual({
            spec: {
                maxPlayers: 4,
                resourceProbability: 0.1,
                dimensions: { width: 32, height: 25 },
                features: { edge: EdgeType.wall, fogOfWar: FogOfWar.both }
            },
            name: arenaName,
            id: 'test-arena-id',
            tick: 0,
            owner,
            players: {},
            status: ArenaStatus.init,
            obstacles: [
                { type: UnitType.wall, position: [{ x: 6, y: 10 }, { x: 6, y: 6 }, { x: 10, y: 6 }] },
                { type: UnitType.wall, position: [{ x: 22, y: 6 }, { x: 26, y: 6 }, { x: 26, y: 10 }] },
                { type: UnitType.wall, position: [{ x: 26, y: 14 }, { x: 26, y: 18 }, { x: 22, y: 18 }] },
                { type: UnitType.wall, position: [{ x: 10, y: 18 }, { x: 6, y: 18 }, { x: 6, y: 14 }] }
            ],
            resources: [],
            grid: 'mock-grid'
        });
        expect(createGrid).toHaveBeenCalledWith({ width: 32, height: 25 }, [
            { type: UnitType.wall, position: [{ x: 6, y: 10 }, { x: 6, y: 6 }, { x: 10, y: 6 }] },
            { type: UnitType.wall, position: [{ x: 22, y: 6 }, { x: 26, y: 6 }, { x: 26, y: 10 }] },
            { type: UnitType.wall, position: [{ x: 26, y: 14 }, { x: 26, y: 18 }, { x: 22, y: 18 }] },
            { type: UnitType.wall, position: [{ x: 10, y: 18 }, { x: 6, y: 18 }, { x: 6, y: 14 }] }
        ]);
    });

    it('should throw an error for unknown arena', () => {
        expect(() => setupArena('unknown', 'test-owner')).toThrow('Unknown Arena: unknown');
    });
});

describe('setupUnits', () => {
    it('should setup units for players in the arena', () => {
        const arena = {
            name: 'default',
            spec: {
                maxPlayers: 4
            },
            players: {
                'player1': { id: 'player1' },
                'player2': { id: 'player2' }
            }
        };

        setupUnits(arena);

        expect(arena.players.player1.resources).toBe(8);
        expect(arena.players.player2.resources).toBe(8);
        expect(addUnit).toHaveBeenCalledWith(arena, 'player1', UnitType.barrack, {x: 2, y: 2}, UnitAction.idle, Direction.north);
        expect(addUnit).toHaveBeenCalledWith(arena, 'player2', UnitType.barrack, {x: 30, y: 22}, UnitAction.idle, Direction.north);
    });

    it('should throw an error for unknown arena', () => {
        const arena = { name: 'unknown', players: {} };
        expect(() => setupUnits(arena)).toThrow('Unknown Arena: unknown');
    });

    it('should throw an error if too many players', () => {
        const arena = {
            name: 'default',
            spec: {
                maxPlayers: 2
            },
            players: {
                'player1': { id: 'player1' },
                'player2': { id: 'player2' },
                'player3': { id: 'player3' }
            }
        };

        expect(() => setupUnits(arena)).toThrow('Too many players for default');
    });
});