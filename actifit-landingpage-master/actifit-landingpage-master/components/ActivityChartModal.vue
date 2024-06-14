<template>
  <div class="modal fade" id="activityChartModal" ref="activityChartModal" tabindex="-1">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ $t('Activity_chart') }}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
		<div class="modal-body">
			<div>
				<MeasureLineChart :data="weightVals" :options="chartOptions"/>
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
	
	props: ['userActivity'],
	
	data () {
      return {
		cur_bchain: 'HIVE',
		weightVals: [],
		chartOptions: {
				scales: {
					xAxes: [{
						ticks: {
							beginAtZero: true,
							suggestedMax: 10000,
						},
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
					}],
					yAxes: [{
						ticks: {
							beginAtZero: true,
							suggestedMax: 10000,
						},
						type: 'linear',
					}]
				},
				
				"annotation": {
					"annotations": [
						/*{
							type: 'line',
							mode: 'horizontal',
							scaleID: 'y-axis-0',
							value: 5000,
							borderColor: 'rgb(200,60,200)',
							backgroundColor: 'rgb(200,60,200)',
							borderWidth: 50,
							label: {
							  enabled: true,
							  content: 'Min Rewards'
							}
						},
						{
							type: 'line',
							mode: 'horizontal',
							scaleID: 'y-axis-0',
							value: 10000,
							borderColor: 'rgb(200,60,200)',
							backgroundColor: 'rgb(200,60,200)',
							borderWidth: 50,
							label: {
							  enabled: true,
							  content: 'Max Rewards'
							}
						}
						{
							"id": "box_acti_chrt",
							"type": "box",
							"xScaleID": "x-axis-0",
							"yScaleID": "y-axis-0",
							"yMin": "10",
							"yMax": "100",
							"xMin": 864,
							"xMax": 1285,
							"borderWidth": 1,
							"backgroundColor": "rgba(50,60,60,0.25)",
							"borderColor": "rgba(50,60,60,0.25)"
						}, {
							"type": "box",
							"xScaleID": "x-axis-0",
							"yScaleID": "y-axis-0",
							"yMin": 30,
							"yMax": 40,
							"xMin": 864,
							"xMax": 1285,
							"borderWidth": 1,
							"backgroundColor": "rgba(200,60,200,0.25)",
							"borderColor": "rgba(200,60,200,0.25)"
						}*/
					]
				
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
		userActivity: 'setupChartData',
	},
	methods: {
		async setupChartData(){
			//extract proper needed data for chart
			
			let trackedData = [];
			
			
			for (let i=0;i<this.userActivity.length;i++){
				//console.log(this.userActivity[i]);
				if (this.userActivity[i].date){
					if (this.userActivity[i].json_metadata.step_count){
						trackedData.push({
							x: new Date(this.userActivity[i].date),
							y: parseInt(this.userActivity[i].json_metadata.step_count)
						})
					}
				}
			}
			//console.log(trackedData);

			
			this.weightVals = {
				datasets: [
				{
				  label: 'Activity Count',
				  backgroundColor: '#32a883',
				  borderColor: '#32a883',
				  showLine: true,
				  spanGaps: true,
				  fill: false,
				  data: trackedData,
				  borderWidth: 1
				},
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