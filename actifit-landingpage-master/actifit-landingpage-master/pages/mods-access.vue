<template>
  <div>
    <NavbarBrand />

    <div class="container pt-5 mt-5 pb-5" v-if="isUserModerator">
		<div class="text-center">
			<h2>Moderator Interface</h2>
		</div>
		
		<div class="col-md-12 row-sep m-2">
			<h3 v-if="week==1">Moderator Current Week Stats</h3>
			<h3 v-else>Moderator Prior Week Stats</h3>
			<input type="button" value="Prior Week" v-on:click="moderatorStats = priorWeekStats; week=-1;topVotes=-1;topComments=-1;topVoter='';topCommentor=''">
			<input type="button" value="Current Week" v-on:click="moderatorStats = currentWeekStats; week=1;topVotes=-1;topComments=-1;topVoter='';topCommentor=''">
		</div>
		
		<div class="col-md-12 text-center" v-if="!Array.isArray(moderatorStats) || moderatorStats.length < 1"><i class="fas fa-spin fa-spinner text-brand"></i></div>
		
		<div v-else class="col-md-12 row-sep m-2">
			<table class="table table-hover">
				<thead class="text-brand">
				<tr>
				  <th scope="col">Moderator</th>
				  <th scope="col">Comment Count</th>
				  <th scope="col">Vote Count</th>
				</tr>
			  </thead>
			  <tbody>
				<tr v-for="(stat, index) in moderatorStats" v-bind:key="index" v-if="Array.isArray(stat.items) && stat.items.length>0" :class="checkTopRank(stat.items)">
					<td :class="{'bg-success': stat.items[0].user === topVoter || stat.items[0].user === topCommentor, 'text-white': stat.items[0].user === topVoter || stat.items[0].user === topCommentor}">@{{stat.items[0].user}}</td>
					<td :class="{'bg-success': stat.items[0].user === topVoter || stat.items[0].user === topCommentor, 'text-white': stat.items[0].user === topVoter || stat.items[0].user === topCommentor}">{{stat.items.filter(entry => entry.reward_activity === "Moderator Comment").length}}</td>
					<td :class="{'bg-success': stat.items[0].user === topVoter || stat.items[0].user === topCommentor, 'text-white': stat.items[0].user === topVoter || stat.items[0].user === topCommentor}">{{stat.items.filter(entry => entry.reward_activity === "Post Vote").length}}</td>
				</tr>
				</tbody>
			</table>
		</div>
		
		<div class="col-md-12 row-sep m-2">
			<h3>{{ $t('Hey') }} {{ user.account.name }}!</h3>
			<b>INPUT YOUR FUNDS PASSWORD</b><input type="password" name="fundsPass" ref="fundsPass">
		</div>
		
		<div class="col-md-12 row-sep m-2">
			<div class="row text-center action-title">VERIFY NEWBIE</div>
			<div :action='this.actiapimod' method="get" class="p-2">
			  User: <input type="text" id="newbieaccount" name="newbieaccount" ref="newbieaccount" value=""><br>
			  Social Media Verify Link: <input type="text" name="verif_link" ref="verif_link" value="https://" ><br>
			  <input type="button"  value="Verify Newbie" v-on:click="processAction('verifynewbie')">
			  <div ref="verifynewbieresult" name="verifynewbieresult" class="text-brand" />
			</div>
		</div>
		
		<div class="col-md-12 row-sep m-2">
			<div class="row text-center action-title">GENERATE FREE SIGNUP LINK</div>
			<div :action='this.actiapimod' method="get" class="p-2">
			  Signup Username: <input type="text" id="signusername" name="signusername" ref="signusername" value=""><br>
			  Transaction Link: <input type="text" name="txlink" ref="txlink" id="txlink" value="https://"><br>
			  <input type="button"  value="Generate Link" v-on:click="processAction('freesignup')">
			  <div ref="freesignupresult" name="freesignupresult" class="text-brand" />
			</div>
		</div>
		
		<div class="col-md-12 row-sep m-2">
			<div class="row text-center action-title">BAN USER</div>
			<div :action='this.actiapimod' method="get" class="p-2">
			  User: <input type="text" id="banuser" name="banuser" ref="banuser" value=""><br>
			  Ban Length: <input type="text" name="ban_length" ref="ban_length" value="10000" ><br>
			  Ban Reason: <input type="text" name="ban_reason" ref="ban_reason" value="" ><br>
			  <input type="button"  value="Ban Hammer" v-on:click="processAction('ban')">
			  <div ref="banresult" name="banresult" class="text-brand" />
			</div>
		</div>
		
		<div class="col-md-12 row-sep m-2">
			<div class="text-center row action-title">UNBAN USER</div>
			<div :action='this.actiapimod' method="get" class="p-2">
			  User: <input type="text" id="unbanuser" ref="unbanuser" name="unbanuser" value=""><br>
			  <input type="button" value="UNBAN" v-on:click="processAction('unban')">
			  <div ref="unbanresult" name="unbanresult" class="text-brand" />
			</div>
		</div>
		
		<div class="col-md-12 row-sep m-2">
			<div class="text-center row action-title">ACTIFIT REWARD CONTEST</div>
			<div :action='this.actiapimod' method="get" class="p-2">
				POST URL:
				<input type="text" id="fullurl" name="fullurl" ref="fullurl" size="100">
				VP:
				<input type="number" id="power" name="power" ref="power" min="0" max="100" value="100" style="width: 60px;" >
				<br />
				<input type="button" value="VOTE AWAY!" v-on:click="processAction('reward')">
				<div name="rewardresult" ref="rewardresult" class="text-brand" />
			</div>
		</div>
		
		<div class="col-md-12 row-sep m-2">
			<div class="text-center row action-title">RESET FUNDS PASSWORD</div>
			<div :action='this.actiapimod' method="get" class="p-2">
			  User: <input type="text" id="resetuser" name="resetuser" ref="resetuser" value=""><br>
			  <input type="button" value="RESET PASSWORD" v-on:click="processAction('resetpass')">
			  <div name="resetpassresult" ref="resetpassresult" class="text-brand" />
			</div>
		</div>
		
		<div class="col-md-12 row-sep m-2" v-if="isAdmin">
			<div class="text-center row action-title">MARKET ORDERS</div>
				<table class="table table-hover">
				<thead class="text-brand">
				<tr>
				  <th scope="col">User</th>
				  <th scope="col">Gadget ID</th>
				  <th scope="col">Gadget Name</th>
				  <th scope="col">Quantity</th>
				  <th scope="col">Color</th>
				  <th scope="col">Status</th>
				  <th scope="col">AFIT Paid</th>
				  <th scope="col">HIVE Paid</th>
				  <th scope="col">Date Purchase</th>
				  <th scope="col">buyer_name</th>
				  <th scope="col">buyer_phone</th>
				  <th scope="col">buyer_address</th>
				  <th scope="col">buyer_address2</th>
				  <th scope="col">buyer_country</th>
				  <th scope="col">buyer_state</th>
				  <th scope="col">buyer_city</th>
				  <th scope="col">buyer_zip</th>
				  <th scope="col">last_updated</th>
				  <th scope="col">note</th>
				</tr>
			  </thead>
			  <tbody>
				<tr v-for="(entry, index) in purchaseOrders" v-bind:key="index">
					<td>@{{entry.user}}</td>
					<td>{{entry.gadget}}</td>
					<td>{{entry.gadget_name}}</td>
					<td>{{entry.quantity}}</td>
					<td>{{entry.color}}</td>
					<td>{{entry.status}}</td>
					<td>{{entry.afit_paid}}</td>
					<td>{{entry.hive_paid}}</td>
					<td>{{entry.date_bought}}</td>
					<td>{{entry.buyer_name}}</td>
					<td>{{entry.buyer_phone}}</td>
					<td>{{entry.buyer_address}}</td>
					<td>{{entry.buyer_address2}}</td>
					<td>{{entry.buyer_country}}</td>
					<td>{{entry.buyer_state}}</td>
					<td>{{entry.buyer_city}}</td>
					<td>{{entry.buyer_zip}}</td>
					<td>{{entry.last_updated}}</td>
					<td>{{entry.note}}</td>
				</tr>
				</tbody>
			</table>
		</div>
		
		<div class="col-md-12 row-sep m-2" v-else>
			<div class="text-center row action-title">MARKET ORDERS</div>
				<table class="table table-hover">
				<thead class="text-brand">
				<tr>
				  <th scope="col">User</th>
				  <th scope="col">Gadget ID</th>
				  <th scope="col">Gadget Name</th>
				  <th scope="col">Quantity</th>
				  <th scope="col">Color</th>
				  <th scope="col">Status</th>
				  <th scope="col">AFIT Paid</th>
				  <th scope="col">HIVE Paid</th>
				  <th scope="col">Date Purchase</th>
				  <!--<th scope="col">buyer_name</th>
				  <th scope="col">buyer_phone</th>
				  <th scope="col">buyer_address</th>
				  <th scope="col">buyer_address2</th>
				  <th scope="col">buyer_country</th>
				  <th scope="col">buyer_state</th>
				  <th scope="col">buyer_city</th>
				  <th scope="col">buyer_zip</th>
				  <th scope="col">last_updated</th>
				  <th scope="col">note</th>-->
				</tr>
			  </thead>
			  <tbody>
				<tr v-for="(entry, index) in purchaseOrders" v-bind:key="index">
					<td>@{{entry.user}}</td>
					<td>{{entry.gadget}}</td>
					<td>{{entry.gadget_name}}</td>
					<td>{{entry.quantity}}</td>
					<td>{{entry.color}}</td>
					<td>{{entry.status}}</td>
					<td>{{entry.afit_paid}}</td>
					<td>{{entry.hive_paid}}</td>
					<td>{{entry.date_bought}}</td>
					<!--<td>{{entry.buyer_name}}</td>
					<td>{{entry.buyer_phone}}</td>
					<td>{{entry.buyer_address}}</td>
					<td>{{entry.buyer_address2}}</td>
					<td>{{entry.buyer_country}}</td>
					<td>{{entry.buyer_state}}</td>
					<td>{{entry.buyer_city}}</td>
					<td>{{entry.buyer_zip}}</td>
					<td>{{entry.last_updated}}</td>
					<td>{{entry.note}}</td>-->
				</tr>
				</tbody>
			</table>
		</div>
		
		<!--<div class="col-md-12 row-sep m-2">
			<div class="text-center row action-title">VERIFY FUNDS PASSWORD</div>
			<div :action='this.actiapimod' method="get" class="p-2">
			  User: <input type="text" id="from" name="from" ref="from" value=""><br>
			  <input type="button" value="VERIFY PASSWORD" v-on:click="processAction('verifypass')">
			  <div name="verifypassresult" ref="verifypassresult" class="text-brand" />
			</div>
		</div>-->
    </div>
	
	<div :class="smallScreenClasses" class="container mt-5 pb-5 pt-5" v-else>
      <!-- account balance -->
      <div class="text-center p-5">
		<div class="row pb-3">
		  <div class="text-center text-brand w-100 lead">
		    {{ $t('need_login_signup_notice_vote') }}
		  </div>
		</div>
		<div class="row pb-3">
		  <div class="w-50">
			<a href="/login" class="btn btn-brand btn-lg w-75">{{ $t('Login') }}</a>
		  </div>
		  <div class="w-50">
			<a href="/signup" class="btn btn-brand btn-lg w-75">{{ $t('Sign_Up') }}</a>
		  </div>
		</div>
	  </div>
	</div>
	
    <Footer />
  </div>
