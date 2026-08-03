import Product from '~/components/Product.vue'

describe('Product owned gadget counts', () => {
  it('only exposes provider attribution when a provider name exists', () => {
    expect(Product.computed.providerName.call({ product: { provider_name: '  Alice  ' } })).toBe('Alice')
    expect(Product.computed.providerName.call({ product: { provider_name: '   ' } })).toBe('')
    expect(Product.computed.providerName.call({ product: {} })).toBe('')

    expect(Product.computed.hasProviderName.call({ providerName: 'Alice' })).toBe(true)
    expect(Product.computed.hasProviderName.call({ providerName: '' })).toBe(false)
  })

  it('counts bought, inactive, and deactivated gadget inventory', () => {
    const context = {
      user: { account: { name: 'alice' } },
      product: { _id: 'gadget-1', type: 'ingame' },
      gadgetStats: [
        { _id: { gadget: 'gadget-1', status: 'bought' }, count: 2 },
        { _id: { gadget: 'gadget-1', status: 'inactive' }, count: 1 },
        { _id: { gadget: 'gadget-1', status: 'deactivated' }, count: 3 },
        { _id: { gadget: 'gadget-1', status: 'consumed' }, count: 4 },
        { _id: { gadget: 'another-gadget', status: 'bought' }, count: 5 }
      ]
    }

    expect(Product.computed.inactiveCount.call(context)).toBe(6)
  })

  it('includes inactive inventory in the total bought count', () => {
    expect(Product.computed.boughtCount.call({
      user: { account: { name: 'alice' } },
      product: { type: 'ingame' },
      gadgetStats: [{}],
      consumedCount: 4,
      inactiveCount: 2,
      activeCount: 1
    })).toBe(7)
  })
})
