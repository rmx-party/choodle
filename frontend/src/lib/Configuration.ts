import type { Dimensiony } from '$lib/Calculations'
import { PUBLIC_FEATURE_AUTHENTICATION } from '$env/static/public'

export const lineWidth = 1
export const targetMaxSize: Dimensiony = { x: 195, y: 260 }
export const drawColor = '#000000'
export const backgroundColour = '#FFFFFF' // NOTE: this is canvas background, not page bg
export const pageBackgroundDefault = '#F7F7F7'
export const choodleYellow = '#FEF40A'
export const choodleUndoKey = 'choodle-undo'
export const choodlePromptKey = 'choodle-selected-prompt'
export const choodleCreatorIdKey = 'choodle-creator-id'
export const choodlePersistedCreatorIdKey = 'choodle-persisted-creator-id'
export const blackWhiteThreshold = 250
export const upScaledImageRatio = 8

// feature flags

export const featureAuthentication = PUBLIC_FEATURE_AUTHENTICATION
