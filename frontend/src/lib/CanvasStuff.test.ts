import {describe, expect, it, test} from 'vitest';

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
    test.each([
        {desired: {x: 0, y: 0}, maximum: {x: 0, y: 0}, expected: {x: 0, y: 0}},
        {desired: {x: 10, y: 10}, maximum: {x: 0, y: 0}, expected: {x: 0, y: 0}},
        {desired: {x: 10, y: 10}, maximum: {x: 20, y: 20}, expected: {x: 10, y: 10}},
        {desired: {x: 30, y: 10}, maximum: {x: 20, y: 20}, expected: {x: 20, y: 10}},
        {desired: {x: 10, y: 30}, maximum: {x: 20, y: 20}, expected: {x: 10, y: 20}},
    ])('maximumSize($desired, $maximum) -> $expected', ({
                                                            desired,
                                                            maximum,
                                                            expected
                                                        }) => {
        expect(maximumSize(desired, maximum)).toEqual(expected)
    })
});
