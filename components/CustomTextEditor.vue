<template>
  <div class="mavonEditor acti-shadow">
    <client-only>

      <!-- :toolbars="markdownOption" -->
      <mavon-editor language="en" markdown-it-emoji="true" v-model="content" ref="editor" :shortCut=false
        @imgAdd="mavonUpImg">
        <!-- @keydown.native="handleKeydown"> -->



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
      <ul v-if="showMentionList && this.searchQuery.length>=3 && this.mentionList.length>0" class="mention-dropdown" ref="mentionDropdown" :style="mentionDropdownStyle">
        <li v-for="(mention, index) in mentionList" :key="index" @click="selectMention(mention)"
          :class="{ 'selected': index === selectedMentionIndex }">
          @{{ mention }}
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
      selectedMentionIndex: 0,
      mentionList: [],
      showMentionList: false,
      cursorPosition: 0,
      mentionDropdownStyle: { top: '0px', left: '0px' },

      // Internal references for event handling
      textareaElement: null,
      boundHandleCursorMove: null,
      boundHandleKeydown: null,
      boundHideMentionListOnBlur: null,
      boundHandleInput: null,
      boundHandleKeyup: null,

       latestFetchId: 0,
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

      const fetchId = ++this.latestFetchId;

      // Ensure searchQuery is not empty or too short before fetching
      if (!this.searchQuery || this.searchQuery.length < 3) {
          // If query is invalid for fetching, but a newer fetch has already been initiated,
          // don't clear state here.
          if (fetchId < this.latestFetchId) {
              console.log(`Fetch ${fetchId}: Query too short/empty, but newer fetch (${this.latestFetchId}) exists. Ignoring.`);
              return; // Ignore if a newer request has started
          }

          // If this is the *latest* request context, clear the list data.
          console.log(`Fetch ${fetchId}: Query too short/empty, clearing list.`);
          this.mentionList = [];
          this.selectedMentionIndex = 0;
            // Note: showMentionList state is managed by the handlers (input/cursorMove)
            // based on the current searchQuery length, not directly by fetch when query < 3.
            // Let the handlers decide if the list container should be visible for < 3 chars.

          return; // Stop here
      }

      try {
        const response = await axios.get(
          process.env.hiveApiNode + `/hafbe-api/input-type/${encodeURIComponent(this.searchQuery)}%25`
        );
        const responseData = response.data;


        if (fetchId < this.latestFetchId) { // <-- Check the ID here
             console.log(`Fetch ${fetchId}: Response received, but newer fetch (${this.latestFetchId}) has started. Ignoring response.`);
             return; // Ignore this response if a newer fetch has been initiated
        }

        // --- Check the input_type field ---
        if (responseData.input_type === 'invalid_input') {
          console.log(`Fetch mentions: Invalid input type received for query "${this.searchQuery}"`);
          this.mentionList = []; // Clear list for invalid input
          this.showMentionList = false; // Explicitly hide list for invalid input
          this.selectedMentionIndex = 0; // Reset selection
        } else {
          // --- Handle valid input type ---
          console.log(`Fetch mentions: Valid input type received for query "${this.searchQuery}"`);
          this.mentionList = responseData.input_value || []; // Populate list with valid value

          // If the list has results, ensure showMentionList is true and update visuals
          if (this.mentionList.length > 0) {
              // The calling handler (input/cursorMove) should have set showMentionList = true,
              // but ensure it's true if we actually received results.
              this.showMentionList = true;
              this.selectedMentionIndex = 0; // Reset selection for new results
              this.scrollDropdownIntoView(); // Scroll to the top item (index 0)
              this.updateDropdownPosition(); // Update position (size might have changed)
          } else {
              // Valid input type, query >= 3, but no results were returned in input_value.
              // The list remains empty. showMentionList should stay true (set by handler)
              // so the template can display the "No users found..." message.
              // Just ensure selection is reset and position is updated.
              this.selectedMentionIndex = 0;
              this.updateDropdownPosition(); // Update position even if list is empty (might have border/padding height)
              // No need to set showMentionList here, it should already be true if query >= 3 and handler ran.
          }
        }

      } catch (error) {
        if (fetchId < this.latestFetchId) { // <-- Check the ID here
          console.log(`Fetch ${fetchId}: Error received, but newer fetch (${this.latestFetchId}) has started. Ignoring error.`);
          return; // Ignore this error if a newer fetch has been initiated
        }

        console.error(`Fetch ${fetchId}: Error fetching mentions for query "${this.searchQuery}":`, error);
        console.error('Error fetching mentions:', error);
        // On network error or unexpected response structure (not handled by invalid_input type)
        // In this case, hide the list and clear everything.
        this.showMentionList = false;
        this.mentionList = [];
        this.selectedMentionIndex = 0;
        // Optionally clear searchQuery on fetch error too? Probably better to keep the partial query.
        // this.searchQuery = '';
      }
    },

    scrollDropdownIntoView() {
      this.$nextTick(() => {
        const mentionDropdown = this.$refs.mentionDropdown;
        if (mentionDropdown){
          const selectedMention = mentionDropdown.children[this.selectedMentionIndex];
          if (selectedMention) {
            selectedMention.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      });
    },
    selectMention(username) {
      const textareaElement = this.$el.querySelector('textarea');
      const currentCursorPosition = textareaElement.selectionStart; // Use current position

      // We need to find the start index of the @word being replaced
      const textBeforeCursor = this.content.slice(0, currentCursorPosition);

      // Find the most recent '@' that could be the start of the word we are replacing
      // Look for '@' followed by word characters right before the cursor
      const mentionMatchBefore = textBeforeCursor.match(/@(\w*)$/);

      let startIndex = currentCursorPosition; // Default: insert at cursor if no @word found
      let textAfterReplacement = this.content.slice(currentCursorPosition);

      if (mentionMatchBefore) {
        // Found an @word ending right before the cursor
        const mentionWord = mentionMatchBefore[0]; // e.g., "@search"
        const mentionStartIndex = currentCursorPosition - mentionWord.length;
        startIndex = mentionStartIndex; // This is where we start replacing
        textAfterReplacement = this.content.slice(currentCursorPosition); // text after the original cursor pos
      } else {
        // If handleCursorMove put us inside an @word when we clicked,
        // the word might not end *right* at the cursor.
        // We need to find the full @word that contained the cursor
        const text = this.content;
        const mentionRegex = /@(\w+)/g;
        let match;
        let foundMatchUnderCursor = false;

        // Find the @word that contains the cursor position we were at *before* clicking the suggestion
        // Need to store the cursor position *before* selectMention modifies the text/focus
        // Let's assume this.cursorPosition (set by handleKeydown/handleCursorMove) is the state *before* selection
        const posBeforeSelect = this.cursorPosition;

        while ((match = mentionRegex.exec(text)) !== null) {
          const wordStart = match.index;
          const wordEnd = match.index + match[0].length;
          // Check if the position *before* selection was inside this word
          if (posBeforeSelect >= wordStart && posBeforeSelect < wordEnd) {
            startIndex = wordStart; // Replace from the start of this found @word
            textAfterReplacement = text.slice(wordEnd); // Keep text after the found @word
            foundMatchUnderCursor = true;
            break;
          }
        }
        // If no @word found under the cursor (shouldn't happen if list was visible, but safety)
        if (!foundMatchUnderCursor) {
          startIndex = currentCursorPosition; // Insert at the current selectionStart
          textAfterReplacement = this.content.slice(currentCursorPosition);
        }
      }
      // Build the new content
      const textBeforeReplacement = this.content.slice(0, startIndex);
      const newContent = `${textBeforeReplacement}@${username} ${textAfterReplacement}`;

      // Update the content
      this.content = newContent;

      // Calculate the new cursor position (after the inserted username and the space)
      const newCursorPosition = startIndex + username.length + 2; // +1 for '@', +1 for space

      // Hide the list and clear state
      this.showMentionList = false;
      this.mentionList = [];
      this.searchQuery = ''; // Clear search query after selection

      // Manually update cursor position in the textarea after the DOM updates
      this.$nextTick(() => {
        textareaElement.selectionStart = newCursorPosition;
        textareaElement.selectionEnd = newCursorPosition;
        textareaElement.focus(); // Ensure textarea is focused
      });
    },

    handleCursorMove(event) {
      const textareaElement = event.target;
      const cursorPos = textareaElement.selectionStart;
      const text = textareaElement.value;

      // Store the current cursor position for use elsewhere (like selectMention)
      this.cursorPosition = cursorPos;

      let currentMentionQuery = null; // Use null initially

      console.log(`[handleCursorMove] After logic, showMentionList: ${this.showMentionList}`);

      // Find the @username word that CONTAINS the cursor or is immediately after it
      // Use /@(\w+)/g to find actual mentions (requires at least one word char after @)
      const mentionRegex = /@([a-zA-Z0-9_.-]+)/g;
      let match;

      // Check all matches to see if any contain the cursor
      while ((match = mentionRegex.exec(text)) !== null) {
        const wordStart = match.index;
        const wordEnd = match.index + match[0].length;

        // Check if the cursor is within or exactly at the end of the word bounds
        // Use <= wordEnd to include the cursor position immediately after the word chars
        if (cursorPos >= wordStart && cursorPos <= wordEnd) {
          currentMentionQuery = match[1]; // Extract the username part (e.g., "user" from "@user")
          break; // Found the relevant word/context for the cursor position
        }
      }

      // --- State Updates based on finding a word under the cursor ---

      if (currentMentionQuery !== null) { // Cursor is within or immediately after an @word+
        // If the query has actually changed OR the list is currently hidden
        // This prevents unnecessary state updates and index resets when just moving WITHIN the same word.
        if (this.searchQuery !== currentMentionQuery || !this.showMentionList) {
          console.log('handleCursorMove: Found new @word+ context, showing list');
          this.searchQuery = currentMentionQuery;
          this.showMentionList = true; // Show the list
          this.selectedMentionIndex = 0; // Reset selection
          this.updateDropdownPosition(); // Update position

          // Fetch new results if the query meets the minimum length
          if (this.searchQuery.length >= 3) {
            this.fetchMentions(); // Fetch based on the extracted username part
          } else {
            // If query is too short, clear the list results but keep list visible (template shows message)
            this.mentionList = [];
          }
        } else {
          console.log('handleCursorMove: Still in same @word+ context, list already visible');
          // Cursor moved WITHIN the same @word or to its immediate end, list is already shown and query is the same.
          // Just ensure position is updated.
          this.updateDropdownPosition();
        }

      } else { // Cursor is NOT within or immediately after an @word+
        // *** ONLY hide the list if it was showing AND the current searchQuery is NOT empty ***
        // If searchQuery is empty, it means the user likely just typed '@'
        if (this.showMentionList && this.searchQuery !== '') {
          console.log('handleCursorMove: Not in @word+ context and query is not empty, hiding list');
          this.showMentionList = false;
          this.searchQuery = ''; // Clear query
          this.mentionList = [];
          this.selectedMentionIndex = 0;
        } else if (this.showMentionList && this.searchQuery === '') {
          // This case happens right after typing '@'.
          // Cursor is not in @word+ (because regex is @(\w+)), but query IS empty.
          // The list *should* stay visible showing "Start typing...".
          // No action needed here, list remains visible.
          console.log('handleCursorMove: Not in @word+ context, but query is empty (@). List remains visible.');
          this.updateDropdownPosition(); // Still update position in case text lines changed
        } else {
          console.log('handleCursorMove: Not in @word+ context, list already hidden');
          // List was already hidden, do nothing.
        }
      }
    },

    // handleInput method - Keep this as is, it handles state based on typing/backspacing
    // It correctly hides the list if the text *before* the cursor no longer ends with @(\w*)
    handleInput(event) {
      const textareaElement = event.target;
      const cursorPos = textareaElement.selectionStart;
      this.cursorPosition = cursorPos; // Keep cursor pos updated

      // Find the @word ending RIGHT BEFORE the cursor after the input change
      // Use /@(\w*)$/ to match "@" followed by 0 or more word chars at the end
      const textBeforeCursor = textareaElement.value.slice(0, cursorPos);
      const currentWordMatch = textBeforeCursor.match(/@([a-zA-Z0-9_.-]*)$/);

      console.log(`[handleInput] After logic, showMentionList: ${this.showMentionList}`);


      if (currentWordMatch) {
        // Cursor is immediately after an @word (including just after '@')
        const currentQuery = currentWordMatch[1]; // The part after "@"

        // If the query has changed or the list was hidden
        if (this.searchQuery !== currentQuery || !this.showMentionList) {
          console.log('handleInput: Cursor immediately after @word, showing/updating list. Query:', currentQuery);
          this.searchQuery = currentQuery;
          this.showMentionList = true; // Ensure list is shown
          this.selectedMentionIndex = 0; // Reset selection when typing
          this.updateDropdownPosition(); // Update position

          // Fetch if query length is sufficient, otherwise clear list results
          if (this.searchQuery.length >= 3) {
            this.fetchMentions();
          } else {
            this.mentionList = []; // Clear list if too short
            // If searchQuery is '', list is empty, template shows message. showMentionList is true. Correct.
          }
        } else {
          console.log('handleInput: Still same @word ending at cursor, list already visible.');
          // Typing continued within the same @word, list already shown, query is the same.
          // Just ensure position is updated.
          this.updateDropdownPosition();
        }

      } else {
        // Cursor is NOT immediately after an @word (e.g., typed space, comma, or typing elsewhere)
        console.log('handleInput: Cursor NOT immediately after @word');
        if (this.showMentionList) { // If list was showing, hide it.
          console.log('handleInput: Hiding list');
          this.showMentionList = false;
          this.searchQuery = ''; // Clear query
          this.mentionList = []; // Clear list
          this.selectedMentionIndex = 0;
        } else {
          console.log('handleInput: List already hidden');
        }
      }
    },

    handleKeydown(event) {
      const textareaElement = event.target;
      const cursorPos = textareaElement.selectionStart;
      this.cursorPosition = cursorPos; // Always update cursor position on keydown
      const key = event.key;

      // Check if the cursor is currently immediately after an @word that could trigger selection
      // This pattern matches "@" followed by 0 or more word characters right at the end of the text before the cursor.
      const textBeforeCursor = textareaElement.value.slice(0, cursorPos);
      const isCursorAfterAtWordEnding = textBeforeCursor.match(/@\w*$/);

      console.log(`[handleKeydown] Key: "${event.key}", current showMentionList: ${this.showMentionList}`);


      if (this.showMentionList) {
          // Handle selection keys (Enter, Space, Tab) ONLY IF:
          // 1. The list has items to select from (`this.mentionList.length > 0`)
          // 2. The cursor is positioned immediately after the @word being typed/edited (`isCursorAfterAtWordEnding` is true)
          if (['Enter',' ','Tab'].includes(key) && this.mentionList.length > 0 && isCursorAfterAtWordEnding) {
            console.log('handleKeydown: Handling selection key', key, 'at end of @word');
            event.preventDefault(); // Prevent default only when performing a selection
            this.selectMention(this.mentionList[this.selectedMentionIndex]);
          } else if (key === 'ArrowDown' || key === 'ArrowUp') {
            // Still handle arrow keys globally when list is open to navigate suggestions
            if (this.mentionList.length > 0) {
                console.log('handleKeydown: Handling Arrow key for selection navigation');
                event.preventDefault(); // Prevent cursor movement in textarea
                if (key === 'ArrowDown') {
                    this.selectedMentionIndex = (this.selectedMentionIndex + 1) % this.mentionList.length;
                } else {
                    this.selectedMentionIndex = (this.selectedMentionIndex - 1 + this.mentionList.length) % this.mentionList.length;
                }
                this.scrollDropdownIntoView();
            }
          } else if (key === 'Escape') {
            console.log('handleKeydown: Handling Escape');
            event.preventDefault(); // Prevent default Escape behavior
            this.showMentionList = false;
            this.searchQuery = '';
            this.mentionList = [];
            this.selectedMentionIndex = 0;
          }
          // For any other key (including regular characters, backspace, other arrow keys when not navigating suggestions,
          // or Space/Enter/Tab when NOT at the end of an @word):
          // Do NOT prevent default. Let the browser handle inserting the character, backspacing, or moving the cursor.
          // The `input` event handler will then fire (if text changed) or the `keyup` event handler
          // will fire (if cursor moved), and these will correctly update the mention list state based on the *new* text and cursor position.

      } else { // List is NOT showing
          if (key === '@') {
              // If @ is typed and list is NOT already active
                console.log('handleKeydown: Typed @, initiating mention flow');
                // Initiate the flow. The subsequent 'input' event will set searchQuery='' based on the text,
                // and ensure showMentionList is true. This just provides immediate visual feedback.
                this.showMentionList = true; // Immediate visual feedback
                this.selectedMentionIndex = 0;
                this.mentionList = []; // Clear previous results
                // Let the default '@' character be typed. handleInput will pick it up.
                this.$nextTick(() => {
                    // Update position *after* the character is likely added to the DOM
                    if (this.textareaElement) {
                          this.updateDropdownPosition();
                    }
                  });

          } else if (event.ctrlKey && key === 'Backspace') {
                console.log('handleKeydown: Ctrl+Backspace');
                event.preventDefault();
                const textBeforeCursor = textareaElement.value.substring(0, cursorPos);
                const wordRange = /\s*\S+$/.exec(textBeforeCursor);

                if (wordRange) {
                  const wordStartIndex = cursorPos - wordRange[0].length;
                  const newValue =
                    textBeforeCursor.substring(0, wordStartIndex) +
                    textareaElement.value.substring(cursorPos);

                  this.content = newValue; // Update v-model

                  this.$nextTick(() => {
                    if (this.textareaElement) {
                        this.textareaElement.selectionStart = wordStartIndex;
                        this.textareaElement.selectionEnd = wordStartIndex;
                        this.textareaElement.focus();
                        // Trigger handleInput to re-evaluate mention state after deletion
                        // Passing the element ensures the handler has access to the textarea
                        this.handleInput({ target: this.textareaElement });
                    }
                  });
                }
          }
            // For standard keys when list is NOT active:
            // Let default behavior happen. `handleInput` covers text changes, `handleCursorMove` (via keyup) covers cursor changes.
      }
    },
    updateDropdownPosition() {
      // Use $nextTick to ensure DOM is updated before calculating position
      this.$nextTick(() => {
        const editor = this.textareaElement; // Use the stored textarea ref
        const mentionDropdown = this.$refs.mentionDropdown;
        const container = this.$el; // Get the root element of your component (div.mavonEditor.acti-shadow)

        // Ensure we have the necessary elements
        if (!editor || !mentionDropdown || !container) {
            console.warn("Editor textarea, mention dropdown, or container not found for positioning.");
            return;
        }

        const cursorPosition = this.cursorPosition;
        const text = editor.value;

        // --- Approximate Cursor Position Calculation ---

        const textBeforeCursor = text.substr(0, cursorPosition);
        const lines = textBeforeCursor.split("\n");
        const currentLineIndex = lines.length - 1;
        const charIndexInLine = lines[currentLineIndex].length;

        // Get the textarea's position relative to the viewport
        const editorRect = editor.getBoundingClientRect();

        // Get the container's position relative to the viewport
        const containerRect = container.getBoundingClientRect(); // Get the container's rect

        // Get the textarea's scroll position
        const editorScrollTop = editor.scrollTop;
        const editorScrollLeft = editor.scrollLeft;

        // Approximate line height and character width (adjust these if needed for accuracy)
        const computedStyle = window.getComputedStyle(editor);
        const approxLineHeight = parseInt(computedStyle.lineHeight, 10) || 20; // Use computed line-height or fallback
        const approxCharWidth = 8; // Keep initial guess or try measuring (more complex)

        // Calculate approximate pixel position of the cursor relative to the TOP-LEFT of the TEXTAREA CONTENT
        const cursorXRelativeToEditorContent = charIndexInLine * approxCharWidth;
        const cursorYRelativeToEditorContent = currentLineIndex * approxLineHeight;

        // Calculate the approximate pixel position of the cursor relative to the VIEPORT
        const cursorXRelativeToViewport = editorRect.left + cursorXRelativeToEditorContent - editorScrollLeft;
        const cursorYRelativeToViewport = editorRect.top + cursorYRelativeToEditorContent - editorScrollTop;

        // --- Calculate Cursor Position Relative to the CONTAINER ---
        // This is the crucial step for positioning absolute elements within the container
        const cursorXRelativeToContainer = cursorXRelativeToViewport - containerRect.left;
        const cursorYRelativeToContainer = cursorYRelativeToViewport - containerRect.top;


        // --- Dropdown Positioning Logic (Above or Below) ---

        const dropdownHeight = mentionDropdown.offsetHeight;
        const dropdownWidth = mentionDropdown.offsetWidth;
        const offsetY = 5; // Vertical space between text and dropdown

        // Preferred position: BELOW the current text line
        // Calculate top relative to the CONTAINER's top edge
        const preferredTopBelow = cursorYRelativeToContainer + approxLineHeight + offsetY;

        // Calculate available space BELOW the cursor line *within the viewport*
        // We still check against the viewport height because the dropdown might exceed container height
        const spaceBelowInViewport = window.innerHeight - (cursorYRelativeToViewport + approxLineHeight + offsetY);

        // Calculate available space ABOVE the cursor line *within the viewport*
        const spaceAboveInViewport = cursorYRelativeToViewport - offsetY;


        let finalTop, finalLeft;

        // Decide whether to position above or below based on viewport space
        // Position BELOW if there is enough space below *in the viewport*, OR if there is NOT enough space ABOVE *in the viewport*
        // Position ABOVE only if there is NOT enough space BELOW *in the viewport* AND there *is* enough space ABOVE *in the viewport*
        if (spaceBelowInViewport >= dropdownHeight || spaceAboveInViewport < dropdownHeight) {
            // Position BELOW
            console.log('Positioning dropdown BELOW (relative to container)');
            finalTop = preferredTopBelow;
        } else {
            // Position ABOVE
            console.log('Positioning dropdown ABOVE (relative to container)');
            finalTop = cursorYRelativeToContainer - dropdownHeight - offsetY;
        }

        // Determine the horizontal position (aligned with the approximate start of the @word)
        // Calculate the '@' symbol's approximate position relative to the CONTAINER's left edge
        const mentionMatchBefore = textBeforeCursor.match(/@(\w*)$/);
        let atSymbolCharIndex = charIndexInLine; // Default to cursor column

        if(mentionMatchBefore) {
          // If the cursor is right after an @word ending, align with the '@' symbol's position
          atSymbolCharIndex = charIndexInLine - mentionMatchBefore[0].length;
        } else {
            // If cursor is inside an @word or right after '@'
            const mentionRegexGlobal = /@(\w+)/g;
            let match;
            let foundMatchUnderCursor = false;
            while ((match = mentionRegexGlobal.exec(text)) !== null) {
              const wordStart = match.index;
              const wordEnd = match.index + match[0].length;
              if (cursorPosition >= wordStart && cursorPosition <= wordEnd) {
                  atSymbolCharIndex = wordStart; // Index of the '@' symbol
                  foundMatchUnderCursor = true;
                  break;
              }
            }
            // If cursor is NOT in any @word+ context, but is right after '@', align with '@'
            if (!foundMatchUnderCursor && textBeforeCursor.endsWith('@')) {
                atSymbolCharIndex = charIndexInLine - 1; // Index of the '@' symbol
            } else if (!foundMatchUnderCursor) {
                // If cursor isn't in any @word context at all, align with the cursor's column
                  atSymbolCharIndex = charIndexInLine;
            }
        }

        // Calculate the horizontal position relative to the VIEPORT based on the '@' symbol's approximate column
        const atSymbolXRelativeToViewport = editorRect.left + (atSymbolCharIndex * approxCharWidth) - editorScrollLeft;

        // Calculate the horizontal position relative to the CONTAINER based on the '@' symbol's approximate column
        const atSymbolXRelativeToContainer = atSymbolXRelativeToViewport - containerRect.left;


        finalLeft = atSymbolXRelativeToContainer;


        // --- Apply the calculated styles (relative to container) ---
        this.mentionDropdownStyle = {
          top: `${finalTop}px`,
          left: `${finalLeft}px`,
          // bottom: 'auto', // Explicitly set bottom to auto
        };

        console.log('Calculated relative Dropdown Style:', this.mentionDropdownStyle);

        // --- Horizontal Boundary Check (relative to CONTAINER) ---
        // Check if the right edge of the dropdown goes beyond the CONTAINER's right edge
        const dropdownRightEdgeRelativeToContainer = finalLeft + dropdownWidth;
        const containerWidth = containerRect.width; // Get container width

        if (dropdownRightEdgeRelativeToContainer > containerWidth) {
            // If it goes off the right, shift it left relative to the container's left edge
            finalLeft = containerWidth - dropdownWidth - 10; // Shift by dropdown width + a little padding (relative to container)
            // Ensure it doesn't go off the left edge of the container either
            finalLeft = Math.max(0, finalLeft); // Ensure it's not less than 0

            this.mentionDropdownStyle.left = `${finalLeft}px`;
            console.log('Adjusted Dropdown Style (Right edge, relative):', this.mentionDropdownStyle);

        }
        // Add check for left edge too (e.g., if aligning with a word very close to the container's left edge)
        if (finalLeft < 0) {
            finalLeft = 0; // Align with the left edge of the container
            this.mentionDropdownStyle.left = `${finalLeft}px`;
            console.log('Adjusted Dropdown Style (Left edge, relative):', this.mentionDropdownStyle);
        }
        // Vertical boundary check relative to container might also be needed if the container has overflow
        // and a fixed height, but for a scrollable editor within a container, viewport check is often more relevant.
      });
    },
    hideMentionListOnBlur() { /* ... existing code with setTimeout ... */
      setTimeout(() => {
        const activeElement = document.activeElement;
        const componentElement = this.$el;
        const dropdownElement = this.$refs.mentionDropdown;

        // Check if focus is outside the component entirely
        // Or if focus is within the component BUT NOT the dropdown itself (e.g., the markdown preview area)
        // Or if focus is within the dropdown
        if (!componentElement.contains(activeElement) || (dropdownElement && !dropdownElement.contains(activeElement) && componentElement.contains(activeElement))) {
          // If focus is outside the main component *or* is inside the component but not the dropdown
          // This logic might need tweaking depending on what mavon-editor's DOM structure is like when blurred.
          // A simpler check: If focus is NOT within the dropdown AND is NOT within the textarea
          if (!this.textareaElement.contains(activeElement) && !(dropdownElement && dropdownElement.contains(activeElement))) {
            console.log("Blur detected, hiding list");
            this.showMentionList = false;
            this.searchQuery = '';
            this.mentionList = [];
            this.selectedMentionIndex = 0;
          } else {
            console.log("Blur occurred, but focus remains in textarea or dropdown.");
          }

        } else {
          console.log("Blur occurred, but focus is still within the component (and not in the dropdown). This case needs careful handling depending on mavon-editor's structure.");
          // If focus goes to the preview area, maybe keep the list? Or hide it?
          // Hiding is usually safer unless the list is relevant to the preview. Let's hide.
          if (activeElement !== this.textareaElement && !(dropdownElement && dropdownElement.contains(activeElement))) {
            this.showMentionList = false;
            this.searchQuery = '';
            this.mentionList = [];
            this.selectedMentionIndex = 0;
          }
        }

      }, 50); // Adjusted delay
    },
    handlePaste(event) {
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

        const imageUrl = 'https://usermedia.actifit.io/' + key;
        this.$refs.editor.$img2Url(pos, imageUrl);
        return imageUrl;

      } catch (error) {
        console.log('meow Upload Error:', error);
        throw error;
      }
    },

  },
  mounted() {
    this.$nextTick(() => {
      const editorRef = this.$refs.editor; // Use standard check
      const editorEl = editorRef && editorRef.$el;

      if (editorEl) {
        this.textareaElement = editorEl.querySelector('textarea') || editorEl.querySelector('.v-note-edit-area .auto-textarea-input');

        if (this.textareaElement) {
          console.log("Mavon editor textarea element found. Attaching listeners.");

          // Mouse events for cursor movement
          this.boundHandleCursorMove = this.handleCursorMove.bind(this);
          this.textareaElement.addEventListener('mouseup', this.boundHandleCursorMove);
          this.textareaElement.addEventListener('mousemove', this.boundHandleCursorMove); // Smooth updates

          // Keydown for special keys (Enter, Arrows while list is open), and initial '@'
          this.boundHandleKeydown = this.handleKeydown.bind(this);
          this.textareaElement.addEventListener('keydown', this.boundHandleKeydown);

          // Keyup for cursor movement via keyboard navigation (Arrows, Home, End, PageUp, PageDown)
          this.boundHandleKeyup = this.handleCursorMove.bind(this); // <-- Reuse handleCursorMove
          this.textareaElement.addEventListener('keyup', this.boundHandleKeyup); // <-- Add keyup listener

          // Input for text changes (typing, paste, cut, backspace)
          this.boundHandleInput = this.handleInput.bind(this);
          this.textareaElement.addEventListener('input', this.boundHandleInput);

          // Blur for hiding the list when focus leaves
          this.boundHideMentionListOnBlur = this.hideMentionListOnBlur.bind(this);
          this.textareaElement.addEventListener('blur', this.boundHideMentionListOnBlur);


        } else {
          console.warn("Mavon editor textarea element not found with common selectors.");
        }
      } else {
        console.warn("Mavon editor root element ($refs.editor.$el) not found in $nextTick. Check ref 'editor' and component rendering.");
      }
    });
  },

  beforeDestroy() {
    // Remove event listeners
    if (this.textareaElement) {
      if (this.boundHandleCursorMove) {
        this.textareaElement.removeEventListener('mouseup', this.boundHandleCursorMove);
        this.textareaElement.removeEventListener('mousemove', this.boundHandleCursorMove);
      }
      if (this.boundHandleKeydown) {
        this.textareaElement.removeEventListener('keydown', this.boundHandleKeydown);
      }
      if (this.boundHandleKeyup) { // <-- Remove keyup listener
        this.textareaElement.removeEventListener('keyup', this.boundHandleKeyup);
      }
      if (this.boundHandleInput) { // <-- Remove input listener
        this.textareaElement.removeEventListener('input', this.boundHandleInput);
      }
      if (this.boundHideMentionListOnBlur) { // <-- Remove blur listener
        this.textareaElement.removeEventListener('blur', this.boundHideMentionListOnBlur);
      }
    }
    // Clear state on destroy
    this.showMentionList = false;
    this.searchQuery = '';
    this.mentionList = [];
    this.selectedMentionIndex = 0;
  },
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
  z-index: 5000;
  /* Higher value to ensure it appears above other elements */
}

.mention-dropdown li {
  padding: 5px;
  cursor: pointer;
}

.mention-dropdown li.selected,
.mention-dropdown li:hover {
  background: #f0f0f0;
}

.mavonEditor.acti-shadow {
  position: relative;
}


</style>
