<template>
  <!-- navbar links with smooth scrolling to sections -->
    <nav class="navbar fixed-top navbar-expand-lg navbar-light px-1">
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <!--<li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="scrollTo('#content')">{{ $t('What_is_actifit') }}</a>
          </li>-->
          <li class="nav-item btn btn-brand m-1 p-1 nav-item-border" v-if="!home">
            <div style="display:inline-flex"><i class="fas fa-home text-white"></i><a class="nav-link text-white" href="#" @click.prevent="$router.push('/')">{{ $t('Home') }}</a></div>
          </li>
		  
		  <li class="nav-item btn btn-brand m-1 p-1 nav-item-border">
            <div style="display:inline-flex"><i class="fas fa-running text-white"></i><a class="nav-link text-white" href="#" @click.prevent="$router.push('/activity')">{{ $t('Activity') }}</a></div>
          </li>
		  <li class="nav-item btn btn-brand m-1 p-1 nav-item-border"><!-- item-highlight-->
            <div style="display:inline-flex"><i class="fas fa-shopping-cart text-white"></i><a class="nav-link text-white" href="#" @click.prevent="$router.push('/market')">{{ $t('Market') }}</a></div>
          </li>
		  <li class="nav-item btn btn-brand m-1 p-1 nav-item-border">
            <div style="display:inline-flex"><i class="fas fa-seedling text-white"></i><a class="nav-link text-white" href="#" @click.prevent="$router.push('/yieldfarming')">{{ $t('yield_farming') }}</a></div>
          </li>
		  
          <!--<li class="nav-item btn btn-brand m-1 p-1 nav-item-border" v-if="home">
            <div style="display:inline-flex"><i class="fas fa-heart text-white"></i><a class="nav-link text-white" href="#" @click.prevent="$emit('scrollTo', '#delegators')">{{ $t('Delegators') }}</a></div>
          </li>
		  <li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="scrollTo('#professionals')">{{ $t('Professionals') }}</a>
          </li>
		  <li class="nav-item btn btn-brand m-1 p-1 nav-item-border" v-if="home">
            <div style="display:inline-flex"><i class="fas fa-medal text-white"></i><a class="nav-link text-white" href="#" @click.prevent="$emit('scrollTo', '#leaderboard')">{{ $t('Leaderboard') }}</a></div>
          </li>
          <li class="nav-item btn btn-brand m-1 p-1 nav-item-border" v-if="home">
            <div style="display:inline-flex"><i class="fas fa-users text-white"></i><a class="nav-link text-white" href="#" @click.prevent="$emit('scrollTo', '#team')">{{ $t('Team') }}</a></div>
          </li>
		  
          <li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="scrollTo('#athletes')">{{ $t('Sponsored_Athletes') }}</a>
          </li>
		  
		  <li class="nav-item btn btn-brand m-1 p-1 nav-item-border" v-if="home">
            <div style="display:inline-flex"><i class="far fa-handshake text-white"></i><a class="nav-link text-white" href="#" @click.prevent="$emit('scrollTo', '#partners')">{{ $t('Partners') }}</a></div>
          </li>-->
		  
          <li class="nav-item btn btn-brand m-1 p-1 nav-item-border" v-if="home">
            <div style="display:inline-flex"><i class="far fa-newspaper text-white"></i><a class="nav-link text-white" href="#" @click.prevent="$emit('scrollTo', '#news')">{{ $t('News') }}</a></div>
          </li>

		  <li class="nav-item btn btn-brand m-1 p-1 nav-item-border">
            <div style="display:inline-flex"><i class="fas fa-user-friends text-white"></i><a class="nav-link text-white" href="#" @click.prevent="$router.push('/referrals')">{{ $t('Refer_A_Friend') }}</a></div>
          </li>
		  
		  <li class="nav-item btn btn-brand m-1 p-1 nav-item-border">
            <div style="display:inline-flex"><i class="fas fa-users text-white"></i><a class="nav-link text-white" href="/communities">{{ $t('Communities') }}</a></div>
          </li>
		  
		  <li class="nav-item btn btn-brand m-1 p-1 nav-item-border">
            <div style="display:inline-flex"><i class="fas fa-search text-white"></i><a class="nav-link text-white" href="/explore">{{ $t('Explore') }}</a></div>
          </li>
		  
        </ul>
      </div>
	  <UserMenu/>
    </nav>
</template>
<script>
	import UserMenu from '~/components/UserMenu';
	
	export default {
		props: ['home'],
		components: {
		  UserMenu,
		  
		},
		async mounted () {
			console.log('navbar mounted');
		}
	
	}
</script>

<style lang="sass">
  .navbar-brand
    img
      width: 40px
    h1
      font-size: 14px
    h3
      font-size: 12px
</style>
<style>
	.nav-item-border{
		opacity: 0.7;
		background-color: #ff112d;
		border: 1px solid #ff112d;
		border-radius: 3px;
	}
</style>
