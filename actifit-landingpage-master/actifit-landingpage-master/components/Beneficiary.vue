<template>
  <div>
    <button @click="openModal" class="btn border text-brand acti-shadow mt-2">{{$t('manage_beneficiaries')}}<span v-if="entries.length > 0">({{entries.length}})</span></button>
	<transition name="modal-transition">
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
				  <button @click="removeEntry(index)" v-if="!viewOnly && isRemovable(index)">Remove</button>
				</div>
			  </div>
			  <div v-if="restrictedPercent > 0" class="table-row">
				<div class="table-cell">&lt;dynamic-encoder-recipients&gt;</div>
				<div class="table-cell">{{ restrictedPercent }}</div>
				<div class="table-cell"></div>
			  </div>
			</div>
		</div>
		<div v-if="extraNote != ''"><i>{{extraNote}}</i><br /></div>
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
	</transition>
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
	},
	requiredEntries: {
	  type: Array,
      default: () => []
	},
	restrictedPercent: {
	  type: Number,
	  default: 0
	},
	extraNote: {
	  type: String,
	  default: ''
	}
  },//['initialEntries', 'viewOnly'], 
  data() {
    return {
      isModalOpen: false,
      entries: this.initialEntries.map(entry => ({ account: entry.account, weight: parseFloat(entry.weight) / 100 })),
      newEntry: {
        account: '',
        weight: 0
      }
    }
  },
  watch: {
	initialEntries: function (){
		console.log('adjust initial entries')
		this.entries = this.initialEntries.map(entry => ({ account: entry.account, weight: parseFloat(entry.weight) / 100 }))
	}
  },
  computed: {
    totalValue() {
      return this.entries.reduce((acc, entry) => parseFloat(acc) + parseFloat(entry.weight), 0) + this.restrictedPercent;
    },
    remainingValue() {
      return 100 - this.totalValue
    },
	formattedEntries() {
		return this.entries.map(entry => ({ account: entry.account, weight: parseFloat(entry.weight * 100) }))
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
        if (this.totalValue + parseFloat(this.newEntry.weight) <= 100) {
          this.entries.push({ ...this.newEntry })
		  //sort alpha as this is required when creating content 
		  this.entries = this.entries.sort((a, b) => a.account.localeCompare(b.account));
		  //save data properly as int for weight
		  this.entries = this.entries.map(obj => ({
			  account: obj.account,
			  weight: parseFloat(obj.weight)
		  }));
          this.newEntry.account = ''
          this.newEntry.weight = 0
        } else {
          alert('The total weight cannot exceed 100%')
        }
      } else {
        alert('Please fill in both fields')
      }
    },
	isRemovable(index) {
		return !(this.requiredEntries.length > 0 && this.requiredEntries.includes(this.entries[index].account));
	},
    removeEntry(index) {
	  if (!this.isRemovable(index)){
		//cannot remove this entry
		return;
	  }
      this.entries.splice(index, 1)
    },
    saveEntries() {
      //const formattedEntries = this.entries.map(entry => ({ account: entry.account, weight: parseInt(entry.weight * 100) }))
      //console.log(formattedEntries)
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
.modal-transition-enter-active,
.modal-transition-leave-active {
  transition: all 0.5s ease-out;
}
.modal-transition-enter,
.modal-transition-leave-to {
  transform: translateY(-100%);
}
</style>