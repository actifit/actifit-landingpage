import Vue from 'vue';
import mavonEditor from 'mavon-editor';
import 'mavon-editor/dist/css/index.css';

/* added to support emoji display in toolbar */
/*
import markdownItEmoji from 'markdown-it-emoji'
import MarkdownIt from 'markdown-it'
const md = new MarkdownIt()
md.use(markdownItEmoji)

Vue.use(mavonEditor,{markdownIt: md})*/
Vue.use(mavonEditor);