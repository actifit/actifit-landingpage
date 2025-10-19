<template>
  <div :id="modalId" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ modalTitle }} <img :src="tokenLogo" class="mr-2 token-logo" @error="handleImageError"></h5>

          <div v-if="canShowBalanceTypeDropdown" class="ml-auto mr-3">
            <select v-model="selectedBalanceOption" @change="fetchTopHolders" class="form-control form-control-sm">
              <option value="balance">{{ $t('Balance') }}</option>
              <option value="savings_balance">{{ $t('Savings') }}</option>
            </select>
          </div>

          <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="clearData">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="loading" class="text-center">
            <i class="fas fa-spin fa-spinner fa-2x text-brand"></i>
          </div>
          <div v-else-if="error" class="text-center text-danger">
            <p>{{ $t('Error_fetching_data') }}: {{ error }}</p>
          </div>
          <div v-else-if="!holdersList || holdersList.length === 0" class="text-center text-info">
            <p>{{ $t('No_data_found_for_top_holders') }}</p>
          </div>
          <table v-else class="table table-hover">
            <thead class="text-brand">
              <tr>
                <th scope="col">{{ $t('Rank') }}</th>
                <th scope="col">{{ $t('User') }}</th>
                <th scope="col">{{ $t(balanceDisplayNameKey) }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(topHolder, key) in holdersList" :key="key" :class="{'bg-danger': user === topHolder.account, 'text-white': user === topHolder.account}">
                <td>{{ topHolder.rank }}</td>
                <td>
                  <!-- Check if account is truthy AND not the string 'null' before rendering link -->
                  <a v-if="topHolder.account && topHolder.account !== 'null'" :href="`https://actifit.io/@${topHolder.account}`" target="_blank" :class="{'text-white': user === topHolder.account}">
                    @{{ topHolder.account }}
                  </a>
                  <!-- If account is null (or the string 'null'), display 'null' -->
                  <span v-else>null</span>
                </td>
                <td>{{ formatBalance(topHolder.value) }} {{ displayCoinSymbol }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios';

  export default {
    props: {
      modalId: {
        type: String,
        required: true
      },
      coinType: {
        type: String, // e.g., 'HIVE', 'HBD', 'AFIT'
        required: true
      },
      balanceType: {
        type: String, // e.g., 'balance', 'hp_vests', 'hbd_balance'
        required: true
      },
      user: {
        type: String, // Current logged-in user, for highlighting
        default: ''
      },
      modalTitleKey: { // i18n key for modal title, e.g., 'top_afit_holders_title'
        type: String,
        required: true
      },
      tokenLogoPath: { // Path to the token logo, e.g., '/img/actifit_logo.png'
        type: String,
        required: true
      },
      balanceDisplayNameKey: { // i18n key for table header, e.g., 'Afit_Bal', 'Hive_Bal'
        type: String,
        default: 'Balance'
      },
      coinSymbolKey: { // i18n key for token symbol, e.g., 'AFIT', 'HIVE', 'HP'
        type: String,
        default: ''
      },
      // Divisor for converting raw API 'value' to displayable amount
      divisor: {
        type: Number,
        default: 1
      },
      // Precision for number formatting
      precision: {
        type: Number,
        default: 5
      }
    },
    data() {
      return {
        holdersList: [],
        loading: false,
        error: null,
        localTokenLogoPath: this.tokenLogoPath,
        selectedBalanceOption: 'balance',
      };
    },
    computed: {
      modalTitle() {
        return this.$t(this.modalTitleKey);
      },
      tokenLogo() {
        return this.localTokenLogoPath;
      },
      displayCoinSymbol() {
        if (this.coinSymbolKey) {
          return this.$t(this.coinSymbolKey);
        }
        if (this.balanceType === 'hp_vests') {
          return this.$t('HP');
        }
        return this.$t(this.coinType.toUpperCase());
      },
      canShowBalanceTypeDropdown() {
        // Show dropdown for HIVE and HBD *if* the modal's primary balanceType prop is 'balance'
        // This hides it for AFIT and HP modals, where savings_balance is not applicable or always 'balance'.
        return (this.coinType === 'HIVE' || this.coinType === 'HBD') && this.balanceType === 'balance';
      },
      apiBalanceType() {
        if (this.balanceType === 'hp_vests') {
          // HP (vests) always uses 'balance' for the API's balance-type parameter
          return 'balance';
        }
        // For other coinTypes (HIVE/HBD balance), use the selected dropdown option
        return this.selectedBalanceOption;
      },
      apiCoinType() {
        if (this.balanceType === 'hp_vests') {
          // HP (vests) always maps to coin-type 'HIVE' in the API
          return 'HIVE';
        }
        return this.coinType; // For other coins, use the prop value
      }
    },
    mounted() {
      if (process.client) {
        $(this.$el).on('show.bs.modal', this.fetchTopHolders);
      }
    },
    beforeDestroy() {
      if (process.client) {
        $(this.$el).off('show.bs.modal', this.fetchTopHolders);
      }
    },
    methods: {
      async fetchTopHolders() {
        this.loading = true;
        this.error = null;
        this.holdersList = [];

        try {
          let actualBalanceType = this.balanceType;
          let actualCoinType = this.coinType;

          if (this.balanceType === 'hp_vests') {
            actualBalanceType = 'balance';
            //actualCoinType = 'HIVE';
          }

          const response = await axios.get('https://api.syncad.com/balance-api/top-holders', {
            params: {
              'coin-type': this.apiCoinType,    // Use computed property
              'balance-type': this.apiBalanceType, // Use computed property
              page: 1,
            },
          });

          this.holdersList = response.data.map(holder => {
            let processedValue = parseFloat(holder.value);

            if (!isNaN(processedValue) && this.divisor) {
                if (this.balanceType === 'hp_vests') {
                    processedValue /= 1000000;
                    // For HP (VESTS), we MULTIPLY by the hivePerVestsRatio
                    processedValue *= this.divisor;
                } else if (this.divisor !== 1) {
                    // For HIVE/HBD, we DIVIDE the large integer value (e.g., by 1000)
                    processedValue /= this.divisor;
                }
            } else if (isNaN(processedValue)) {
                processedValue = 0;
            }

            return {
              rank: holder.rank || null,
              account: holder.account || this.$t('Unknown_User'),
              value: processedValue
            };
          });

        } catch (err) {
          console.error("Error fetching top holders:", err);
          this.error = err.message || 'Unknown error';
        } finally {
          this.loading = false;
        }
      },
      formatBalance (number) {
        const num = parseFloat(number);
        if (isNaN(num)) {
          return '0.00000';
        }
        return new Intl.NumberFormat('en-EN', { maximumFractionDigits : this.precision, minimumFractionDigits: 0 }).format(num)
      },
      handleImageError() {
        this.localTokenLogoPath = '/img/placeholder_token.png';
      },
      clearData() {
        this.holdersList = [];
        this.loading = false;
        this.error = null;
        this.localTokenLogoPath = this.tokenLogoPath;
      }
    }
  }
</script>

<style scoped>
  .token-logo{
    width: 40px;
    height: 40px;
  }
  @media screen and (max-width: 600px){
    .table td, .table th{
      padding: .3rem;
    }
  }
</style>
