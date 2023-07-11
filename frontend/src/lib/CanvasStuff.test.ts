import {describe, expect, it, test} from 'vitest';
import {applyRatio, Dimensiony, maximumSize, removeOffset} from "$lib/CanvasStuff";

describe('CanvasStuff', () => {
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

    describe('applyRatio', () => {
        test.each([
            {dimensions: {x: 0, y: 0}, ratio: 0.0, expected: {x: 0, y: 0}},
            {dimensions: {x: 20, y: 20}, ratio: 2.0, expected: {x: 40, y: 40}},
            {dimensions: {x: 20, y: 20}, ratio: 0.5, expected: {x: 10, y: 10}},
            {dimensions: {x: -50, y: -50}, ratio: 0.1, expected: {x: -5, y: -5}},
        ])('applyRatio($dimensions, $ratio) -> $expected', ({
                                                                dimensions,
                                                                ratio,
                                                                expected
                                                            }) => {
            expect(applyRatio(dimensions, ratio)).toEqual(expected)
        })
    });
});

