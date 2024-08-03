<template>
	<!-- login link or user dropdown menu when logged in, for navbar-->
	<div class="row p-2">
		<div class="col-sm-9"></div>
		<div class="col-sm-3">
		  <select class="form-control sel-adj border-red rounded-top rounded-bottom" v-model="cur_bchain" @change="setActiveChain($event)">
			<option value=""><i>--Active Chain--</i></option>
			<option value="HIVE" :selected="cur_bchain == 'HIVE' ? 'true' : 'false'">Hive</option> 
			<!--<option value="STEEM" :selected="cur_bchain == 'STEEM' ? 'true' : 'false'">Steem</option> -->
			<option value="BLURT" :selected="cur_bchain == 'BLURT' ? 'true' : 'false'">Blurt</option>
		  </select>
		</div>
	</div>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
	components: {
	  
    },
	data () {
		return {
			cur_bchain: 'HIVE',
			prior_chain: '',
			reload: 0,
		}
	},
	watch: {
	  // user: 'updateUserData',
	  bchain: function(newBchain) {
		//console.log('change in chain');
		this.cur_bchain = newBchain;
		this.prior_chain = newBchain;
		this.$store.dispatch('steemconnect/refreshUser');
		this.reload += 1;
	  }
	},
    computed: {
      ...mapGetters('steemconnect', ['user']),
      ...mapGetters(['bchain']),
	  
	  
    },
	methods: {
	  /**
       * Formats numbers with commas and dots.
       *
       * @param number
	   * @param precision
       * @returns {string}
       */
      numberFormat (number, precision) {
        return new Intl.NumberFormat('en-EN', { maximumFractionDigits : precision}).format(number)
      },
	  
	  setActiveChain(event){
		console.log(event.target.value);
		console.log(this.cur_bchain);
		let chain = event.target.value;
		if (this.cur_bchain == this.prior_chain){
			//take no action if no change in chain
			return;
		}
		let userConf = confirm(this.$t('confirm_chain_switch').replace('_CHAIN_', chain));
		if (!userConf) {
		  this.cur_bchain = this.prior_chain;
		  console.log(this.cur_bchain);
		  return;
		}
		this.prior_chain = chain;
		this.$store.commit('setBchain', this.cur_bchain);
		
		localStorage.setItem('cur_bchain', this.cur_bchain);
		
		this.profImgUrl = process.env.hiveImgUrl;
		/*if (this.cur_bchain == 'STEEM'){
			this.profImgUrl = process.env.steemImgUrl;
		}*/
	  },
	  
	  
	},
    async mounted () {
		
		//grab current active chain
		if (localStorage.getItem('cur_bchain')){
			this.cur_bchain = localStorage.getItem('cur_bchain')
			this.prior_chain = this.cur_bchain;
		}
		
		
		/*this.profImgUrl = process.env.hiveImgUrl;
		if (this.cur_bchain == 'STEEM'){
			this.profImgUrl = process.env.steemImgUrl;
		}*/
		
		/* this.updateUserData()
		
		//fetch new notifications every minute
		setInterval(this.updateUserData, 60000); */
    },
  }
</script>

<style lang="sass">
.user-menu-container
  height: 54px
  top: 0
  right: 6px
  .user-menu
    .user-avatar
      width: 40px
      height: 40px
      background-position: center center
      background-size: cover
      border-radius: 50%
      border: solid 1px #ddd
    .dropdown-toggle::after
      display: none
    .navbar-text
      font-size: .8rem
    .dropdown-menu
      position: absolute
      right: 0
      left: auto
</style>
<style>
	#user_menu_navlink{
		height: 40px;
	}
	.increased-rank{
		color: #76BB0E;
	}
	.group-class{
		margin-left: 0px !important;
		display: inline-block;
	}
	.notification-class{
		background-color: red;
		color: white !important;
		display: inline-block;
		text-align: center;
		font-size: 12px;
		width: auto;
		min-width: 20px;
	}
	.group-class.user-avatar-notif-menu{
		float: left;
	}
	.user-avatar{
		text-align: center;
	}
	.user-avatar-medium{
		width: 30px !important;
		height: 30px !important;
		text-align: center;
		position: absolute;
		float: right;
	}
	.notif-container{
		max-height: 300px;
		overflow-y: auto;
		overflow-x: hidden;
	}
	.option-opaque{
		opacity: 0.3;
	}
	@keyframes spin {
		0% {
			transform: rotateZ(0);
		}
		100% {
			transform: rotateZ(360deg);
		}
	}
	.span-toggle-chain{
		font-size: 1.2rem;
	}
</style>
