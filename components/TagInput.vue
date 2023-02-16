<template>
  <div>
    <span class="row">
	<input v-model="newItem" @keyup="keyCheck" @paste="handlePaste" :placeholder="$t('Tags')" class="form-control form-control-lg w-25" style="border: none;"/>
    <ul style="list-style: none; display: flex; flex-flow: wrap;">
      <li v-for="(item, index) in items" :key="item" style="border: 1px solid gray; border-radius: 3px;" class="acti-shadow mr-2 mb-2 p-2">
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
	  //console.log(this.initialItems)
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
		if (Array.isArray(this.items) && this.items.length > 0){
			if (this.items.includes(this.newItem.replace(',',''))){
				proceed = false;
			}
		}
		if (proceed){
			this.items.push(...items);
	    }
	  event.preventDefault();
      this.newItem = '';
	  return false;
    },
    addItem() {
	  //console.log('new tag a');
	  //console.log(this.newItem);
	  //console.log(this.items);
      if (this.newItem) {
		let proceed = true;
		if (Array.isArray(this.items) && this.items.length > 0){
			if (this.items.includes(this.newItem.replace(',',''))){
				proceed = false;
			}
		}
		if (proceed){
			this.items.push(this.newItem.replace(',','').trim());
		}
        this.newItem = '';
      }
    },
    removeItem(index) {
      this.items.splice(index, 1);
    }
  }
}
</script>
