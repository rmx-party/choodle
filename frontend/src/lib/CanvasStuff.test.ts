import {describe, expect, it, test} from 'vitest';
import {maximumSize} from "$lib/CanvasStuff";
import type {Dimensiony} from "$lib/CanvasStuff";

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

function removeOffset(dimensions: Dimensiony, offsetToRemove: Dimensiony): Dimensiony {
    return {x: dimensions.x - offsetToRemove.x, y: dimensions.y - offsetToRemove.y}
}

describe('removeOffset', () => {
    test.each([
        {dimensions: {x: 0, y: 0}, offsetToRemove: {x: 0, y: 0}, expected: {x: 0, y: 0}},
        {dimensions: {x: 20, y: 20}, offsetToRemove: {x: 0, y: 0}, expected: {x: 20, y: 20}},
        {dimensions: {x: 20, y: 20}, offsetToRemove: {x: 5, y: 5}, expected: {x: 15, y: 15}},
        {dimensions: {x: 50, y: 50}, offsetToRemove: {x: 10, y: 20}, expected: {x: 40, y: 30}},
        {dimensions: {x: 50, y: 50}, offsetToRemove: {x: 20, y: 10}, expected: {x: 30, y: 40}},
        {dimensions: {x: 50, y: 50}, offsetToRemove: {x: -20, y: 10}, expected: {x: 70, y: 40}},
        {dimensions: {x: 50, y: 50}, offsetToRemove: {x: 10, y: -20}, expected: {x: 40, y: 70}},
        {dimensions: {x: 50, y: 50}, offsetToRemove: {x: 100, y: 20}, expected: {x: -50, y: 30}},
        {dimensions: {x: 50, y: 50}, offsetToRemove: {x: 10, y: 100}, expected: {x: 40, y: -50}},
    ])('removeOffset($dimensions, $offsetToRemove) -> $expected', ({
                                                                       dimensions,
                                                                       offsetToRemove,
                                                                       expected
                                                                   }) => {
        expect(removeOffset(dimensions, offsetToRemove)).toEqual(expected)
    })
});