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
					var option = that.charts['netin'].getOption();
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
					that.charts['netin'].setOption(option);
					
					var option = that.charts['netout'].getOption();
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
					that.charts['netout'].setOption(option);
					

					//刷新告警数据
					var option = that.charts['alertin'].getOption();
					var curdatas = [
						(Math.random(100) * 100).toFixed(0),
						(Math.random(100) * 100).toFixed(0),
						(Math.random(100) * 100).toFixed(0),
						(Math.random(100) * 100).toFixed(0)
					];
					option.series[0].data = curdatas;
					that.charts['alertin'].setOption(option);
					
					var option = that.charts['alertout'].getOption();
					var curdatas = [
						(Math.random(100) * 100).toFixed(0),
						(Math.random(100) * 100).toFixed(0),
						(Math.random(100) * 100).toFixed(0),
						(Math.random(100) * 100).toFixed(0)
					];
					option.series[0].data = curdatas;
					that.charts['alertout'].setOption(option);

				}, refreshtime);
			},
			/**
			 * 加载数据
			 */
			loadData: function() {
				var that = this;
				//加载网络数据
				api.loadNetData({}, function(res) {
					that.initNetInChart(res);
					that.initNetOutChart(res);
				});
				//加载告警数据
				api.loadAlertData({}, function(res) {
					that.initNetInAlertChart(res);
					that.initNetOutAlertChart(res);
				});
			},
			/**
			 * 初始化网络告警图表
			 * @param {Object} res
			 */
			initNetOutAlertChart: function(res) {
				var myChart = this.$echarts.init(document.getElementById('alertinchart'));
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
						if(res.data.values[i].from == 'netout' && res.data.values[i].type == item.value){
							count += res.data.values[i].value
						}
					}
					values.push(count);
				});
				var option = utils.createChartBaseOption('网络下行告警数据', '50px',null,null,null,leavels);
				option.xAxis.boundaryGap = true;
				option.tooltip= {
					show: true,
					formatter: "{b}:{c}"
				},
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
				this.charts['alertin'] = myChart;
			},
			/**
			 * 初始化网络告警图表
			 * @param {Object} res
			 */
			initNetInAlertChart: function(res) {
				var myChart = this.$echarts.init(document.getElementById('alertoutchart'));
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
						if(res.data.values[i].from == 'netin' && res.data.values[i].type == item.value){
							count += res.data.values[i].value
						}
					}
					values.push(count);
				});
				var option = utils.createChartBaseOption('网络上行告警数据', '50px',null,null,null,leavels);
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
				this.charts['alertout'] = myChart;
			},
			/**
			 * 初始化网络图表
			 * @param {Object} res
			 */
			initNetOutChart: function(res) {
				var myChart = this.$echarts.init(document.getElementById('netoutchart'));
				var xData = res.data.times;
				var values = res.data.outs;
				var option = utils.createChartBaseOption('网络下行情况', '50px',null,null,null,xData);
				option.tooltip= {
					trigger: "axis",
					axisPointer: {
						type: "shadow",
						textStyle: {
							color: "#fff",
						}
					}
				},
				option.calculable= true,
				option.series= [{
					name: "下行",
					type: "line",
					symbolSize: 5,
					symbol: 'circle',
					itemStyle: {
						color: "#c257F6",
					},
					markPoint: {
						label: {
							normal: {
								textStyle: {
									color: '#fff'
								}
							}
						},
						data: [{
							type: 'max',
							name: '最大值',

						}, {
							type: 'min',
							name: '最小值'
						}]
					},
					data: values
				} ];
				// 使用刚指定的配置项和数据显示图表。
				myChart.setOption(option);
				this.charts['netout'] = myChart;
			},
			/**
			 * 初始化网络图表
			 * @param {Object} res
			 */
			initNetInChart: function(res) {
				var myChart = this.$echarts.init(document.getElementById('netinchart'));
				var xData = res.data.times;
				var values = res.data.ins;
				var option = utils.createChartBaseOption('网络上行情况', '50px',null,null,null,xData);
				option.tooltip= {
					trigger: "axis",
					axisPointer: {
						type: "shadow",
						textStyle: {
							color: "#fff",
						}
					}
				};
				option.calculable= true;
				option.series= [{
					name: "上行",
					type: "line",
					symbolSize: 5,
					symbol: 'circle',
					itemStyle: {
						color: "#6f7de3",
					},
					markPoint: {
						label: {
							normal: {
								textStyle: {
									color: '#fff'
								}
							}
						},
						data: [{
							type: 'max',
							name: '最大值',

						}, {
							type: 'min',
							name: '最小值'
						}]
					},
					data: values
				} ];
				// 使用刚指定的配置项和数据显示图表。
				myChart.setOption(option);
				this.charts['netin'] = myChart;
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
		<el-col :span="12">
			<div class="grid-content bg-purple chart_panel" id="netinchart">网络使用量
			</div>
		</el-col>
		<el-col :span="12">
			<div class="grid-content bg-purple chart_panel" id="netoutchart">网络使用量
			</div>
		</el-col>
	</el-row>
	<el-row :gutter="10">
		<el-col :span="12">
			<div class="grid-content bg-purple chart_panel" id="alertinchart">告警信息
			</div>
		</el-col>
		<el-col :span="12">
			<div class="grid-content bg-purple chart_panel" id="alertoutchart">告警信息
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
