import Vue from 'vue'

//Hive auth services
import HAS from 'hive-auth-wrapper';
Vue.prototype.$HAS = HAS;

//sanitization
import DOMPurify from 'dompurify'
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import c from 'highlight.js/lib/languages/c';
import csharp from 'highlight.js/lib/languages/csharp';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import ruby from 'highlight.js/lib/languages/ruby';
import php from 'highlight.js/lib/languages/php';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import sql from 'highlight.js/lib/languages/sql';
import yaml from 'highlight.js/lib/languages/yaml';
import markdown from 'highlight.js/lib/languages/markdown';
import diff from 'highlight.js/lib/languages/diff';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('py', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('c', c);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('cs', csharp);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('rb', ruby);
hljs.registerLanguage('php', php);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('json', json);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('yml', yaml);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('md', markdown);
hljs.registerLanguage('diff', diff);

marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (_) {}
    }
    try {
      return hljs.highlightAuto(code).value;
    } catch (_) {}
    return '';
  }
}));

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
        let sanitizedTag = '';
        if (process.client) {
          sanitizedTag = DOMPurify.sanitize(meta_data.tags[i], { ALLOWED_TAGS: [] });
        } else {
          // Server-side fallback: strip tags using regex
          sanitizedTag = meta_data.tags[i].replace(/<[^>]*>?/gm, '');
        }
        // Only add the tag if it's not empty after sanitization
        if (sanitizedTag.trim() !== '') {
          tagDisplay += '<span class="single-tag p-1">' + sanitizedTag + '</span> ';
        }
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