</template>

<script>
  import NavbarBrand from '~/components/NavbarBrand'
  import Footer from '~/components/Footer'

  import { mapGetters } from 'vuex'

  export default {
	head () {
		return {
		  title: `Actifit Moderator Access - Actifit`,
		}
	},
    components: {
      NavbarBrand,
      Footer,
    },
	data (){
	  return {
		screenWidth: 1200,
		actiapimod: process.env.actiAppUrl + 'modAction',//'http://localhost:3120/modAction', //
		moderatorStats: [],
		currentWeekStats: [],
		priorWeekStats: [],
		topVotes: -1,
		topVoter: '',
		topComments: -1,
		topCommentor: '',
		week: 1,
		purchaseOrders: [],
		isAdmin: false,
	  }
	},
    computed: {
      ...mapGetters('steemconnect', ['user']),
	  ...mapGetters(['moderators']),
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
	  isUserModerator() {
		if (this.user && this.moderators.find( mod => mod.name == this.user.account.name && mod.title == 'moderator')) {
		  return true;
		}
		return false;
	  }
    },
    async mounted () {
	  this.screenWidth = screen.width;
	  this.fetchUserInfo();
	  
	  //grab moderators' list
		this.$store.dispatch('fetchModerators')
		
		//grab moderators weekly stats
		let res = await fetch(process.env.actiAppUrl + 'moderatorWeeklyStats');
		let outcome = await res.json();
		console.log(outcome);
		this.moderatorStats = outcome;
		this.currentWeekStats = outcome;
		
		let res_two = await fetch(process.env.actiAppUrl + 'moderatorWeeklyStats?priorWeek=true');
		let outcome_two = await res_two.json();
		console.log(outcome_two);
		this.priorWeekStats = outcome_two;
		/*for (let i=0;i<outcome.length;i++){
			if (Array.isArray(outcome[i]) && outcome[i].length>0){
				let entry = new Object();
				entry.user=
				this.moderatorStats.push(entry);
			}
		}*/
		
		//grab market orders
		let accToken = localStorage.getItem('access_token')
		//this.$store.dispatch('fetchUserBoughtRealProducts', accToken)
		let url = new URL(process.env.actiAppUrl + 'realProductsBought/?user=' + this.user.account.name.toLowerCase());
			
		let reqHeads = new Headers({
		  'Content-Type': 'application/json',
		  'x-acti-token': 'Bearer ' + accToken,
		});
		let res_t = await fetch(url, {
			method: 'GET',
			headers: reqHeads,
		});
		this.purchaseOrders = await res_t.json();
    },
	created () {
	  this.$store.dispatch('steemconnect/login')
	},
	watch: {
	  user : 'fetchUserInfo'
	},
	methods: {
	  checkTopRank (item){
		let topRanker = false;
		console.log(item);
		if (Array.isArray(item)){
			let votes = item.filter(entry => entry.reward_activity === "Post Vote").length;
			console.log('votes:'+votes);
			if (votes > this.topVotes){
				this.topVotes = votes;
				this.topVoter = item[0].user;
				topRanker = true;
			}
			
			let comments = item.filter(entry => entry.reward_activity === "Moderator Comment").length;
			console.log('comments:'+comments);
			if (comments > this.topComments){
				this.topComments = comments;
				this.topCommentor = item[0].user;
				topRanker = true;
			}
		}
		console.log(topRanker);
		if (topRanker){
			return "topRank";
		}
		return "jingo";
	  },
	  fetchUserInfo () {
		if (typeof this.user != 'undefined' && this.user != null){
		  this.$store.dispatch('fetchUserTokens')
		  this.$store.dispatch('fetchReferrals')
		  this.$store.dispatch('fetchUserRank')
		  let baseUrl = window.location.origin;
		  //is this admin user
		  if (this.user.account.name == 'mcfarhat' ||
				this.user.account.name == 'rabihfarhat' ||
				this.user.account.name == 'alfamano' ||
				this.user.account.name == 'pjansen'){
			this.isAdmin = true;
		  }else{
			this.isAdmin = false;
		  }
		}
	  },
	  async processAction (targetAction){
		
		let url = new URL(this.actiapimod);
		//compile all needed data and send it along the request for processing
		let params = {
			moderator: this.user.account.name,
			targetAction: targetAction,
			fundsPass: this.$refs['fundsPass'].value.trim(),
		};
		switch(targetAction){
		
			case 'ban': 
						params.banuser = this.$refs['banuser'].value.trim();
						params.ban_length = this.$refs['ban_length'].value.trim();
						params.ban_reason = this.$refs['ban_reason'].value.trim();
						break;
			case 'unban': 
						params.unbanuser = this.$refs['unbanuser'].value.trim();
						break;
			case 'reward': 
						params.fullurl = this.$refs['fullurl'].value.trim();
						params.power = this.$refs['power'].value.trim();
						break;
			case 'resetpass':
						params.resetuser = this.$refs['resetuser'].value.trim();
						break;
		
			case 'verifypass':
						params.from = this.$refs['from'].value.trim();
						break;
			case 'verifynewbie':
						params.account = this.$refs['newbieaccount'].value.trim();
						params.verif_link = this.$refs['verif_link'].value.trim();
						break;
						
			case 'freesignup':
						params.username = this.$refs['signusername'].value.trim();
						params.txlink = this.$refs['txlink'].value.trim();
						break;
		}
		
		Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
		try{
			let res = await fetch(url);
			let outcome = await res.json();
			console.log(outcome);
			let display = outcome;
			if (outcome.error){
				display = outcome.error;
			}else if (outcome.status){
				display = outcome.status;
			}else if (outcome.ok){
				display = 'success';
			}
			this.$refs[targetAction+'result'].innerHTML = display;
			//update user data according to result

		}catch(err){
			console.error(err);
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
	.row-sep{
		border: 2px solid red;
		border-radius: 5px;
	}
	.action-title{
		font-weight: bold;
		border-bottom: 2px solid red;
	}
	.topRank{
		background: red;
	}
</style>
