<template>
  <div class="modal fade" id="dailyActivityChartModal" ref="dailyActivityChartModal" tabindex="-1">
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
	
	props: ['report'],
	
	data () {
      return {
		cur_bchain: 'HIVE',
		weightVals: [],
		chartOptions: {
				scales: {
					xAxes: [{
						ticks: {
							beginAtZero: true,
							suggestedMin: '00:00',
							suggestedMax: '23:45',
						},
						type: 'time',
						time: {
							format: 'h:mm',
							//tooltipFormat: 'll',
							displayFormats: {
								'millisecond': 'hh:mm',
								'second': 'hh:mm',
								'minute': 'hh:mm',
								'hour': 'hh:mm',
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
							suggestedMax: 3000,
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
		report: 'setupChartData',
	},
	methods: {
		async setupChartData(){
			//extract proper needed data for chart
			let trackedData = [];
			if (this.report && JSON.parse(this.report.json_metadata)){
				let activityDataJsn = JSON.parse(this.report.json_metadata);
				if (Array.isArray(activityDataJsn.detailedActivity)&& activityDataJsn.detailedActivity.length>0){
					let activityData = activityDataJsn.detailedActivity[0].split('|');
					let activityDate = new Date(activityDataJsn.activityDate[0].substr(0,4),activityDataJsn.activityDate[0].substr(4,2)-1, activityDataJsn.activityDate[0].substr(6,2));
					for (let i=0;i<activityData.length;i++){
						/*if (this.report[i].date){
							if (this.report[i].json_metadata.step_count){*/
								trackedData.push({
									x: activityDate.setHours(activityData[i].substr(0,2),activityData[i].substr(2,2)),
									y: parseInt(activityData[i].substr(4))
								})
							/*}
						}*/
					}
				}
			
			}
			
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