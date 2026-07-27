import ProfilePage from '~/pages/_username/index.vue'

<<<<<<< Updated upstream
const { broadcastUpdate, getLiveProfileMetadata, saveMeasurements } = ProfilePage.methods
=======
const { broadcastUpdate, proceedLogout, saveMeasurements } = ProfilePage.methods

describe('profile account actions', () => {
  it('clears the standard login state and dispatches logout', () => {
    const originalProcessClient = process.client
    process.client = true
    localStorage.setItem('std_login', 'true')
    localStorage.setItem('std_login_name', 'alice')

    const context = {
      $store: {
        commit: jest.fn(),
        dispatch: jest.fn()
      }
    }

    try {
      proceedLogout.call(context)

      expect(context.$store.commit).toHaveBeenCalledWith('setStdLoginUser', false)
      expect(localStorage.getItem('std_login')).toBeNull()
      expect(localStorage.getItem('std_login_name')).toBeNull()
      expect(context.$store.dispatch).toHaveBeenCalledWith('steemconnect/logout')
    } finally {
      process.client = originalProcessClient
      localStorage.clear()
    }
  })
})
>>>>>>> Stashed changes

describe('profile metadata updates', () => {
  it('reads freshly fetched posting metadata before saving', async () => {
    const context = {
      user: { account: { name: 'alice' } },
      setProperNode: () => ({
        api: {
          getAccounts: (accounts, callback) => callback(null, [{
            posting_json_metadata: '{"app":"peakd/2.0","profile":{"name":"Alice"}}'
          }])
        }
      }),
      $t: key => key
    }

    await expect(getLiveProfileMetadata.call(context)).resolves.toEqual({
      app: 'peakd/2.0',
      profile: { name: 'Alice' }
    })
  })

  it('handles malformed freshly fetched posting metadata safely', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    const context = {
      user: { account: { name: 'alice' } },
      setProperNode: () => ({
        api: {
          getAccounts: (accounts, callback) => callback(null, [{ posting_json_metadata: '{bad-json' }])
        }
      }),
      $t: key => key
    }

    await expect(getLiveProfileMetadata.call(context)).resolves.toEqual({})
    consoleError.mockRestore()
  })

  it('uses posting authority without changing legacy metadata when updating profile fields', async () => {
    const processTrx = jest.fn().mockResolvedValue({ success: true })
    const context = {
      user: { account: { name: 'alice' } },
      textAreaLocationValue: 'Paris',
      textAreaDescriptionValue: 'Runner',
      textAreaLinkValue: 'https://example.com',
      textAreaUsernameValue: 'Alice',
      getProfileMetadata: () => ({ profile: { cover_image: 'cover.jpg' } }),
      $processTrxFunc: processTrx
    }

    await broadcastUpdate.call(context, null, 'description')

    expect(processTrx).toHaveBeenCalledWith(
      'account_update2',
      expect.objectContaining({ json_metadata: '' }),
      false
    )
  })

  it('uses posting authority without changing legacy metadata when saving measurements', async () => {
    const processTrx = jest.fn().mockResolvedValue({ success: true })
    const context = {
      user: { account: { name: 'alice' } },
      userinfo: { json_metadata: '' },
      measurementDraft: { weight: '70', weightUnit: 'kg' },
      measurementSaveError: '',
      savingMeasurements: false,
      getLiveProfileMetadata: jest.fn().mockResolvedValue({
        app: 'peakd/2.0',
        profile: { name: 'Alice', cover_image: 'cover.jpg' }
      }),
      $processTrxFunc: processTrx,
      applyMeasurementSources: jest.fn(),
      turnMeasurementsEditOff: jest.fn(),
      $notify: jest.fn(),
      $t: key => key
    }

    await saveMeasurements.call(context)

    expect(processTrx).toHaveBeenCalledWith(
      'account_update2',
      expect.objectContaining({ json_metadata: '' }),
      false
    )
    const transaction = processTrx.mock.calls[0][1]
    expect(JSON.parse(transaction.posting_json_metadata)).toMatchObject({
      app: 'peakd/2.0',
      profile: { name: 'Alice', cover_image: 'cover.jpg', actifit_measurements: { weight: 70 } }
    })
  })

  it('shows the backend transaction error when saving measurements fails', async () => {
    const context = {
      user: { account: { name: 'alice' } },
      userinfo: {},
      measurementDraft: { weight: '70', weightUnit: 'kg' },
      measurementSaveError: '',
      savingMeasurements: false,
      getLiveProfileMetadata: jest.fn().mockResolvedValue({ profile: {} }),
      $processTrxFunc: jest.fn().mockResolvedValue({ success: false, error: 'missing required posting authority' }),
      applyMeasurementSources: jest.fn(),
      turnMeasurementsEditOff: jest.fn(),
      $notify: jest.fn(),
      $t: key => key
    }

    await saveMeasurements.call(context)

    expect(context.measurementSaveError).toBe('missing required posting authority')
    expect(context.applyMeasurementSources).not.toHaveBeenCalled()
    expect(context.savingMeasurements).toBe(false)
  })
})
