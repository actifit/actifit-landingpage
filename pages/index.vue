<template>
  <div class="home" ref="homePage">
    <!-- top anchor -->
    <a id="top"></a>
	<div id="navbar-container" ref="navbar-container" v-if="renderReady">
    <NavbarBrand :home="true" @scrollTo="scrollTo"/>
	</div>
    <!-- header with fullscreen background -->
	<div class="header pt-4 pt-md-5 position-relative">
	  <div class="container py-5">
        
        <!-- wallet/activities preview -->
		
        <div class="card form mx-auto p-3 mt-3 mt-md-2 text-center border-0 home-card">
		  <div class="pb-md-2 text-center">
			  <img src="/img/actifit_logo.png" alt="Actifit" class="logo" />
			  <h1 class="mt-3 mt-sm-2 text-brand title">{{ $t('Actifit') }}</h1>
			  <!--<h3 class="font-italic text-brand slogan">{{ $t('Slogan') }}</h3>-->
			</div>
		
          <div v-if="user">
            <div class="pb-md-2 row">
              <div class="col-sm-6">
                <p class="lead text-muted mb-0">{{ $t('Balance') }}</p>
                <h3><b>{{ numberFormat(formattedUserTokens, 3) }}</b><br><small>{{ $t('AFIT_Token') }}</small></h3>
                <a href="#" @click.prevent="$router.push('/wallet')" class="btn btn-lg btn-brand w-100 acti-shadow">{{ $t('My_Wallet') }}</a>
              </div>
              <div class="col-sm-6 mt-4 mt-sm-0">
                <p class="lead text-muted mb-0">{{ $t('Activity') }}</p>
                <h3><b>{{ grabUserReportCount }}</b><br><small>{{ $t('Reports') }}</small></h3>
                <a href="#" class="btn btn-lg btn-brand w-100 acti-shadow" @click.prevent="$router.push('/activity/' + user.account.name)">{{ $t('My_Activity') }}</a>
              </div>
            </div>
			<div class="pb-md-2 row text-center">
			  <SteemStats :user="user" class="col-md-12" :key="reload"/>
			</div>
			<div class="pb-md-2 pt-2 row text-center">
			  <div class="col-6 mb-3">
				<a href="#" class="btn btn-lg btn-brand w-100 acti-shadow" @click.prevent="$router.push('/activity/')">{{ $t('activity_feed') }}</a>
			  </div>
			  <div class="col-6">
				<a href="#" class="btn btn-lg btn-brand w-100 acti-shadow" @click.prevent="$router.push('/market')">{{ $t('Market') }}</a>
			  </div>
			</div>
		  </div>

          <!-- login/register buttons -->
          <div v-else>
            <!--<p class="lead py-md-3 form-info">Log in to see your current token balance, or sign up for a Steem account to start getting rewarded for your activity.</p>-->
            <div class="row">
              <div class="col-6">
                <a href="/login" class="btn btn-brand btn-lg w-100 acti-shadow">{{ $t('Login') }}</a>
				<!--<a :href="$steemconnect.getLoginURL()" class="btn btn-brand btn-lg w-100">{{ $t('Login') }}</a>-->
              </div>
              <div class="col-6">
                <a href="/signup" class="btn btn-brand btn-lg w-100 acti-shadow">{{ $t('Sign_Up') }}</a>
              </div>
            </div>
			<div class="row pb-md-2 pt-2 ">
              <div class="col-6">
				<a href="#" class="btn btn-lg btn-brand w-100 acti-shadow" @click.prevent="$router.push('/activity/')">{{ $t('activity_feed') }}</a>
			  </div>
			  <div class="col-6">
				<a href="#" class="btn btn-lg btn-brand w-100 acti-shadow" @click.prevent="$router.push('/market/')">{{ $t('Market') }}</a>
			  </div>
            </div>
          </div>
        </div>
      </div>

      <!-- scroll indicator -->
      <div class="text-center scroll-down position-absolute w-100">
        <a href="#" @click="scrollTo('#content')">
          <i class="fas fa-2x text-light fa-chevron-down"></i>
        </a>
      </div>
    </div>
    <!-- intro -->
	<!--<transition type="animation">-->
    <section class="intro" id="content">
      <div class="container py-5">
        <h1 class="pt-5 mb-3 text-capitalize text-center headline" v-html="$t('homepage.section1_title')"></h1>
        <p class="lead mb-4 pb-5 text-center">
          {{ $t('homepage.section1_desc') }}
        </p>

        <!-- stats -->
        <!--<div class="row pb-5">
          <div class="col text-center">
            <h1><i class="fas fa-coins"></i></h1>
            <h4>{{ $t('Tokens_Distributed') }}</h4>
            <h2 class="text-brand">{{ numberFormat(animatedTokensDistributed, 0) }} {{ $t('AFIT_Token') }}</h2>
          </div>
          <div class="col text-center">
            <h1><i class="fas fa-users"></i></h1>
            <h4>{{ $t('Token_Holders') }}</h4>
            <h2 class="text-brand">{{ numberFormat(animatedUserCount, 0) }}</h2>
          </div>
          <div class="col text-center">
            <h1><i class="fas fa-dumbbell"></i></h1>
            <h4>{{ $t('Rewarded_Activities') }}</h4>
            <h2 class="text-brand">{{ numberFormat(animatedRewardedActivityCount, 0) }}</h2>
          </div>
        </div>-->
      </div>
    </section>
	<!--</transition>-->

    <!-- texts with images -->
    <section class="showcase">
      <div class="container-fluid p-0">

        <!-- app -->
        <div class="row no-gutters">
          <div class="col-lg-6 order-lg-2 text-white showcase-img" style="background-image: url('/img/showcase-1.jpg');"></div>
          <div class="col-lg-6 order-lg-1 my-auto showcase-text">
            <h2 class="text-capitalize">{{ $t('homepage.section2_title') }}</h2>
            <p class="lead mb-0" v-html="$t('homepage.section2_desc')"></p>
            <div class="text-center mt-5">
              <a href="https://bit.ly/actifit-app" target="_blank">
                <img src="/img/google-play.png" />
              </a>
              <br>
              <br>
              <a href="https://bit.ly/actifit-ios" target="_blank">
              <img src="/img/app-store.png" />
              </a>
            </div>
          </div>
        </div>

        <!-- use case -->
        <div class="row no-gutters">
          <div class="col-lg-6 text-white showcase-img" style="background-image: url('/img/showcase-4.jpg');"></div>
          <div class="col-lg-6 my-auto showcase-text">
            <h2 class="text-capitalize">{{ $t('homepage.section3_title') }}</h2>
            <p class="lead mb-0" v-html="$t('homepage.section3_desc')">
            </p>
          </div>
        </div>

        <!-- delegation -->
        <div class="row no-gutters">
          <div class="col-lg-6 order-lg-2 text-white showcase-img rounded" style="background-image: url('/img/showcase-3.jpg');"></div>
          <div class="col-lg-6 order-lg-1 my-auto showcase-text rounded">
            <h2 class="text-capitalize">{{ $t('homepage.section4_title') }}</h2>
            <p class="lead mb-0">{{ $t('homepage.section4_desc') }}</p>
			<div class="text-center row pt-2">
				<a href="/yieldfarming" class="btn btn-brand btn-lg w-50 border-light acti-shadow">{{ $t('yield_farming') }}</a>
				<a href="/wallet?action=delegate" class="btn btn-brand btn-lg w-50 border-light acti-shadow">{{ $t('Delegate') }}</a>
			</div>
          </div>
        </div>
      </div>
    </section>


	<!-- top Delegators -->
    <section id="delegators" class="py-5">
      <div class="container">
        <h1 class="text-center pb-5">
          <i class="fas fa-heart"></i><br>
          {{ $t('Top_Delegators') }}
        </h1>
        <div class="row">
          <div  v-if="topDelegators.hive" class="col-6 col-sm-4 col-md-3 text-center mb-4" v-for="(delegator, index) in topDelegators.hive" :key="'hive'+index" :delegator="delegator">
            <a :href="delegator._id" target="_blank">
              <div class="avatar avatar-hive small mx-auto mb-3" :style="'background-image: url('+profImgUrl+'/u/' + delegator._id + '/avatar);'"></div>
            </a>
            <a :href="delegator._id" target="_blank">@{{ delegator._id }}</a><br/>
			<img src="/img/HIVE.png" style="max-height: 20px;"><a :href="delegator._id" target="_blank">{{ numberFormat(delegator.steem_power, 0) }} {{ $t('Hive_Power') }}</a>
          </div>
		  <!--<div  v-if="topDelegators.steem" class="col-6 col-sm-4 col-md-3 text-center mb-4" v-for="(delegator, index) in topDelegators.steem" :key="'steem'+index" :delegator="delegator">
            <a :href="delegator._id" target="_blank">
              <div class="avatar avatar-steem small mx-auto mb-3" :style="'background-image: url('+profImgUrl+'/u/' + delegator._id + '/avatar);'"></div>
            </a>
            <a :href="delegator._id" target="_blank">@{{ delegator._id }}</a><br/>
			<img src="/img/STEEM.png" style="max-height: 20px;"><a :href="delegator._id" target="_blank">{{ numberFormat(delegator.steem_power, 0) }} {{ $t('Steem_Power') }}</a>
          </div>-->
		  <div class="full-div">
			<nuxt-link to="/delegators" class="text-center btn btn-brand acti-shadow" data-target="#">{{ $t('View_All_Delegators') }}</nuxt-link>
		  </div>
        </div>
      </div>
    </section>

    <!-- leaderboard -->
    <section id="leaderboard" class="py-5 bg-brand text-light">
      <div class="container">
        <h1 class="text-center pb-5">
          <i class="fas fa-medal"></i><br>
          {{ $t('Daily_Leaderboard') }}
        </h1>
        <div class="row" v-if="leaderboard.length >= 3">
          <div class="col-sm-4 text-center mb-4 mb-sm-0 d-flex align-items-center justify-content-center">
            <div>
              <h2>2.</h2>
              <a :href="leaderboard[1].username" target="_blank">
                <div class="avatar mx-auto mb-3" :style="'background-image: url('+profImgUrl+'/u/' + leaderboard[1].username.replace('@','') + '/avatar);'"></div>
              </a>
              <a :href="leaderboard[1].username" target="_blank">{{ leaderboard[1].username }}</a><br/>
			  <a :href="leaderboard[1].username" target="_blank">{{ leaderboard[1].activity_count }} {{ $t('Recorded_Activity') }}</a>
            </div>
          </div>
          <div class="col-sm-4 text-center mb-4 mb-sm-0 d-flex align-items-center justify-content-center">
            <div>
              <h2>1.</h2>
              <a :href="leaderboard[0].username" target="_blank">
                <div class="avatar mx-auto mb-3" :style="'width: 200px; height: 200px; background-image: url('+profImgUrl+'/u/' + leaderboard[0].username.replace('@','') + '/avatar);'"></div>
              </a>
              <a :href="leaderboard[0].username" target="_blank">{{ leaderboard[0].username }}</a><br/>
			  <a :href="leaderboard[0].username" target="_blank">{{ leaderboard[0].activity_count }} {{ $t('Recorded_Activity') }}</a>
            </div>
          </div>
          <div class="col-sm-4 text-center mb-4 mb-sm-0 d-flex align-items-center justify-content-center">
            <div>
              <h2>3.</h2>
              <a :href="leaderboard[2].username" target="_blank">
                <div class="avatar mx-auto mb-3" :style="'width: 100px; height: 100px; background-image: url('+profImgUrl+'/u/' + leaderboard[2].username.replace('@','') + '/avatar);'"></div>
              </a>
              <a :href="leaderboard[2].username" target="_blank">{{ leaderboard[2].username }}</a><br/>
			  <a :href="leaderboard[2].username" target="_blank">{{ leaderboard[2].activity_count }} {{ $t('Recorded_Activity') }}</a>
            </div>
          </div>
        </div>
		<div class="full-div">
			<nuxt-link to="/leaderboard" class="text-center btn delegator-btn text-brand mt-2 leader-cls-btn acti-shadow-inverse" data-target="#">{{ $t('View_leaderboard') }}</nuxt-link>
		</div>
      </div>
    </section>

    <!-- team -->
    <section id="team" class="py-5">
      <div class="container">
        <h1 class="text-center pb-5">
          <i class="fas fa-users"></i><br>
          {{ $t('Team') }}
        </h1>
        <div class="row">
		  <div class="col-6 col-sm-4 col-md-3 text-center mb-4">
            <a href="@mcfarhat" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(https://usermedia.actifit.io/mohammadfarhat.jpg);'"></div>
            </a>
            <a href="@mcfarhat" target="_blank">Mohammad Farhat</a>
			<div><i>CEO & Founder</i></div>
			<a href="https://www.linkedin.com/in/mohammadfarhat/" target="_blank"><i class="fab fa-linkedin"></i></a>
          </div>
		  <div class="col-6 col-sm-4 col-md-3 text-center mb-4">
            <a href="@alfamano" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(https://usermedia.actifit.io/alaafarhat.jpg);'"></div>
            </a>
            <a href="@alfamano" target="_blank">Alaa Farhat</a>
			<div><i>Business Development Manager</i></div>
			<a href="https://www.linkedin.com/in/alaa-farhat-b8b59317/" target="_blank"><i class="fab fa-linkedin"></i></a>
          </div>
		  <div class="col-6 col-sm-4 col-md-3 text-center mb-4">
            <a href="@pjansen" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(https://usermedia.actifit.io/pauljansen.jpg);'"></div>
            </a>
            <a href="@pjansen" target="_blank">Paul Jansen</a>
			<div><i>Operations Manager</i></div>
			<a href="https://www.linkedin.com/in/profilepauljansen" target="_blank"><i class="fab fa-linkedin"></i></a>
          </div>
		  <div class="col-6 col-sm-4 col-md-3 text-center mb-4">
            <a href="@rabihfarhat" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(https://usermedia.actifit.io/rabihfarhat.jpg);'"></div>
            </a>
            <a href="@rabihfarhat" target="_blank">Rabih Farhat</a>
			<div><i>Finance Manager</i></div>
			<a href="https://www.linkedin.com/in/rabih-farhat-42a1604b/" target="_blank"><i class="fab fa-linkedin"></i></a>
          </div>
		  <div class="col-6 col-sm-4 col-md-3 text-center mb-4">
            <a href="@katerinaramm" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(https://usermedia.actifit.io/katerinaramm.jpg);'"></div>
            </a>
            <a href="@katerinaramm" target="_blank">Katerina Ramoutsaki</a>
			<div><i>Social Media Manager</i></div>
			<a href="https://www.linkedin.com/in/katerina-ramoutsaki-25055697/" target="_blank"><i class="fab fa-linkedin"></i></a>
          </div>
		</div>
		<div class="row">
		  <div class="col-6 col-sm-4 col-md-3 text-center mb-4">
            <a href="@ciuoto" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(https://usermedia.actifit.io/eugeniopirillo.jpg);'"></div>
            </a>
            <a href="@ciuoto" target="_blank">Eugenio Pirillo</a>
			<div><i>Moderator</i></div>
			<a href="https://www.linkedin.com/in/epirillo/" target="_blank"><i class="fab fa-linkedin"></i></a>
          </div>
		  <div class="col-6 col-sm-4 col-md-3 text-center mb-4">
            <a href="@priyanarc" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(https://usermedia.actifit.io/priyanfareen.jpg);'"></div>
            </a>
            <a href="@priyanarc" target="_blank">Priyan Fareen</a>
			<div><i>Moderator</i></div>
			<a href="https://www.linkedin.com/in/priyan-fareen-33722398/" target="_blank"><i class="fab fa-linkedin"></i></a>
          </div>	  
		  <div class="col-6 col-sm-4 col-md-3 text-center mb-4">
            <a href="@kpreddy" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(https://usermedia.actifit.io/praveen.jpg);'"></div>
            </a>
            <a href="@kpreddy" target="_blank">Praveen Reddy</a>
			<div><i>Moderator</i></div>
			<a href="https://www.linkedin.com/in/praveen-reddy-kanthala-a0532011a/" target="_blank"><i class="fab fa-linkedin"></i></a>
          </div>
		  <!--<div class="col-6 col-sm-4 col-md-3 text-center mb-4">
            <a href="@sumit71428" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(https://usermedia.actifit.io/sumitsingh.jpg);'"></div>
            </a>
            <a href="@sumit71428" target="_blank">Sumit Singh</a>
			<div><i>Moderator</i></div>
			<a href="https://www.linkedin.com/in/sumit-singh-91b616185/" target="_blank"><i class="fab fa-linkedin"></i></a>
          </div>-->
		  <div class="col-6 col-sm-4 col-md-3 text-center mb-4">
            <a href="@silvertop" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(https://usermedia.actifit.io/silvertop.jpg);'"></div>
            </a>
            <a href="@silvertop" target="_blank">Mike Gutman</a>
			<div><i>Moderator</i></div>
          </div>
		  <div class="col-6 col-sm-4 col-md-3 text-center mb-4">
            <a href="@elizabethbit" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(https://usermedia.actifit.io/elizabethbit.jpg);'"></div>
            </a>
            <a href="@elizabethbit" target="_blank">Elizabeth Gutman</a>
			<div><i>Moderator</i></div>
			<a href="https://www.linkedin.com/in/elizabeth-gutman-33456536/" target="_blank"><i class="fab fa-linkedin"></i></a>
          </div>
        </div>
      </div>
    </section>

    <!-- ambassadors -->
    <!--<section id="ambassadors" class="py-5 bg-light">
      <div class="container">
        <h1 class="text-center pb-5">
          <i class="fas fa-bullhorn tilt"></i><br>
          {{ $t('Ambassadors') }}
        </h1>
        <div class="row">
          <div class="col-6 col-sm-4 text-center mb-4" v-for="(ambassador, index) in ambassadors" :key="index" :moderator="ambassador.name">
            <a :href="ambassador.name" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url('+profImgUrl+'/u/' + ambassador.name + '/avatar);'"></div>
            </a>
            <a :href="ambassador.name" target="_blank">@{{ ambassador.name }}</a>
          </div>
        </div>
      </div>
    </section>-->

    <!-- sponsored athletes -->
    <!--<section id="athletes" class="py-5">
      <div class="container">
        <h1 class="text-center pb-5">
          <i class="fas fa-dumbbell"></i><br>
          {{ $t('Sponsored_Athletes') }}
        </h1>
        <div class="row">
		  <div class="col-6 col-sm-6 text-center mb-4">
            <a href="@lasitha" target="_blank">
              <div class="avatar mx-auto mb-3" style="background-image: url('https://steemitimages.com/p/4HFqJv9qRjVeVQzX3gvDHytNF793bg88B7fESPieLQ8dxHkpPXaNe2rRpUWHJ9oYqAqg35RCq5cGDGqMBomDWQ4pj7ZxwQiW2QmTqkZ5gU3Snkvwtmqe8AkkSWsiLeULjsjFWn1JUPg6vAr1HaniGbakPsmAMyHgdfc?width=512&height=512');"></div>
            </a>
            <a href="@lasitha" target="_blank">@lasitha</a>
          </div>
          <div class="col-6 col-sm-6 text-center mb-4">
            <a href="@entrepreneur916" target="_blank">
              <div class="avatar mx-auto mb-3" style="background-image: url('https://ipfs.busy.org/ipfs/QmPyExYzRA6Zp14c2UL3dZSTwZtToABHwFAyFjR1pZMVk6');"></div>
            </a>
            <a href="@entrepreneur916" target="_blank">@entrepreneur916</a>
          </div>
          <div class="col-6 col-sm-6 text-center mb-4 mb-sm-0">
            <a href="@bunnymoney" target="_blank">
              <div class="avatar mx-auto mb-3" style="background-image: url('https://ipfs.busy.org/ipfs/QmQnNadhAJPJL5Sa8FYL5Pxhgw22zWjw4S8Kmji6k21p2w');"></div>
            </a>
            <a href="@bunnymoney" target="_blank">@bunnymoney</a>
          </div>
          <div class="col-6 col-sm-6 text-center mb-4 mb-sm-0">
            <a href="@fedesox" target="_blank">
              <div class="avatar mx-auto mb-3" style="background-image: url('https://ipfs.busy.org/ipfs/QmZrT7r9SjKUcx81L8p9G9z6uhndupDpfsrtYjwqgF3zC2');"></div>
            </a>
            <a href="@fedesox" target="_blank">@fedesox</a>
          </div>
        </div>
      </div>
    </section>-->

	<!-- partners -->
	<!--<section id="partners" class="py-5 bold-content">
      <div class="container">
        <h1 class="text-center pb-5">
          <i class="far fa-handshake"></i><br>
			{{ $t('Partners') }}
        </h1>
        <div class="row">
		  <div class="col-6 col-sm-4 col-md-3 text-center mb-4">
            <a rel="nofollow noopener" href="https://sportstalksocial.com/" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(./img/partners/sports_talk_social_logo.png);'"></div>
            </a>
            <a rel="nofollow noopener" href="https://sportstalksocial.com/" target="_blank">Sports Talk Social</a>
          </div>
		  
		  <div class="col-6 col-sm-4 col-md-3 text-center mb-4">
            <a rel="nofollow noopener" href="https://actifit.io/@beachready" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(./img/partners/BEACH_READY_LOGO.png);'"></div>
            </a>
            <a rel="nofollow noopener" href="https://actifit.io/@beachready" target="_blank">Beach Ready</a>
          </div>
		  
		 
		  
		  <div class="col-6 col-sm-4 col-md-3 text-center mb-4">
            <a rel="nofollow noopener" href="https://actifit.io/@adventureready" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(./img/partners/ADVENTURE_READY_LOGO.png);'"></div>
            </a>
            <a rel="nofollow noopener" href="https://actifit.io/@adventureready" target="_blank">Adventure Ready</a>
          </div>
		  
		  <div class="col-6 col-sm-4 col-md-3 text-center mb-4">
            <a rel="nofollow noopener" href="https://marketsquare.io/" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(./img/partners/Logo_MSQ.png);'"></div>
            </a>
            <a rel="nofollow noopener" href="https://marketsquare.io/" target="_blank">MarketSquare</a>
          </div>
		  
		  <div class="col-6 col-sm-4 col-md-3 text-center mb-4">
            <a rel="nofollow noopener" href="https://ark.io/" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(./img/partners/Logo_ARK.io.png);'"></div>
            </a>
            <a rel="nofollow noopener" href="https://ark.io/" target="_blank">Ark</a>
          </div>
		  
		  <div class="col-6 col-sm-4 col-md-3 text-center mb-4">
            <a rel="nofollow noopener" href="https://appics.com/" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(./img/partners/Appics-Signet-black.png);'"></div>
            </a>
            <a rel="nofollow noopener" href="https://appics.com/" target="_blank">Appics</a>
          </div>
		  
		  <div class="col-6 col-sm-4 col-md-3 text-center mb-4">
            <a rel="nofollow noopener" href="https://nomics.com/" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(./img/partners/Nomics_Logo.png);'"></div>
            </a>
            <a rel="nofollow noopener" href="https://nomics.com/" target="_blank">Nomics</a>
          </div>
		</div>
	  </div>
      
    </section>
	
	-->
	
	<section id="infrastructure" class="py-5">
		<div class="container">
			<h1 class="text-center pb-5">
			  <i class="fas fa-cubes"></i><br>
				{{ $t('Infrastructure') }}
			</h1>
			<div class="row">
				<div class="col-12 text-center mb-4" :title="$t('main_chain')">
				<img src="/img/HIVE.png" style="max-height: 150px;"><br/><span class="font-weight-bold">{{$t('HIVE')}}</span>
			  </div>
			</div>
			<div class="row" :title="$t('secondary_chains')">
			  <!--<div class="col-6 col-sm-4 col-md-3 text-center mb-4">
				<img src="/img/STEEM.png" style="max-height: 100px;"><br/><span class="font-weight-bold">{{$t('STEEM')}}</span>
			  </div>-->
			  <div class="col-6 text-center mb-4">
				<img src="/img/BLURT.png" style="max-height: 100px;"><br/><span class="font-weight-bold">{{$t('BLURT')}}</span>
			  </div>
			 
			  <div class="col-6 text-center mb-4">
				<img src="/img/BNB_CHAIN.webp" style="max-height: 100px;"><br/><span class="font-weight-bold">{{$t('BNB CHAIN')}}</span>
			  </div>
			</div>
		</div>
	</section>
	

    <!-- news -->
    <section id="news" class="py-5 bg-brand text-light">
      <h1 class="text-center pb-3">
        <i class="far fa-newspaper"></i><br>
        {{ $t('News') }}
      </h1>
      <client-only>
        <carousel :perPageCustom="[[0, 1], [768, 2], [1024, 3], [1280, 4]]" :paginationColor="'rgba(255, 255, 255, 0.5)'" :paginationActiveColor="'#fff'">
          <slide v-for="(post, index) in news" :post="post" :key="index">
            <News :post="post" />
          </slide>
        </carousel>
      </client-only>
    </section>
	

    <Footer isHomePage='true'/>
	
	<!-- <FriendshipModal v-if="user"/> -->
	
    <NewsModal :news="activeNews" />
	<NotifyModal :modalTitle="$t('Actifit_Info')" :modalText="$t('VP_desc')"/>
	<NotifyModal id="notifyModalRC" ref="notifyModalRC" :modalTitle="$t('Actifit_Info')" :modalText="$t('RC_desc')"/>
	
	<!--<CompetitionAnnounce />-->
	
	<pendingRewardsModal :pendingRewards="pendingRewards" :username="user" />
	
	<a id="pendingRewardsKicker" name="pendingRewardsKicker" ref="pendingRewardsKicker" class="btn btn-white" data-toggle="modal" data-target="#pendingRewardsModal"></a>
	
	<a id="pendingRewardsHider" name="pendingRewardsHider" ref="pendingRewardsHider" class="btn btn-white" data-toggle="dismiss" data-target="#pendingRewardsModal"></a>
  </div>
</template>

<script>
  import NavbarBrand from '~/components/NavbarBrand'
  import VueScrollTo from 'vue-scrollto' // for smooth scrolling
  import Footer from '~/components/Footer'
  import News from '~/components/News'
  import NewsModal from '~/components/NewsModal'
  import pendingRewardsModal from '~/components/PendingRewardsModal'
  import { mapGetters } from 'vuex'
  import SteemStats from '~/components/SteemStats'
  import NotifyModal from '~/components/NotifyModal'
  //import FriendshipModal from '~/components/FriendshipModal'
  
  //import CompetitionAnnounce from '~/components/CompetitionAnnounce'

  export default {
    components: {
	  NavbarBrand,
      Footer,
      News,
      NewsModal,
	  SteemStats,
	  NotifyModal,
	  pendingRewardsModal
	  //,FriendshipModal
	  //,CompetitionAnnounce
    },
    data () {
      return {
        username: '', // username whose funds to show
        // animated numbers
        tweenedUserCount: 0,
        tweenedTokensDistributed: 0,
        tweenedRewardedActivityCount: 0,
		reload: 0,
		profImgUrl: process.env.hiveImgUrl,
		pendingRewards: {},
		renderReady: false,
      }
    },
    computed: {
      ...mapGetters('steemconnect', ['user']),
	  ...mapGetters('steemconnect', ['stdLogin']),
      ...mapGetters(['userTokens', 'userReportCount', 'transactions', 'userRank', 'userCount', 'topDelegators', 'moderators', 'ambassadors', 'tokensDistributed', 'rewardedActivityCount', 'leaderboard', 'news', 'activeNews', 'bchain']),
      formattedUserTokens () {
        return parseFloat(this.userTokens).toFixed(3)
      },
	  
      grabUserReportCount () {
        return this.userReportCount
      },
	  
	  displayUserRank () {
		return this.userRank
	  },
	  
      // animated numbers
      animatedUserCount: function() {
        return this.tweenedUserCount.toFixed(0);
      },
      animatedTokensDistributed: function() {
        return this.tweenedTokensDistributed.toFixed(0);
      },
      animatedRewardedActivityCount: function() {
        return this.tweenedRewardedActivityCount.toFixed(0);
      }
    },
    // watchers to update animated numbers
    watch: {
      userCount: function(newValue) {
        TweenLite.to(this.$data, 8, { tweenedUserCount: newValue });
      },
      tokensDistributed: function(newValue) {
        TweenLite.to(this.$data, 8, { tweenedTokensDistributed: newValue });
      },
      rewardedActivityCount: function(newValue) {
        TweenLite.to(this.$data, 8, { tweenedRewardedActivityCount: newValue });
      },
	  user: 'fetchUserData',
	  bchain: async function(newBchain) {
		console.log('user activity change in chain '+newBchain);
		this.cur_bchain = newBchain;
		this.profImgUrl = process.env.hiveImgUrl;
		if (this.cur_bchain == 'STEEM'){
			this.profImgUrl = process.env.steemImgUrl;
		}
		await this.$store.dispatch('steemconnect/refreshUser');
		this.fetchUserData();
		this.reload += 1;
	  },
	  
    },
    methods: {
      /**
       * Scrolls down to content area.
       */
      scrollTo (target) {
        VueScrollTo.scrollTo(target, 1000, {easing: 'ease-in-out'})
      },

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
	  
	  async setPendingRewards(json){
		//console.log(json);
		this.pendingRewards = json;
		//console.log(this.pendingRewards);
		if (this.pendingRewards.pendingRewards.HIVE.amount || this.pendingRewards.pendingRewards.STEEM.amount || this.pendingRewards.pendingRewards.BLURT.amount){
			//console.log('got results');
			//console.log(this.pendingRewards);
			
			//only show if user has not opted out
			if (!localStorage.getItem('preventRewardsPop')){
				this.$refs['pendingRewardsKicker'].click();
			}
		}
	  },
	  
	  fetchUserData () {
		if (typeof this.user != 'undefined' && this.user != null){
		  this.$store.dispatch('fetchUserTokens')
		  this.$store.dispatch('fetchUserRank')
		  this.$store.dispatch('fetchUserReportCount')
		  this.$store.dispatch('fetchReferrals')
		  this.fetchUserPendingRewards();
		}
	  },
	  fetchUserPendingRewards () {
		//let's check if user already has a funds pass set
		
		  fetch(process.env.actiAppUrl+'pendingRewards/?user='+this.user.account.name).then(
			res => {res.json().then(json => this.setPendingRewards(json)).catch(e => reject(e))
		  }).catch(e => reject(e))
	  }
    },
    async mounted () {
		  // login
		  console.log('main mounted');
      this.$store.dispatch('steemconnect/login')
	  this.fetchUserData();
	
      // fetch data
      this.$store.dispatch('fetchRewardedActivityCount')
      this.$store.dispatch('fetchLeaderboard')
	  
	  this.$store.dispatch('fetchTokenInfo')

	  //grab top 12 delegators
	  this.$store.dispatch('fetchTopDelegators', 12)

	  //grab team listing
	  //this.$store.dispatch('fetchModerators')
	  this.$store.dispatch('fetchAmbassadors')

      this.$store.dispatch('fetchNews')
	  
	  //dynamically add the navbar to avoid multiple calls into it
	  this.renderReady = true;
	  
    },
	async beforeDestory(){
		this.$refs['pendingRewardsHider'].click();
	}
  }
</script>

<style lang="sass">	
  .header
    
    background: url('/img/header-5.png') top no-repeat
    background-size: cover
    .form
      max-width: 500px
      box-shadow: 0 0 50px rgba(0, 0, 0, 0.2)
  .scroll-down
    bottom: 10px
  .showcase .showcase-text
    padding: 3rem
  .showcase .showcase-img
    min-height: 30rem
    background-size: cover
    background-position: center
  .tilt
    transform: rotate(-15deg)

  .VueCarousel-dot-container
    padding: 15px !important
    .VueCarousel-dot
      padding: 1px 5px !important
      margin-top: 0 !important

  .navbar
    .navbar-nav
      .nav-link
        padding-right: .4rem
        padding-left: .4rem

  @media (min-width: 768px)
    .showcase .showcase-text
      padding: 7rem

  @media (max-width: 1200px)
    .header
      .form
        .logo
          max-width: 100px

  @media (max-width: 767px)
    .header
      .title
        font-size: 1.7rem
      .slogan
        font-size: 1.3rem
      .form-info
        font-size: 1rem
    .intro
      .headline
        font-size: 1.7rem
    .showcase
      .showcase-text
        padding: 2rem
        h2
          font-size: 1.5rem
        .lead
          font-size: 1.2rem
      .showcase-img
        min-height: 15rem
</style>
<style>
	.header{
		background-repeat: no-repeat;
		/* box-shadow: 5px 0px 5px rgb(255 0 0 / 50%), 0px 5px 5px rgb(255 0 0 / 50%); */
		 box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
		/* min-height: 100% */
	}
	section{
		margin-bottom: 0.2em;
		box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
		/* box-shadow: 5px 0px 5px rgb(255 0 0 / 50%), 0px 5px 5px rgb(255 0 0 / 50%); */
	}
	section.showcase {
		box-shadow: none;
	}
	div.footer{
		/* margin-top: 0.2em; */
	}
	.showcase .showcase-img{
		padding: 2px;
	}
	.acti-shadow{
		box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
	}
	.acti-shadow-inverse{
		box-shadow: 3px 3px 3px rgb(255 255 255 / 40%);
	}
	.showcase .showcase-text, .showcase .showcase-img{
		box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
		/* box-shadow: 5px 0px 5px rgb(255 0 0 / 50%), 0px 5px 5px rgb(255 0 0 / 50%); */
	}
	.home-card{
	  opacity: 0.9;
	}
	
	.avatar-hive{
		border-color: red;
	}
	
	
	.avatar-steem{
		border-color: lightblue;
	}
	
	.user-menu .user-avatar{
	  float: right;
	}
	.leader-cls-btn:hover{
	  background-color: darkred;
	  color: white;
	}
	.bold-content{
		font-weight: bold;
	}
</style>