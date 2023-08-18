import {describe, expect, it, test} from 'vitest';

import {maximumSize, removeOffset, tuplizeDimensiony} from "./Calculations";

describe('Calculations', () => {
    describe('maximumSize gives a box that fits within desired and maximum preserving the aspect ratio of maximum', () => {
        test.each([
            {desired: {x: 0, y: 0}, maximum: {x: 0, y: 0}, expected: {x: 0, y: 0}},
            {desired: {x: 10, y: 10}, maximum: {x: 0, y: 0}, expected: {x: 0, y: 0}},
            {desired: {x: 10, y: 10}, maximum: {x: 20, y: 20}, expected: {x: 10, y: 10}},
            {desired: {x: 30, y: 10}, maximum: {x: 20, y: 20}, expected: {x: 10, y: 10}},
            {desired: {x: 10, y: 30}, maximum: {x: 20, y: 20}, expected: {x: 10, y: 10}},
            {desired: {x: 1024, y: 768}, maximum: {x: 420, y: 746}, expected: {x: 420, y: 746}},
            {desired: {x: 400, y: 200}, maximum: {x: 16, y: 9}, expected: {x: 16, y: 9}},
            {desired: {x: 8, y: 9}, maximum: {x: 16, y: 9}, expected: {x: 8, y: 4}},
            {desired: {x: 16, y: 4}, maximum: {x: 16, y: 9}, expected: {x: 7, y: 4}},
        ])('maximumSize($desired, $maximum) -> $expected', ({
                                                                desired,
                                                                maximum,
                                                                expected
                                                            }) => {
            expect(maximumSize(desired, maximum)).toEqual(expected)
        })
    });
});

