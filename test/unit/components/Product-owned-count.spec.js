import Product from '~/components/Product.vue'

describe('Product owned gadget counts', () => {
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
