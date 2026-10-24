import Vue from 'vue'

//Hive auth services
import HAS from 'hive-auth-wrapper';
// The SAME hive-js instance store/actions.js configures (node URL, alternative
// endpoints) - module singleton - so broadcasts below go to the configured node.
import hive from '@hiveio/hive-js';
import { requestKey } from '~/utils/keyPrompt';
import { classifyKey, keyRefusal } from '~/utils/keyChecks';
import escapeHtml from '~/utils/escapeHtml';
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
export function getTransactionErrorMessage(outcome) {
  const stringifyError = (error) => {
	if (!error || typeof error === 'boolean') return '';
	if (typeof error === 'string') return error;
	if (error.message) return stringifyError(error.message);
	if (error.error) return stringifyError(error.error);
	if (error.details) return stringifyError(error.details);
	try {
	  return JSON.stringify(error);
	} catch (e) {
	  return '';
	}
  };

  if (!outcome) return '';
  const trxError = outcome.trx && outcome.trx.tx && outcome.trx.tx.error;
  return stringifyError(trxError) || stringifyError(outcome.error) || stringifyError(outcome.message);
}

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
		  const txID = response && response.result ? response.result.id : null;
		  const success = Boolean(response && response.success && txID);
		  const error = success ? '' : getTransactionErrorMessage(response);
		  resolve({
			success,
			txID,
			trx: txID ? { tx: { id: txID } } : null,
			...(error ? { error } : {})
		  });
		}
	  );
	});
  } else if (localStorage.getItem('acti_login_method') == 'hiveauth') {
	return new Promise((resolve) => {
	  const auth = {
		username: this.user.account.name,
		token: localStorage.getItem('hiveauth_has_token'),
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
	// Typed-key login: sign and broadcast IN THE BROWSER.
	//
	// This branch used to send the operation to /performTrx, where the SERVER signed it
	// with a posting key it had stored. That is what the incident abused - stored keys
	// signed Hive-Engine drains server-side - and /performTrx is now permanently
	// disabled. Since the signed-challenge login, the server never holds a key at all,
	// so typed-key users could log in but not vote, comment, post or transfer.
	//
	// Return shape is unchanged - { success, trx: { tx }, error? } - so no caller needs
	// to change. hive-js returns { id, ref_block_num, ... }: `id` is the real transaction
	// id, which payment confirmation depends on, and ref_block_num matches what the old
	// server path returned.
	const out = await this.$broadcastWithKey([[op_name, cstm_params]], { active: active });
	if (out.success) return { success: true, trx: out.trx };
	const err_msg = out.trx.tx.error;
	// A cancelled prompt is the user's own choice, not an error worth a red toast.
	if (!out.cancelled) {
	  this.$notify({ group: 'error', text: err_msg, position: 'top center' });
	}
	return { success: false, trx: null, error: err_msg };
  }
};

/**
 * Decrypt a memo addressed to the user, in the browser.
 *
 * Replaces /memoDecode, which had the SERVER decrypt with a posting key it had stored for
 * the user. That route is permanently disabled and the server holds no keys, so the 3Speak
 * session flow (connectSession3S, which fetches an encrypted access token from 3Speak and
 * must decrypt it) was dead for EVERY login method - it never branched by method at all.
 *
 * Returns the shape /memoDecode returned, so callers' handling is unchanged:
 *   { xcstkn: <decoded memo> }  or  { error: <message> }
 *
 * Keychain decrypts in the extension: requestVerifyKey IS memo decryption. A typed key
 * decrypts locally with hive-js. HiveAuth has no memo-decrypt operation; it never worked
 * here either (the server held no key for HiveAuth users), so this is not a regression.
 */
Vue.prototype.$decodeMemo = async function (memo) {
  if (!memo) return { error: this.$t('error_performing_operation') };
  const account = this.user && this.user.account && this.user.account.name;
  const method = localStorage.getItem('acti_login_method');
  try {
	if (method === 'keychain' && window.hive_keychain) {
	  const decoded = await new Promise((resolve) => {
		window.hive_keychain.requestVerifyKey(account, memo, 'Posting',
		  (r) => resolve(r && r.success ? r.result : null));
	  });
	  return decoded ? { xcstkn: decoded } : { error: this.$t('signing_cancelled') };
	}
	if (method === 'hiveauth') {
	  return { error: this.$t('error_performing_operation') };
	}
	let wif = this.$store.state.chatPostingKey;
	if (!wif) {
	  wif = await requestKey('posting', account, [['memo_decode', {}]]);
	  if (wif) this.$store.commit('setChatPostingKey', wif);
	}
	if (!wif) return { error: this.$t('signing_cancelled') };
	return { xcstkn: hive.memo.decode(wif, memo) };
  } catch (e) {
	// Escaped: callers show this in a toast, and toasts render HTML.
	return { error: escapeHtml((e && e.message) || this.$t('error_performing_operation')) };
  }
};

/**
 * Sign and broadcast operations IN THE BROWSER with the typed-key user's own key.
 *
 * Shared by $processTrxFunc and by every component that used to call /performTrx
 * directly - one implementation, so they cannot drift (see utils/keyChecks.js for why
 * that matters here).
 *
 * Returns the response shape /performTrx used to return, so callers' existing outcome
 * handling keeps working unchanged:
 *   success: { success: true, trx: { tx: <broadcast result incl. id> } }
 *   failure: { error: true, trx: { tx: { error: <message> } }, cancelled?: true }
 *
 * Does NOT notify: the direct callers already raise their own toast on failure, and
 * doubling it would be noise. $processTrxFunc notifies for its own callers.
 *
 * HIVE ONLY. Typed-key login is Hive-only (the signed-challenge login verifies against
 * the Hive account), so the key held here IS a Hive key; signing a Steem or Blurt
 * operation with it would fail anyway. Saying so plainly beats an opaque chain error.
 */
Vue.prototype.$broadcastWithKey = async function (operations, opts) {
  const options = opts || {};
  const active = !!options.active;
  const bchain = String(options.bchain || 'HIVE').toUpperCase();
  // The message is HTML-ESCAPED here, once, at the source. Every caller either
  // substring-matches it ('missing' / 'authority') or shows it in a toast, and toasts
  // render HTML (vue-notification uses v-html) - while the text can come from an RPC
  // node. Escaping here covers every caller, including ones added later.
  const fail = (msg, extra) => Object.assign({ error: true, trx: { tx: { error: escapeHtml(msg) } } }, extra || {});

  if (bchain !== 'HIVE') {
	return fail(this.$t('typed_key_hive_only'));
  }

  const account = this.user && this.user.account && this.user.account.name;
  const keyType = active ? 'active' : 'posting';

  let wif;
  if (options.wif) {
	// The caller already collected the key in its own form (the buy-now flows ask for
	// the active key up front). Use it rather than prompting a second time - but apply
	// exactly the checks the prompt applies. This path skips the prompt, and it is the
	// one that signs PAYMENTS: without this, an owner key typed into a buy form would
	// sign, and a posting key would fail only after the user had committed.
	const typed = String(options.wif).trim();
	const refusal = keyRefusal(await classifyKey(account, typed), keyType);
	if (refusal) return fail(this.$t(refusal));
	wif = typed;
  } else if (active) {
	// Active keys are requested PER ACTION and never kept: one can move funds.
	wif = await requestKey('active', account, operations);
  } else {
	// The posting key lives in memory for the session, put there at login. After a
	// reload it is gone (memory-only by design), so ask once and keep it for the rest
	// of the session.
	wif = this.$store.state.chatPostingKey;
	if (!wif) {
	  wif = await requestKey('posting', account, operations);
	  if (wif) this.$store.commit('setChatPostingKey', wif);
	}
  }

  if (!wif) {
	return fail(this.$t('signing_cancelled'), { cancelled: true });
  }

  try {
	const result = await new Promise((resolve, reject) => {
	  // keys MUST be an object keyed by role. hive-js signs with `for (k in keys)`, so
	  // a bare WIF string would iterate its CHARACTERS and sign with garbage.
	  hive.broadcast.send({ extensions: [], operations: operations }, { [keyType]: wif },
		(err, res) => (err ? reject(err) : resolve(res)));
	});
	return { success: true, trx: { tx: result } };
  } catch (err) {
	const err_msg = getTransactionErrorMessage({ error: err }) ||
	  (err && err.message) || this.$t('error_performing_operation');
	// A posting key that no longer has authority (the user rotated it) must not keep
	// being retried from memory. Drop it so the next action asks for the current one.
	if (!active && /missing.*authority|missing required posting/i.test(err_msg)) {
	  this.$store.commit('setChatPostingKey', null);
	}
	return fail(err_msg);
  } finally {
	// Drop this function's reference to an active key once the broadcast settles. This
	// does NOT wipe it from memory - JS strings cannot be zeroed - it only stops this
	// code from holding it. The active key is never written to the store or storage.
	if (active) wif = null;
  }
};

/**
 * Does this session sign its own transactions in the browser - Keychain, HiveAuth or a
 * typed key? Then every payment/action confirmation must use the actifit-bot route that
 * verifies the transaction ON CHAIN (the "...Keychain" routes, via findVerifyTrx).
 *
 * The other routes (buyGadgetHive, activateMultiGadget, addFriend, ...) only look the
 * transaction up in verified_tx, which was filled by the server when IT signed. The
 * server no longer signs, so for a browser-signed transaction those routes can never
 * succeed. Sending a typed-key user there broadcast a real HIVE payment and then failed
 * the purchase. Only HiveSigner (no std_login) keeps the old routes.
 */
Vue.prototype.$signsInBrowser = function () {
  return !!localStorage.getItem('std_login');
};

/**
 * Did an actifit-bot confirmation route fail? The routes answer {error: ...} for some
 * failures but {status: 'error'} when on-chain verification fails - and callers that
 * only checked `outcome.error` treated that second shape as SUCCESS.
 */
Vue.prototype.$confirmFailed = function (outcome) {
  return !outcome || !!outcome.error || outcome.status === 'error';
};

/**
 * Text for a failed signing/broadcast, SAFE FOR v-html (errorProceed and toasts are
 * both HTML sinks). Accepts every failure shape that reaches the purchase flows:
 *   $broadcastWithKey  { error: true, trx: { tx: { error } } }  - already escaped there
 *   Keychain/HiveAuth  { success: false, error: <string> }
 *   hive-js            Error with .cause.message / .message
 * It used to read res.cause.message unconditionally, which threw on the first two.
 */
Vue.prototype.$signingErrorText = function (res) {
  if (res && res.trx && res.trx.tx && res.trx.tx.error) return res.trx.tx.error;
  const msg = (res && res.cause && res.cause.message) ||
	(res && typeof res.error === 'string' && res.error) ||
	(res && typeof res.message === 'string' && res.message);
  return escapeHtml(msg || this.$t('error_performing_operation'));
};

/**
 * The HIVE payment WAS signed and broadcast, but actifit-bot did not confirm the
 * purchase. Say exactly that, with the transaction id, so the user does not pay a second
 * time and support can find the payment. A toast that stays until dismissed: the panel
 * that shows errorProceed is hidden when the buy flow finishes. Returns the text too.
 */
Vue.prototype.$notifyPaymentNotConfirmed = function (trxId) {
  const msg = this.$t('payment_sent_not_confirmed').replace('_TX_', escapeHtml(trxId || ''));
  this.$notify({ group: 'error', text: msg, duration: -1, position: 'top center' });
  return msg;
};

// Returns actifit-bot's own message for the key-rotation gate, or null.
//
// For an account flagged in the 2026-10-21 incident, sensitive endpoints
// (/setUserFundsPass, /storeUserWalletAddress, /deleteUserWalletAddress,
// /deleteAccount) answer 403 {code:'KEY_ROTATION_REQUIRED', error, message} - or 503
// {code:'TRY_AGAIN'} when the chain cannot be read to decide. Those carry an actionable
// instruction ("rotate your posting key"), so a generic "error performing operation"
// hides the one thing the user needs to be told.
//
// Allow-listed by code rather than "show whatever the server said", so ordinary failures
// and internal errors keep their existing generic text. Every call site renders through
// {{ }}, so this is not an HTML sink - but narrow is still the right default.
Vue.prototype.$gateMessage = function (outcome) {
	const GATE_CODES = ['KEY_ROTATION_REQUIRED', 'TRY_AGAIN'];
	if (!outcome || GATE_CODES.indexOf(outcome.code) === -1) return null;
	const msg = outcome.message || outcome.error;
	return (typeof msg === 'string' && msg.trim()) ? msg : null;
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
	// Accept both URL shapes — 3speak.tv/watch?v= and play.3speak.tv/embed?v=
	// (the latter is what some clients paste) — with or without the play. subdomain.
	let threespk_embed_reg = /\[!\[[^\]]*\]\([^)]+\)\]\(https?:\/\/(?:play\.)?3speak\.tv\/(?:watch|embed)\?v=([\w.-]+\/[\w.-]+)\)/ig;
	report_content = report_content.replace(threespk_embed_reg, (match, v) => {
		return stashResult(`<div class="video-container"><iframe src="https://play.3speak.tv/watch?v=${v}&mode=iframe&autoplay=false&layout=desktop" scrolling="no" frameborder="0" allowfullscreen></iframe></div>`);
	});

	let threespk_raw_reg = /(^|\s)(https?:\/\/(?:play\.)?3speak\.tv\/(?:watch|embed)\?v=([\w.-]+\/[\w.-]+))/ig;
	report_content = report_content.replace(threespk_raw_reg, (match, prefix, url, v) => {
		return prefix + stashResult(`<div class="video-container"><iframe src="https://play.3speak.tv/watch?v=${v}&mode=iframe&autoplay=false&layout=desktop" scrolling="no" frameborder="0" allowfullscreen></iframe></div>`);
	});

	// Process YouTube
	let vid_reg = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube\.com\S*[^\w\-\s])([\w\-]{11})(?=[^\w\-]|$)(?![?=&+%\w]*(?:['"][^<>]*>|<\/a>))[?=&+%\w-]*/ig;
	report_content = report_content.replace(vid_reg, (match, v) => {
		return stashResult(`<div class="video-container"><iframe width="640" height="360" src="https://www.youtube.com/embed/${v}" frameborder="0" allowfullscreen></iframe></div>`);
	});

	// Escape characters that are significant inside an HTML attribute value so a
	// crafted URL cannot terminate the src="" attribute and inject new attributes
	// (e.g. onerror=). Defence against stored XSS via image/media URLs.
	const escapeHtmlAttr = escapeHtml;

	// Process Images (unified approach)
	const createProxiedImageTag = (url) => {
		if (!url || typeof url !== 'string') return '';
		url = url.trim();
		if (!url.startsWith('http')) return '';
		// usermedia.actifit.io (Actifit's own upload host) is not served by the
		// Hive image proxy (403), so serve it directly like already-hive-hosted / gif images.
		const proxiedUrl = (url.startsWith('https://images.hive.blog') || url.startsWith('https://usermedia.actifit.io') || url.toLowerCase().endsWith('.gif'))
			? url
			: `https://images.hive.blog/0x0/${url}`;
		return `<img src="${escapeHtmlAttr(proxiedUrl)}">`;
	};

	const existingImgRegex = /<img\s+[^>]*?src\s*=\s*['"]([^'"]+)['"][^>]*?>/gi;
	report_content = report_content.replace(existingImgRegex, (match, url) => stashResult(createProxiedImageTag(url)));

	// URL capture rejects quotes, whitespace and angle brackets so it cannot carry
	// an attribute-breakout payload, and requires ']( ' adjacency (matching the
	// markdownLinkRegex protective pass) so no crafted-whitespace variant slips through.
	const markdownImgRegex = /!\[[^\]]*\]\(([^\s"'<>)]+)\)/g;
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
	// ===== STEP 3: RESTORE PLACEHOLDERS, THEN SANITIZE ======================
	// =========================================================================

	// Restore stashed media/mention HTML BEFORE sanitizing so it passes through
	// DOMPurify / sanitize-html too. Restoring after sanitization (the previous
	// behaviour) re-injected raw, attacker-influenced markup that the sanitizer
	// never saw — a stored-XSS hole. This also makes the iframe host allow-list
	// and link whitelist actually apply to stashed content.
	for (const placeholder in placeholders) {
		html_content = html_content.replace(placeholder, placeholders[placeholder]);
	}

	let sanitizeOptions = {
		ALLOWED_TAGS: [ 'img', 'iframe', 'details', 'summary', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'sub', 'sup', 'div', 'a', 'p', 'br', 'strong', 'em', 'u', 's', 'blockquote', 'code', 'pre', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span' ],
		ALLOWED_ATTR: [ 'src', 'style', 'class', 'alt', 'title', 'width', 'height', 'frameborder', 'allowfullscreen', 'href', 'target', 'rel', 'colspan', 'rowspan', 'data-external-href' ],
		SAFE_FOR_TEMPLATES: true,
        // Block dangerous CSS properties that allow UI hijacking (phishing popups)
        FORBID_ATTR: ['id', 'onclick', 'onerror', 'onload'],
        FORBID_TAGS: ['style', 'script'],
	};

    let sanitized_html = '';

    const TRUSTED_IFRAME_HOSTS = [
        'youtube.com', 'youtu.be',
        '3speak.tv', '3speak.online',
        'vimm.tv', 'd.tube',
        'rumble.com', 'vimeo.com',
        'facebook.com',
    ];

    if (process.client) {
        // Custom hook to strip dangerous CSS from style attributes and restrict iframe src
        DOMPurify.addHook('afterSanitizeAttributes', function(node) {
            if (node.hasAttribute('style')) {
                let style = node.getAttribute('style');
                // Remove properties that allow positioning elements outside their container
                // or that can carry javascript:/expression() payloads
                const dangerousProps = ['position', 'z-index', 'top', 'left', 'bottom', 'right', 'inset', 'margin-top', 'margin-left', 'margin-right', 'margin-bottom', 'pointer-events', 'opacity', 'background-image', 'background'];
                dangerousProps.forEach(prop => {
                    const regex = new RegExp(prop + '\\s*:\\s*[^;]+;?', 'gi');
                    style = style.replace(regex, '');
                });
                // Defence-in-depth: drop any remaining rule whose value contains a dangerous token
                style = style.replace(/[^:;]+:\s*[^;]*(javascript:|expression\(|url\s*\(javascript)[^;]*;?/gi, '');
                node.setAttribute('style', style);
            }
            // Restrict iframe src to trusted media hosts — blocks javascript: and arbitrary https embeds
            if (node.tagName === 'IFRAME' && node.hasAttribute('src')) {
                const src = node.getAttribute('src');
                let allowed = false;
                try {
                    const hostname = new URL(src).hostname;
                    allowed = TRUSTED_IFRAME_HOSTS.some(h => hostname === h || hostname.endsWith('.' + h));
                } catch {}
                if (!allowed) node.removeAttribute('src');
            }
        });

        sanitized_html = DOMPurify.sanitize(html_content, sanitizeOptions);

        // Remove the hook after use to prevent affecting other sanitization tasks if any
        DOMPurify.removeHook('afterSanitizeAttributes');
    } else {
        // Server-side sanitization using sanitize-html
        const sanitizeHtml = require('sanitize-html');
        const trustedIframeRe = new RegExp(
            '^https?:\\/\\/([\\w-]+\\.)*(' +
            TRUSTED_IFRAME_HOSTS.map(h => h.replace('.', '\\.')).join('|') +
            ')(\\/|$)', 'i'
        );
        sanitized_html = sanitizeHtml(html_content, {
            allowedTags: sanitizeOptions.ALLOWED_TAGS,
            allowedAttributes: {
                '*': sanitizeOptions.ALLOWED_ATTR
            },
            allowedIframeHostnames: TRUSTED_IFRAME_HOSTS,
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
		let imgUrl;
		try{
			//find first occurrence that is url
			imgUrl = metaData.image.find(element => /^(http|https):\/\//.test(element));
		}catch(err){
			//alt image case
			imgUrl = metaData.images.find(element => /^(http|https):\/\//.test(element));
		}
		if (!imgUrl) return "";
		// usermedia.actifit.io / already-hive-hosted images are not served by the
		// Hive image proxy (403) — return them directly instead of a broken proxy URL.
		if (imgUrl.startsWith('https://images.hive.blog') || imgUrl.startsWith('https://usermedia.actifit.io')) return imgUrl;
		return 'https://images.hive.blog/0x0/' + imgUrl;
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
