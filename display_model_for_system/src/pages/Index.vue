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
			this.chartheight = ($(window).height() - this.titleheight) / 2;
			this.loadData();

			//开始定时刷新报表数据
			this.startRefreshChart();

			var that = this;
			$(window).resize(function() {
				this.chartheight = ($(window).height() - this.titleheight) / 2;
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
					var cpudata = (Math.random() * 100).toFixed(2);
					var option = that.charts['cpu'].getOption();
					option.series[0].data[0].value = cpudata;
					that.charts['cpu'].setOption(option);

					//刷新内存数据
					var memorydata = (Math.random() * 100).toFixed(2);
					var option = that.charts['memory'].getOption();
					option.series[0].data[0].value = memorydata;
					option.series[0].data[1].value = 100 - memorydata;
					option.title[1].text = memorydata + '%';
					that.charts['memory'].setOption(option);

					//更新数据库使用情况
					var option = that.charts['database'].getOption();
					var databasedata = [(Math.random() * 1000).toFixed(0), (Math.random() * 1000).toFixed(0), (
						Math.random() * 1000).toFixed(0), (Math.random() * 1000).toFixed(0), (Math
						.random() * 1000).toFixed(0)];
					option.series[0].data[0] = databasedata;
					that.charts['database'].setOption(option);

					//更新网络使用情况
					var option = that.charts['net'].getOption();
					var times = [];
					var indata = [];
					var outdata = [];
					var startData = new Date();
					startData.setMinutes(startData.getMinutes() - 30);
					for (var i = startData; i.getTime() < new Date().getTime(); i.setMinutes(i.getMinutes() +
							1)) {
						times.push(i.format('hh:mm'));
						indata.push((Math.random(100) * 100).toFixed(2));
						outdata.push((Math.random(100) * 100).toFixed(2));
					}
					option.xAxis[0].data = times;
					option.series[0].data = indata;
					option.series[1].data = outdata;
					that.charts['net'].setOption(option);

					//更新访问情况
					var option = that.charts['view'].getOption();
					var startData = new Date();
					var times = [];
					var values = [];
					startData.setMinutes(startData.getMinutes() - 30);
					for (var i = startData; i.getTime() < new Date().getTime(); i.setMinutes(i.getMinutes() +
							1)) {
						times.push(i.format('hh:mm'));
						values.push((Math.random(1000) * 1000).toFixed(0));
					}
					option.xAxis[0].data = times;
					option.series[0].data = values;
					that.charts['view'].setOption(option);

					//更新访问情况
					var option = that.charts['dist'].getOption();
					var yData = [];
					yData.push((Math.random(100) * 100).toFixed(2));
					yData.push((Math.random(100) * 100).toFixed(2));
					yData.push((Math.random(100) * 100).toFixed(2));
					yData.push((Math.random(100) * 100).toFixed(2));
					yData.push((Math.random(100) * 100).toFixed(2));

					option.series[0].data = yData;
					that.charts['dist'].setOption(option);

				}, refreshtime);
			},
			/**
			 * 加载数据
			 */
			loadData: function() {
				var that = this;
				//加载cpu数据
				api.loadCpuData({}, function(res) {
					that.initCpuChart(res);
				});
				//加载内存数据
				api.loadMemoryData({}, function(res) {
					that.initMemoryChart(res);
				});
				//加载网络数据
				api.loadNetData({}, function(res) {
					that.initNetChart(res);
				});
				//加载浏览量数据
				api.loadViewData({}, function(res) {
					that.initViewChart(res);
				});
				//加载磁盤数据
				api.loadDistData({}, function(res) {
					that.initDistChart(res);
				});
				//加载数据库数据
				api.loadDatabaseData({}, function(res) {
					that.initDatabaseChart(res);
				});
			},
			/**
			 * 初始化数据库图表
			 * @param {Object} res
			 */
			initDatabaseChart: function(res) {
				var myChart = this.$echarts.init(document.getElementById('databasehart'));

				var max = res.data.max;

				var types = [];
				res.data.types.forEach(function(item, index) {
					types.push({
						max: max,
						name: item.name
					});
				});

				var data = [];
				res.data.curdata.forEach(function(item, index) {
					data.push(item.value);
				});
				
				var option = {
					"color": ["rgba(245, 166, 35, 1)", "rgba(19, 173, 255, 1)"],
					title: utils.createChartTitle('数据库使用情况'),
					"tooltip": {
						"show": true,
						"trigger": "item"
					},
					"radar": {
						"center": ["50%", "50%"],
						"radius": "60%",
						"startAngle": 90,
						"splitNumber": 4,
						"shape": "circle",
						"splitArea": {
							"areaStyle": {
								"color": ["transparent"]
							}
						},
						"axisLine": {
							"show": true,
							"lineStyle": {
								color: '#f56c6c',
								type: 'dashed'
							}
						},
						"splitLine": {
							"show": true,
							"lineStyle": {
								color: '#355C84',
								type: 'dashed'
							}
						},
						"indicator": types
					},
					"series": [{
						"name": "使用量",
						"type": "radar",
						"symbol": "circle",
						"symbolSize": 5,
						"areaStyle": {
							"normal": {
								"color": "rgba(245, 166, 35, 0.4)"
							}
						},
						itemStyle: {
							color: 'rgba(245, 166, 35, 1)',
							borderColor: 'rgba(245, 166, 35, 0.3)',
							borderWidth: 1,
						},
						"lineStyle": {
							"normal": {
								"type": "dashed",
								"color": "rgba(245, 166, 35, 1)",
								"width": 1
							}
						},
						"data": data
					}]
				};
				// 使用刚指定的配置项和数据显示图表。
				myChart.setOption(option);
				this.charts['database'] = myChart;
			},
			/**
			 * 初始化磁盘图表
			 * @param {Object} res
			 */
			initDistChart: function(res) {
				var myChart = this.$echarts.init(document.getElementById('distchart'));
				let xData = [],
					yData = [],
					all = [];
				res.data.forEach(function(item, index) {
					xData.push(item.name);
					yData.push(item.value);
					all.push({
						"name": item.all + "G",
						"value": 100
					});
				});

				var option = utils.createChartBaseOption('磁盘使用量统计', null, null, '80px', null,xData);

				option.series =  [{
					name: '使用量',
					type: 'bar',
					barWidth: '16%',
					itemStyle: {
						normal: {
							barBorderRadius: 30,
							color: new echarts.graphic.LinearGradient(
								0, 0, 0, 1, [{
										offset: 0,
										color: 'rgba(245,108,108, 0.8)'
									},
									{
										offset: 1,
										color: 'rgba(245,108,108, 0.1)'
									}
								]
							)
						}
					},
					label: {
						show: true,
						position: 'top',
						distance: 15,
						formatter: '{c}%',
						color: '#fff'
					},
					data: yData,
					zlevel: 11
				}, {
					name: '总量',
					type: 'bar',
					barWidth: '16%',
					barGap: '-100%',
					data: all,
					label: {
						show: true,
						position: 'top',
						distance: 15,
						formatter: '{b}',
						color: '#fff'
					},
					itemStyle: {
						normal: {
							barBorderRadius: 30,
							color: 'rgba(255,255,255,0.2)'
						}
					},
					zlevel: 9
				}];
				// 使用刚指定的配置项和数据显示图表。
				myChart.setOption(option);
				this.charts['dist'] = myChart;
			},
			/**
			 * 初始化浏览量图表
			 * @param {Object} res
			 */
			initViewChart: function(res) {
				var myChart = this.$echarts.init(document.getElementById('viewchart'));

				var times = res.data.times;
				var values = res.data.values;

				var option = utils.createChartBaseOption('系统访问统计', '60px', null, null, null,times);
				option.series = {
					name: '访问量',
					type: 'line',
					color: '#0092f6',
					smooth: true,
					itemStyle: {
						normal: {
							color: '#f56c6c',
							lineStyle: {
								color: '#f56c6c',
								width: 1,
							},
							areaStyle: {
								color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
									offset: 0,
									color: 'rgba(245,108,108, 0.5)'
								}, {
									offset: 1,
									color: 'rgba(245,108,108, 0.1)'
								}], false)
							}
						}
					},
					label: {
						show: true,
						position: 'top',
						textStyle: {
							color: '#fff',
						}
					},
					symbol: 'circle',
					symbolSize: 5,
					data: values
				};
				// 使用刚指定的配置项和数据显示图表。
				myChart.setOption(option);
				this.charts['view'] = myChart;
			},
			/**
			 * 初始化网络图表
			 * @param {Object} res
			 */
			initNetChart: function(res) {
				var myChart = this.$echarts.init(document.getElementById('netchart'));

				var times = res.data.times;
				var indata = res.data.ins;
				var outdata = res.data.outs;

				var option = utils.createChartBaseOption('网络使用情况', null, null, null, '70px',times);
				option.legend = {
					show: true,
					x: 'center',
					bottom: '20px',
					textStyle: {
						color: '#fff'
					},
					data: ['下行', '上行']
				};
				option.series = [{
					name: '上行',
					type: 'line',
					stack: '总量',
					symbolSize: 3,
					itemStyle: {
						color: '#55eff185',
						borderColor: '#55eff185',
						borderWidth: 1
					},
					label: {
						show: true,
						position: 'top',
						textStyle: {
							color: '#fff',
						}
					},
					data: indata
				}, {
					name: '下行',
					type: 'line',
					stack: '总量',
					symbolSize: 3,
					itemStyle: {
						color: 'rgba(245,108,108, 0.5)',
						borderColor: 'rgba(245,108,108, 0.5)',
						borderWidth: 1
					},
					label: {
						show: true,
						position: 'top',
						textStyle: {
							color: '#fff',
						}
					},
					data: outdata
				}];

				// 使用刚指定的配置项和数据显示图表。
				myChart.setOption(option);
				this.charts['net'] = myChart;
			},
			/**
			 * 初始化内存图表
			 * @param {Object} res
			 */
			initMemoryChart: function(res) {
				var myChart = this.$echarts.init(document.getElementById('memorychart'));

				var value = res.data.curdata;
				var dataStyle = {
					normal: {
						label: {
							show: false
						},
						labelLine: {
							show: false
						},
						shadowBlur: 40,
						shadowColor: 'rgba(40, 40, 40, 0.5)',
					}
				};
				var placeHolderStyle = {
					normal: {
						color: 'rgba(0,0,0,0)',
						label: {
							show: false
						},
						labelLine: {
							show: false
						}
					},
					emphasis: {
						color: 'rgba(0,0,s0,0)'
					}
				};
				var option = {
					title: [utils.createChartTitle('当前内存使用情况'), {
						text: value + '%',
						x: 'center',
						y: 'center',
						textStyle: {
							color: "#f56c6c",
							fontSize: 50
						}
					}],
					color: ['#FF358F', '#313443', '#313443'],
					tooltip: {
						show: true,
						formatter: "{a} <br/>{b} : {c} ({d}%)"
					},
					series: [{
						name: 'Line 1',
						type: 'pie',
						clockWise: false,
						radius: [145, 155],
						itemStyle: dataStyle,
						data: [{
							value: value,
							name: '01'
						}, {
							value: 100 - value,
							name: 'invisible',
							itemStyle: placeHolderStyle
						}]
					}, {
						name: 'Line 2',
						type: 'pie',
						animation: false,
						clockWise: false,
						radius: [125, 145],
						itemStyle: dataStyle,
						tooltip: {
							show: false
						},
						data: [{
							value: 100,
							name: '02',
							itemStyle: {
								emphasis: {
									color: '#313443'
								}
							}
						}, {
							value: 0,
							name: 'invisible',
							itemStyle: placeHolderStyle
						}]
					}]
				};

				// 使用刚指定的配置项和数据显示图表。
				myChart.setOption(option);
				this.charts['memory'] = myChart;
			},
			/**
			 * 初始化cpu图表
			 * @param {Object} res
			 */
			initCpuChart: function(res) {
				var myChart = this.$echarts.init(document.getElementById('cpuchart'));
				// 指定图表的配置项和数据
				var value = res.data.curdata; //此处使用定时器刷新数据，实际情况使用接口加载数据
				var option = {
					title: utils.createChartTitle('当前CPU使用情况'),
					tooltip: {
						formatter: '{a} <br/>{b} : {c}%'
					},
					series: [{
						type: 'gauge',
						radius: '70%',
						startAngle: '220',
						endAngle: '-65',
						pointer: {
							show: true,
							itemStyle: {
								color: '#f56c6c'
							}
						},
						detail: {
							formatter: function(value) {
								var num = Math.round(value);
								return '{bule|' + value + '}{white|%}';
							},
							rich: {
								white: {
									fontSize: 50,
									fontWeight: 600,
									color: '#f56c6c'
								},
								bule: {
									fontSize: 50,
									fontWeight: 600,
									color: '#f56c6c'
								},
								radius: {
									width: 350,
									height: 80,
									borderWidth: 1,
									borderColor: '#0092F2',
									fontSize: 50,
									color: '#fff',
									backgroundColor: '#1B215B',
									borderRadius: 20,
									textAlign: 'center'
								},
								size: {
									height: 400,
									padding: [100, 0, 0, 0],
								}
							},
							offsetCenter: ['0%', '40%']
						},
						data: [{
							value: value,
							name: 'CPU使用情况',
						}],
						markPoint: {
							data: [{
								x: "50%",
								y: "50%",
								symbol: 'circle',
								symbolSize: 24,
								itemStyle: {
									color: '#f56c6c'
								},
							}, {
								x: "50%",
								y: "50%",
								symbol: 'circle',
								symbolSize: 18,
								itemStyle: {
									color: "#fff"
								},
							}]
						},
						title: {
							show: true,
							color: '#fff',
							offsetCenter: ['0', '85%'],
							fontSize: 16
						},
						axisLine: {
							show: true,
							lineStyle: {
								color: [
									[0.91, new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
											offset: 0,
											// color: 'rgba(248,152,152,0.3)', // 0% 处的颜色
											color: '#19fdab', // 0% 处的颜色
										},
										{
											offset: 0.5,
											color: "#d0ff19",
										},
										{
											offset: 1,
											// color: 'rgba(245,108,108,0.9)', // 100% 处的颜色
											color: '#ff4026', // 100% 处的颜色
										},
									])]
								],
								width: 20,
								shadowOffsetX: 0,
								shadowOffsetY: 0,
								opacity: 1
							}
						},
						axisTick: {
							show: true
						},
						splitLine: {
							show: false,
						},
						axisLabel: {
							show: false
						}
					}]
				};

				// 使用刚指定的配置项和数据显示图表。
				myChart.setOption(option);
				this.charts['cpu'] = myChart;
			}
		}
	}
