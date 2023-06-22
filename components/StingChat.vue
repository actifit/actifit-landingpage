<template>
  <div>
    <div ref="widgetContainer"></div>
	<span class="user-avatar group-class">
		<i class="far fa-comments p-2 text-brand" @click="toggleWidget" :title="$t('sting_chat')"></i>
	</span>
  </div>
</template>

<script>
export default {
  data() {
    return {
      init: true,
      widget: null
    };
  },
  mounted() {
    this.loadScript("https://chat.peakd.com/stwidget.js", this.initWidget);
  },
  props: ['user'],
  methods: {
    loadScript(url, callback) {
      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.onload = callback;
      document.head.appendChild(script);
    },
    initWidget() {
      this.widget = new StWidget('https://chat.peakd.com/t/hive-193552/0');	  
	  this.widget.properties = {
		"requireLogin": false,
		"showSidebar": true,
		"sidebar": 2,
		"sidebar2enableSharedView": false,
		"sidebarToggleByChannelNameOnDirectGroup": true,
		"streambarExpand": true,
		"streambarMode": 1,
		"sidebarAddButton": 1,
		"communityChannelNameFormat": "<title>/<name>",
		"messageIconFlexClass": "block text-justify lg:text-left sm:flex",
		"messageIconClass": "iconFloat",
		"--appCommunityIconFontSize": "18px",
		"--appCommunityIconSize": "42px",
		"homeTabCommunities": true,
		"homeTabPreferences": true,
		"homeTabThemes": false,
		"onlyPrependCommunities": false,
		"prependCommunities": [
			"hive-193552"
		],
		"defaultTheme": {"bg0":"#ff112d","bg1":"#ff112d","bg2":"#ffffff","bg3":"#ffffff","bgbtn1":"#2e8336","bgbtn2":"#d9d9d7","bgowner":"#007b00","bgadmin":"#2368d5","bgmod":"#2e8336","bgconote":"#ff112d","bgunote":"#ff112d"},
		"--appFontFamily": "'Arial'",
		"--appFontSize": "16px",
		"--appMessageFontFamily": "''New Heterodox Mono',monospace'",
		"--appMessageFontSize": "16px"
		};
		
		//set user
		  if (this.user && this.user.account.name){
			console.log('setting user'+this.user)
			this.widget.setUser(this.user.account.name);
		  }
	  
      // If you would like to not let the widget use keychain passthrough, you can disable it with:
      // stwidget.enableKeychainPassthrough = false;

      if (this.init) {

		  var element = this.widget.createElement('450px', '556px', true /* overlay */, true /* resizable */);
		  this.widget.setStyle({ direction: 'rtl', top: '51px', right: '32px' }); //add custom styles
		  // Add direction: 'rtl' if you would like the widget to be expandable by dragging the 
		  // bottom-left corner instead of bottom-right corner

		  //var widgetElement = this.$refs.widget;
		  //widgetElement.appendChild(element);
			var widgetContainer = this.$refs.widgetContainer;
			widgetContainer.appendChild(element);
			widgetContainer.hidden = true;//initialize as hidden

		  this.init = false;
		  
		  
	  }

    },
	toggleWidget() {
	  var e = this.$refs.widgetContainer;
      if (e) {
        e.hidden = !e.hidden;
      }
    }
  },
};
</script>
<style>
	.h-screen.flex.flex-col.appbg0.appfg0.border-r-1.sidebar{
		background-color: #ff112d !important;
	}
</style>