import {type DeepReadonly, inject, type InjectionKey, provide, readonly} from 'vue'
import cvData from '@/data/cv.json'

export type CvData = typeof cvData

const CvDataKey: InjectionKey<DeepReadonly<CvData>> = Symbol('cvData')

/**
 * Provides read-only CV data from `src/data/cv.json` via Vue DI.
 *
 * Why:
 * - Keep components dumb: they consume typed data instead of importing JSON everywhere.
 * - Prevent accidental mutation by exposing a `readonly()` DeepReadonly.
 */
export function provideCvData() {
    provide(CvDataKey, readonly(cvData))
}

export function useCvData(): DeepReadonly<CvData> {
    const data = inject(CvDataKey)
    if (!data) {
        throw new Error('CvData not provided. Make sure to call provideCvData() in a parent component.')
    }
    return data
}
