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
					var option = that.charts['memory'].getOption();
					var value = (Math.random(100) * 100).toFixed(2);
					option.series[1].data[0].value = value;
					option.series[2].data[0] = 100 - value;
					option.series[3].data[0] = value;
					option.series[4].data[0] = 100 - value;
					that.charts['memory'].setOption(option);
	
					//刷新历史数据
					var option = that.charts['record'].getOption();
	
					var times = [];
					var curdatas = [];
					var startData = new Date();
					startData.setMinutes(startData.getMinutes() - 30);
					for (var i = startData; i.getTime() < new Date().getTime(); i.setMinutes(i.getMinutes() +
							1)) {
						times.push(i.format('hh:mm'));
						curdatas.push((Math.random(100) * 100).toFixed(2));
					}
					option.series[0].data = curdatas;
					that.charts['record'].setOption(option);
	
					//刷新告警数据
					var option = that.charts['alert'].getOption();
					var curdatas = [
						(Math.random(100) * 100).toFixed(0),
						(Math.random(100) * 100).toFixed(0),
						(Math.random(100) * 100).toFixed(0),
						(Math.random(100) * 100).toFixed(0)
					];
					option.series[0].data = curdatas;
					
					that.charts['alert'].setOption(option);
	
				}, refreshtime);
			},
			/**
			 * 加载数据
			 */
			loadData: function() {
				var that = this;
				//加载内存数据
				api.loadMemoryData({}, function(res) {
					that.initMemoryChart(res);
					that.initMemoryRecordChart(res);
				});
				//加载告警数据
				api.loadAlertData({}, function(res) {
					that.initMemoryAlertChart(res);
				});
			},
			/**
			 * 初始化cpu告警图表
			 * @param {Object} res
			 */
			initMemoryAlertChart: function(res) {
				var myChart = this.$echarts.init(document.getElementById('alertchart'));
				var colorArray = [
					'#1ace4a', //绿
					'#4bf3ff', //蓝
					'#b250ff', //粉
					'#ffa800' //黄
				];
				var values = [];
				var leavels = [];
				res.data.leavel.forEach(function(item,index){
					leavels.push(item.label);
					var count = 0;
					for(var i= 0;i<res.data.values.length;i++){
						if(res.data.values[i].from == 'memory' && res.data.values[i].type == item.value){
							count += res.data.values[i].value
						}
					}
					values.push(count);
				});
				var option = utils.createChartBaseOption('内存告警数据', '50px',null,null,null,leavels);
				option.xAxis.boundaryGap = true;
				option.tooltip= {
					show: true,
					formatter: "{b}:{c}"
				};
				option.series= [{
					name: '告警数量',
					type: 'bar',
					label: {
						normal: {
							show: true,
							position: 'top',
							formatter: '{c}',
							textStyle: {
								color: 'white' //color of value
							}
						}
					},
					itemStyle: {
						normal: {
							show: true,
							color: function(params) {
								let num = colorArray.length;
								return colorArray[params.dataIndex % num]
							},
							barBorderRadius: 20,
							borderWidth: 0,
							borderColor: '#333',
						}
					},
					barWidth:'10%',
					barGap: '0%',
					barCategoryGap: '50%',
					data: values
				}];
				// 使用刚指定的配置项和数据显示图表。
				myChart.setOption(option);
				this.charts['alert'] = myChart;
			},
			/**
			 * 初始化cpu图表
			 * @param {Object} res
			 */
			initMemoryRecordChart: function(res) {
				var myChart = this.$echarts.init(document.getElementById('recordchart'));
	
				var times = res.data.records.times;
				var option = utils.createChartBaseOption('内存使用情况', '50px',null,null,null,times);
				option.series= {
					name: '内存使用量',
					symbolSize: 5,
					type: "line",
					smooth: true,
					stack:'数量',
					data: res.data.records.values,
					itemStyle: {
						normal: {
							borderWidth: 1,
							color: '#f56c6c',
							shadowColor: 'rgba(93,241,255 ,0.7)',
							shadowBlur: 10,
							//shadowOffsetY: 0
						}
					},
					label: {
						show: true,
						position: 'top',
						textStyle: {
							color: '#fff',
						}
					}
				};
				// 使用刚指定的配置项和数据显示图表。
				myChart.setOption(option);
				this.charts['record'] = myChart;
			},
			/**
			 * 初始化cpu图表
			 * @param {Object} res
			 */
			initMemoryChart: function(res) {
				var myChart = this.$echarts.init(document.getElementById('memorychart'));
	
				var value = res.data.curdata; //百分比
				var lineheight = 150;
				var option = {
					tooltip: {
						trigger: 'none'
					},
					grid:utils.createChartGaid('60px','60px',null,null),
					title: utils.createChartTitle('当前内存使用情况'),
					yAxis: {
						data: ["内存使用"],
						axisTick: {
							show: false
						},
						axisLine: {
							show: false
						},
						axisLabel: {
							show: false
						}
					},
					xAxis: {
						splitLine: {
							show: false
						},
						axisTick: {
							show: false
						},
						axisLine: {
							show: false
						},
						axisLabel: {
							show: false
						}
					},
					series: [{
						name: '最上层立体圆',
						type: 'pictorialBar',
						symbolSize: [45, lineheight],
						symbolOffset: [20, 0],
						z: 12,
						itemStyle: {
							normal: {
								color: '#293CA0'
							}
						},
						data: [{
							value: 100,
							symbolPosition: 'end'
						}]
					}, {
						name: '中间立体圆',
						type: 'pictorialBar',
						symbolSize: [45, lineheight],
						symbolOffset: [20, 0],
						z: 12,
						itemStyle: {
							normal: {
								color: '#B687F9'
							}
						},
						data: [{
							value: value,
							symbolPosition: 'end'
						}]
					}, {
						name: '最底部立体圆',
						type: 'pictorialBar',
						symbolSize: [45, lineheight],
						symbolOffset: [-20, 0],
						z: 12,
						itemStyle: {
							normal: {
								color: '#A052FE'
							}
						},
						data: [100 - value]
					}, {
						//底部立体柱
						stack: '1',
						type: 'bar',
						itemStyle: {
							normal: {
								color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
									offset: 0,
									color: '#CE7EFE'
								}, {
									offset: 1,
									color: '#7125FF'
								}])
							}
						},
						label: {
							show: true,
							position: "top",
							distance: 15,
							color: "#f56c6c",
							fontSize: 50,
							formatter: '{c}' + '%'
						},
						silent: true,
						barWidth: lineheight,
						barGap: '-100%', // Make series be overlap
						data: [value]
					}, {
						//上部立体柱
						stack: '1',
						type: 'bar',
						itemStyle: {
							normal: {
								color: '#14257B',
								opacity: .7
							}
						},
						silent: true,
						barWidth: lineheight,
						barGap: '-100%', // Make series be overlap
						data: [100 - value]
					}]
				};
	
				// 使用刚指定的配置项和数据显示图表。
				myChart.setOption(option);
				this.charts['memory'] = myChart;
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
		<el-col>
			<div class="grid-content bg-purple chart_panel" id="memorychart">
			</div>
		</el-col>
	</el-row>
	<el-row :gutter="10">
		<el-col :span="12">
			<div class="grid-content bg-purple chart_panel" id="recordchart">
			</div>
		</el-col>
		<el-col :span="12">
			<div class="grid-content bg-purple chart_panel" id="alertchart">
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