</script>
<template>
	<div class="title">
		<!-- 贝贝智能平台运行监控 -->
		<img src="../assets/title_bg.png">
	</div>
	<el-row :gutter="10">
		<el-col :span="8">
			<div class="grid-content bg-purple chart_panel" id="cpuchart">cpu使用量
			</div>
		</el-col>
		<el-col :span="8">
			<div class="grid-content bg-purple chart_panel" id="memorychart">内存使用量
			</div>
		</el-col>
		<el-col :span="8">
			<div class="grid-content bg-purple chart_panel" id="databasehart">数据库链接状况
			</div>
		</el-col>
	</el-row>
	<el-row :gutter="10">
		<el-col :span="8">
			<div class="grid-content bg-purple chart_panel" id="netchart">网络使用情况
			</div>
		</el-col>
		<el-col :span="8">
			<div class="grid-content bg-purple chart_panel" id="viewchart">当前访问量
			</div>
		</el-col>
		<el-col :span="8">
			<div class="grid-content bg-purple chart_panel" id="distchart">磁盘使用量
			</div>
		</el-col>
	</el-row>
</template>

<style scoped="scoped">
	.title {
		height: v-bind(titleheight+"px");
		line-height: v-bind(titleheight+"px");
	}

	.chart_panel {
		height: v-bind(chartheight+"px");
	}
</style>
