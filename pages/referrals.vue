<template>
  <div>
    <NavbarBrand />

    <div class="container pt-5 mt-5 pb-5" v-if="user">

      <ListHeadingSection :textualDisplay="$t('Referrals')" />

      <div class="text-left">
        <h3 class="mb-4" v-if="user">{{ $t('Hey') }} {{ user.account.name }}!</h3>
		    <div class="" v-html="$t('referral_notice')"></div>
        <h5>{{ $t('Your_Referral_Link') }}</h5>
		    <input type="text" :class="smallScreenClasses" class="p-3" name="refLink" ref="refLink" id="referral-link" :value="refUrl" readonly/>
		    <button v-on:click="copyContent" data-targetEl="refLink" class="btn btn-brand p-3">{{ $t('Copy_Link') }}</button>
		    <div class="text-brand">
          <span class="share-txt">{{ $t('Share') }} </span>
          <social-sharing :url="refUrl"
						  :title="socialSharingTitle"
						  description="Signup to Actifit, the mobile dapp that incentivizes healthy lifestyle and rewards your everyday activity "
						  quote="Signup to Actifit, the mobile dapp that incentivizes healthy lifestyle and rewards your everyday activity"
						  :hashtags="hashtags"
						  twitter-user="actifit_fitness"
						  inline-template>
          <div class="share-links-actifit text-left">
              <network network="facebook">
              <i class="fab fa-facebook" title="facebook"></i>
              </network>
              <network network="twitter">
              <i class="fab fa-x-twitter" title="X (twitter)"></i>
              </network>
              <network network="telegram">
              <i class="fab fa-telegram" title="telegram"></i>
              </network>
              <network network="whatsapp">
              <i class="fab fa-whatsapp" title="whatsapp"></i>
              </network>
              <network network="linkedin">
              <i class="fab fa-linkedin" title="linkedin"></i>
              </network>
              <network network="reddit">
              <i class="fab fa-reddit" title="reddit"></i>
              </network>
              <network network="skype">
              <i class="fab fa-skype" title="skype"></i>
              </network>
              <network network="sms">
              <i class="fas fa-comment" title="SMS"></i>
              </network>
              <network network="email">
                <i class="fa fa-envelope" title="email"></i>
              </network>
            </div>
          </social-sharing>
        </div>
      </div>

    <!-- Free signup links section-->
    <div >
        <h4 class="text-left mt-5">{{ $t('Referral_Free_Signup_Links') }}</h4>
        <p>{{ $t('referral_free_signup_links_notice') }}</p>
        <!-- claim button to claim new signup links-->
        <div v-if="hasClaimableLinks.status">
          <button  v-on:click="claimSignupLinks" class="btn btn-brand p-3">{{ $t('Claim_free_links') }}</button>
        </div>
        <div v-else>
          <!-- otherwise display existing links -->
          <div v-for="(link, index) in freeLinks" :key="index" :link="link">
            <h5>{{ $t('Free_referral_link').replace('_COUNT_', index+1) }}</h5>
            <input type="text" :class="smallScreenClasses" class="p-3" :name="'freeRefLnk'+index" :ref="'freeRefLnk'+index" :id="'freeRefLnk_'+index" :value="refUrl+'&promo='+link.code" readonly/>
            <button v-on:click="copyContent" :data-targetEl="'freeRefLnk'+index" class="btn btn-brand p-3">{{ $t('Copy_Link') }}</button>
          </div>
        </div>
      </div>


	  <!-- Referral Reward Calculation -->
	  <div class="">
        <h3 class="text-left mt-5">{{ $t('Referral_Reward_Breakdown') }}</h3>
        <div class="text-left">
			  <b><i class="fas fa-check text-success m-lg-3"></i>
			  {{ $t('referral_default_reward') }}</b>
        </div>
        <div class="text-left">
          <b><i class="fas fa-check text-success m-lg-3"></i>
          {{ totalPercentBonus }} {{ $t('referral_monthly_reward') }}:</b>
        </div>
        <div class="text-left pl-4">
          <i class="fas fa-check text-success m-lg-3"></i>
          {{ $t('referral_rec_default_reward') }}
        </div>
        <div class="text-left pl-4">
          <i class="fas fa-check text-success m-lg-3" v-if="this.userRank>=this.userRankMin"></i>
          <i class="fas fa-times text-danger m-lg-3" v-else></i>
          {{ $t('referral_user_rank_reqt') }}
          <div v-if="this.userRank<this.userRankMin" class="text-brand">
            {{ $t('missing_reqt_value').replace('_AMNT_', this.userRankMin-this.userRank).replace('_UNIT_', 'points') }}
          </div>
        </div>
        <div class="text-left pl-4">
          <i class="fas fa-check text-success m-lg-3" v-if="this.userTokens>=this.userTokensMin"></i>
          <i class="fas fa-times text-danger m-lg-3" v-else></i>
          {{ $t('referral_afit_bal') }}
          <div v-if="this.userTokens<this.userTokensMin" class="text-brand">
            {{ $t('missing_reqt_value').replace('_AMNT_', this.userTokensMin-this.userTokens).replace('_UNIT_', 'AFIT') }}
          </div>
        </div>
        <div class="text-left pl-4">
          <i class="fas fa-check text-success m-lg-3" v-if="this.afitx_balance>=this.afitxMin"></i>
          <i class="fas fa-times text-danger m-lg-3" v-else></i>
          {{ $t('referral_afitx_bal') }}
          <div v-if="this.afitx_balance<this.afitxMin" class="text-brand">
            {{ $t('missing_reqt_value').replace('_AMNT_', this.afitxMin-this.afitx_balance).replace('_UNIT_', 'AFITX') }}
          </div>
        </div>
        <a href="/wallet" class="btn btn-brand btn-lg border w-25">{{ $t('Wallet') }}</a><a href="/userrank" class="btn btn-brand btn-lg border w-25">{{ $t('User_rank_details') }}</a>
      </div>


      <!-- Referrals -->
      <div class="">
        <h4 class="text-left mt-5">{{ $t('My_Referrals') }} {{ referrals.length>0?'('+referrals.length+')':'' }}</h4>
        <Referral v-for="(referral, index) in referrals" :key="index" :referral="referral" />
        <div class="text-left"><small class="text-muted" v-if="referrals.length === 0">{{ $t('No_referrals_notice') }}</small></div>
      </div>
    </div>

	<div :class="smallScreenClasses" class="container mt-5 pb-5 pt-5" v-else>
      <!-- account balance -->
      <div class="text-center p-5">
		<div class="row pb-3">
		  <div class="text-center text-brand w-100 lead">
		    {{ $t('login_required_referrals') }}
		  </div>
		</div>
		<div class="row pb-3">
		  <div class="w-50">
			<a href="#" data-toggle="modal" data-target="#loginModal" @click="showModalFunc" class="btn btn-brand btn-lg w-75">{{ $t('Login') }}</a>
		  </div>
		  <div class="w-50">
			<a href="/signup" class="btn btn-brand btn-lg w-75">{{ $t('Sign_Up') }}</a>
		  </div>
		</div>
	  </div>
	</div>

    <Footer />
	<LoginModal v-if="showModal" @close="showModal = false" />
  </div>
