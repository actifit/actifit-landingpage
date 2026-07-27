const locales = {
  ar_AE: require('../../../lang/ar_AE'),
  de_DE: require('../../../lang/de_DE'),
  en_US: require('../../../lang/en_US'),
  es_ES: require('../../../lang/es_ES'),
  fr_FR: require('../../../lang/fr_FR'),
  hi_IN: require('../../../lang/hi_IN'),
  it_IT: require('../../../lang/it_IT'),
  ja_JP: require('../../../lang/ja_JP'),
  pl_PL: require('../../../lang/pl_PL'),
  pt_PT: require('../../../lang/pt_PT'),
  ru_RU: require('../../../lang/ru_RU'),
  tr_TR: require('../../../lang/tr_TR'),
  uk_UA: require('../../../lang/uk_UA'),
  zh_CN: require('../../../lang/zh_CN')
}

const profileLabelKeys = [
  'Height',
  'Body_Fat',
  'Waist',
  'Weight',
  'Chest',
  'Thighs',
  'Measurements_updated',
  'Measurements_saved',
  'Measurements_positive_values',
  'Measurements_one_required',
  'Not_Set',
  'Claimed',
  'Posh_connected',
  'accept_request',
  'request_sent',
  'unfriend',
  'Latest_Activity_Count',
  'Latest_Activity_Date'
]

describe('profile label translations', () => {
  test.each(Object.entries(locales))('%s defines every profile label', (localeName, messages) => {
    profileLabelKeys.forEach((key) => {
      expect(Object.prototype.hasOwnProperty.call(messages, key)).toBe(true)
      expect(typeof messages[key]).toBe('string')
      expect(messages[key].trim()).not.toBe('')
    })
  })

  test.each(Object.entries(locales))('%s does not display underscored translation keys', (localeName, messages) => {
    profileLabelKeys
      .filter(key => key.includes('_'))
      .forEach((key) => {
        expect(messages[key]).not.toBe(key)
        expect(messages[key]).not.toContain('_')
      })
  })

  it('uses human-readable English profile labels', () => {
    expect(profileLabelKeys.reduce((labels, key) => ({
      ...labels,
      [key]: locales.en_US[key]
    }), {})).toEqual({
      Height: 'Height',
      Body_Fat: 'Body Fat',
      Waist: 'Waist',
      Weight: 'Weight',
      Chest: 'Chest',
      Thighs: 'Thighs',
      Measurements_updated: 'Measurements updated',
      Measurements_saved: 'Measurements saved to your Hive profile.',
      Measurements_positive_values: 'Measurements must be positive numbers.',
      Measurements_one_required: 'Enter at least one measurement.',
      Not_Set: 'Not set',
      Claimed: 'Claimed',
      Posh_connected: 'POSH connected',
      accept_request: 'Accept request',
      request_sent: 'Request sent',
      unfriend: 'Unfriend',
      Latest_Activity_Count: 'Latest Activity Count',
      Latest_Activity_Date: 'Latest Activity Date'
    })
  })
})
