<script>
import { Scatter } from 'vue-chartjs'
import moment from 'moment'
import chartPluginAnnotation from 'chartjs-plugin-annotation';

let namedChartAnnotation = chartPluginAnnotation;
namedChartAnnotation["id"]="annotation";

export default {
  extends: Scatter,
  props: ['data', 'options'],
  watch: {
		data: 'updateChart',
  },
  methods: {
	updateChart () {
		this.addPlugin(namedChartAnnotation),
		this.renderChart(this.data, this.options)
	}
  },
  mounted () {
		this.addPlugin(namedChartAnnotation),
		this.renderChart(this.data, this.options)
  }
}
</script>