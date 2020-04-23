<template>
  <div class="modal fade" id="measureChartModal" ref="measureChartModal" tabindex="-1">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ $t('Measurements_chart') }}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
		<div class="modal-body">
			<div>
				<MeasureLineChart :data="weightVals" :options="chartOptions"/>
			</div>
			<div>
				<MeasureLineChart :data="chestVals" :options="chartOptions"/>
			</div>
			<div>
				<MeasureLineChart :data="bodyfatVals" :options="chartOptions"/>
			</div>
		</div>
      </div>
    </div>
  </div>
</template>

<script>
 
  import { mapGetters } from 'vuex'
  
  import MeasureLineChart from '~/components/MeasureLineChart'
  
  export default {
	
	props: ['userMeasurements'],
	
	data () {
      return {
		cur_bchain: 'HIVE',
		weightVals: [],
		heightVals: [],
		chestVals: [],
		waistVals: [],
		bodyfatVals: [],
		thighsVals: [],
		chartOptions: {
				scales: {
					xAxes: [{
						type: 'time',
						time: {
							format: 'DD/MM/YYYY',
							tooltipFormat: 'll',
							displayFormats: {
								'millisecond': 'DD/MM/YYYY',
								'second': 'DD/MM/YYYY',
								'minute': 'DD/MM/YYYY',
								'hour': 'DD/MM/YYYY',
								'day': 'DD/MM/YYYY',
								'week': 'DD/MM/YYYY',
								'month': 'DD/MM/YYYY',
								'quarter': 'DD/MM/YYYY',
								'year': 'DD/MM/YYYY',
							  }
						},
						display: true,
						scaleLabel: {
							display:     true,
							labelString: 'Date'
						},
						distribution: 'linear'
					}]
				}
			},
	  }
	},
	components: {
	  MeasureLineChart
	},
	computed: {
      ...mapGetters('steemconnect', ['user']),
      ...mapGetters(['bchain']),
    },
	watch: {
		userMeasurements: 'setupChartData',
	},
	methods: {
		async setupChartData(){
			//extract proper needed data for chart
			
			let weightData = [];
			let heightData = [];
			let waistData = [];
			let chestData = [];
			let thighsData = [];
			let bodyfatData = [];
			
			
			for (let i=0;i<this.userMeasurements.length;i++){
				if (this.userMeasurements[i].json_metadata.height){
					weightData.push({
						x: new Date(this.userMeasurements[i].date),
						y: this.userMeasurements[i].json_metadata.weight
					})
					
					heightData.push({
						x: new Date(this.userMeasurements[i].date),
						y: this.userMeasurements[i].json_metadata.height
					})
					
					chestData.push({
						x: new Date(this.userMeasurements[i].date),
						y: this.userMeasurements[i].json_metadata.chest
					})
					
					thighsData.push({
						x: new Date(this.userMeasurements[i].date),
						y: this.userMeasurements[i].json_metadata.thighs
					})
					
					waistData.push({
						x: new Date(this.userMeasurements[i].date),
						y: this.userMeasurements[i].json_metadata.waist
					})
					
					bodyfatData.push({
						x: new Date(this.userMeasurements[i].date),
						y: this.userMeasurements[i].json_metadata.bodyfat
					})
				}
			}
			//console.log(weightData);

			
			this.weightVals = {
				datasets: [
				{
				  label: 'Weight Progress',
				  backgroundColor: '#f87979',
				  showLine: true,
				  //spanGaps: true,
				  fill: false,
				  data: weightData,
				}
			  ]
			};
			
			this.heightVals = {
				datasets: [
				{
				  label: 'Height Progress',
				  backgroundColor: '#f87979',
				  showLine: true,
				  //spanGaps: true,
				  fill: false,
				  data: heightData,
				}
			  ]
			};
			
			this.chestVals = {
				datasets: [
				{
				  label: 'Chest Progress',
				  backgroundColor: '#f87979',
				  showLine: true,
				  //spanGaps: true,
				  fill: false,
				  data: chestData,
				}
			  ]
			};
			
			this.waistVals = {
				datasets: [
				{
				  label: 'Waist Progress',
				  backgroundColor: '#f87979',
				  showLine: true,
				  //spanGaps: true,
				  fill: false,
				  data: waistData,
				}
			  ]
			};
			
			this.bodyfatVals = {
				datasets: [
				{
				  label: 'Bodyfat Progress',
				  backgroundColor: '#f87979',
				  showLine: true,
				  //spanGaps: true,
				  fill: false,
				  data: bodyfatData,
				}
			  ]
			};
			
			this.thighsVals = {
				datasets: [
				{
				  label: 'Thighs Progress',
				  backgroundColor: '#f87979',
				  showLine: true,
				  //spanGaps: true,
				  fill: false,
				  data: thighsData,
				}
			  ]
			};
			//this.$forceUpdate();
		}
	},
	async mounted () {
		//grab current chain
		if (localStorage.getItem('cur_bchain')){
			this.cur_bchain = localStorage.getItem('cur_bchain')
			this.currentToken = this.cur_bchain;
		}
	}
  }
</script>
<style>
.text-green{
	color: #76BB0E
}
.border-red{
	border: 2px red solid;
	border-radius: 5px;
}
</style>