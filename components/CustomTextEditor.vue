<template>
  <div class="mavonEditor acti-shadow">
    <client-only>

      <!-- :toolbars="markdownOption" -->
      <mavon-editor language="en" markdown-it-emoji="true" v-model="content" ref="editor" :shortCut=false
        @imgAdd="mavonUpImg" @keydown.native="handleKeydown">



        <!-- Add a custom button after the left toolbar  -->
        <template slot="left-toolbar-after">


          <emoji-picker :search="search">
            <span slot="emoji-invoker" slot-scope="{ events: { click: clickEvent } }" @click.stop="clickEvent">
              <button type="button" class="op-icon far fa-smile" aria-hidden="true" title="Insert Emoji"></button>
            </span>
            <div slot="emoji-picker" slot-scope="{ emojis }"><!--, selectEmoji-->
              <div class="emoji-picker" :style="{ top: top + 'px', left: left + 'px' }">
                <!-- top: display.y + 'px', left: display.x + 'px' } -->
                <div class="emoji-picker__search">
                  <input type="text" v-model="search" v-focus>
                </div>
                <div>
                  <div v-for="(emojiGroup, category) in emojis" :key="category">
                    <h5>{{ category }}</h5>
                    <div class="emojis">
                      <span v-for="(emoji, emojiName) in emojiGroup" :key="emojiName" @click="selectEmoji(emoji)"
                        :title="emojiName">{{ emoji }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </emoji-picker>



        </template>
      </mavon-editor>
      <!-- username autocomplete -->
      <ul v-if="showMentionList" class="mention-dropdown" :style="mentionDropdownStyle">
        <li v-for="(mention, index) in mentionList" :key="index" @click="selectMention(mention)">
          {{ mention }}
        </li>
      </ul>
    </client-only>
  </div>
</template>
<script>
import axios from 'axios';
import EmojiPicker from 'vue-emoji-picker'


export default {
  components: {
    EmojiPicker
  },
  props: {
    initialContent: {
      type: String,
      default: () => ''
    }
  },
  watch: {
    initialContent: function (newVal, oldVal) { // watch it
      this.content = newVal;
    }
  },
  data() {
    return {
      //emoji picker data
      input: '',
      search: '',
      file: '', //image
      imgUploading: false, // loading animation while image upload in progress
      content: this.initialContent,
      //new data related to username auto-complete
      searchQuery: '',
      mentionList: [],
      showMentionList: false,
      cursorPosition: 0,
      mentionDropdownStyle: { top: '0px', left: '0px' },
    }
  },
  directives: {
    focus: {
      inserted(el) {
        el.focus()
      },
    },
  },
  methods: {
    async fetchMentions() {
      if (!this.searchQuery) return;
      try {
        const response = await axios.get(
          process.env.hiveApiNode+`/hafbe-api/input-type/${this.searchQuery}%25`
        );
        this.mentionList = response.data.input_value || [];
      } catch (error) {
        console.error('Error fetching mentions:', error);
      }
    },
    selectMention(username) {
      const textBefore = this.content.slice(0, this.cursorPosition - this.searchQuery.length - 1);
      const textAfter = this.content.slice(this.cursorPosition);

      this.content = `${textBefore}[@${username}](https://actifit.io/@${username}) ${textAfter}`;
      this.showMentionList = false;
      this.mentionList = [];
    },
    handleKeydown(event) {
      const textareaElement = this.$el.querySelector('textarea');
      this.cursorPosition = textareaElement.selectionStart;

      if (event.key === '@') {
        this.showMentionList = true;
        this.searchQuery = '';
        this.mentionList = [];
        this.updateDropdownPosition();
      } else if (this.showMentionList) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          // Navigate dropdown
        } else if (event.key === 'Enter') {
          event.preventDefault();
          this.selectMention(this.mentionList[0]);
        } else if (event.key === 'Backspace') {
          this.searchQuery = this.searchQuery.slice(0, -1);
        } else {
          this.searchQuery += event.key;
        }

        if (this.searchQuery.length >= 3) {
          this.fetchMentions();
        }
      }else if (event.ctrlKey && event.key === 'Backspace') {

        event.preventDefault();

        // get the textarea element
        console.log(`content: ${textareaElement.value}`);

        // get the current cursor position (to know where to start deleting)
        const cursorPosition = textareaElement.selectionStart;
        console.log(`selection start: ${cursorPosition}`);

        // get the text before the cursor (when we start deleting)
        const textBeforeCursor = textareaElement.value.substring(0, cursorPosition);

        // match the word before the cursor
        const wordRange = /\s*\S+\s*$/.exec(textBeforeCursor);

        //if a word is found, delete it
        if (wordRange) {
          const wordStartIndex = cursorPosition - wordRange[0].length;
          const newValue =
            textBeforeCursor.substring(0, wordStartIndex) +
            textareaElement.value.substring(cursorPosition);

          //update the content bound to v-model
          this.content = newValue;

          // update the cursor position (so the cursor doesnt always go back to the end of the text when deleted)
          this.$nextTick(() => {
            textareaElement.selectionStart = wordStartIndex;
            textareaElement.selectionEnd = wordStartIndex;
            textareaElement.focus();
            console.log(`cursor position set to: ${wordStartIndex}`);
          });
        }
      }
    },
    updateDropdownPosition() {
      this.$nextTick(() => {
        const editor = this.$el.querySelector('textarea');
        console.log(editor);
        if (!editor) return;

        const cursorPosition = this.cursorPosition;
        const lines = editor.value.substr(0, cursorPosition).split("\n");
        const line = lines.length - 1;
        const charIndex = lines[line].length;
        const lineHeight = 20; // Approximate line height in pixels

        this.mentionDropdownStyle = {
          top: `${window.scrollY + lineHeight * line + 20}px`,
          left: `${window.scrollX + charIndex * 8}px`
        };
      });
    },
    handlePaste(event) {
      console.log(event);
      const clipboardData = event.clipboardData || window.clipboardData;
      const items = clipboardData.items;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          //this.uploadImage(file);
          this.uploadImage([file]);
          break;//only allow one image upload
        }
      }
    },
    selectEmoji(emoji) {
      /*this.emojisOutput = this.emojisOutput + emoji.native;
      this.body += emoji.native*/
      this.emojisOutput = this.emojisOutput + emoji;
      this.content += emoji;
      //setMessageToSend(messageToSend + emoji.native)
    },
    async mavonUpImg(pos, file) {
      let url = await this.uploadImage(pos, [file])
      //$vm = this.$refs.md
      //this.$refs.editor.$img2Url(pos, url);
    },
    async uploadImage(pos, file) {
      const key = (
        Date.now().toString(36) +
        Math.random().toString(36).substr(2, 11) +
        Math.random().toString(36).substr(2, 11)
      ).toUpperCase();

      const renamedFile = new File([file[0]], key, { type: file[0].type });

      const formData = new FormData();
      formData.append('image', renamedFile);

      try {
        //const axios = await import('axios');
        //const response = await axios.default.post('https://usermedia.actifit.io/upload', formData, {
        const response = await axios.post('https://usermedia.actifit.io/upload', formData, {
          headers: {
            'Authorization': process.env.sec_img_upl,
            'Content-Type': 'multipart/form-data'
          }
        });

        console.log('meow Upload Success:', response.data);
        const imageUrl = 'https://usermedia.actifit.io/' + key;
        this.$refs.editor.$img2Url(pos, imageUrl);
        return imageUrl;

      } catch (error) {
        console.log('meow Upload Error:', error);
        throw error;
      }
    }

  }

}

