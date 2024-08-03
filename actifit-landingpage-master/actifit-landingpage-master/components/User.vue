<template>
  <!-- single card item for user -->	
        <div class="card form mx-auto p-3 mt-3 mt-md-5 text-center card-border pro-card col-sm-4">
		  <div class="pb-md-2 text-center">
			  <h1 class="pro-name">{{ this.singleuser.name}}</h1>
			  <h2><a :href="'/' + this.singleuser.username">@{{ this.singleuser.username}}</a></h2>
			  <h3>{{ this.singleuser.type}}</h3>
			  <h4>{{ this.singleuser.location}}</h4>
			  <img :src="this.singleuser.pic" class="pro-img-cls">
		  </div>
		  <div class="pb-md-2 text-left">
			<b>{{ $t('brief')}}: </b>{{this.singleuser.brief}}
		  </div>
		  <div class="pb-md-2 text-left">
			<b>{{ $t('details')}}: </b>{{this.getDetails()}}
			<span v-if="detailsOpen"><a href='#' @click.prevent="switchDetails()">{{ $t('read_less')}}</a></span>
			<span v-else><a href='#' @click.prevent="switchDetails()">{{ $t('read_more')}}</a></span>
		  </div>
		  <div class="pb-md-2 text-left">
			<b>{{ $t('qualifications')}}: </b>{{this.singleuser.certificates}}
		  </div>
		  <div class="pb-md-2 text-left">
			<b>{{ $t('languages')}}: </b>
			<span v-for="lang in this.singleuser.languages" v-bind:key="lang">
			  {{ lang }} &nbsp;
			</span>
		  </div>
		  <div class="pb-md-2 text-center">			  
              <div>
                <a class="btn btn-brand btn-lg w-100 book-button" @click.prevent="$router.push('/market/?prof=' + singleuser.username)">{{ $t('Book_on_market') }}</a>
              </div>
		  </div>
		
          <!-- login/register buttons -->
          <div >
           
          </div>
        </div>
		
</template>

<script>
  import {mapGetters} from 'vuex'
  
  import steem from 'steem'

  export default {
    props: ['singleuser'],
    computed: {
      ...mapGetters('steemconnect', ['user']),
      date() {
        let date = new Date(this.singleuser.approval_date)
        let minutes = date.getMinutes()
        return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + (minutes < 10 ? '0' + minutes : minutes)
      },
	  
    }, 
	data: function(){
		return {
			
		}
	},
	watch: {
	  
	},
	methods: {
	  
	  
	},
	async mounted () {
		
	},
	
  }
</script>

<style>
	.card-border{
	  border: 5px solid #dc3545!important;
	  border-radius: 10px;
	}
	.pro-img-cls{
	  width: 100%;
	}
	.pro-card{
	  /*width: 400px;*/
	}
	.pro-name{
	  background: radial-gradient(red, transparent);
      color: white;
	}
	.book-button{
	  color: white !important;
	}
</style>
