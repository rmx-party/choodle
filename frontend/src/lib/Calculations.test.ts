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

    describe("tuplizeDimensiony", () => {
        it('turns an order-insensitivbe dimensiony object into an ordered tuple of dimensions', () => {
            expect(tuplizeDimensiony({x: 100, y: 150})).toEqual([100, 150])
        })
    })
});

