<template>
  <div>
    
    <NewFooterDesign />
    
    
    <VoteProposalModal />
    
    <vue-cookie-accept-decline 
      :ref="'myPanel1'" 
      :elementId="'myPanel1'" 
      :debug="false" 
      :position="'bottom'"
      :type="'bar'" 
      :disableDecline="true" 
      :transitionName="'slideFromBottom'" 
      :showPostponeButton="false">

      <div slot="message">
        {{ $t('cookies_notice') }}
        <router-link to="privacy-policy">{{ $t('More_Info') }}</router-link>
      </div>

      <div slot="acceptContent">
        {{ $t('Accept_Cookie') }}
      </div>
    </vue-cookie-accept-decline>
  </div>
</template>

<script>
import NewFooterDesign from './NewFooterDesign.vue';

import VueCookieAcceptDecline from 'vue-cookie-accept-decline';
import "vue-cookie-accept-decline/dist/vue-cookie-accept-decline.css";
import VoteProposalModal from "~/components/VoteProposalModal";

export default {
  props: ['isHomePage'],

  components: {
    NewFooterDesign,
    VueCookieAcceptDecline,
    VoteProposalModal
  },

  computed: {
    currentYear() {
      return (new Date()).getFullYear();
    },
  },

  async mounted() {
    if (process.client) {
      $("#voteProposalModal").modal({ backdrop: false, focus: false, keyboard: true });
      $('#voteProposalModal').on('shown.bs.modal', function () {
        $("body").css("overflow", "auto"); // Allow scrolling on the page
        $("body").removeClass("modal-open");
      });
    }
  }
}
</script>

<style>


body.modal-open {
  overflow: auto !important; 
}

#voteProposalModal {
  top: unset !important; /* Remove any `top` style */
  left: unset !important; /* Remove any `left` style */
  transform: none !important; /* Remove Bootstrap's centering transform */
  box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
}

.footer{
  position: relative;
  width: 100%;
}
blockquote {
  font-size: 15px;
  padding: 10px;
  margin: 0 0 20px;
  border-left: 5px solid #eee;
  margin-bottom: 1rem;
}

.numberCircle {
  width: 10px;
  line-height: 10px;
  padding: 4px 2px 4px 2px;
  margin-left: 4px;
  background: #fff;
  border: 1px solid;
  text-align: center;
  vertical-align: middle;
  outline-style: inset;
  border-radius: 0% !important;
}

.cookie__bar__content {
  overflow: visible !important;
}

button.cookie__bar__buttons__button--accept {
  background: #ff112d !important;
}

.goog-ad-disp {
  min-width: 120px;
  max-width: 900px;
  min-height: 120px;
  max-height: 500px;
}

.goog-ad-horiz-90 {
  height: 90px !important;
  max-height: 90px !important;
}

.fa-reply:before {
  content: "\f3e5" !important;
}

.user-avatar-small {
  width: 30px;
  height: 30px;
  background-position: center center;
  background-size: cover;
  border-radius: 50%;
  border: solid 1px #ddd;
  display: inline-block;
  cursor: pointer;
}

.item-highlight {
  border: 3px red inset;
  margin: -3px;
}

.no-actifit {
  display: none !important;
}

.currency-logo-small {
  height: 20px;
}

.token-logo-sm {
  width: 20px;
  height: 20px;
}

.token-logo-md {
  width: 30px;
  height: 30px;
}

.dropdown-menu>.dropdown-item {
  padding: .1rem 1.1rem !important;
}

.btn {
  border-radius: 5px;
}

.btn-brand {
  box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
}

.acti-shadow {
  box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
}

.main-user-info {
  /* background-color: antiquewhite; */
  background: linear-gradient(20deg, orange, transparent);
}

.main-payment-info {
  /* background-color: lightcoral; */
  background: linear-gradient(180deg, lightcoral, coral);
  color: white !important;
}

.far,
.fas,
.fa-solid {
  cursor: pointer;
}

.tooltip {
  position: relative;
  cursor: pointer;
}

div#voteModal {
  z-index: 99999;
  /* fix for proper voting popup placement */
}

.columns {
  display: flex;
}

.column {
  flex: 1;
}

.column a {
  display: block;
  margin-bottom: 0px;
  text-decoration: none;
  width: fit-content;
}

.social-links img {
  width: 40px;
  height: 40px;
  margin-top: -15px;
}
</style>