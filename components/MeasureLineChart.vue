<script>
import { Scatter } from 'vue-chartjs'
import moment from 'moment'
 
export default {
  extends: Scatter,
  props: ['data', 'options'],
  watch: {
		data: 'updateChart',
  },
  methods: {
	updateChart () {
		this.renderChart(this.data, this.options)
	}
  },
  mounted () {
    this.renderChart(this.data, this.options)
  }
}
</script>