Vue.prototype.$cleanBody = function (report_content, full_cleanup, no_media){
	if (!report_content) return '';

	// Define all replacements and regex first
	let vid_replacement = '<div class="video-container"><iframe width="640" height="360" src="https://www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe></div>';

	// =========================================================================
	// ===== STEP 1: PRE-PROCESS VIDEOS AND IMAGES INTO PLACEHOLDERS =========
	// =========================================================================

	const placeholders = {};
	let counter = 0;

	// Stash function that generates a placeholder
	const stashResult = (html) => {
		if (no_media) return '';
		const placeholder = `HTML_PLACEHOLDER_${counter++}`;
		placeholders[placeholder] = html;
		return placeholder;
	};

	// Protect markdown links [text](url) from being corrupted by
	// video/image/mention regexes that match URLs inside them.
	const markdownLinks = [];
	const markdownLinkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
	report_content = report_content.replace(markdownLinkRegex, (match) => {
		const linkPlaceholder = `MDLINK_PH_${markdownLinks.length}`;
		markdownLinks.push(match);
		return linkPlaceholder;
	});

	// Process 3Speak
	let threespk_embed_reg = /\[!\[[^\]]*\]\([^)]+\)\]\(https?:\/\/3speak\.tv\/watch\?v=([\w.-]+\/[\w.-]+)\)/ig;
	report_content = report_content.replace(threespk_embed_reg, (match, v) => {
		return stashResult(`<div class="video-container"><iframe src="https://play.3speak.tv/watch?v=${v}&mode=iframe&autoplay=false&layout=desktop" scrolling="no" frameborder="0" allowfullscreen></iframe></div>`);
	});

	let threespk_raw_reg = /(^|\s)(https?:\/\/3speak\.tv\/watch\?v=([\w.-]+\/[\w.-]+))/ig;
	report_content = report_content.replace(threespk_raw_reg, (match, prefix, url, v) => {
		return prefix + stashResult(`<div class="video-container"><iframe src="https://play.3speak.tv/watch?v=${v}&mode=iframe&autoplay=false&layout=desktop" scrolling="no" frameborder="0" allowfullscreen></iframe></div>`);
	});

	// Process YouTube
	let vid_reg = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube\.com\S*[^\w\-\s])([\w\-]{11})(?=[^\w\-]|$)(?![?=&+%\w]*(?:['"][^<>]*>|<\/a>))[?=&+%\w-]*/ig;
	report_content = report_content.replace(vid_reg, (match, v) => {
		return stashResult(`<div class="video-container"><iframe width="640" height="360" src="https://www.youtube.com/embed/${v}" frameborder="0" allowfullscreen></iframe></div>`);
	});

	// Process Images (unified approach)
	const createProxiedImageTag = (url) => {
		if (!url || typeof url !== 'string') return '';
		url = url.trim();
		if (!url.startsWith('http')) return '';
		const proxiedUrl = (url.startsWith('https://images.hive.blog') || url.toLowerCase().endsWith('.gif'))
			? url
			: `https://images.hive.blog/0x0/${url}`;
		return `<img src="${proxiedUrl}">`;
	};

	const existingImgRegex = /<img\s+[^>]*?src\s*=\s*['"]([^'"]+)['"][^>]*?>/gi;
	report_content = report_content.replace(existingImgRegex, (match, url) => stashResult(createProxiedImageTag(url)));

	const markdownImgRegex = /!\[[^\]]*\]\s*\(([^)]+)\)/g;
	report_content = report_content.replace(markdownImgRegex, (match, url) => stashResult(createProxiedImageTag(url)));

	const rawImgRegex = /(^|\s)(https?:\/\/[^\s"'<>]*\.(?:png|jpg|jpeg|gif|webp))/g;
	report_content = report_content.replace(rawImgRegex, (match, prefix, url) => prefix + stashResult(createProxiedImageTag(url)));

    // Mentions
    if (!full_cleanup){
		let user_name_regex = /([^\/])(@([\d\w-.]+))/igm;
		report_content = report_content.replace(user_name_regex, (match, prefix, full_user, username) => {
            return prefix + stashResult(`<a href="https://actifit.io/@${username}">@${username}</a>`);
        });
	}

	// Restore markdown links that were protected from pre-processing
	for (let i = markdownLinks.length - 1; i >= 0; i--) {
		report_content = report_content.replace(`MDLINK_PH_${i}`, markdownLinks[i]);
	}

	// =========================================================================
	// ===== STEP 2: CONVERT MARKDOWN TO HTML =================================
	// =========================================================================

	let html_content = marked.parse(report_content, { breaks: true, gfm: true });

	// =========================================================================
	// ===== STEP 3: RESTORE PLACEHOLDERS AND SANITIZE ========================
	// =========================================================================

	let sanitizeOptions = {
		ALLOWED_TAGS: [ 'img', 'iframe', 'details', 'summary', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'sub', 'sup', 'div', 'a', 'p', 'br', 'strong', 'em', 'u', 's', 'blockquote', 'code', 'pre', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span' ],
		ALLOWED_ATTR: [ 'src', 'style', 'class', 'alt', 'title', 'width', 'height', 'frameborder', 'allowfullscreen', 'href', 'target', 'rel', 'colspan', 'rowspan', 'data-external-href' ],
		ALLOWED_URI_REGEXP: /.*/,
		SAFE_FOR_TEMPLATES: true,
		ALLOW_UNKNOWN_PROTOCOLS: true,
        // Block dangerous CSS properties that allow UI hijacking (phishing popups)
        FORBID_ATTR: ['id', 'onclick', 'onerror', 'onload'],
        FORBID_TAGS: ['style', 'script'],
	};

    let sanitized_html = '';

    if (process.client) {
        // Custom hook to strip dangerous CSS from style attributes
        DOMPurify.addHook('afterSanitizeAttributes', function(node) {
            if (node.hasAttribute('style')) {
                let style = node.getAttribute('style');
                // Remove properties that allow positioning elements outside their container
                const dangerousProps = ['position', 'z-index', 'top', 'left', 'bottom', 'right', 'margin-top', 'margin-left'];
                dangerousProps.forEach(prop => {
                    const regex = new RegExp(prop + '\\s*:\\s*[^;]+;?', 'gi');
                    style = style.replace(regex, '');
                });
                node.setAttribute('style', style);
            }
        });

        sanitized_html = DOMPurify.sanitize(html_content, sanitizeOptions);

        // Remove the hook after use to prevent affecting other sanitization tasks if any
        DOMPurify.removeHook('afterSanitizeAttributes');
    } else {
        // Server-side sanitization using sanitize-html
        const sanitizeHtml = require('sanitize-html');
        sanitized_html = sanitizeHtml(html_content, {
            allowedTags: sanitizeOptions.ALLOWED_TAGS,
            allowedAttributes: {
                '*': sanitizeOptions.ALLOWED_ATTR
            },
            allowedStyles: {
                '*': {
                    // Match the dangerousProps logic from DOMPurify hook
                    'position': [/^((?!fixed|absolute|relative).)*$/],
                    'z-index': [/^((?!.*).)*$/], // Disallow all z-index on server for safety
                    'top': [/^((?!.*).)*$/],
                    'left': [/^((?!.*).)*$/],
                    'bottom': [/^((?!.*).)*$/],
                    'right': [/^((?!.*).)*$/],
                }
            }
        });
    }

    // RESTORE PLACEHOLDERS AFTER SANITIZATION
    for (const placeholder in placeholders) {
        sanitized_html = sanitized_html.replace(placeholder, placeholders[placeholder]);
    }

	// =========================================================================
	// ===== STEP 4: POST-PROCESS LINKS (WHITELIST & EXTERNAL) ================
	// =========================================================================

    const processLinks = (href, addClass, setAttr) => {
        if (!href) return;

		// Whitelist check
		const isWhitelisted = /^(?:\/|#|https?:\/\/(?:[\w-]+\.)*(?:actifit\.io|peakd\.com|ecency\.com|hive\.blog|leofinance\.io|travelfeed\.com|3speak\.tv|steemit\.com|hivesigner\.com|vimm\.tv|d\.tube|bit\.ly|youtube\.com|youtu\.be|facebook\.com|twitter\.com|x\.com|instagram\.com|discord\.gg|discord\.com|telegram\.me|t\.me))/i.test(href);

		if (!isWhitelisted) {
			addClass('external-link');
            // We use the data-external-href to keep the modal informed
            // even if the href is still on the tag for browser rendering.
            setAttr('data-external-href', href);
		}

		// Standard link attributes for whitelisted/internal
		if (!href.startsWith('/') && !href.startsWith('#')) {
			setAttr('target', '_blank');
			setAttr('rel', 'noopener ugc');
		}
    };

    if (process.client) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(sanitized_html, 'text/html');
        const links = doc.querySelectorAll('a[href]');

        links.forEach(a => {
            processLinks(
                a.getAttribute('href'),
                (cls) => a.classList.add(cls),
                (name, val) => a.setAttribute(name, val)
            );
        });
        return doc.body.innerHTML;
    } else {
        // Server-side link processing using cheerio
        const cheerio = require('cheerio');
        const $ = cheerio.load(sanitized_html);
        $('a[href]').each((i, el) => {
            const $el = $(el);
            processLinks(
                $el.attr('href'),
                (cls) => $el.addClass(cls),
                (name, val) => $el.attr(name, val)
            );
        });
        return $('body').html();
    }
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
