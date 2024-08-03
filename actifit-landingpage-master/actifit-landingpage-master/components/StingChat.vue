<template>
  <div>
    <div ref="widgetContainer" id="widgetContainer"></div>
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
	console.log('mountedsting')
    this.loadScript("https://chat.peakd.com/stwidget.js", this.initWidget);
  },
  props: ['user'],
  methods: {
	//avoid double loading the script if it is loaded already
	isScriptLoaded(src, remove) {
	  const scripts = document.getElementsByTagName('script');
	  for (let i = 0; i < scripts.length; i++) {
		if (scripts[i].src === src) {
		  if (remove){
				console.log('removing extra script')
				scripts[i].remove();
				console.log(this.widget);
				//const element = document.getElementById(elementId);
				//element.remove();
		  }
		  return true; // Script with the given src is already loaded
		}
	  }
	  return false; // Script with the given src is not found
	},
	hasDivChildren(element) {
	  const divElements = element.querySelectorAll('div');
	  return divElements.length > 0;
	},

    loadScript(url, callback) {
	  //let isLoaded = false;//this.isScriptLoaded(url);
	  let isLoaded = this.isScriptLoaded(url, true);
	  console.log('isLOaded')
	  console.log(isLoaded);
	  //if (isLoaded) return;
      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.onload = callback;
      document.head.appendChild(script);
    },
    initWidget() {
	  console.log('initwidget');
	  console.log(window.widget)
	  if(window.widget != null) return;
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
			console.log('setting user'+this.user.account.name)
			this.widget.setUser(this.user.account.name);
		  }
	  
      // If you would like to not let the widget use keychain passthrough, you can disable it with:
      // stwidget.enableKeychainPassthrough = false;
	  console.log('init status:'+this.init)
      if (this.init) {
		  const hasChildNodes = this.hasDivChildren(document.getElementById('widgetContainer'));
		  console.log(this.widget);
		  console.log(document.getElementById('widgetContainer'));
		  console.log('has child nodes:'+hasChildNodes);
		  //clear prior to creation new widget
		  this.widget.cleanup();
		  if (hasChildNodes) return;
		  console.log('post return');
		  
		  //check screen dimensions and adjust accordingly if needed
		  let defaultWidth = 450;
		  if (screen.width < 750){
			defaultWidth = screen.width - 40;
		  }
		  
		  var element = this.widget.createElement(defaultWidth+'px', '556px', true /* overlay */, true /* resizable */);
		  this.widget.setStyle({ direction: 'rtl', top: '76px', right: '0px' }); //add custom styles
		  // Add direction: 'rtl' if you would like the widget to be expandable by dragging the 
		  // bottom-left corner instead of bottom-right corner

		  //var widgetElement = this.$refs.widget;
		  //widgetElement.appendChild(element);
		  console.log('create widget')
			var widgetContainer = this.$refs.widgetContainer;
			widgetContainer.appendChild(element);
			widgetContainer.hidden = true;//initialize as hidden
		  console.log(widgetContainer);
		  this.init = false;
		  //this.widget.pause(true);
		  
		  
	  }

    },
	toggleWidget() {
	  var e = this.$refs.widgetContainer;
	  console.log(e);
	  if (e.hidden){
		//this.widget.pause(false);
	  }
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