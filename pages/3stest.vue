<template>
	<div>
		<NavbarBrand />
		<div class="container pt-5 mt-5 pb-5">
			<input type="button" @click="connectSession3S()" value="Test">
		</div>
	</div>
</template>

<script>
import NavbarBrand from '~/components/NavbarBrand'
import {mapGetters} from 'vuex'
import * as tus from "tus-js-client";
export default {
	data (){
		return {
		
		}
	},
	components: {
		NavbarBrand
	},
	computed: {
	  ...mapGetters('steemconnect', ['user']),
	  ...mapGetters('steemconnect', ['stdLogin']),
	},
	methods: {
		async connectSession3S(){
			try{
			console.log('3S session');
			
			//fetch 3speak memo
			
			let res = await fetch(process.env.threeSpeakApiSession.replace('_USERNAME_', this.user.account.name));
			console.log(res);
			let outcome = await res.json();
			console.log(outcome);
			let memo = '';
			if (outcome && outcome.memo){
				memo = outcome.memo;
			}
			console.log(memo);
			
			//decode memo

			//grab actifit token
			let accToken = localStorage.getItem('access_token')
			
			let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
			
			let url = new URL(process.env.actiAppUrl + 'memoDecode/?user='+this.user.account.name+'&bchain='+cur_bchain);
			
			let reqHeads = new Headers({
			  'Content-Type': 'application/json',
			  'x-acti-token': 'Bearer ' + accToken,
			});
			res = await fetch(url, {
				method: 'POST',
				headers: reqHeads,
				body: JSON.stringify({'memo': memo})
			});
			outcome = await res.json();
			console.log(outcome);
			let xcstkn = '';
			if (outcome.error){
				console.log(outcome.error);
				return;
			}else{
				xcstkn = outcome.xcstkn;
			}
			
			//request cookie
			if (xcstkn){
				if (xcstkn.startsWith('#')){
					xcstkn = xcstkn.substring(1);//remove first character from token #
				}
				res = await fetch(process.env.threeSpeakApiSession.replace('_USERNAME_', this.user.account.name)+'&access_token=' + xcstkn, {
					credentials: 'include',
				});
				console.log(res);
				//console.log(res.headers);
				outcome = await res.json();
				console.log(outcome);	
			}
			}catch(exc){
				console.log(exc);
			}
	  },
	},
	async mounted () {
		await this.$store.dispatch('steemconnect/login')
		//await this.$store.dispatch('steemconnect/refreshUser');
		//console.log('session 3S');
		//this.connectSession3S();
	}
}
</script>