<template>
  <div :class="['autocomplete-input', customClass]">
    <input
      type="text"
      v-model="inputValue"
      ref="inputElement"
      id="username"
      name="username"
      @input="onInput"
      @keydown.down="highlightNext"
      @keydown.up="highlightPrevious"
      @keydown.enter="selectHighlighted"
      @blur="hideDropdown"
      @focus="showDropdown"
      :class="inputClass"
      placeholder=""
    />
    <ul v-if="showDropdownList && mentionList.length" class="mention-dropdown" ref="mentionDropdown">
      <li
        v-for="(mention, index) in mentionList"
        :key="index"
        @click="selectMention(mention)"
        :class="{ 'selected': index === highlightedIndex }"
      >
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
    }
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
        this.highlightedIndex = (this.highlightedIndex + 1) % this.mentionList.length;
      }
    },
    highlightPrevious() {
      if (this.mentionList.length > 0) {
        this.highlightedIndex =
          (this.highlightedIndex - 1 + this.mentionList.length) % this.mentionList.length;
      }
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
</style>
