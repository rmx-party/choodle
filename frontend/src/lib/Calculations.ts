export type Dimensiony = {
    x: number;
    y: number;
}

function floorCoordinates(dimensions: Dimensiony) {
    return {x: Math.floor(dimensions.x), y: Math.floor(dimensions.y)}
}

function getWidth(length: number, ratio: number) {
    const width = length / (1 / ratio);
    return Math.floor(width);
}

function getHeight(length: number, ratio: number) {
    const height = length * (1 / ratio);
    return Math.floor(height);
}

function calculateAspectRatioFit(src: Dimensiony, max: Dimensiony) {
    const targetRatio = max.x / max.y
    const srcRatio = src.x / src.y

    if (srcRatio === targetRatio) {
        return floorCoordinates(src)
    }

    if (srcRatio > targetRatio) {
        return floorCoordinates({x: getWidth(src.y, targetRatio), y: src.y})
    }

    return floorCoordinates({x: src.x, y: getHeight(src.x, targetRatio)})
}

export function maximumSize(desiredSize: Dimensiony, maxSize: Dimensiony): Dimensiony {
    if (desiredSize.x < maxSize.x || desiredSize.y < maxSize.y) {
        return calculateAspectRatioFit(desiredSize, maxSize)
    }
    return maxSize
}

export function applyRatio(dimensions: Dimensiony, ratio: number) {
    return {x: dimensions.x * ratio, y: dimensions.y * ratio}
}

export function removeOffset(dimensions: Dimensiony, offsetToRemove: Dimensiony): Dimensiony {
    return {x: dimensions.x - offsetToRemove.x, y: dimensions.y - offsetToRemove.y}
}

export function tuplizeDimensiony(dimensions: Dimensiony) {
    return [dimensions.x, dimensions.y]
}