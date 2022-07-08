<template>
	<div class="title">
		<!-- 贝贝智能平台运行监控 -->
		<img src="../assets/title_bg.png">
	</div>
	<el-row :gutter="10">
		<el-col :span="12">
			<div class="grid-content bg-purple chart_panel" id="statuschart">状态分布
			</div>
		</el-col>
		<el-col :span="12">
			<div class="grid-content bg-purple chart_panel" id="leavelchart">级别分布
			</div>
		</el-col>
	</el-row>
	<el-row :gutter="10">
		<el-col>
			<div class="grid-content bg-purple chart_panel" id="typechart">类型分布
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
					var option = that.charts['type'].getOption();
					var curdatas = [
						(Math.random(100) * 100).toFixed(0),
						(Math.random(100) * 100).toFixed(0),
						(Math.random(100) * 100).toFixed(0),
						(Math.random(100) * 100).toFixed(0),
						(Math.random(100) * 100).toFixed(0),
						(Math.random(100) * 100).toFixed(0)
					];
					option.series[0].data = curdatas;

					that.charts['type'].setOption(option);
					
					var option = that.charts['status'].getOption();
					var curdatas = [
						(Math.random(100) * 100).toFixed(0),
						(Math.random(100) * 100).toFixed(0)
					];
					option.series[0].data = curdatas;
					
					that.charts['status'].setOption(option);
					
					var option = that.charts['leavel'].getOption();
					var curdatas = [
						(Math.random(100) * 100).toFixed(0),
						(Math.random(100) * 100).toFixed(0),
						(Math.random(100) * 100).toFixed(0),
						(Math.random(100) * 100).toFixed(0)
					];
					option.series[0].data = curdatas;
					
					that.charts['leavel'].setOption(option);

				}, refreshtime);
			},
			/**
			 * 加载数据
			 */
			loadData: function() {
				var that = this;
				//加载告警数据
				api.loadAlertData({}, function(res) {
					that.initStatusAlertChart(res);
					that.initLeabelRecordChart(res);
					that.initTypeChart(res);
				});
			},
			/**
			 * 初始化告警类型图表
			 * @param {Object} res
			 */
			initStatusAlertChart: function(res) {
				var myChart = this.$echarts.init(document.getElementById('statuschart'));
				
				var colorList = [
				    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
				        { offset: 0, color: 'rgba(247, 10, 144, 1)' },
				        { offset: 1, color: 'rgba(176, 1, 180, 1)' },
				    ]),
				    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
				        { offset: 0, color: 'rgba(36, 250, 173, 1)' },
				        { offset: 1, color: 'rgba(16, 202, 151, 1)' },
				    ])
				];
				
				var status = [];
				var values = [];
				res.data.status.forEach(function(item,index){
					status.push(item.label);
					var value  = 0;
					for (var i = 0; i < res.data.values.length; i++) {
						if(res.data.values[i].status == item.value){
							value += res.data.values[i].value;
						}
					}
					values.push(value);
				})
				var option = utils.createChartBaseOption('告警状态分布', '50px',null,null,null,status);
				option.xAxis.boundaryGap = true;
				option.tooltip= {
					show: true,
					formatter: "{b}:{c}"
				},
				option.series= [{
					zlevel: 1,
					name: '',
					type: 'bar',
					barWidth: '30px',
					data: values,
					align: 'center',
					itemStyle: {
						normal: {
							color: function (params) {
								return colorList[params.dataIndex];
							},
							barBorderRadius: 30
						}
					},
					label: {
						show: true,
						color: '#fff'
					}
				}];

				// 使用刚指定的配置项和数据显示图表。
				myChart.setOption(option);
				this.charts['status'] = myChart;
			},
			/**
			 * 初始化告警级别
			 * @param {Object} res
			 */
			initLeabelRecordChart: function(res) {
				var myChart = this.$echarts.init(document.getElementById('leavelchart'));

				var colorArray = [
					'#1ace4a', //绿
					'#4bf3ff', //蓝
					'#b250ff', //粉
					'#ffa800' //黄
				];
				var values = [];
				var leavels = [];
				res.data.leavel.forEach(function(item, index) {
					leavels.push(item.label);
					var count = 0;
					for (var i = 0; i < res.data.values.length; i++) {
						if (res.data.values[i].leavel == item.value) {
							count += res.data.values[i].value
						}
					}
					values.push(count);
				});
				var option = utils.createChartBaseOption('告警级别数据', '50px',null,null,null,leavels);
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
					barWidth: '10%',
					barGap: '0%',
					barCategoryGap: '50%',
					data: values
				}];

				// 使用刚指定的配置项和数据显示图表。
				myChart.setOption(option);
				this.charts['leavel'] = myChart;
			},
			/**
			 * 初始化cpu图表
			 * @param {Object} res
			 */
			initTypeChart: function(res) {
				var myChart = this.$echarts.init(document.getElementById('typechart'));
				
				var colorList = [
				    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
				        { offset: 0, color: 'rgba(3, 251, 71, 1)' },
				        { offset: 1, color: 'rgba(19, 218, 140, 1)' },
				    ]),
				    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
				        { offset: 0, color: 'rgba(36, 250, 173, 1)' },
				        { offset: 1, color: 'rgba(16, 202, 151, 1)' },
				    ]),
				    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
				        { offset: 0, color: 'rgba(33, 245, 219, 1)' },
				        { offset: 1, color: 'rgba(19, 201, 183, 1)' },
				    ]),
				    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
				        { offset: 0, color: 'rgba(37, 250, 245, 1)' },
				        { offset: 1, color: 'rgba(11, 190, 204, 1)' },
				    ]),
				    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
				        { offset: 0, color: 'rgba(48, 220, 243, 1)' },
				        { offset: 1, color: 'rgba(8, 183, 231, 1)' },
				    ]),
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
				    ]),
				];
				var categorys = [];
				var values = [];
				res.data.types.forEach(function(item, index) {
					categorys.push(item.label);
					var count = 0;
					for (var i = 0; i < res.data.values.length; i++) {
						if (res.data.values[i].type == item.value) {
							count += res.data.values[i].value
						}
					}
					values.push(count);
				});
				var option = utils.createChartBaseOption('告警类型分布', '50px',null,null,null,categorys);
				option.xAxis.boundaryGap = true;
				option.series= [
					{
						type: 'bar',
						data: values,
						barWidth: '10%',
						itemStyle: {
							normal: {
								color: function (params) {
									return colorList[params.dataIndex];
								},
								barBorderRadius: [30, 30, 0, 0],
								shadowBlur: 4,
							},
						},
						label: {
							normal: {
								show: true,
								position: ['-10', '-20'],
								distance: 1,
								formatter: ' {a|{c}%}',
								rich: {
									a: {
										color: '#fff',
										align: 'center'
									}
								}
							}
						}
					}
				];
				
				// 使用刚指定的配置项和数据显示图表。
				myChart.setOption(option);
				this.charts['type'] = myChart;
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