</template>

<script>
  import NavbarBrand from '~/components/NavbarBrand'
  import Referral from '~/components/Referral'
  import Footer from '~/components/Footer'
  import LoginModal from '~/components/LoginModal'
  import ListHeadingSection from '~/components/ListHeadingSection';

  import SocialSharing from 'vue-social-sharing'

  import { mapGetters } from 'vuex'

  import SSC from 'sscjs'

  const ssc = new SSC(process.env.steemEngineRpc);

  const hsc = new SSC(process.env.hiveEngineRpc);

  export default {
	head () {
		return {
		  title: `Actifit Referrals - Actifit.io`,
		  meta: [
			{ hid: 'description', name: 'description', content: `Referrals page for actifit users` },
			{ hid: 'ogdescription', name: 'og:description', content: `Referrals page for actifit users` }
		  ]
		}
	},
    components: {
      NavbarBrand,
      Referral, // single referral block
      Footer,
	    SocialSharing,
	    LoginModal,
      ListHeadingSection
    },
	data (){
	  return {
		showModal: false,
    refUrl: '',
		screenWidth: 1200,
		afitx_he_balance: 0,
		afitx_se_balance: 0,
		afitx_balance: 0,
		userTokensMin: 50000,
		userRankMin: 30,
		afitxMin: 50,
		socialSharingTitle: process.env.socialSharingTitle,
		socialSharingDesc: process.env.socialSharingDesc,
		socialSharingQuote: process.env.socialSharingQuote,
		hashtags: process.env.socialSharingHashtags,
    hasClaimableLinks: true,
    freeLinks: [],
	  }
	},
    computed: {
      ...mapGetters('steemconnect', ['user']),
      ...mapGetters(['userTokens', 'referrals', 'userRank']),
	  displayUserRank () {
		return this.userRank
	  },
	  smallScreenClasses () {
		//use proper classes for neat display
		if (this.screenWidth < 768){
		  return "w-100";
		}
		return "w-50";
	  },
	  totalPercentBonus () {
		return 20 + (this.userRank>=this.userRankMin?5:0) + (this.userTokens>=this.userTokensMin?5:0) + (this.afitx_balance>=this.afitxMin?5:0) + '%';
	  }
    },
    async mounted () {
	  this.screenWidth = screen.width;
	  this.fetchUserInfo();
    },
	created () {
	  this.$store.dispatch('steemconnect/login')
	},
	watch: {
	  user : 'fetchUserInfo'
	},
	methods: {
	  copyContent (event) {
		  /* Get the text field */
		  var copyText = this.$refs[event.currentTarget.getAttribute('data-targetEl')];
      /* Select the text field */
      if (Array.isArray(copyText)){
        copyText[0].select();
      }else{
        copyText.select();
      }
		  /* Copy the text inside the text field */
		  document.execCommand("copy");
		  return;
	  },
	  showModalFunc() {
		this.$nextTick(() => {
			this.showModal = true;
			// If you're still using jQuery, make sure it's properly imported
			if ($ && typeof $.fn.modal === 'function') {
			$('#loginModal').modal('show');
			}
		});
		},
	  async fetchUserInfo () {
		if (typeof this.user != 'undefined' && this.user != null){
		  this.$store.dispatch('fetchUserTokens')
		  this.$store.dispatch('fetchReferrals')
		  this.$store.dispatch('fetchUserRank')

      this.hasClaimableLinks = await this.$store.dispatch('fetchClaimableSignupLinks');
      if (!this.hasClaimableLinks || !this.hasClaimableLinks.status){
        this.loadSignupLinks();
      }
		  let baseUrl = window.location.origin;
		  this.refUrl = baseUrl + '/signup?referrer=' + this.user.account.name;
		  this.fetchAFITXSE();
		  this.fetchAFITXHE();
		}
	  },
	  fetchAFITXSE() {
		  let parnt = this
		  ssc.findOne('tokens', 'balances', { account: this.user.account.name, symbol: 'AFITX' }).then(
				function(bal) {


					if (bal){
						  parnt.afitx_se_balance = bal.balance;
						  parnt.afitx_balance = parseFloat(parnt.afitx_he_balance)+parseFloat(parnt.afitx_se_balance)
					  }
				}
			)
	  },
	  fetchAFITXHE() {
		  let parnt = this
		  hsc.findOne('tokens', 'balances', { account: this.user.account.name, symbol: 'AFITX' }).then(
				function(bal) {


					if (bal){
						  parnt.afitx_he_balance = bal.balance;
						  parnt.afitx_balance = parseFloat(parnt.afitx_he_balance)+parseFloat(parnt.afitx_se_balance)
					  }
				}
			)
	  },
    async claimSignupLinks(){
      let outcome = await this.$store.dispatch('claimSignupLinks');
      if (outcome.status && outcome.status == 'success'){
        this.$notify({
				  group: 'success',
				  text: this.$t('Claim_links_success'),
				  position: 'top center'
				})
        this.hasClaimableLinks = false;
        //fetch new signup links

      }else{
        this.$notify({
				  group: 'error',
				  text: this.$t('error'),
				  position: 'top center'
				})
      }
    },
    async loadSignupLinks(){
      try {

        let accToken = localStorage.getItem('access_token')

        let url = new URL(process.env.actiAppUrl + 'myFreeSignupLinks/?user=' + this.user.account.name.toLowerCase());

				let reqHeads = new Headers({
				  'Content-Type': 'application/json',
				  'x-acti-token': 'Bearer ' + accToken,
				});
				let res = await fetch(url, {
					//method: 'POST',
					headers: reqHeads,
					//body: JSON.stringify({'operation': JSON.stringify(operation), 'active': this.userActvKey})
				});

        if (!res.ok) {
          this.$notify({
            group: 'error',
            text: this.$t('error'),
            position: 'top center'
          })
          return;
        }
				const json = await res.json();
        if (json && Array.isArray(json.result)) {
					this.freeLinks = json.result;
				}else{
					this.freeLinks = [];
				}
      } catch (error) {
        console.error("Error fetching user signup links:", error);
        this.freeLinks = [];
      }
    }
	},
  }
</script>
<style>
	#referral-link{
	  border-color: #ff112d;
	}
	.share-links-actifit span{
	  cursor: pointer;
	  font-size: 22px;
	  padding: 5px;
	}
	.share-txt {
	  font-size: 20px;
	}
</style>
