<template>
  <div>
    <div ref="widgetContainer"></div>
	<button @click="toggleWidget">Toggle Widget</button>
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
		"defaultTheme": "Ignite",
		"--appFontFamily": "'Arial'",
		"--appFontSize": "16px",
		"--appMessageFontFamily": "''New Heterodox Mono',monospace'",
		"--appMessageFontSize": "16px"
		};
	  
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

		  this.init = false;
	  }

    },
	toggleWidget() {
      //var e = this.$refs.widget;
	  var e = this.$refs.widgetContainer;
		//var e = this.$refs.widgetContainer.querySelector(".st-widget-container");

      if (e) {
        e.hidden = !e.hidden;
      }
    }
  },
};
</script>