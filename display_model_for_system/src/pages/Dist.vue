<template>
	<div class="title">
		<!-- 贝贝智能平台运行监控 -->
		<img src="../assets/title_bg.png">
	</div>
	<el-row :gutter="10">
		<el-col>
			<div class="grid-content bg-purple chart_panel" id="distchart">网络使用量
			</div>
		</el-col>
	</el-row>
</template>

<script>
	import $ from 'jquery'
	import utils from '../public/utils.js'
	import api from '../public/api.js'
	import config from '../public/config.js'

	import * as echarts from 'echarts'

	export default {
		data() {
			return {
				chartheight: 100,
				titleheight: 60,
				timer: null,
				charts: []
			}
		},
		mounted: function() {
			this.chartheight = ($(window).height() - this.titleheight);
			this.loadData();

			//开始定时刷新报表数据
			this.startRefreshChart();

			var that = this;
			$(window).resize(function() {
				this.chartheight = ($(window).height() - this.titleheight);
				for (var key in that.charts) {
					that.charts[key].resize();
				}
			});
		},
		unmounted: function() {
			if (this.timer) {
				clearInterval(this.timer);
			}
		},
		methods: {
			/**
			 * 定时刷新报表数据
			 */
			startRefreshChart: function() {
				if (this.timer) {
					clearInterval(this.timer);
				}
				var that = this;

				//获取刷新周期，TODO 配置变动时，此处需自动更新
				var refreshtime = 60 * 1000;
				config.getConfig().forEach(function(item, index) {
					if (item.key == 'refreshtime') {
						refreshtime = item.value;
					}
				});

				this.timer = setInterval(function() {
					//刷新cpu数据
					var option = that.charts['dist'].getOption();
					
					for (var i = 0; i < 5; i++) {
						var value = (Math.random(100) * 100);
						option.series[0].data[i].value = 100;
						option.series[1].data[i].value = value.toFixed(2);
						option.series[2].data[i].value =  100;
						option.series[3].data[i].value =  value.toFixed(2);
						option.series[4].data[i].value =  (100 - value).toFixed(2);
					}
					
					that.charts['dist'].setOption(option);

				}, refreshtime);
			},
			/**
			 * 加载数据
			 */
			loadData: function() {
				var that = this;
				//加载内存数据
				api.loadDistData({}, function(res) {
					that.initDistChart(res);
				});
			},
			/**
			 * 初始化cpu图表
			 * @param {Object} res
			 */
			initDistChart: function(res) {
				var myChart = this.$echarts.init(document.getElementById('distchart'));

				var categorys = [];
				var data1 = [];
				var data2 = [];
				var data3 = [];
				var data4 = [];
				var data5 = [];
				res.data.forEach(function(item, index) {
					categorys.push(item.name);
					var value = 0;
					for (var i = 0; i < res.data.length; i++) {
						if (res.data[i].name == item.name) {
							value = res.data[i].value
						}
					}
					data1.push({
						name: "",
						value: 100,
						symbolPosition: "end"
					});
					data2.push({
						value: value
					});
					data3.push({
						name: "",
						value: "100"
					});
					data4.push({
						name: "",
						value: value,
						symbolPosition: "end"
					});
					data5.push({
						name: "a",
						value: 100 - value
					});
				});
				var barwidth = '50%';
				var size = '65%';
				
				var option = utils.createChartBaseOption('磁盘使用情况', '70px',null,'80px',null,categorys);
				option.xAxis.axisLine = false
				option.xAxis.axisLabel = false
				option.xAxis.boundaryGap = true;
				option.yAxis.splitLine = false;
				option.yAxis.axisLabel = false;
				option.series = [{ // 头
						name: "",
						type: "pictorialBar",
						symbolSize: [size, 45],
						symbolOffset: [0, -20],
						z: 12,
						itemStyle: {
							normal: {
								color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
									[{
											offset: 0,
											color: "rgba(54,127,223,1)"
										},
										{
											offset: 1,
											color: "rgba(94,162,254,1)"
										}
									],
									false
								),
							}
						},
						data: data1
					},
					//底部立体柱
					{
						name: "vvvv",
						stack: '1',
						type: 'bar',
						silent: true,
						barWidth: barwidth,
						barGap: '-100%', // Make series be overlap
						data: data2,
						itemStyle: {
							normal: {
								color: {
									x: 0,
									y: 0,
									x2: 0,
									y2: 1,
									type: "linear",
									global: false,
									colorStops: [{ //第一节下面
										offset: 0,
										color: "rgba(0,255,245,0.5)"
									}, {
										offset: 1,
										color: "#43bafe"
									}]
								}
							}
						}
					},
					//三个最低下的圆片
					{
						name: "",
						type: "pictorialBar",
						symbolSize: [size, 30],
						symbolOffset: [0, 16],
						z: 12,
						itemStyle: {
							normal: {
								color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
										offset: 0,
										color: "rgba(89,211,255,1)"
									},
									{
										offset: 1,
										color: "rgba(23,237,194,1)"
									}
								])
							}
						},
						data: data3
					},
					// 中间圆片
					{
						name: "",
						type: "pictorialBar",
						symbolSize: [size, 42],
						symbolOffset: [0, -20],
						itemStyle: {
							normal: {
								color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
									[{
											offset: 0,
											color: "rgba(89,211,255,1)"
										},
										{
											offset: 1,
											color: "rgba(23,237,194,1)"
										}
									],
									false
								),
							}
						},
						z: 12,
						data: data4
					},
					//上部立体柱
					{
						//上部立体柱
						stack: '1',
						type: 'bar',
						itemStyle: {
							normal: {
								color: '#3E8BE6',
								opacity: .7
							}
						},
						label: {
							show: true,
							position: 'inside',
							distance: 20,
							color: "#FFFE00",
							fontSize: 30,
							formatter: function(item) {
								var a = 100
								return (a - item.value).toFixed(2) + '%'
							}
						},
						silent: true,
						barWidth: barwidth,
						barGap: '-100%', // Make series be overlap
						data: data5
					}
				];

				// 使用刚指定的配置项和数据显示图表。
				myChart.setOption(option);
				this.charts['dist'] = myChart;
			}
		}
	}
</script>

<style scoped="scoped">
	.title {
		height: v-bind(titleheight+"px");
		line-height: v-bind(titleheight+"px");
	}

	.chart_panel {
		height: v-bind(chartheight+"px");
	}
</style>
