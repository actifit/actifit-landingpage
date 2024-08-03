import Vue from 'vue'

//Hive auth services
import HAS from 'hive-auth-wrapper';
Vue.prototype.$HAS = HAS;
console.log('Hive Auth Service initialized:', HAS);
//sanitization
import sanitize from 'sanitize-html'

import moment from "moment";

import Lodash from 'lodash';

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
	return `${mins} min(s) ago`;
  } else if (hours < 24) {
	return `${hours} hour(s) ago`;
  } else if (days < 7) {
	return `${days} day(s) ago`;
  } else if (weeks < 4) {
	return `${weeks} week(s) ago`;
  } else if (months < 12) {
	return `${months} month(s) ago`;
  } else {
	return `${years} year(s) ago`;//`${years} years and ${remainingMonths} month(s)`;
  }
}


Vue.prototype.$getDaysDifference = function(firstDate, secondDate) {
	
  let localDate = new Date();
  
  const dateParam = new Date(Date.parse(firstDate));//Date(dateParam);
  const currentDate = new Date(Date.parse(secondDate));
  const difference = Math.abs(dateParam.getTime() - currentDate);// - localDate.getTimezoneOffset() * 60000);
  
  //let difference = utcTime - dateParam.getTime();//currentDate.getUTCTime() - dateParam.getTime();
  let mins = Math.floor(difference / (1000 * 60 ));
  let hours = Math.floor(difference / (1000 * 60 * 60));
  let days = Math.floor(hours / 24);
  /*let weeks = Math.floor(days / 7);
  let months = Math.floor(weeks / 4);
  let years = Math.floor(months / 12);
  let remainingMonths = months % 12;*/
  return days;

  /*if (mins < 60) {
	return `${mins} min(s) ago`;
  } else if (hours < 24) {
	return `${hours} hour(s) ago`;
  } else if (days < 7) {
	return `${days} day(s) ago`;
  } else if (weeks < 4) {
	return `${weeks} week(s) ago`;
  } else if (months < 12) {
	return `${months} month(s) ago`;
  } else {
	return `${years} year(s) ago`;//`${years} years and ${remainingMonths} month(s)`;
  }*/
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

Vue.prototype.$reblog = async function (user, post){
	let user_prmpt = this.$t('reblog_confirm');
	let decis = confirm(user_prmpt);
	if (!decis){
		return;
	}
	let op_name = 'custom_json';
	let cstm_params;
	cstm_params = {
		required_auths: [],
		required_posting_auths: [user.account.name],
		id: 'reblog',
		json: "[\"reblog\",{\"account\":\""+user.account.name+"\", \"author\":\""+post.author+"\", \"permlink\":\""+post.permlink+"\"}]"//JSON.stringify([])
	};
	let outc = await this.$processTrxFunc(op_name, cstm_params, false);
	if (outc.success){
		this.$notify({
		group: 'success',
		text: 'success',
		position: 'top center'
	  });
	}else{
		this.$notify({
		group: 'error',
		text: 'error',
		position: 'top center'
	  });
	}
	
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
		  resolve({ success: response.success, txID: response.result.id, trx: {tx: {id:response.result.id}} });
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
			resolve({ success: true, txID: response.data, trx: {tx: {id: response.data} }});
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

Vue.prototype.$cleanBody = function (report_content, full_cleanup){
	//sanitize content first hand
	let img_replacement = '<img src="$1">';
	let vid_replacement = '<iframe width="640" height="360" src="https://www.youtube.com/embed/$1"></iframe>';
	let user_link_replacement = '$1<a href="https://actifit.io/$2">$2</a>';
	
	if (full_cleanup){
		report_content = sanitize(report_content, { allowedTags: []});
		img_replacement = '';
		vid_replacement = '';
	}else{
		report_content = sanitize(report_content, { allowedTags: ['img', 'details', 'summary', 'iframe', 'blockquote'] } );
	}
	//fix for lost blockquotes
	report_content = report_content.replaceAll('&gt;','>');
	//console.log(report_content);
	//console.log(report_content);
	//return report_content;
	/* let's find images sent as ![](), and display them properly */
	//let img_links_reg = /^(?:(?!=").)*((https?:\/\/[./\d\w-]*\.(?:png|jpg|jpeg|gif))|((https?:\/\/usermedia\.actifit\.io\/[./\d\w-]+)))/igm;
	let img_links_reg = /[!]\[[\d\w\s-\.\(\)]*\]\((((https?:\/\/actifit\.s3\.amazonaws\.com\/)|((https?:\/\/usermedia\.actifit\.io\/))|((https:\/\/ipfs\.busy\.org\/ipfs\/))|((https:\/\/steemitimages\.com\/)))[\d\w-=&[\:\/\.\%\?]+|(https?:\/\/[.\d\w-\/\:\%]*(\.(?:png|jpg|jpeg|gif)(\??[\d\w-=&[\:\/\.\%\?]+)?)?))[)]/igm;
	report_content = report_content.replace(img_links_reg, img_replacement);
	
	/* let's find images sent as pure URLs, and display them as actual images, while avoiding well established images */
	/* negative lookbehinds are not supported ?<! we need to switch to another approach */
	//img_links_reg = /(?<!=")(?<!]\()(((https?:\/\/usermedia\.actifit\.io\/)[\d\w-]+)|(https?:\/\/[./\d\w-]*\.(?:png|jpg|jpeg|gif)))/igm;
	//img_links_reg = /(((https?:\/\/usermedia\.actifit\.io\/)[\d\w-]+)|(https?:\/\/[./\d\w-]*\.(?:png|jpg|jpeg|gif)))(?!")/igm;
	img_links_reg = /(((https?:\/\/actifit\.s3\.amazonaws\.com\/)[\d\w-]+)|((https?:\/\/usermedia\.actifit\.io\/)[\d\w-]+)|((https:\/\/ipfs\.busy\.org\/ipfs\/)[\d\w-]+)|((https:\/\/steemitimages\.com\/)[\d\w-[\:\/\.]+)|(https?:\/\/[.\/\d\w-]*\.(?:png|jpg|jpeg|gif)))[\s]/igm;
	report_content = report_content.replace(img_links_reg, img_replacement);
	
	//final catch all for images converting any left overs to proper tag:
	img_links_reg = /^(?!<img\s+src=)([^<>\s]+\.(?:png|jpe?g|gif|bmp|ico|svg))$/igm;
	report_content = report_content.replace(img_links_reg, img_replacement);
	
	/* let's match youtube videos and display them in a player */
	//let vid_reg = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/gm;
	let vid_reg = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube\.com\S*[^\w\-\s])([\w\-]{11})(?=[^\w\-]|$)(?![?=&amp;+%\w]*(?:['"][^&lt;&gt;]*&gt;|&lt;\/a&gt;))[?=&amp;+%\w-]*/ig;
	
	//swap into a player format, and introduce embed format for proper playing of videos
	report_content = report_content.replace(vid_reg, vid_replacement);
	
	//add support for 3speak videos embedded within iframe
	//let threespk_reg = /[.*](https?:\/\/3speak\.tv\/watch\?v=([\w-]+\/[\w-]+))/i;
	//let threespk_reg = /(?:\[!\[\]\()?https?:\/\/3speak\.tv\/watch\?v=([\w-]+\/[\w-]+)(?:\)\])?/i;
	let threespk_reg = /(?:\[.*\]\()?https?:\/\/3speak\.tv\/watch\?v=([\w.-]+\/[\w.-]+)(?:\))?/i;
	report_content = report_content.replace(threespk_reg,'<iframe width="640" height="360" src="//3speak.tv/embed?v=$1&autoplay=false"></iframe>');
	//examples: 
	//https://3speak.tv/watch?v=jongolson/vhtttbyf		//[![](https://ipfs-3speak.b-cdn.net/ipfs/bafkreiee4k3q5sax6stbqzty6yktbhmk4mi2opf6r7hckti3ypkjvigjhi/)](https://3speak.tv/watch?v=jongolson/vhtttbyf)

	
	/* let's find links sent as [](), and display them properly */
	//let href_lnks = /\[([\d\w\s-\.\(\)=[\:\/\.%\?&"<>]*)\]\(([\d\w-=[\:\/\.%\?&]+|(https?:\/\/[.\d\w-\/\:\%\(\)]*\.))[)]/igm;
	//report_content = report_content.replace(href_lnks,'<a href="$2">$1</a>');
	
	//let href_lnks = /\[([\d\w-\.\@]*)\]\(([\d\w-\.\@\/\:]*)\)/igm;
	//report_content = report_content.replace(href_lnks,'<a href="$2">$1</a>');
	
	/* regex to match @ words and convert them to steem user links. Need to skip special occurrences such as name within a link (preceded by /) */
	if (!full_cleanup){
		let user_name = /([^\/])(@([\d\w-.]+))/igm;
		
		report_content = report_content.replace(user_name, user_link_replacement);
	}
	
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

Vue.prototype.$dateToFullRelative = function (d){
	  const isTimeZoned = d.indexOf(".") !== -1 || d.indexOf("+") !== -1 ? d : `${d}.000Z`;
	  const dm = moment(new Date(isTimeZoned));
	  return dm.fromNow();
	};
	
Vue.prototype.$dayDiff = function (d) {
	  const isTimeZoned = d.indexOf(".") !== -1 || d.indexOf("+") !== -1 ? d : `${d}.000Z`;
	  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
	  const a = new Date(isTimeZoned);
	  const b = new Date();

	  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
	  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

	  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
	};
	
Vue.prototype.$hourDiff = function (d) {
	  const isTimeZoned = d.indexOf(".") !== -1 || d.indexOf("+") !== -1 ? d : `${d}.000Z`;
	  let diff = (new Date().getTime() - new Date(isTimeZoned).getTime()) / 1000;
	  diff /= 60 * 60;
	  return Math.abs(Math.round(diff));
	};
	
Vue.prototype.$secondDiff = function (d) {
	  const isTimeZoned = d.indexOf(".") !== -1 || d.indexOf("+") !== -1 ? d : `${d}.000Z`;
	  let diff = (new Date().getTime() - new Date(isTimeZoned).getTime()) / 1000;
	  return Math.abs(Math.round(diff));
	};
	
Vue.prototype.$postHasImage = function(metaData){
	if (metaData.image){
		if (Array.isArray(metaData.image) && metaData.image.length > 0){
			return true;
		}
	}
	if (metaData.images){
		if (Array.isArray(metaData.images) && metaData.images.length > 0){
			return true;
		}
	}
	return false;
};

Vue.prototype.$fetchPostImage = function (metaData){
	if (this.$postHasImage(metaData)){
		try{
			//find first occurrence that is url
			return metaData.image.find(element => /^(http|https):\/\//.test(element));
		}catch(err){
			//alt image case
			return metaData.images.find(element => /^(http|https):\/\//.test(element));
		}
	}
	return "";
};

Vue.prototype.$getCommunityLogo = function (communityName){
	return 'https://images.hive.blog/u/'+communityName+'/avatar';
};

Vue.prototype.$findCardCountByRarity = async function (userCards, rarityParam){
	let match = {rarity: rarityParam}
	//using filter to find all matches
	let matchCount = _.filter(userCards, match);
	if (matchCount != null && matchCount.length > 0){
		console.log('cards with rarity '+ rarityParam + ':'+matchCount.length)
		return matchCount.length;
	}else{
		console.log('zero matches for rarity '+rarityParam);
		return 0;
	}
};