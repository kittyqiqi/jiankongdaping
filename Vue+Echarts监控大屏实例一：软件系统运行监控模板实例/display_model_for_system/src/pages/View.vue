<template>
	<div class="title">
		<!-- 贝贝智能平台运行监控 -->
		<img src="../assets/title_bg.png">
	</div>
	<el-row :gutter="10">
		<el-col :span="12">
			<div class="grid-content bg-purple chart_panel" id="clientchart">终端分布
			</div>
		</el-col>
		<el-col :span="12">
			<div class="grid-content bg-purple chart_panel" id="urlchart">接口分布
			</div>
		</el-col>
	</el-row>
	<el-row :gutter="10">
		<el-col >
			<div class="grid-content bg-purple chart_panel" id="recordchart">请求量
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
					//更新访问情况
					var option = that.charts['record'].getOption();
					var startData = new Date();
					var times = [];var values = [];
					startData.setMinutes(startData.getMinutes() - 30);
					for (var i = startData; i.getTime() < new Date().getTime(); i.setMinutes(i.getMinutes() + 1)) {
						times.push(i.format('hh:mm'));
						values.push((Math.random(1000) * 1000).toFixed(0));
					}
					option.xAxis[0].data =times;
					option.series[0].data =values;
					that.charts['record'].setOption(option);
					
					//更新客户端情况
					var option = that.charts['client'].getOption();
					var curdatas = [
						(Math.random(100) * 100).toFixed(0),
						(Math.random(100) * 100).toFixed(0),
						(Math.random(100) * 100).toFixed(0),
						(Math.random(100) * 100).toFixed(0)
					];
					option.series[0].data = curdatas;
					
					that.charts['client'].setOption(option);
					
					//更新接口情况
					var option = that.charts['url'].getOption();
					var curdatas = [
						(Math.random(100) * 100).toFixed(0),
						(Math.random(100) * 100).toFixed(0),
						(Math.random(100) * 100).toFixed(0),
						(Math.random(100) * 100).toFixed(0),
						(Math.random(100) * 100).toFixed(0)
					];
					option.series[0].data = curdatas;
					
					that.charts['url'].setOption(option);
	
				}, refreshtime);
			},
			/**
			 * 加载数据
			 */
			loadData: function() {
				var that = this;
				//加载内存数据
				api.loadViewData({}, function(res) {
					that.initViewRecordChart(res);
					that.initViewClientChart(res);
					that.initViewUrlChart(res);
				});
			},
			/**
			 * 初始化cpu告警图表
			 * @param {Object} res
			 */
			initViewRecordChart: function(res) {
				var myChart = this.$echarts.init(document.getElementById('recordchart'));
				
				var times = res.data.times;
				var values = res.data.values;
				
				var option = utils.createChartBaseOption('系统访问统计', '50px',null,null,null,times);
				option.tooltip= {
					trigger: 'axis'
				},
				option.series= {
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
				this.charts['record'] = myChart;
			},
			/**
			 * 初始化cpu图表
			 * @param {Object} res
			 */
			initViewClientChart: function(res) {
				var myChart = this.$echarts.init(document.getElementById('clientchart'));
				
				var colorArray = [
					new echarts.graphic.LinearGradient(0, 0, 0, 1, [
					    { offset: 0, color: 'rgba(23, 158, 221, 1)' },
					    { offset: 1, color: 'rgba(8, 150, 231, 1)' },
					]),
					new echarts.graphic.LinearGradient(0, 0, 0, 1, [
					    { offset: 0, color: 'rgba(57, 105, 250, 1)' },
					    { offset: 1, color: 'rgba(41, 85, 237, 1)' },
					]),
					new echarts.graphic.LinearGradient(0, 0, 0, 1, [
					    { offset: 0, color: 'rgba(98, 85, 255, 1)' },
					    { offset: 1, color: 'rgba(0, 102, 255, 1)' },
					]),
					new echarts.graphic.LinearGradient(0, 0, 0, 1, [
					    { offset: 0, color: 'rgba(150, 71, 254, 1)' },
					    { offset: 1, color: 'rgba(92, 31, 228, 1)' },
					]),
					new echarts.graphic.LinearGradient(0, 0, 0, 1, [
					    { offset: 0, color: 'rgba(205, 100, 250, 1)' },
					    { offset: 1, color: 'rgba(149, 70, 254, 1)' },
					]),
					new echarts.graphic.LinearGradient(0, 0, 0, 1, [
					    { offset: 0, color: 'rgba(242, 10, 247, 1)' },
					    { offset: 1, color: 'rgba(171, 28, 221, 1)' },
					]),
					new echarts.graphic.LinearGradient(0, 0, 0, 1, [
					    { offset: 0, color: 'rgba(247, 10, 144, 1)' },
					    { offset: 1, color: 'rgba(176, 1, 180, 1)' },
					])
				];
				var values = [];
				var clients = [];
				res.data.clients.forEach(function(item, index) {
					clients.push(item.label);
					var count = 0;
					for (var i = 0; i < res.data.record.length; i++) {
						if (res.data.record[i].clients == item.value) {
							count += res.data.record[i].value
						}
					}
					values.push(count);
				});
				var option = utils.createChartBaseOption('访问终端数据', '50px',null,null,null,clients);
				option.xAxis.boundaryGap = true;
				option.tooltip= {
					show: true,
					formatter: "{b}:{c}"
				};
				option.series= [{
					name: '访问数量',
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
					barWidth: '10%',
					barGap: '0%',
					barCategoryGap: '50%',
					data: values
				}];
				
				// 使用刚指定的配置项和数据显示图表。
				myChart.setOption(option);
				this.charts['client'] = myChart;
			},
			/**
			 * 初始化cpu图表
			 * @param {Object} res
			 */
			initViewUrlChart: function(res) {
				var myChart = this.$echarts.init(document.getElementById('urlchart'));
				
				var colorArray = [
					'#1ace4a', //绿
					'#4bf3ff', //蓝
					'#b250ff', //粉
					'#ffa800' //黄
				];
				var values = [];
				var urls = [];
				res.data.urls.forEach(function(item, index) {
					urls.push(item.label);
					var count = 0;
					for (var i = 0; i < res.data.record.length; i++) {
						if (res.data.record[i].url == item.value) {
							count += res.data.record[i].value
						}
					}
					values.push(count);
				});
				var option = utils.createChartBaseOption('访问接口数据', '50px',null,null,null,urls);
				option.xAxis.boundaryGap = true;
				option.tooltip= {
					show: true,
					formatter: "{b}:{c}"
				};
				option.series = [{
					name: '访问数量',
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
					barWidth: '10%',
					barGap: '0%',
					barCategoryGap: '50%',
					data: values
				}];
	
				// 使用刚指定的配置项和数据显示图表。
				myChart.setOption(option);
				this.charts['url'] = myChart;
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

