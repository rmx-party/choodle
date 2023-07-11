import {describe, expect, it} from 'vitest';

type Dimensiony = {
    x: number;
    y: number;
}

function maximumSize(desiredSize: Dimensiony, maxSize: Dimensiony): Dimensiony {
    return {
        x: Math.min(desiredSize.x, maxSize.x),
        y: Math.min(desiredSize.y, maxSize.y)
    }
}

describe('maximumSize', () => {
    it('gives desired x when desired x is less than max x', () => {
        expect(maximumSize({x: 100, y: 100}, {x: 150, y: 150})).toEqual({x: 100, y: 100})
    });

    it('gives maximum x, and desired y, when x is more than max x, and y is less', () => {
        expect(maximumSize({x: 200, y: 100}, {x: 150, y: 150})).toEqual({x: 150, y: 100})
    })

    it('gives desired y when desired y is less than max y', () => {
        expect(maximumSize({x: 500, y: 500}, {x: 550, y: 550})).toEqual({x: 500, y: 500})
    });

    it('gives desired x, and maximum y, when y is more than max y, and x is less', () => {
        expect(maximumSize({x: 550, y: 500}, {x: 500, y: 550})).toEqual({x: 500, y: 500})
    })
});
