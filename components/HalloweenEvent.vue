
<template>
  <div class="halloween-event">
    <div class="event-header">
      <h2 class="event-title">{{ $t('special_halloween_event') }}</h2>
      <p class="event-subtitle">{{ $t('halloween_subtitle') }}</p>
    </div>
    <div class="products-grid">
      <Product v-for="product in halloweenProducts"
        :product="product"
        :key="product._id"
        :pros="professionals"
        :userrank="userRank"
        :gadgetStats="gadgetStats"
        :realProducts="realProducts"
        :expandAll="expandAllStatus"
        @update-prod="updateProd"
        :afitPrice="afitPrice"
        @refresh-tickets="refreshTickets"
        class="halloween-product"
      />
    </div>
  </div>
</template>

<script>
import Product from '~/components/Product';

export default {
  name: 'HalloweenEvent',
  components: {
    Product,
  },
  props: {
    products: {
      type: Array,
      default: () => [],
    },
    professionals: {
      type: Array,
      default: () => [],
    },
    userRank: {
      type: [String, Number],
      default: '',
    },
    gadgetStats: {
      type: Array,
      default: () => ([]),
    },
    realProducts: {
      type: Array,
      default: () => [],
    },
    expandAllStatus: {
      type: String,
      default: '',
    },
    afitPrice: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    halloweenProducts() {
      return this.products.filter(p => p.specialevent && p.event === 'Halloween');
    },
  },
  methods: {
    updateProd(prod) {
      this.$emit('update-prod', prod);
    },
    refreshTickets() {
      this.$emit('refresh-tickets');
    },
  },
};
</script>

<style scoped src="~/assets/css/halloween-event.css"></style>
