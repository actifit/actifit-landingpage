<template>
  <div :class="['autocomplete-input', customClass]">
    <div class="input-with-icon">
      <i class="fa fa-search"></i>

      <input type="text" v-model="inputValue" ref="inputElement" id="username" name="username" @input="onInput"
        @keydown.down="highlightNext" @keydown.up="highlightPrevious" @keydown.enter="selectHighlighted"
        @blur="hideDropdown" @focus="showDropdown" :class="inputClass" :placeholder="placeHolderVal" />
    </div>
    <ul v-if="showDropdownList && mentionList.length" class="mention-dropdown" ref="mentionDropdown">
      <li v-for="(mention, index) in mentionList" :key="index" @mouseover="highlightOption(index)"
        @click="selectMention(mention)" class="text-left text-brand" style=""
        :class="{ 'selected': index === highlightedIndex }" ref="mentionItems">
        {{ mention }}
      </li>
    </ul>
  </div>
</template>

<script>
import axios from "axios";

export default {
  props: {
    customClass: {
      type: String,
      default: "", // Default empty string if no custom class is provided
    },
    inputClass: {
      type: String,
      default: "", // Provide default input styling
    },
    passedValue: {
      type: String,
      default: "",
    },
    placeHolderVal: {
      type: String,
      default: "",
    },
    enableRedirect: {
      type: Boolean,
      default: false, // Toggle for redirection behavior
    },
  },
  data() {
    return {
      inputValue: this.passedValue,
      showDropdownList: false,
      mentionList: [],
      highlightedIndex: -1,
    };
  },
  methods: {
    async fetchMentions() {
      if (!this.inputValue) return;
      try {
        const response = await axios.get(
          process.env.hiveApiNode + `/hafbe-api/input-type/${this.inputValue}%25`
        );
        const responseData = response.data;
        if (responseData.input_type === 'invalid_input') {
          this.mentionList = []; // Clear list for invalid input
          this.showMentionList = false; // Explicitly hide list for invalid input
          this.selectedMentionIndex = 0; // Reset selection
        } else{
          this.mentionList = response.data.input_value || [];
          if (this.mentionList.length > 0) {
              // The calling handler (input/cursorMove) should have set showMentionList = true,
              // but ensure it's true if we actually received results.
              this.showMentionList = true;
              this.selectedMentionIndex = 0; // Reset selection for new results
              this.scrollDropdownIntoView(); // Scroll to the top item (index 0)
              this.updateDropdownPosition(); // Update position (size might have changed)
          }else {
              this.selectedMentionIndex = 0;
              this.updateDropdownPosition();
          }
        }

      } catch (error) {
        console.error("Error fetching mentions:", error);
      }
    },
    onInput() {
      if (this.inputValue) {
        this.fetchMentions(); // Fetch suggestions dynamically
        this.showDropdownList = true;
      } else {
        this.showDropdownList = false;
        this.mentionList = [];
      }
    },
    hideDropdown() {
      setTimeout(() => {
        this.showDropdownList = false;
      }, 200); // Delay to allow `selectMention` trigger
    },
    showDropdown() {
      if (this.inputValue) {
        this.showDropdownList = true;
      }
    },
    highlightNext() {
      if (this.mentionList.length > 0) {
        // Increment index and wrap around
        this.highlightedIndex = (this.highlightedIndex + 1) % this.mentionList.length;
        this.scrollToHighlighted();
      }
    },
    highlightPrevious() {
      if (this.mentionList.length > 0) {
        // Decrement index and wrap around
        this.highlightedIndex =
          (this.highlightedIndex - 1 + this.mentionList.length) % this.mentionList.length;
        this.scrollToHighlighted();
      }
    },
    highlightOption(index) {
      this.highlightedIndex = index;
      this.scrollToHighlighted();
    },
    selectHighlighted() {
      if (this.highlightedIndex >= 0) {
        this.selectMention(this.mentionList[this.highlightedIndex]);
      }
    },
    selectMention(mention) {
      this.inputValue = mention;
      this.showDropdownList = false;
      this.$emit("select", mention);

      // Check if redirection is enabled
      if (this.enableRedirect) {
        const url = `/${mention}`;
        window.location.href = url; // Redirect to the generated URL
      }
    },
    scrollToHighlighted() {
      const items = this.$refs.mentionItems;
      const dropdown = this.$refs.mentionDropdown;

      if (items && items[this.highlightedIndex]) {
        const item = items[this.highlightedIndex];

        // Get the item's position and dimensions
        const itemTop = item.offsetTop;
        const itemBottom = itemTop + item.offsetHeight;

        // Get the dropdown's visible area
        const dropdownScrollTop = dropdown.scrollTop;
        const dropdownHeight = dropdown.offsetHeight;

        // Scroll up if the item is above the visible area
        if (itemTop < dropdownScrollTop) {
          dropdown.scrollTop = itemTop;
        }
        // Scroll down if the item is below the visible area
        else if (itemBottom > dropdownScrollTop + dropdownHeight) {
          dropdown.scrollTop = itemBottom - dropdownHeight;
        }
      }
    },

  },
  mounted() {
    // Forward the ref to make it accessible via the parent component
    this.$refs.input = this.$refs.inputElement;
  },
};
</script>

<style scoped>
.autocomplete-input {
  position: relative;
}

.text-input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
}

.mention-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  z-index: 10;
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
}

.mention-dropdown li {
  padding: 10px;
  cursor: pointer;
}

.mention-dropdown li:hover,
.mention-dropdown li.selected {
  background-color: #f0f0f0;
}

.input-with-icon {
  position: relative;
  display: inline-block;
  width: 100%;
  /* Ensures input field spans the full width */
}

.input-with-icon .fa-search {
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  color: gray;
  /* Customize icon color */
  font-size: 16px;
  display: block !important;
}
#username{
  padding-left: 30px;
  font-size: 16px;
}

.input-with-icon input {
  padding-left: 35px;
  /* Create space for the icon */
  width: 100%;
  /* Ensures input field spans the container */
}

.hiddenIcon .fa-search{
  display:none;
}

.hiddenIcon .input-with-icon input {
  padding-left: 3px;
}
@media only screen and (max-width: 500px){
  #username{
    font-size: 12px;
    padding-left: 30px; /* This is the key fix: ensures padding is applied */
  }

  .input-with-icon .fa-search {
    display: block !important; /* Ensures the icon is always visible on mobile */
    font-size: 14px; /* Optional: adjust icon size for smaller screens */
  }
}
</style>