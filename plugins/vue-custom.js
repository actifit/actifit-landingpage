import Vue from 'vue'

//Hive auth services
import HAS from 'hive-auth-wrapper';
Vue.prototype.$HAS = HAS;

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

Vue.prototype.$fetchReportTags = function(report){
  let tagDisplay = "";
  if (report && report.json_metadata) {
    //let meta_data = JSON.parse(report.json_metadata);

    let meta_data = (typeof report.json_metadata === "string")
      ? JSON.parse(report.json_metadata)
      : report.json_metadata;

    for (let i in meta_data.tags) {
      //skip empty tags
      if (meta_data.tags[i] && meta_data.tags[i].trim() != ''){
        // Sanitize the tag to strip all HTML before rendering
        const sanitizedTag = sanitize(meta_data.tags[i], {
          allowedTags: [],
          allowedAttributes: {},
        });
        tagDisplay += '<span class="single-tag p-1">' + sanitizedTag + '</span> ';
      }
      if (i > process.env.maxTagDisplay - 1) break;
    };
  }
  return tagDisplay;
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
  if (!report_content) return '';

	// If a full cleanup is requested, strip all HTML.
	if (full_cleanup) {
		return sanitize(report_content, {
			allowedTags: [],
			allowedAttributes: {},
		});
	}

	// 1. Basic video embeds (YouTube, 3Speak)
	// Replace 3Speak links with their iframe embed
	let threespk_embed_reg = /\[!\[[^\]]*\]\([^)]+\)\]\(https?:\/\/3speak\.tv\/watch\?v=([\w.-]+\/[\w.-]+)\)/ig;
	report_content = report_content.replace(threespk_embed_reg, '<iframe src="https://play.3speak.tv/watch?v=$1&mode=iframe&autoplay=false&layout=desktop"></iframe>');
	let threespk_raw_reg = /(^|\s)(https?:\/\/3speak\.tv\/watch\?v=([\w.-]+\/[\w.-]+))/ig;
	report_content = report_content.replace(threespk_raw_reg, '$1<iframe src="https://play.3speak.tv/watch?v=$3&mode=iframe&autoplay=false&layout=desktop"></iframe>');
	
	// Replace YouTube links with their iframe embed
	let vid_reg = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube\.com\S*[^\w\-\s])([\w\-]{11})(?=[^\w\-]|$)(?![?=&+%\w]*(?:['"][^<>]*>|<\/a>))[?=&+%\w-]*/ig;
	report_content = report_content.replace(vid_reg, '<iframe src="https://www.youtube.com/embed/$1"></iframe>');


	// 2. Define secure sanitization options
	const sanitizeOptions = {
		allowedTags: sanitize.defaults.allowedTags.concat([ 'img', 'iframe', 'div', 'span', 'a' ]),
		allowedAttributes: {
			a: ['href', 'rel'], // Only allow href and rel
			img: ['src', 'alt'], // Only allow src and alt
			iframe: ['src', 'width', 'height', 'frameborder', 'allowfullscreen'],
			div: ['class'],
			span: ['class']
		},
		allowedSchemes: ['http', 'https', 'mailto', 'tel'],
		// Enforce noopener and ugc on all links for security and SEO
		transformTags: {
			'a': function(tagName, attribs) {
				if (attribs.href) {
					// Add actifit.io link for mentions
					if (attribs.href.startsWith('@')) {
						return {
							tagName: 'a',
							attribs: {
								href: 'https://actifit.io/' + attribs.href.substring(1),
								rel: 'noopener ugc'
							}
						};
					}
					return {
						tagName: 'a',
						attribs: {
							href: attribs.href,
							rel: 'noopener ugc'
						}
					};
				}
				return { tagName, attribs };
			},
			'img': function(tagName, attribs) {
				if (attribs.src) {
					const url = attribs.src.trim();
					if (url.startsWith('http')) {
						// Use Hive image proxy for all images except GIFs
						const proxiedUrl = (url.startsWith('https://images.hive.blog') || url.toLowerCase().endsWith('.gif'))
							? url
							: `https://images.hive.blog/0x0/${url}`;
						return {
							tagName: 'img',
							attribs: {
								src: proxiedUrl,
								alt: attribs.alt || ''
							}
						};
					}
				}
				// If src is invalid or missing, remove the tag
				return { tagName: 'span', text: '' };
			}
		},
		// Ensure only safe iframe sources are allowed
		allowedIframeHostnames: ['www.youtube.com', 'play.3speak.tv']
	};

	// 3. Sanitize the content
	let sanitized_content = sanitize(report_content, sanitizeOptions);

	// The dangerous replaceAll is removed. All sanitization is handled above.

	return sanitized_content;
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

//Generates a random ID - for example for images
Vue.prototype.$uuidv4 = function(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

Vue.prototype.$fetchHiveFmtPostImage = function (metaData){
	if (this.$postHasImage(metaData)){
		try{
			//find first occurrence that is url
			return 'https://images.hive.blog/0x0/' + metaData.image.find(element => /^(http|https):\/\//.test(element));
		}catch(err){
			//alt image case
			return 'https://images.hive.blog/0x0/' + metaData.images.find(element => /^(http|https):\/\//.test(element));
		}
	}
	return "";
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

Vue.prototype.$parseJsonMetadata = function parseJsonMetadata(value) {
		if (!value) return {};
		if (typeof value === 'object') return value;
		if (typeof value === 'string') {
			const trimmed = value.trim();
			if (trimmed === '[object Object]') return {};
			if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
				try { return JSON.parse(trimmed); } catch (e) { console.warn('Invalid json_metadata', e); return {}; }
			}
			try { return JSON.parse(trimmed); } catch (e) { return {}; }
		}
		return {};
	};
