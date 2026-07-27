const MEASUREMENT_KEYS = ['height', 'weight', 'chest', 'waist', 'thighs', 'bodyfat']
const MEASUREMENT_SAVE_TIMEOUT_MS = 120000
const MEASUREMENT_UNIT_OPTIONS = {
  height: ['cm', 'in'],
  weight: ['kg', 'lb'],
  chest: ['cm', 'in'],
  waist: ['cm', 'in'],
  thighs: ['cm', 'in']
}

export function normalizeMeasurementUnit (key, unit) {
  const options = MEASUREMENT_UNIT_OPTIONS[key]
  if (!options) return ''

  const normalized = String(unit || '').trim().toLowerCase()
  const aliases = {
    centimeters: 'cm',
    centimetres: 'cm',
    centimeter: 'cm',
    centimetre: 'cm',
    inches: 'in',
    inch: 'in',
    kilograms: 'kg',
    kilogram: 'kg',
    kgs: 'kg',
    pounds: 'lb',
    pound: 'lb',
    lbs: 'lb'
  }
  const matchedUnit = aliases[normalized] || normalized
  return options.includes(matchedUnit) ? matchedUnit : options[0]
}

export function convertMeasurementValue (key, value, fromUnit, toUnit) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue) || fromUnit === toUnit) return value

  const supportedUnits = MEASUREMENT_UNIT_OPTIONS[key]
  if (!supportedUnits || !supportedUnits.includes(fromUnit) || !supportedUnits.includes(toUnit)) return value

  let convertedValue = numericValue
  if (fromUnit === 'cm' && toUnit === 'in') convertedValue = numericValue / 2.54
  else if (fromUnit === 'in' && toUnit === 'cm') convertedValue = numericValue * 2.54
  else if (key === 'weight' && fromUnit === 'kg' && toUnit === 'lb') convertedValue = numericValue * 2.2046226218
  else if (key === 'weight' && fromUnit === 'lb' && toUnit === 'kg') convertedValue = numericValue / 2.2046226218

  return Number(convertedValue.toFixed(2))
}

export function normalizeMeasurements (measurements) {
  if (!measurements || typeof measurements !== 'object') return null

  const normalized = {}
  MEASUREMENT_KEYS.forEach((key) => {
    const value = measurements[key]
    if (value !== '' && value !== null && typeof value !== 'undefined' && Number.isFinite(Number(value))) {
      normalized[key] = Number(value)
    }

    const unitKey = `${key}Unit`
    if (Object.prototype.hasOwnProperty.call(normalized, key) && key !== 'bodyfat') {
      normalized[unitKey] = normalizeMeasurementUnit(key, measurements[unitKey])
    }
  })

  if (!Object.keys(normalized).some(key => MEASUREMENT_KEYS.includes(key))) return null
  if (measurements.updated_at && !Number.isNaN(Date.parse(measurements.updated_at))) {
    normalized.updated_at = new Date(measurements.updated_at).toISOString()
  }

  return normalized
}

export function mergeMeasurementSources (reports = [], profileMeasurements) {
  const normalizedProfile = normalizeMeasurements(profileMeasurements)
  const reportEntries = Array.isArray(reports) ? reports.slice() : []

  if (!normalizedProfile || !normalizedProfile.updated_at) return reportEntries

  const profileEntry = {
    date: normalizedProfile.updated_at,
    json_metadata: normalizedProfile,
    source: 'profile'
  }

  return [profileEntry, ...reportEntries].sort((left, right) => {
    return new Date(right.date || 0).getTime() - new Date(left.date || 0).getTime()
  })
}

export function selectLatestMeasurements (entries = []) {
  const measurements = {}
  let updatedAt = '-'

  entries.forEach((entry) => {
    const source = entry && entry.json_metadata
    if (!source || typeof source !== 'object') return

    const sourceKeys = MEASUREMENT_KEYS.filter((key) => {
      const value = source[key]
      return value !== '' && value !== null && typeof value !== 'undefined' && Number.isFinite(Number(value))
    })
    if (!sourceKeys.length) return

    if (updatedAt === '-') updatedAt = entry.date || source.updated_at || '-'
    sourceKeys.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(measurements, key)) return

      measurements[key] = source[key]
      const unitKey = `${key}Unit`
      if (key !== 'bodyfat' && source[unitKey]) measurements[unitKey] = source[unitKey]
    })
  })

  return { measurements, updatedAt }
}

export function buildMeasurementsMetadata (existingMetadata = {}, measurements) {
  return {
    ...existingMetadata,
    profile: {
      ...(existingMetadata.profile || {}),
      actifit_measurements: measurements
    }
  }
}

export function waitForMeasurementSave (transactionPromise, timeoutError, timeoutMs = MEASUREMENT_SAVE_TIMEOUT_MS) {
  let timeoutId
  const timeoutResult = new Promise((resolve) => {
    timeoutId = setTimeout(() => resolve({ success: false, error: timeoutError }), timeoutMs)
  })

  return Promise.race([transactionPromise, timeoutResult]).finally(() => clearTimeout(timeoutId))
}

export { MEASUREMENT_KEYS, MEASUREMENT_SAVE_TIMEOUT_MS, MEASUREMENT_UNIT_OPTIONS }
