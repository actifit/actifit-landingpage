import ProfilePage from '~/pages/_username/index.vue'

const { broadcastUpdate, saveMeasurements } = ProfilePage.methods

describe('profile metadata updates', () => {
  it('preserves freshly fetched json_metadata when updating profile fields', async () => {
    const processTrx = jest.fn().mockResolvedValue({ success: true })
    const context = {
      user: { account: { name: 'alice' } },
      textAreaLocationValue: 'Paris',
      textAreaDescriptionValue: 'Runner',
      textAreaLinkValue: 'https://example.com',
      textAreaUsernameValue: 'Alice',
      getProfileMetadata: () => ({ profile: { cover_image: 'cover.jpg' } }),
      getLiveAccountJsonMetadata: jest.fn().mockResolvedValue('{"legacy":"keep-me"}'),
      $processTrxFunc: processTrx
    }

    await broadcastUpdate.call(context, null, 'description')

    expect(processTrx).toHaveBeenCalledWith('account_update2', expect.objectContaining({
      json_metadata: '{"legacy":"keep-me"}'
    }))
  })

  it('preserves freshly fetched json_metadata when saving measurements', async () => {
    const processTrx = jest.fn().mockResolvedValue({ success: true })
    const context = {
      user: { account: { name: 'alice' } },
      userinfo: { json_metadata: '' },
      measurementDraft: { weight: '70', weightUnit: 'kg' },
      measurementSaveError: '',
      savingMeasurements: false,
      getProfileMetadata: () => ({ profile: { name: 'Alice' } }),
      getLiveAccountJsonMetadata: jest.fn().mockResolvedValue('{"legacy":"keep-me"}'),
      $processTrxFunc: processTrx,
      applyMeasurementSources: jest.fn(),
      turnMeasurementsEditOff: jest.fn(),
      $notify: jest.fn(),
      $t: key => key
    }

    await saveMeasurements.call(context)

    expect(processTrx).toHaveBeenCalledWith('account_update2', expect.objectContaining({
      json_metadata: '{"legacy":"keep-me"}'
    }))
  })
})
