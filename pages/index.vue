<template>
  <div class="home">
    <!-- top anchor -->
    <a id="top"></a>

    <!-- navbar links with smooth scrolling to sections -->
    <nav class="navbar fixed-top navbar-expand-lg navbar-light px-1">
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="scrollTo('#content')">{{ $t('What_is_actifit') }}</a>
          </li>
		  <li class="nav-item">
            <a class="nav-link" href="/whitepaper/Actifit_White_Paper.pdf">{{ $t('Whitepaper') }}</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="$router.push('/activity')">{{ $t('Activity') }}</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="scrollTo('#delegators')">{{ $t('Delegators') }}</a>
          </li>
		  <li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="scrollTo('#leaderboard')">{{ $t('Leaderboard') }}</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="scrollTo('#team')">{{ $t('Team') }}</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="scrollTo('#athletes')">{{ $t('Sponsored_Athletes') }}</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="scrollTo('#news')">{{ $t('News') }}</a>
          </li>
		  <li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="$router.push('/referrals')">{{ $t('Refer_A_Friend') }}</a>
          </li>
        </ul>
      </div>
	  <UserMenu/>
    </nav>

    <!-- header with fullscreen background -->
	<div class="header pt-4 pt-md-5 position-relative">
	  <div class="container py-5">
        
        <!-- wallet/activities preview -->
		
        <div class="card form mx-auto p-3 mt-3 mt-md-5 text-center border-0 home-card">
		  <div class="pb-md-2 text-center">
			  <img src="/img/actifit_logo.png" alt="Actifit" class="logo" />
			  <h1 class="mt-3 mt-sm-2 text-brand title">{{ $t('Actifit') }}</h1>
			  <h3 class="font-italic text-brand slogan">{{ $t('Slogan') }}</h3>
			</div>
		
		
          <div v-if="user">
            <div class="row">
              <div class="col-sm-6">
                <p class="lead text-muted mb-0">{{ $t('Balance') }}</p>
                <h3><b>{{ formattedUserTokens }}</b><br><small>{{ $t('AFIT_Token') }}</small></h3>
                <a href="#" @click.prevent="$router.push('/wallet')" class="btn btn-lg btn-brand w-100">{{ $t('My_Wallet') }}</a>
              </div>
              <div class="col-sm-6 mt-4 mt-sm-0">
                <p class="lead text-muted mb-0">{{ $t('Activity') }}</p>
                <h3><b>{{ grabUserReportCount }}</b><br><small>{{ $t('Reports') }}</small></h3>
                <a href="#" class="btn btn-lg btn-brand w-100" @click.prevent="$router.push('/activity/' + user.account.name)">{{ $t('My_Activity') }}</a>
              </div>
            </div>
          </div>

          <!-- login/register buttons -->
          <div v-else>
            <!--<p class="lead py-md-3 form-info">Log in to see your current token balance, or sign up for a Steem account to start getting rewarded for your activity.</p>-->
            <div class="row">
              <div class="col-6">
                <a :href="$steemconnect.getLoginURL()" class="btn btn-brand btn-lg w-100">{{ $t('Login') }}</a>
              </div>
              <div class="col-6">
                <a href="/signup" class="btn btn-brand btn-lg w-100">{{ $t('Sign_Up') }}</a>
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
    <section class="intro bg-light" id="content">
      <div class="container py-5">
        <h1 class="pt-5 mb-3 text-capitalize text-center headline" v-html="$t('homepage.section1_title')"></h1>
        <p class="lead mb-4 pb-5 text-center">
          {{ $t('homepage.section1_desc') }}
        </p>

        <!-- stats -->
        <div class="row pb-5">
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
        </div>
      </div>
    </section>

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
          <div class="col-lg-6 order-lg-2 text-white showcase-img" style="background-image: url('/img/showcase-3.jpg');"></div>
          <div class="col-lg-6 order-lg-1 my-auto showcase-text">
            <h2 class="text-capitalize">{{ $t('homepage.section4_title') }}</h2>
            <p class="lead mb-0">{{ $t('homepage.section4_desc') }}</p>
			<div style="text-align:center; padding-top: 10px">
				<br/>
				<a href="https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=10%20SP">10 {{ $t('SP') }}</a>|
				<a href="https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=20%20SP">20 {{ $t('SP') }}</a>|
				<a href="https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=50%20SP">50 {{ $t('SP') }}</a>|
				<a href="https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=100%20SP">100 {{ $t('SP') }}</a>|
				<a href="https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=250%20SP">250 {{ $t('SP') }}</a>|
				<a href="https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=500%20SP">500 {{ $t('SP') }}</a><br/>
				<a href="https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=1000%20SP">1,000 {{ $t('SP') }}</a>|
				<a href="https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=2000%20SP">2,000 {{ $t('SP') }}</a>|
				<a href="https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=5000%20SP">5,000 {{ $t('SP') }}</a>|
				<a href="https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=10000%20SP">10,000 {{ $t('SP') }}</a>|
				<a href="https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=20000%20SP">20,000 {{ $t('SP') }}</a>|
				<a href="https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=50000%20SP">50,000 {{ $t('SP') }}</a>
				<br/>
				<a href="https://steembottracker.com/delegation.html?delegatee=actifit">{{ $t('Custom_Amount') }}</a>
			</div>
          </div>
        </div>
      </div>
    </section>


	<!-- top Delegators -->
    <section id="delegators" class="py-5 bg-light">
      <div class="container">
        <h1 class="text-center pb-5">
          <i class="fas fa-heart"></i><br>
          {{ $t('Top_Delegators') }}
        </h1>
        <div class="row">
          <div class="col-6 col-sm-4 col-md-3 text-center mb-4" v-for="(delegator, index) in topDelegators" :key="index" :delegator="delegator">
            <a :href="delegator._id" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(https://steemitimages.com/u/' + delegator._id + '/avatar);'"></div>
            </a>
            <a :href="delegator._id" target="_blank">@{{ delegator._id }}</a><br/>
			<a :href="delegator._id" target="_blank">{{ numberFormat(delegator.steem_power, 0) }} {{ $t('Steem_Power') }}</a>
          </div>
		  <div class="full-div">
			<nuxt-link to="/delegators" class="text-center btn delegator-btn" data-target="#">{{ $t('View_All_Delegators') }}</nuxt-link>
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
                <div class="avatar mx-auto mb-3" :style="'background-image: url(https://steemitimages.com/u/' + leaderboard[1].username.replace('@','') + '/avatar);'"></div>
              </a>
              <a :href="leaderboard[1].username" target="_blank">{{ leaderboard[1].username }}</a><br/>
			  <a :href="leaderboard[1].username" target="_blank">{{ leaderboard[1].activity_count }} {{ $t('Recorded_Activity') }}</a>
            </div>
          </div>
          <div class="col-sm-4 text-center mb-4 mb-sm-0 d-flex align-items-center justify-content-center">
            <div>
              <h2>1.</h2>
              <a :href="leaderboard[0].username" target="_blank">
                <div class="avatar mx-auto mb-3" :style="'width: 200px; height: 200px; background-image: url(https://steemitimages.com/u/' + leaderboard[0].username.replace('@','') + '/avatar);'"></div>
              </a>
              <a :href="leaderboard[0].username" target="_blank">{{ leaderboard[0].username }}</a><br/>
			  <a :href="leaderboard[0].username" target="_blank">{{ leaderboard[0].activity_count }} {{ $t('Recorded_Activity') }}</a>
            </div>
          </div>
          <div class="col-sm-4 text-center mb-4 mb-sm-0 d-flex align-items-center justify-content-center">
            <div>
              <h2>3.</h2>
              <a :href="leaderboard[2].username" target="_blank">
                <div class="avatar mx-auto mb-3" :style="'width: 100px; height: 100px; background-image: url(https://steemitimages.com/u/' + leaderboard[2].username.replace('@','') + '/avatar);'"></div>
              </a>
              <a :href="leaderboard[2].username" target="_blank">{{ leaderboard[2].username }}</a><br/>
			  <a :href="leaderboard[2].username" target="_blank">{{ leaderboard[2].activity_count }} {{ $t('Recorded_Activity') }}</a>
            </div>
          </div>
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
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(https://www.dropbox.com/s/dlo8nengvv5ebpb/Mo%20-%20pro%20-%202018.jpg?dl=1);'"></div>
            </a>
            <a href="@mcfarhat" target="_blank">Mohammad Farhat</a>
			<div><i>CEO & Founder</i></div>
			<a href="https://www.linkedin.com/in/mohammadfarhat/" target="_blank"><i class="fab fa-linkedin"></i></a>
          </div>
		  <div class="col-6 col-sm-4 col-md-3 text-center mb-4">
            <a href="@alfamano" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(https://media.licdn.com/dms/image/C4D03AQHaFIYov4RQRA/profile-displayphoto-shrink_800_800/0?e=1561593600&v=beta&t=P4mXVYWQLZ95_9ulQG8HGBGmDFDN4ct6AItzcsG71Ng);'"></div>
            </a>
            <a href="@alfamano" target="_blank">Alaa Farhat</a>
			<div><i>Operations Manager</i></div>
			<a href="https://www.linkedin.com/in/alaa-farhat-b8b59317/" target="_blank"><i class="fab fa-linkedin"></i></a>
          </div>
		  <div class="col-6 col-sm-4 col-md-3 text-center mb-4">
            <a href="@katerinaramm" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(https://steemitimages.com/u/katerinaramm/avatar);'"></div>
            </a>
            <a href="@katerinaramm" target="_blank">Katerina Ramoutsaki</a>
			<div><i>Social Media Manager</i></div>
			<a href="https://www.linkedin.com/in/katerina-ramoutsaki-25055697/" target="_blank"><i class="fab fa-linkedin"></i></a>
          </div>
		  <div class="col-6 col-sm-4 col-md-3 text-center mb-4">
            <a href="@rabihfarhat" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(https://media.licdn.com/dms/image/C5603AQHo9hI0JjU5sg/profile-displayphoto-shrink_800_800/0?e=1561593600&v=beta&t=NWsO9U_HJaaZ_s5xJAiIJcRIN2lQZfJkYXcyYzi2Cg8);'"></div>
            </a>
            <a href="@rabihfarhat" target="_blank">Rabih Farhat</a>
			<div><i>Finance Manager</i></div>
			<a href="https://www.linkedin.com/in/rabih-farhat-42a1604b/" target="_blank"><i class="fab fa-linkedin"></i></a>
          </div>
		  <div class="col-6 col-sm-4 col-md-3 text-center mb-4">
            <a href="@pjansen" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(https://media.licdn.com/dms/image/C4E03AQHa0iykUKqUmA/profile-displayphoto-shrink_800_800/0?e=1561593600&v=beta&t=xl5sQ80B1Cj5Oio-ph54RFqEY2ezrjYuGE_sJsxfDeQ);'"></div>
            </a>
            <a href="@pjansen" target="_blank">Paul Jansen</a>
			<div><i>Quality Assurance Manager</i></div>
			<a href="https://www.linkedin.com/in/profilepauljansen" target="_blank"><i class="fab fa-linkedin"></i></a>
          </div>
		</div>
		<div class="row">
		  <div class="col-6 col-sm-4 col-md-3 text-center mb-4">
            <a href="@definethedollar" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(https://media.licdn.com/dms/image/C4D03AQFX6nc2g7kxPw/profile-displayphoto-shrink_800_800/0?e=1561593600&v=beta&t=ANzZzMRaKW9dYgL6V1ZhRbBVgELUPmtwCQ1Oc13SFpo);'"></div>
            </a>
            <a href="@definethedollar" target="_blank">Jason Rees</a>
			<div><i>Moderator</i></div>
			<a href="https://www.linkedin.com/in/jason-bryan-rees-68b917184/" target="_blank"><i class="fab fa-linkedin"></i></a>
          </div>
		  <div class="col-6 col-sm-4 col-md-3 text-center mb-4">
            <a href="@ciuoto" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(https://steemitimages.com/u/ciuoto/avatar);'"></div>
            </a>
            <a href="@ciuoto" target="_blank">Eugenio Pirillo</a>
			<div><i>Moderator</i></div>
			<a href="https://www.linkedin.com/in/epirillo/" target="_blank"><i class="fab fa-linkedin"></i></a>
          </div>
		  <div class="col-6 col-sm-4 col-md-3 text-center mb-4">
            <a href="@thereikiforest" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(https://media.discordapp.net/attachments/491018053685870622/570037859231465472/ADdPNihJzmPcLkHtjKRVWu2N2uvBRfNLKJYb8XFwoWdz4j9e3DS1QLdFzcrCu82tWCUcPMWmdAARuC1dyPZmPVkDo.png?width=586&height=492);'"></div>
            </a>
            <a href="@thereikiforest" target="_blank">April Newhall</a>
			<div><i>Moderator</i></div>
          </div>
		  <div class="col-6 col-sm-4 col-md-3 text-center mb-4">
            <a href="@ashikstd" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(https://media.licdn.com/dms/image/C5603AQHyM8GBU9DWzA/profile-displayphoto-shrink_800_800/0?e=1561593600&v=beta&t=E55Jf7Qf0KcMv6mhgXa45mjbdWsEn6tlHUbWj3IY0Ls);'"></div>
            </a>
            <a href="@ashikstd" target="_blank">Md Al Amin</a>
			<div><i>Moderator</i></div>
			<a href="https://www.linkedin.com/in/ashikstd/" target="_blank"><i class="fab fa-linkedin"></i></a>
          </div>
		  <div class="col-6 col-sm-4 col-md-3 text-center mb-4">
            <a href="@alokkumar121" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(https://media.licdn.com/dms/image/C4D03AQEG2ZehG2gP4w/profile-displayphoto-shrink_800_800/0?e=1561593600&v=beta&t=toFJjbpoI8gse5M64RZFgJLSoHweFSBLhdgcdPw02FY);'"></div>
            </a>
            <a href="@alokkumar121" target="_blank">Alok Kumar</a>
			<div><i>Moderator</i></div>
			<a href="https://www.linkedin.com/in/alok-kumar-18373228" target="_blank"><i class="fab fa-linkedin"></i></a>
          </div>
		  <div class="col-6 col-sm-4 col-md-3 text-center mb-4">
            <a href="@ckole" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(https://media.licdn.com/dms/image/C4D03AQEK2wNJByOaZA/profile-displayphoto-shrink_800_800/0?e=1561593600&v=beta&t=HbGxfQXZBI6sIa6qPEIUx7OgWRxWY1wFsfEpo1GqSKI);'"></div>
            </a>
            <a href="@ckole" target="_blank">S. K Olatayo</a>
			<div><i>Moderator</i></div>
			<a href="https://www.linkedin.com/in/s-k-olatayo-5b6323178/" target="_blank"><i class="fab fa-linkedin"></i></a>
          </div>
		  <div class="col-6 col-sm-4 col-md-3 text-center mb-4">
            <a href="@priyanarc" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(https://steemitimages.com/p/32FTXiZsHoAW6noHJDhrg3W8ZKHVFSsLYM859aTDCF8iErL1Z6bfFgZVxWVcQeXwjds5wDJfwPn8wUxqL4mUQj1gXrsTDqxwvNCNV36ZfkfWKCPGW5Ur4uBRzpVbDETYkJJVrCp2SaDZJkii?width=128&height=128);'"></div>
            </a>
            <a href="@priyanarc" target="_blank">Priyan Fareen</a>
			<div><i>Moderator</i></div>
			<a href="https://www.linkedin.com/in/priyan-fareen-33722398/" target="_blank"><i class="fab fa-linkedin"></i></a>
          </div>
		  <div class="col-6 col-sm-4 col-md-3 text-center mb-4">
            <a href="@kpreddy" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(https://media.licdn.com/dms/image/C5103AQFJSd4EV5aT7A/profile-displayphoto-shrink_800_800/0?e=1562198400&v=beta&t=7BT88sxg8ixtf5pIFmbR6FMa-95H0TXjikXo48egGr0);'"></div>
            </a>
            <a href="@kpreddy" target="_blank">Praveen Reddy Kanthala</a>
			<div><i>Moderator</i></div>
			<a href="https://www.linkedin.com/in/praveen-reddy-kanthala-a0532011a/" target="_blank"><i class="fab fa-linkedin"></i></a>
          </div>		  
		  <div class="col-6 col-sm-4 col-md-3 text-center mb-4">
            <a href="@sumit71428" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(https://media.licdn.com/dms/image/C5103AQHisdsxVqaShQ/profile-displayphoto-shrink_800_800/0?e=1561593600&v=beta&t=rtjC0n9_tvOFFPaO5nDr0hG9i5WpMZsAQeNPTxhCZsw);'"></div>
            </a>
            <a href="@sumit71428" target="_blank">Sumit Singh</a>
			<div><i>Moderator</i></div>
			<a href="https://www.linkedin.com/in/sumit-singh-91b616185/" target="_blank"><i class="fab fa-linkedin"></i></a>
          </div>
		  <div class="col-6 col-sm-4 col-md-3 text-center mb-4">
            <a href="@vishalsingh4997" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(https://steemitimages.com/u/vishalsingh4997/avatar/);'"></div>
            </a>
            <a href="@vishalsingh4997" target="_blank">Vishal Singh</a>
			<div><i>Moderator</i></div>
			<a href="https://www.linkedin.com/in/enomz/" target="_blank"><i class="fab fa-linkedin"></i></a>
          </div>
        </div>
      </div>
    </section>

    <!-- ambassadors -->
    <section id="ambassadors" class="py-5 bg-light">
      <div class="container">
        <h1 class="text-center pb-5">
          <i class="fas fa-bullhorn tilt"></i><br>
          {{ $t('Ambassadors') }}
        </h1>
        <div class="row">
          <div class="col-6 col-sm-4 text-center mb-4" v-for="(ambassador, index) in ambassadors" :key="index" :moderator="ambassador.name">
            <a :href="ambassador.name" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(https://steemitimages.com/u/' + ambassador.name + '/avatar);'"></div>
            </a>
            <a :href="ambassador.name" target="_blank">@{{ ambassador.name }}</a>
          </div>
        </div>
      </div>
    </section>

    <!-- sponsored athletes -->
    <section id="athletes" class="py-5">
      <div class="container">
        <h1 class="text-center pb-5">
          <i class="fas fa-dumbbell"></i><br>
          {{ $t('Sponsored_Athletes') }}
        </h1>
        <div class="row">
		  <div class="col-6 col-sm-4 text-center mb-4">
            <a href="@lasitha" target="_blank">
              <div class="avatar mx-auto mb-3" style="background-image: url('https://steemitimages.com/p/4HFqJv9qRjVeVQzX3gvDHytNF793bg88B7fESPieLQ8dxHkpPXaNe2rRpUWHJ9oYqAqg35RCq5cGDGqMBomDWQ4pj7ZxwQiW2QmTqkZ5gU3Snkvwtmqe8AkkSWsiLeULjsjFWn1JUPg6vAr1HaniGbakPsmAMyHgdfc?width=512&height=512');"></div>
            </a>
            <a href="@lasitha" target="_blank">@lasitha</a>
          </div>
		  <div class="col-6 col-sm-4 text-center mb-4">
            <a href="@christinelook" target="_blank">
              <div class="avatar mx-auto mb-3" style="background-image: url('https://steemitimages.com/p/4i88GgaV8qiFU89taP2MgKXzwntUGAvkoQiKU7VxyD37q96HFWBrAPu8BtekbVWEabLnj8XnMov6ZWym79sztA9VTWxjqavxREuQUJqYnh6of1wNVcBc8jpbRQ?width=512&height=512');"></div>
            </a>
            <a href="@christinelook" target="_blank">@christinelook</a>
          </div>
          <div class="col-6 col-sm-4 text-center mb-4">
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
    </section>

    <!-- news -->
    <section id="news" class="py-5 bg-brand text-light">
      <h1 class="text-center pb-3">
        <i class="far fa-newspaper"></i><br>
        {{ $t('News') }}
      </h1>
      <no-ssr>
        <carousel :perPageCustom="[[0, 1], [768, 2], [1024, 3], [1280, 4]]" :paginationColor="'rgba(255, 255, 255, 0.5)'" :paginationActiveColor="'#fff'">
          <slide v-for="(post, index) in news" :post="post" :key="index">
            <News :post="post" />
          </slide>
        </carousel>
      </no-ssr>
    </section>

    <Footer />
	
    <NewsModal :news="activeNews" />
  </div>
</template>

<script>
  import VueScrollTo from 'vue-scrollto' // for smooth scrolling
  import UserMenu from '~/components/UserMenu'
  import Footer from '~/components/Footer'
  import News from '~/components/News'
  import NewsModal from '~/components/NewsModal'
  import { mapGetters } from 'vuex'

  export default {
    components: {
      UserMenu,
      Footer,
      News,
      NewsModal
    },
    data () {
      return {
        username: '', // username whose funds to show

        // animated numbers
        tweenedUserCount: 0,
        tweenedTokensDistributed: 0,
        tweenedRewardedActivityCount: 0,
      }
    },
    computed: {
      ...mapGetters('steemconnect', ['user']),
      ...mapGetters(['userTokens', 'userReportCount', 'transactions', 'userRank', 'userCount', 'topDelegators', 'moderators', 'ambassadors', 'tokensDistributed', 'rewardedActivityCount', 'leaderboard', 'news', 'activeNews']),
      formattedUserTokens () {
        return parseFloat(this.userTokens).toFixed(2)
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
	  
	  fetchUserData () {
		if (typeof this.user != 'undefined' && this.user != null){
		  this.$store.dispatch('fetchUserTokens')
		  this.$store.dispatch('fetchUserRank')
		  this.$store.dispatch('fetchUserReportCount')
		  this.$store.dispatch('fetchReferrals')
		}
	  },
    },
    async mounted () {
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
	  
	  // login
      this.$store.dispatch('steemconnect/login')
	  this.fetchUserData();
    },
  }
</script>

<style lang="sass">	
  .header
    min-height: 100%
    background: url('/img/header-3.jpg') center
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
	.home-card{
	  opacity: 0.9;
	}
	
	.user-menu .user-avatar{
	  float: right;
	}
</style>