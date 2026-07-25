import { buildMeasurementsMetadata, convertMeasurementValue, mergeMeasurementSources, normalizeMeasurements, normalizeMeasurementUnit, selectLatestMeasurements } from '~/utils/measurements'

describe('measurement profile helpers', () => {
  it('normalizes numeric values, units and the update date', () => {
    expect(normalizeMeasurements({
      weight: '72.5',
      weightUnit: ' kg ',
      bodyfat: '18',
      updated_at: '2026-07-22T10:00:00Z'
    })).toEqual({
      weight: 72.5,
      weightUnit: 'kg',
      bodyfat: 18,
      updated_at: '2026-07-22T10:00:00.000Z'
    })
  })

  it('normalizes supported unit aliases and applies defaults', () => {
    expect(normalizeMeasurementUnit('height', 'inches')).toBe('in')
    expect(normalizeMeasurementUnit('weight', 'KGS')).toBe('kg')
    expect(normalizeMeasurementUnit('waist', 'unknown')).toBe('cm')
  })

  it('converts values when measurement units change', () => {
    expect(convertMeasurementValue('height', 180, 'cm', 'in')).toBe(70.87)
    expect(convertMeasurementValue('height', 70.87, 'in', 'cm')).toBe(180.01)
    expect(convertMeasurementValue('weight', 70, 'kg', 'lb')).toBe(154.32)
    expect(convertMeasurementValue('weight', 154.32, 'lb', 'kg')).toBe(70)
  })

  it('does not convert units that do not belong to the measurement field', () => {
    expect(convertMeasurementValue('weight', 70, 'cm', 'in')).toBe(70)
    expect(convertMeasurementValue('height', 180, 'kg', 'lb')).toBe(180)
    expect(convertMeasurementValue('bodyfat', 18, 'cm', 'in')).toBe(18)
  })

  it('adds profile measurements to report history in date order', () => {
    const reports = [{ date: '2026-07-01T00:00:00Z', json_metadata: { weight: 75 } }]
    const result = mergeMeasurementSources(reports, {
      weight: 72,
      updated_at: '2026-07-22T10:00:00Z'
    })

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ source: 'profile', json_metadata: { weight: 72 } })
    expect(result[1]).toBe(reports[0])
  })

  it('keeps report data unchanged when profile measurements are absent', () => {
    const reports = [{ date: '2026-07-01T00:00:00Z', json_metadata: { height: 180 } }]
    expect(mergeMeasurementSources(reports, null)).toEqual(reports)
  })

  it('uses a newer report over profile values while filling report gaps', () => {
    const entries = mergeMeasurementSources([{
      date: '2026-07-23T10:00:00Z',
      json_metadata: { weight: 70, weightUnit: 'kg', height: 181, heightUnit: 'cm' }
    }], {
      weight: 72,
      weightUnit: 'kg',
      chest: 95,
      chestUnit: 'cm',
      updated_at: '2026-07-22T10:00:00Z'
    })

    expect(selectLatestMeasurements(entries)).toEqual({
      measurements: {
        weight: 70,
        weightUnit: 'kg',
        height: 181,
        heightUnit: 'cm',
        chest: 95,
        chestUnit: 'cm'
      },
      updatedAt: '2026-07-23T10:00:00Z'
    })
  })

  it('uses a newer profile over report values while filling profile gaps', () => {
    const entries = mergeMeasurementSources([{
      date: '2026-07-22T10:00:00Z',
      json_metadata: { weight: 72, weightUnit: 'kg', height: 181, heightUnit: 'cm' }
    }], {
      weight: 70,
      weightUnit: 'kg',
      updated_at: '2026-07-23T10:00:00Z'
    })

    expect(selectLatestMeasurements(entries)).toEqual({
      measurements: {
        weight: 70,
        weightUnit: 'kg',
        height: 181,
        heightUnit: 'cm'
      },
      updatedAt: '2026-07-23T10:00:00.000Z'
    })
  })

  it('preserves unrelated posting metadata and profile fields', () => {
    const existing = {
      app: 'peakd/1.0',
      profile: { name: 'Alice', website: 'https://example.com' }
    }
    const measurements = { weight: 72, updated_at: '2026-07-22T10:00:00.000Z' }

    expect(buildMeasurementsMetadata(existing, measurements)).toEqual({
      app: 'peakd/1.0',
      profile: {
        name: 'Alice',
        website: 'https://example.com',
        actifit_measurements: measurements
      }
    })
  })
})
