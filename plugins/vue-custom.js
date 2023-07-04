import Vue from 'vue'

//Hive auth services
import HAS from 'hive-auth-wrapper';
Vue.prototype.$HAS = HAS;

//sanitization
import sanitize from 'sanitize-html'

//global functions
Vue.prototype.$getTimeDifference = function(dateParam) {
	
  let localDate = new Date();
  
  dateParam = new Date(Date.parse(dateParam));//Date(dateParam);
  const currentDate = Date.now();
  const difference = Math.abs(dateParam.getTime() - currentDate - localDate.getTimezoneOffset() * 60000);
  
  //let difference = utcTime - dateParam.getTime();//currentDate.getUTCTime() - dateParam.getTime();
  let mins = Math.floor(difference / (1000 * 60 ));
  let hours = Math.floor(difference / (1000 * 60 * 60));
  let days = Math.floor(hours / 24);
  let weeks = Math.floor(days / 7);
  let months = Math.floor(weeks / 4);
  let years = Math.floor(months / 12);
  let remainingMonths = months % 12;

  if (mins < 60) {
	return `${mins} min(s)`;
  } else if (hours < 24) {
	return `${hours} hour(s)`;
  } else if (days < 7) {
	return `${days} day(s)`;
  } else if (weeks < 4) {
	return `${weeks} week(s)`;
  } else if (months < 12) {
	return `${months} month(s)`;
  } else {
	return `${years} year(s)`;//`${years} years and ${remainingMonths} month(s)`;
  }
}
/**
       * Formats numbers with commas and dots.
       *
       * @param number
	   * @param precision
       * @returns {string}
       */
Vue.prototype.$numberFormat = function(number, precision) {
	return new Intl.NumberFormat('en-EN', { maximumFractionDigits : precision}).format(number)
}

/** global function to process API calls to blockchain **/
Vue.prototype.$processTrxFunc = async function (op_name, cstm_params, active) {
  if (!localStorage.getItem('std_login')) {
	let res = await this.$steemconnect.broadcast([[op_name, cstm_params]]);
	if (res.result.ref_block_num) {
	  console.log('success');
	  return { success: true, trx: res.result };
	} else {
	  return { success: false, trx: null };
	}
  } else if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain) {
	return new Promise((resolve) => {
	  window.hive_keychain.requestBroadcast(
		this.user.account.name,
		[[op_name, cstm_params]],
		active ? 'Active' : 'Posting',
		(response) => {
		  console.log(response);
		  resolve({ success: response.success, txID: response.result.id });
		}
	  );
	});
  } else if (localStorage.getItem('acti_login_method') == 'hiveauth') {
	return new Promise((resolve) => {
	  const auth = {
		username: this.user.account.name,
		token: localStorage.getItem('access_token'),
		expire: localStorage.getItem('expires'),
		key: localStorage.getItem('key')
	  };

	  let operation = [[op_name, cstm_params]];

	  this.$HAS.broadcast(auth, active ? 'active' : 'posting', operation, (evt) => {
		console.log(evt);
		let msg = this.$t('verify_hiveauth_app');
		this.$notify({
		  group: 'warn',
		  text: msg,
		  duration: -1,
		  position: 'top center'
		});
	  })
		.then((response) => {
		  console.log(response);
		  this.$notify({
			group: 'warn',
			clean: true
		  });
		  if (response.cmd && response.cmd === 'sign_ack') {
			resolve({ success: true, txID: response.data });
		  } else if (response.cmd && response.cmd === 'sign_nack') {
			resolve({ success: false });
		  }
		})
		.catch((err) => {
		  this.$notify({
			group: 'warn',
			clean: true
		  });
		  console.log(err);
		  resolve({ success: false });
		});
	});
  } else {
	let operation = [[op_name, cstm_params]];
	console.log('broadcasting');
	console.log(operation);

	let accToken = localStorage.getItem('access_token');
	let op_json = JSON.stringify(operation);
	let cur_bchain = localStorage.getItem('cur_bchain') ? localStorage.getItem('cur_bchain') : '';
	let url = new URL(process.env.actiAppUrl + 'performTrx/?user=' + this.user.account.name + '&operation=' + op_json + '&bchain=' + cur_bchain);
	let reqHeads = new Headers({
	  'Content-Type': 'application/json',
	  'x-acti-token': 'Bearer ' + accToken
	});

	let res = await fetch(url, {
	  headers: reqHeads
	});

	let outcome = await res.json();
	console.log(outcome);

	if (outcome.error) {
	  console.log(outcome.error);

	  let err_msg = outcome.trx.tx.error;
	  if (err_msg.includes('missing') && err_msg.includes('authority')) {
		localStorage.removeItem('access_token');
		this.error_msg = this.$t('session_expired_login_again');
		this.$store.dispatch('steemconnect/logout');
	  }

	  this.$notify({
		group: 'error',
		text: err_msg,
		position: 'top center'
	  });

	  return { success: false, trx: null };
	} else {
	  return { success: true, trx: outcome.trx };
	}
  }
};

