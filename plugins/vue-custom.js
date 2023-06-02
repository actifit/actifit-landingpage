import Vue from 'vue'

//Hive auth services
import HAS from 'hive-auth-wrapper';
Vue.prototype.$HAS = HAS;

//global function
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
