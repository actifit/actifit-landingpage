import Vue from 'vue'

//Hive auth services
import HAS from 'hive-auth-wrapper';
Vue.prototype.$HAS = HAS;

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
