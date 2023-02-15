<template>
  <div>
    <button @click="openModal">{{$t('beneficiaries')}}</button>
    <div v-if="isModalOpen" class="modal">
      <div class="modal-header">
		<span>{{$t('current_benefic_list')}}</span>
		<span class="close" @click="closeModal">&times;</span>
	  </div>
	  
	  <div class="modal-content">
        
		<div class="table">
			<div class="table-header">
			  <div class="table-cell">Username</div>
			  <div class="table-cell">Weight (%)</div>
			  <div class="table-cell" v-if="!viewOnly">Actions</div>
			</div>
			<div class="table-body">
			  <div v-for="(entry, index) in entries" :key="index" class="table-row">
				<div class="table-cell">{{ entry.account }}</div>
				<div class="table-cell">{{ entry.weight }}</div>
				<div class="table-cell">
				  <button @click="removeEntry(index)" v-if="!viewOnly">Remove</button>
				</div>
			  </div>
			</div>
		</div>
		<div v-if="!viewOnly">
			<div><b><i>{{$t('add_beneficiary')}}</i></b></div>
			<div>
			  
			  <label>Username:</label>
			  <input type="text" v-model="newEntry.account" />
			  <label>Weight (%):</label>
			  <input type="number" v-model="newEntry.weight" min="1" :max="remainingValue" />
			  <button @click="addEntry" class="btn border text-brand acti-shadow">Add</button>
			</div>
			<div class="modal-buttons">
			  <button @click="saveEntries" class="btn border text-brand acti-shadow">Save</button>
			  <button @click="closeModal" class="btn border text-red acti-shadow">Cancel</button>
			</div>
		</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    initialEntries: {
      type: Array,
      default: () => []
    },
	viewOnly: {
	  type: Boolean,
	  default: false
	}
  },//['initialEntries', 'viewOnly'], 
  data() {
    return {
      isModalOpen: false,
      entries: this.initialEntries.map(entry => ({ account: entry.account, weight: entry.weight / 100 })),
      newEntry: {
        account: '',
        weight: 0
      }
    }
  },
  computed: {
    totalValue() {
      return this.entries.reduce((acc, entry) => parseInt(acc) + parseInt(entry.weight), 0)
    },
    remainingValue() {
      return 100 - this.totalValue
    }
  },
  methods: {
    openModal() {
      console.log('open modal')
      this.isModalOpen = true
    },
    closeModal() {
      this.isModalOpen = false
    },
    addEntry() {
      if (this.newEntry.account && this.newEntry.weight) {
	    console.log(this.totalValue)
		console.log(this.newEntry.weight)
        if (this.totalValue + parseInt(this.newEntry.weight) <= 100) {
          this.entries.push({ ...this.newEntry })
          this.newEntry.account = ''
          this.newEntry.weight = 0
        } else {
          alert('The total weight cannot exceed 100%')
        }
      } else {
        alert('Please fill in both fields')
      }
    },
    removeEntry(index) {
      this.entries.splice(index, 1)
    },
    saveEntries() {
      const formattedEntries = this.entries.map(entry => ({ account: entry.account, weight: entry.weight * 100 }))
      console.log(formattedEntries)
      this.closeModal()
    }
  }
}
</script>

<style scoped>
.modal {
  display: block;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0,0,0,0.4);
  z-index: 99999;
}


.modal-header{
  background-color: #fefefe;
  /* margin: 15% auto; */
  margin: auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
}

.modal-content {
  background-color: #fefefe;
  /* margin: 15% auto; */
  margin: auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
}

.close {
  float: right;
  font-size: 28px;
  font-weight: bold;
  text-align: right;
}

.close:hover,
.close:focus {
  color: #000;
  text-decoration: none;
  cursor: pointer
}

.table {
  display: table;
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
}

.table-header {
  display: table-header-group;
  font-weight: bold;
}

.table-body {
  display: table-row-group;
}

.table-cell {
  display: table-cell;
  padding: 8px;
  border: 1px solid #ddd;
  text-align: left;
}

.table-row {
  display: table-row;
}
</style>