</script>
<style>
.v-note-panel {
  min-height: 350px;
  max-height: 500px;
}

/* emoji picker styling */
/* Tailwind CSS-styled demo is available here: https://codepen.io/DCzajkowski/pen/Brxvzj */

.wrapper {
  position: relative;
  display: inline-block;
}

.regular-input {
  padding: 0.5rem 1rem;
  border-radius: 3px;
  border: 1px solid #ccc;
  width: 20rem;
  height: 12rem;
  outline: none;
}

.regular-input:focus {
  box-shadow: 0 0 0 3px rgba(66, 153, 225, .5);
}

.emoji-invoker {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
  background: transparent;
  border: 0;
}

.emoji-invoker:hover {
  transform: scale(1.1);
}

.emoji-invoker>svg {
  fill: #b1c6d0;
}

.emoji-picker {
  position: absolute;
  z-index: 1;
  font-family: Montserrat;
  border: 1px solid #ccc;
  width: 15rem;
  height: 20rem;
  overflow: scroll;
  padding: 1rem;
  box-sizing: border-box;
  border-radius: 0.5rem;
  background: #fff;
  box-shadow: 1px 1px 8px #c7dbe6;
}

.emoji-picker__search {
  display: flex;
}

.emoji-picker__search>input {
  flex: 1;
  border-radius: 10rem;
  border: 1px solid #ccc;
  padding: 0.5rem 1rem;
  outline: none;
}

.emoji-picker h5 {
  margin-bottom: 0;
  color: #b1b1b1;
  text-transform: uppercase;
  font-size: 0.8rem;
  cursor: default;
}

.emoji-picker .emojis {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.emoji-picker .emojis:after {
  content: "";
  flex: auto;
}

.emoji-picker .emojis span {
  padding: 0.2rem;
  cursor: pointer;
  border-radius: 5px;
}

.emoji-picker .emojis span:hover {
  background: #ececec;
  cursor: pointer;
}

.v-note-wrapper .v-note-op .v-left-item div:has(.op-icon.fa-smile) {
  float: left;
}

.mention-dropdown {
  position: absolute;
  background: white;
  border: 1px solid #ccc;
  list-style: none;
  padding: 5px;
  margin: 0;
  max-height: 150px;
  overflow-y: auto;
  z-index: 5000; /* Higher value to ensure it appears above other elements */
}
.mention-dropdown li {
  padding: 5px;
  cursor: pointer;
}
.mention-dropdown li:hover {
  background: #f0f0f0;
}
</style>
