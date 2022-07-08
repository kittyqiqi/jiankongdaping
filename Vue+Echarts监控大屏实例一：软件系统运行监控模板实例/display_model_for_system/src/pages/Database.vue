<template>
	<div class="title">
		<!-- 贝贝智能平台运行监控 -->
		<img src="../assets/title_bg.png">
	</div>
	<el-row :gutter="10">
		<el-col>
			<div class="grid-content bg-purple chart_panel" id="databasehart">
			</div>
		</el-col>
	</el-row>
	<el-row :gutter="10">
		<el-col>
			<div class="grid-content bg-purple chart_panel" id="recordchart">
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
					//刷新cpu数据
					var option = that.charts['database'].getOption();
					
					var curdatas = [{
						"name": "使用中",
						"value": (Math.random() * 100).toFixed(2)
					}, {
						"name": "执行中",
						"value": (Math.random() * 100).toFixed(2)
					}, {
						"name": "空闲中",
						"value": (Math.random() * 100).toFixed(2)
					}, {
						"name": "新链接",
						"value": (Math.random() * 100).toFixed(2)
					}, {
						"name": "关闭中",
						"value": (Math.random() * 100).toFixed(2)
					}];
					
					curdatas.forEach(function(item, index) {
						option.series[index].data[0].value = item.value;
						option.series[index].data[1].value = 100 - item.value;
					});
					that.charts['database'].setOption(option);
					
					//刷新历史数据
					var option = that.charts['record'].getOption();
					
					var times = [];
					var curdatas = [
						[],
						[],
						[],
						[],
						[]
					];
					var startData = new Date();
					startData.setMinutes(startData.getMinutes() - 30);
					for (var i = startData; i.getTime() < new Date().getTime(); i.setMinutes(i.getMinutes() +
							1)) {
						times.push(i.format('hh:mm'));
						curdatas[0].push((Math.random(100) * 100).toFixed(2));
						curdatas[1].push((Math.random(100) * 100).toFixed(2));
						curdatas[2].push((Math.random(100) * 100).toFixed(2));
						curdatas[3].push((Math.random(100) * 100).toFixed(2));
						curdatas[4].push((Math.random(100) * 100).toFixed(2));
					}
					curdatas.forEach(function(item, index) {
						option.series[index].data = item;
					});
					that.charts['record'].setOption(option);
	
				}, refreshtime);
			},
			/**
			 * 加载数据
			 */
			loadData: function() {
				var that = this;
				//加载内存数据
				api.loadDatabaseData({}, function(res) {
					that.initDatabaseChart(res);
					that.initRecordChart(res);
				});
			},
			/**
			 * 初始化cpu图表
			 * @param {Object} res
			 */
			initRecordChart: function(res) {
				var myChart = this.$echarts.init(document.getElementById('recordchart'));
				
				var times = res.data.records.times;
				var legends = [];
				var series = [];
				var colors = ['#5FB878', '#01AAED', '#FF5722', '#6648FF'];
				res.data.types.forEach(function(item, index) {
					legends.push({
						name: item.name
					});
					series.push({
						name: item.name,
						symbolSize: 5,
						type: "line",
						smooth: true,
						stack:'数量',
						data: res.data.records["_"+item.value],
						itemStyle: {
							normal: {
								borderWidth: 1,
								color: colors[index % colors.length],
								shadowColor: 'rgba(93,241,255 ,0.7)',
								shadowBlur: 10,
							}
						},
						label: {
							show: true,
							position: 'top',
							textStyle: {
								color: '#fff',
							}
						}
					});
				});
				
				var option = utils.createChartBaseOption('数据库链接情况', '50px',null,'80px','70px',times);
				option.legend =  {
					data: legends,
					x: "center",
					bottom: "20px",
					textStyle: {
						color: "#A1D5FF",
						fontSize: 12
					},
				};
				option.series = series;
				
				// 使用刚指定的配置项和数据显示图表。
				myChart.setOption(option);
				this.charts['record'] = myChart;
			},
			/**
			 * 初始化cpu图表
			 * @param {Object} res
			 */
			initDatabaseChart: function(res) {
				var myChart = this.$echarts.init(document.getElementById('databasehart'));
				
				var dataStyle = {
					normal: {
						label: {
							show: false
						},
						labelLine: {
							show: false
						},
						shadowBlur: 0,
						shadowColor: '#203665'
					}
				};
				var colors = ['#5FB878', '#01AAED', '#FF5722', '#6648FF'];
				var series = [];
				var left = 100 / (res.data.types.length);
				res.data.types.forEach(function(item, index) {
					var value = 0;
					for (var i = 0; i < res.data.curdata.length; i++) {
						if(res.data.curdata[i].type == item.value){
							value += res.data.curdata[i].value;
						}
					}
					series.push({
						name: item.name,
						type: 'pie',
						clockWise: false,
						radius: [140, 120],
						itemStyle: dataStyle,
						hoverAnimation: false,
						center: [(left * (index + 1) - left / 2) + '%', '50%'],
						data: [{
							value: value,
							label: {
								normal: {
									rich: {
										a: {
											color: colors[index % colors.length],
											align: 'center',
											fontSize: 30,
											fontWeight: "bold"
										},
										b: {
											color: '#f56c6c',
											align: 'center',
											fontSize: 30
										}
									},
									formatter: function(params) {
										return params.seriesName + "\n\n{b|2%}";
									},
									position: 'center',
									show: true,
									textStyle: {
										fontSize: '30',
										fontWeight: 'normal',
										color: '#f56c6c'
									}
								}
							},
							itemStyle: {
								normal: {
									color: colors[index % colors.length],
									shadowColor: colors[index % colors.length],
									shadowBlur: 0
								}
							}
						}, {
							value: 100 - value,
							name: '全部',
							itemStyle: {
								normal: {
									color: '#666'
								},
								emphasis: {
									color: '#666'
								}
							}
						}]
					});
				});
				
				var option = {
					title:utils.createChartTitle('当前数据库链接情况'),
					tooltip: {
						formatter: '{a} <br/>{b} : {c}%'
					},
					series: series
				};
	
				// 使用刚指定的配置项和数据显示图表。
				myChart.setOption(option);
				this.charts['database'] = myChart;
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