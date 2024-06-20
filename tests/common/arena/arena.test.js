import { jest, describe, expect } from '@jest/globals';

jest.unstable_mockModule('../../../docs/js/common/generators.js', () => ({
    colors: ['red', 'blue', 'green', 'yellow']
}));

jest.unstable_mockModule('../../../docs/js/common/types/Player.js', () => ({
    PlayerType: {
        human: 'human',
        ai: 'ai'
    }
}));

jest.unstable_mockModule('../../../docs/js/common/arena/arena-library.js', () => ({
    setupArena: jest.fn((arenaName, owner) => ({
        id: `random-arena-id`,
        players: {},
        grid: Array(10).fill().map(() => Array(10).fill().map(() => [])),
        resources: []
    }))
}));

const { colors } = await import('../../../docs/js/common/generators.js');
const { PlayerType } = await import ('../../../docs/js/common/types/Player.js');
const { setupArena } = await import ('../../../docs/js/common/arena/arena-library.js');
const { addArena,
    getArena,
    setPlayerArena,
    getPlayerArena,
    forEachArena,
    getNewUnitId,
    addResource,
    removeResource,
    addUnit,
    removeUnit,
    moveUnit,
    addPlayer } = await import('../../../docs/js/common/arena/arena.js');

describe('arena.js', () => {
    let arena, arenaId, playerId, unitType, position, action, direction, resource;

    beforeEach(() => {
        arena = setupArena('default', 'PlayerName');
        arena.players[0] = { color: 'red', name: 'Player1', id: 0, type: PlayerType.human, send: jest.fn(), units: {}, resources: 0 }
        arenaId = addArena('default', 'Player1', 0, jest.fn());
        playerId = 0;
        unitType = 'pawn';
        position = { x: 1, y: 1 };
        action = 'idle';
        direction = 'north';
        resource = { type: 'gold', position: { x: 2, y: 2 } };
    });

    it('should add a new arena', () => {
        const resultArena = getArena(arenaId);
        expect(resultArena.id).toBe(arena.id);
        expect(resultArena.players[0].name).toBe('Player1');
        expect(resultArena.grid.length).toBe(10);
    });

    it('should add a player to the arena', () => {
        addPlayer(arena, 1, 'Player2', PlayerType.human, jest.fn());
        expect(arena.players[1]).toEqual({
            type: PlayerType.human,
            name: 'Player2',
            id: 1,
            color: 'blue',
            send: expect.any(Function),
            units: {},
            resources: 0
        });
    });

    it('should set and get player arena', () => {
        setPlayerArena(playerId, arenaId);
        expect(getPlayerArena(playerId).id).toBe('random-arena-id');
        setPlayerArena(playerId, null);
        expect(getPlayerArena(playerId)).toBeNull();
    });

    it('should iterate over each arena', () => {
        const callback = jest.fn();
        const actualArena = getArena('random-arena-id');
        forEachArena(callback);
        expect(callback).toHaveBeenCalledWith(actualArena);
    });

    it('should generate new unit ID', () => {
        const unitId = getNewUnitId(playerId, unitType);
        expect(unitId).toBe('pawn-0-0');
    });

    it('should add a unit to the arena', () => {
        addUnit(arena, playerId, unitType, position, action, direction);
        const unitId = 'pawn-0-0';
        expect(arena.players[playerId].units[unitId]).toEqual({
            type: unitType,
            owner: playerId,
            id: unitId,
            position,
            action,
            direction
        });
        expect(arena.grid[1][1]).toContainEqual(expect.objectContaining({ id: unitId }));
    });

    it('should remove a unit from the arena', () => {
        addUnit(arena, playerId, unitType, position, action, direction);
        const unitId = 'pawn-0-0';
        const unit = arena.players[playerId].units[unitId];
        removeUnit(unit, arena);
        expect(arena.players[playerId].units[unitId]).toBeUndefined();
        expect(arena.grid[1][1]).not.toContainEqual(expect.objectContaining({ id: unitId }));
    });

    it('should move a unit within the arena', () => {
        addUnit(arena, playerId, unitType, position, action, direction);
        const unitId = 'pawn-0-0';
        const unit = arena.players[playerId].units[unitId];
        const newPosition = { x: 2, y: 2 };
        moveUnit(unit, arena, newPosition);
        expect(unit.position).toEqual(newPosition);
        expect(arena.grid[2][2]).toContainEqual(expect.objectContaining({ id: unitId }));
        expect(arena.grid[1][1]).not.toContainEqual(expect.objectContaining({ id: unitId }));
    });

    it('should add a resource to the arena', () => {
        addResource(arena, resource.type, resource.position);
        expect(arena.resources).toContainEqual(resource);
        expect(arena.grid[2][2]).toContainEqual(expect.objectContaining({ type: resource.type }));
    });

    it('should remove a resource from the arena', () => {
        addResource(arena, resource.type, resource.position);
        removeResource(arena, resource);
        expect(arena.resources).not.toContainEqual(resource);
        expect(arena.grid[2][2]).not.toContainEqual(expect.objectContaining({ type: resource.type }));
    });
});
