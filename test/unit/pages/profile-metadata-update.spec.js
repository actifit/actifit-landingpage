import ProfilePage from '~/pages/_username/index.vue'

const { broadcastUpdate, saveMeasurements } = ProfilePage.methods

describe('profile metadata updates', () => {
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
      getProfileMetadata: () => ({ profile: { name: 'Alice' } }),
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
  })

  it('shows the backend transaction error when saving measurements fails', async () => {
    const context = {
      user: { account: { name: 'alice' } },
      userinfo: {},
      measurementDraft: { weight: '70', weightUnit: 'kg' },
      measurementSaveError: '',
      savingMeasurements: false,
      getProfileMetadata: () => ({ profile: {} }),
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
