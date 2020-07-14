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
			<!--<div>
				<MeasureLineChart :data="chestVals" :options="chartOptions"/>
			</div>
			<div>
				<MeasureLineChart :data="bodyfatVals" :options="chartOptions"/>
			</div>-->
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
						/*scaleLabel: {
							display:     true,
							labelString: 'Date'
						},*/
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
				if (this.userMeasurements[i].date){
					if (this.userMeasurements[i].json_metadata.weight){
						weightData.push({
							x: new Date(this.userMeasurements[i].date),
							y: this.userMeasurements[i].json_metadata.weight
						})
					}
					
					if (this.userMeasurements[i].json_metadata.height){
						heightData.push({
							x: new Date(this.userMeasurements[i].date),
							y: this.userMeasurements[i].json_metadata.height
						})
					}
					
					if (this.userMeasurements[i].json_metadata.chest){					
						chestData.push({
							x: new Date(this.userMeasurements[i].date),
							y: this.userMeasurements[i].json_metadata.chest
						})
					}
					
					if (this.userMeasurements[i].json_metadata.thighs){					
						thighsData.push({
							x: new Date(this.userMeasurements[i].date),
							y: this.userMeasurements[i].json_metadata.thighs
						})
					}
					
					if (this.userMeasurements[i].json_metadata.waist){					
						waistData.push({
							x: new Date(this.userMeasurements[i].date),
							y: this.userMeasurements[i].json_metadata.waist
						})
					}
					
					if (this.userMeasurements[i].json_metadata.bodyfat){					
						bodyfatData.push({
							x: new Date(this.userMeasurements[i].date),
							y: this.userMeasurements[i].json_metadata.bodyfat
						})
					}
				}
			}
			//console.log(weightData);

			
			this.weightVals = {
				datasets: [
				{
				  label: 'Weight',
				  backgroundColor: '#a85832',
				  borderColor: '#a85832',
				  showLine: true,
				  spanGaps: true,
				  fill: false,
				  data: weightData,
				  borderWidth: 1
				},
				{
				  label: 'Height',
				  backgroundColor: '#a88732',
				  borderColor: '#a88732',
				  showLine: true,
				  spanGaps: true,
				  fill: false,
				  data: heightData,
				  borderWidth: 1
				},
				{
				  label: 'Bodyfat Progress',
				  backgroundColor: '#32a883',
				  borderColor: '#32a883',
				  showLine: true,
				  spanGaps: true,
				  fill: false,
				  data: bodyfatData,
				  borderWidth: 1
				},
				{
				  label: 'Chest Progress',
				  backgroundColor: '#a74dd1',
				  borderColor: '#a74dd1',
				  showLine: true,
				  spanGaps: true,
				  fill: false,
				  data: chestData,
				  borderWidth: 1
				},
				{
				  label: 'Waist Progress',
				  backgroundColor: '#d14dd1',
				  borderColor: '#d14dd1',
				  showLine: true,
				  spanGaps: true,
				  fill: false,
				  data: waistData,
				  borderWidth: 1
				},
				{
				  label: 'Thighs Progress',
				  backgroundColor: '#f76ad6',
				  borderColor: '#f76ad6',
				  showLine: true,
				  spanGaps: true,
				  fill: false,
				  data: thighsData,
				  borderWidth: 1
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
				},
				{
				  label: 'Waist Progress',
				  backgroundColor: '#f87979',
				  showLine: true,
				  //spanGaps: true,
				  fill: false,
				  data: waistData,
				},
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