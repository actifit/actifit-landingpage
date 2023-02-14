<template>
  <div>
    <button @click="openModal">{{$t('beneficiaries')}}</button>
    <div v-if="isModalOpen" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <span>{{$t('current_benefic_list')}}</span>
		<div class="table">
			<div class="table-header">
			  <div class="table-cell">Username</div>
			  <div class="table-cell">Value (%)</div>
			  <div class="table-cell">Actions</div>
			</div>
			<div class="table-body">
			  <div v-for="(entry, index) in entries" :key="index" class="table-row">
				<div class="table-cell">{{ entry.username }}</div>
				<div class="table-cell">{{ entry.value }}</div>
				<div class="table-cell">
				  <button @click="removeEntry(index)">Remove</button>
				</div>
			  </div>
			</div>
		</div>
        <div><b><i>{{$t('add_beneficiary')}}</i></b></div>
        <div>
		  
          <label>Username:</label>
          <input type="text" v-model="newEntry.username" />
          <label>Value (%):</label>
          <input type="number" v-model="newEntry.value" min="1" :max="remainingValue" />
          <button @click="addEntry" class="btn border text-brand acti-shadow">Add</button>
        </div>
        <div class="modal-buttons">
          <button @click="saveEntries" class="btn border text-brand acti-shadow">Save</button>
          <button @click="closeModal" class="btn border text-red acti-shadow">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isModalOpen: false,
      entries: [],
      newEntry: {
        username: '',
        value: 0
      }
    }
  },
  computed: {
    totalValue() {
      return this.entries.reduce((acc, entry) => parseInt(acc) + parseInt(entry.value), 0)
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
      if (this.newEntry.username && this.newEntry.value) {
	    console.log(this.totalValue)
		console.log(this.newEntry.value)
        if (this.totalValue + parseInt(this.newEntry.value) <= 100) {
          this.entries.push({ ...this.newEntry })
          this.newEntry.username = ''
          this.newEntry.value = 0
        } else {
          alert('The total value cannot exceed 100%')
        }
      } else {
        alert('Please fill in both fields')
      }
    },
    removeEntry(index) {
      this.entries.splice(index, 1)
    },
    saveEntries() {
      const formattedEntries = this.entries.map(entry => ({ account: entry.username, weight: entry.value }))
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
}

.modal-content {
  background-color: #fefefe;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
}

.close {
  float: right;
  font-size: 28px;
  font-weight: bold;
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