Vue.prototype.$cleanBody = function (report_content){
	//sanitize content first hand
	report_content = sanitize(report_content);// , { allowedTags: ['img', 'details', 'summary', 'iframe', 'blockquote'] } );
	
	//fix for lost blockquotes
	report_content = report_content.replaceAll('&gt;','>');
	//console.log(report_content);
	//console.log(report_content);
	//return report_content;
	/* let's find images sent as ![](), and display them properly */
	//let img_links_reg = /^(?:(?!=").)*((https?:\/\/[./\d\w-]*\.(?:png|jpg|jpeg|gif))|((https?:\/\/usermedia\.actifit\.io\/[./\d\w-]+)))/igm;
	let img_links_reg = /[!]\[[\d\w\s-\.\(\)]*\]\((((https?:\/\/actifit\.s3\.amazonaws\.com\/)|((https?:\/\/usermedia\.actifit\.io\/))|((https:\/\/ipfs\.busy\.org\/ipfs\/))|((https:\/\/steemitimages\.com\/)))[\d\w-=&[\:\/\.\%\?]+|(https?:\/\/[.\d\w-\/\:\%]*(\.(?:png|jpg|jpeg|gif)(\??[\d\w-=&[\:\/\.\%\?]+)?)?))[)]/igm;
	report_content = report_content.replace(img_links_reg,'<img src="$1">');
	
	/* let's find images sent as pure URLs, and display them as actual images, while avoiding well established images */
	/* negative lookbehinds are not supported ?<! we need to switch to another approach */
	//img_links_reg = /(?<!=")(?<!]\()(((https?:\/\/usermedia\.actifit\.io\/)[\d\w-]+)|(https?:\/\/[./\d\w-]*\.(?:png|jpg|jpeg|gif)))/igm;
	//img_links_reg = /(((https?:\/\/usermedia\.actifit\.io\/)[\d\w-]+)|(https?:\/\/[./\d\w-]*\.(?:png|jpg|jpeg|gif)))(?!")/igm;
	img_links_reg = /(((https?:\/\/actifit\.s3\.amazonaws\.com\/)[\d\w-]+)|((https?:\/\/usermedia\.actifit\.io\/)[\d\w-]+)|((https:\/\/ipfs\.busy\.org\/ipfs\/)[\d\w-]+)|((https:\/\/steemitimages\.com\/)[\d\w-[\:\/\.]+)|(https?:\/\/[.\/\d\w-]*\.(?:png|jpg|jpeg|gif)))[\s]/igm;
	report_content = report_content.replace(img_links_reg,'<img src="$1">');
	
	/* let's match youtube videos and display them in a player */
	//let vid_reg = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/gm;
	let vid_reg = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube\.com\S*[^\w\-\s])([\w\-]{11})(?=[^\w\-]|$)(?![?=&amp;+%\w]*(?:['"][^&lt;&gt;]*&gt;|&lt;\/a&gt;))[?=&amp;+%\w-]*/ig;
	
	//swap into a player format, and introduce embed format for proper playing of videos
	report_content = report_content.replace(vid_reg,'<iframe width="640" height="360" src="https://www.youtube.com/embed/$1"></iframe>');
	
	//add support for 3speak videos embedded within iframe
	//let threespk_reg = /[.*](https?:\/\/3speak\.tv\/watch\?v=([\w-]+\/[\w-]+))/i;
	//let threespk_reg = /(?:\[!\[\]\()?https?:\/\/3speak\.tv\/watch\?v=([\w-]+\/[\w-]+)(?:\)\])?/i;
	let threespk_reg = /(?:\[.*\]\()?https?:\/\/3speak\.tv\/watch\?v=([\w-]+\/[\w-]+)(?:\))?/i;
	report_content = report_content.replace(threespk_reg,'<iframe width="640" height="360" src="//3speak.tv/embed?v=$1&autoplay=false"></iframe>');
	//examples: 
	//https://3speak.tv/watch?v=jongolson/vhtttbyf		//[![](https://ipfs-3speak.b-cdn.net/ipfs/bafkreiee4k3q5sax6stbqzty6yktbhmk4mi2opf6r7hckti3ypkjvigjhi/)](https://3speak.tv/watch?v=jongolson/vhtttbyf)

	
	/* let's find links sent as [](), and display them properly */
	//let href_lnks = /\[([\d\w\s-\.\(\)=[\:\/\.%\?&"<>]*)\]\(([\d\w-=[\:\/\.%\?&]+|(https?:\/\/[.\d\w-\/\:\%\(\)]*\.))[)]/igm;
	//report_content = report_content.replace(href_lnks,'<a href="$2">$1</a>');
	
	//let href_lnks = /\[([\d\w-\.\@]*)\]\(([\d\w-\.\@\/\:]*)\)/igm;
	//report_content = report_content.replace(href_lnks,'<a href="$2">$1</a>');
	
	/* regex to match @ words and convert them to steem user links. Need to skip special occurrences such as name within a link (preceded by /) */
	let user_name = /([^\/])(@([\d\w-.]+))/igm;
	
	report_content = report_content.replace(user_name,'$1<a href="https://actifit.io/$2">$2</a>')
	
	
	//return md.render(report_content);
	//return sanitize(md.render(report_content) , { allowedTags: ['img', 'details', 'summary', 'iframe', 'blockquote'] })
	return report_content;
}

Vue.prototype.$clearDraft = function (username, type){
	localStorage.removeItem(username+'_draft_'+type);
};

Vue.prototype.$storeDraft = function (username, data, type) {
	localStorage.setItem(username+'_draft_'+type, JSON.stringify(data));
};

Vue.prototype.$loadDraft = function (username, type) {
	try{
		let data = localStorage.getItem(username+'_draft_'+type);
		console.log(data);
		return data;
	}catch(err){
		console.log(err);
		return '';
	}
};
