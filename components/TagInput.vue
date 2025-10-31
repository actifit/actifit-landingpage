<template>
  <!--
    This is the new wrapper. It's styled to look like a form control.
    The @click handler focuses the text input when the user clicks anywhere inside the component.
  -->
  <div class="tag-input-wrapper acti-shadow" @click="focusInput">
    <!-- The list of tags, using your original v-for loop -->
    <ul class="tag-list">
      <li v-for="(item, index) in items" :key="item" class="tag-item">
        <span>{{ item }}</span>
        <!-- Your original remove button, styled for better alignment -->
        <button @click.stop="removeItem(index)" class="remove-btn" title="Remove Tag">&times;</button>
      </li>
    </ul>

    <!-- The input for new tags, using your original v-model and event handlers -->
    <input
      ref="tagInput"
      v-model="newItem"
      @keyup="keyCheck"
      @paste="handlePaste"
      :placeholder="$t('Tags')"
      class="tag-input-field"
    />
  </div>
</template>

<script>
// Your original script logic is fully preserved.
// I've only added the focusInput method and the corresponding 'ref' in the template.
export default {
  props: {
    initialItems: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    initialItems: function(newVal, oldVal) { // watch it
      this.items = newVal;
    }
  },
  data() {
    return {
      newItem: '',
      items: this.initialItems
    }
  },
  methods: {
    keyCheck(event) {
      if (event.keyCode === 32 || event.keyCode === 188 || event.keyCode === 13) {
        // Code to handle when the spacebar, comma, or enter key is pressed
        event.preventDefault();
        this.addItem();
      }
    },
    handlePaste(event) {
      const pastedText = event.clipboardData.getData('text');
      let items = pastedText.split(/[\s,]+/);
      items = items.filter(i => i !== "");
      let proceed = true;
      if (Array.isArray(this.items) && this.items.length > 0) {
        // Prevent duplicates from paste
        const existingItems = new Set(this.items);
        items = items.filter(item => !existingItems.has(item.trim()));
      }
      if (items.length > 0) {
        this.items.push(...items.map(item => item.trim()));
      }
      event.preventDefault();
      this.newItem = '';
      return false;
    },
    addItem() {
      const newItemClean = this.newItem.replace(',', '').trim();
      if (newItemClean) {
        let proceed = true;
        if (Array.isArray(this.items) && this.items.length > 0) {
          if (this.items.includes(newItemClean)) {
            proceed = false;
          }
        }
        if (proceed) {
          this.items.push(newItemClean);
        }
        this.newItem = '';
      }
    },
    removeItem(index) {
      this.items.splice(index, 1);
    },
    // New helper method to focus the input field
    focusInput() {
      this.$refs.tagInput.focus();
    }
  }
}
</script>

<style scoped>
.tag-input-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  border: 1px solid #ced4da;
  border-radius: 0.3rem;
  padding: 0.5rem 0.25rem;
  background-color: white;
  cursor: text;
  min-height: calc(1.5em + 1rem + 2px);
  max-height: 85px;
  overflow-y: auto;
}

.tag-list {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 0;
  margin: 0;
}

.tag-item {
  display: flex;
  align-items: center;
  background-color: #e9ecef;
  border: 1px solid #ddd;
  border-radius: 3px;
  margin-left: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.25rem 0.5rem;
  white-space: nowrap;
  font-size: 0.9rem;
}

.remove-btn {
  background: none;
  border: none;
  color: #6c757d;
  font-size: 1.2em;
  font-weight: bold;
  line-height: 1;
  margin-left: 0.5rem;
  cursor: pointer;
  padding: 0;
}

.remove-btn:hover {
  color: #343a40;
}

.tag-input-field {
  flex-grow: 1;
  border: none;
  outline: none;
  padding: 0.25rem 0.5rem;
  min-width: 150px;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  line-height: 1.5;
  height: 100%;
}
</style>
