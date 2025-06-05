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
        this.mentionList = response.data.input_value || [];
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

@media (max-width: 500px) {
  .autocomplete-input.autocomplete-condensed {
    min-width: 60px;
    max-width: 100px; /* Adjust this based on testing */
  }

  .autocomplete-input.autocomplete-condensed .input-with-icon input.search-input-condensed {
    font-size: 0.75rem !important;
    padding: 2px 3px !important; /* Minimal padding */
    height: auto !important;
  }

  .autocomplete-input.autocomplete-condensed.hiddenIcon .input-with-icon input.search-input-condensed {
    padding-left: 3px !important; /* Minimal left padding if internal search icon is hidden */
  }

  .autocomplete-input.autocomplete-condensed .mention-dropdown {
     min-width: 150px; /* Dropdown can be wider than input */
     font-size: 0.9em;
  }

  .autocomplete-input.autocomplete-condensed .mention-dropdown li {
     padding: 6px 10px;
  }
}
</style>
