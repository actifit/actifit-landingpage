<template>
  <div>
    <span class="row">
	<input v-model="newItem" @keyup="keyCheck" @paste="handlePaste" :placeholder="$t('Tags')" class="form-control form-control-lg w-25" style="border: none;"/>
    <ul style="list-style: none; display: flex; flex-flow: wrap;">
      <li v-for="(item, index) in items" :key="item" style="margin-right: 8px; padding: 8px; border: 1px solid gray; border-radius: 3px;" class="acti-shadow">
        {{ item }}
        <button @click="removeItem(index)" style="float: right; background: none; border: none;">x</button>
      </li>
    </ul></span>
  </div>
</template>

<script>
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
	  console.log(this.initialItems)
      if (event.keyCode === 32 || event.keyCode === 188) {
        event.preventDefault();
        this.addItem();
      }
    },
    handlePaste(event) {
      const pastedText = event.clipboardData.getData('text');
      let items = pastedText.split(/[\s,]+/);
      items = items.filter(i => i !== "");
      this.items.push(...items);
      this.newItem = '';
    },
    addItem() {
      if (this.newItem) {
        this.items.push(this.newItem.replace(',',''));
        this.newItem = '';
      }
    },
    removeItem(index) {
      this.items.splice(index, 1);
    }
  }
}
</script>
