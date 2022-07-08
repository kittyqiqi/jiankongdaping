<script>
	import "./public/dark_theme.css"
	import "./public/blue_theme.css"

	import $ from 'jquery'
	import config from './public/config.js'
	import utils from './public/utils.js'

	export default {
		data() {
			return {
				//当前主题，可以通过设置进行控制
				curTheme: "dark",
				turntime:60*1000,
				//菜单居中
				menuPanelTop: 11,
				//菜单居中
				menuPanelLeft: 11,
				menuPanelWidth: 600,
				menuPanelHeight: 280,

				//菜单居中
				settingPanelTop: 11,
				//菜单居中
				settingPanelLeft: 11,
				settingPanelWidth: 600,
				settingPanelHeight: 350,

				menushow: false,
				settingshow: false,

				configs: config.getConfig(),
				settingForm: {},
				rules: {},
				timer: null
			}
		},
		mounted: function() {
			this.menuPanelTop = ($(window).height() - this.menuPanelHeight) / 2;
			this.menuPanelLeft = ($(window).width() - this.menuPanelWidth) / 2;

			this.settingPanelTop = ($(window).height() - this.settingPanelHeight) / 2;
			this.settingPanelLeft = ($(window).width() - this.settingPanelWidth) / 2;

			var that = this;
			this.configs.forEach(function(item, index, arr) {
				that.settingForm[item.key] = item.value;

				that.rules[item.key] = [{
					required: item.required,
					message: '请输入' + item.label,
					trigger: 'blur'
				}];

				//更新界面主题
				if (item.key == 'theme') {
					that.curTheme = item.value
				}
				//更细切换周期
				if (item.key == 'turntime') {
					that.turntime = item.value*1
				}
			});

			//开启自动轮播功能
			if (this.timer) {
				clearInterval(this.timer);
			}
			var that = this;
			this.timer = setInterval(function() {
				var cur = that.$router.currentRoute._value.path;
				if (cur == '/' || cur == '/Index') {
					cur = '/Index';
				}
				var all = that.$router.getRoutes();
				var next = null;
				for (var i = 0; i < all.length; i++) {
					if (all[i].path == cur) {
						if (i < all.length - 1) {
							next = all[i + 1];
						} else {
							next = all[0];
						}
					}
				}
				that.$router.replace(next.path);
			},that.turntime);
		},
		methods: {
			/**
			 * 切换界面
			 * @param {Object} path
			 */
			turnPage: function(path) { //切换界面
				this.$router.push(path);
				this.hideMenu();
				this.hideSetting(); //切换界面
			},
			/**
			 * 显示菜单
			 */
			showMenu: function() {
				this.menushow = true;
			},
			/**
			 * 隐藏菜单
			 */
			hideMenu: function() {
				this.menushow = false;
			},
			/**
			 * 显示设置框
			 */
			showSetting: function() {
				this.settingshow = true;
			},
			/**
			 * 显示设置框
			 */
			hideSetting: function() {
				this.settingshow = false;
			},
			/**
			 * 阻止事件冒泡
			 */
			stopPropagation: function() {},
			/**
			 * 恢复默认
			 */
			defalutForm: function() {
				var that = this;
				this.configs = config.defaultconfig;
				this.configs.forEach(function(item, index, arr) {
					that.settingForm[item.key] = item.value;

					that.rules[item.key] = [{
						required: item.required,
						message: '请输入' + item.label,
						trigger: 'blur'
					}];
				});
			},
			/**
			 * 提交表单
			 */
			submitForm: function() {
				var that = this;
				this.$refs.settingFormRef.validate((valid, fields) => {
					if (!valid) {
						return;
					}
					//将数据组合成数组格式
					var configdata = [];
					for (var key in that.settingForm) {
						var itemconfig = null;
						for (var i = 0; i < that.configs.length; i++) {
							if (that.configs[i].key == key) {
								itemconfig = that.configs[i];
								break;
							}
						}
						if (!itemconfig) { //未识别的配置项
							continue;
						}
						//更新数据
						itemconfig.value = that.settingForm[key];
						configdata.push(itemconfig);
					}

					//保存系统配置
					utils.saveConfig(configdata);

					//刷新并应用系统配置
					this.refreshConfig();
				});
			},
			/**
			 * 刷新并应用系统配置
			 */
			refreshConfig: function() {
				//更新配置表单对应数据
				this.configs = config.getConfig();
				var that = this;
				this.configs.forEach(function(item, index, arr) {
					that.settingForm[item.key] = item.value;

					that.rules[item.key] = [{
						required: item.required,
						message: '请输入' + item.label,
						trigger: 'blur'
					}];

					//更新界面主题
					if (item.key == 'theme') {
						that.curTheme = item.value
					}

					//简单期间，直接刷新界面
					window.location.reload();
				});
			}
		}
	}
</script>

<template>
	<div :class="curTheme">
		<transition name="bounce" mode="out-in">
			<router-view></router-view>
		</transition>
		<!-- 悬浮菜单 -->
		<div class="menu_btn">
			<div class="menu_btn_item" style="border-top-left-radius: 5px;border-top-right-radius: 5px;"
				@click="showMenu">
				<el-icon :size="20">
					<Menu />
				</el-icon>
			</div>
			<div style="background: #000000;height: 1px;"></div>
			<div class="menu_btn_item" style="border-bottom-left-radius: 5px;border-bottom-right-radius: 5px;"
				@click="showSetting">
				<el-icon :size="20">
					<Setting :size="20" />
				</el-icon>
			</div>
		</div>
		<!-- 系统菜单选择弹框 -->
		<div class="menu_panel" v-if="menushow">
			<div class="menu_panel_maker" @click="hideMenu">
				<div class="inner_contaner" @click.stop="stopPropagation">
					<el-row style="margin-top: 20px;">
						<el-col :span="6">
							<div class="menu_item" @click="turnPage('Index')">
								<div class="icon">
									<el-icon :size="40">
										<Platform :size="40" />
									</el-icon>
								</div>
								<div class="text">综合监控</div>
							</div>
						</el-col>
						<el-col :span="6">
							<div class="menu_item" @click="turnPage('Cpu')">
								<div class="icon">
									<el-icon :size="40">
										<Trend-charts :size="40" />
									</el-icon>
								</div>
								<div class="text">CPU监控</div>
							</div>
						</el-col>
						<el-col :span="6">
							<div class="menu_item" @click="turnPage('Memory')">
								<div class="icon">
									<el-icon :size="40">
										<Data-line :size="40" />
									</el-icon>
								</div>
								<div class="text">内存监控</div>
							</div>
						</el-col>
						<el-col :span="6">
							<div class="menu_item" @click="turnPage('Net')">
								<div class="icon">
									<el-icon :size="40">
										<Basketball :size="40" />
									</el-icon>
								</div>
								<div class="text">网络监控</div>
							</div>
						</el-col>
					</el-row>
					<el-row style="margin-top: 20px;">
						<el-col :span="6">
							<div class="menu_item" @click="turnPage('Dist')">
								<div class="icon">
									<el-icon :size="40">
										<Message-box :size="40" />
									</el-icon>
								</div>
								<div class="text">磁盘监控</div>
							</div>
						</el-col>
						<el-col :span="6">
							<div class="menu_item" @click="turnPage('Alert')">
								<div class="icon">
									<el-icon :size="40">
										<Warning-filled :size="40" />
									</el-icon>
								</div>
								<div class="text">告警监控</div>
							</div>
						</el-col>
						<el-col :span="6">
							<div class="menu_item" @click="turnPage('Database')">
								<div class="icon">
									<el-icon :size="40">
										<Coin :size="40" />
									</el-icon>
								</div>
								<div class="text">数据库监控</div>
							</div>
						</el-col>
						<el-col :span="6">
							<div class="menu_item" @click="turnPage('View')">
								<div class="icon">
									<el-icon :size="40">
										<View :size="40" />
									</el-icon>
								</div>
								<div class="text">访问量监控</div>
							</div>
						</el-col>
					</el-row>

					<el-icon :size="25" class="menuPanelCloseBtn" @click="hideMenu">
						<Close-bold :size="25" />
					</el-icon>
				</div>
			</div>
		</div>
		<!-- 系统配置弹框 -->
		<div class="setting_panel" v-if="settingshow">
			<div class="setting_panel_maker" @click="hideSetting">
				<div class="inner_contaner" @click.stop="stopPropagation">
					<el-icon :size="25" class="settingPanelCloseBtn" @click="hideSetting">
						<Close-bold :size="25" />
					</el-icon>
					<div class="setting_panel_title">
						系统配置
					</div>
					<el-form ref="settingFormRef" :model="settingForm" status-icon :rules="rules" label-width="120px"
						class="settingForm">
						<el-form-item :label="item.label+':'" prop="item.type" v-for="(item,index) in configs">
							<!-- 识别配置项类型并创建对应组件 -->
							<el-input v-if="item.type != 'select'" v-model="settingForm[item.key]"
								placeholder="请输入{{item.label}}" type="item.type" autocomplete="off" />
							<el-select v-if="item.type == 'select'" style="width:100%" v-model="settingForm[item.key]"
								placeholder="请选择{{item.label}}">
								<el-option v-for="(optionitem,index1) in item.options" :label="optionitem.label"
									:value="optionitem.value" />
							</el-select>
						</el-form-item>
						<el-form-item>
							<el-row style="width:100%">
								<el-col :span="11">
									<el-button style="width:100%" type="primary" @click="submitForm(settingFormRef)">
										保存配置</el-button>
								</el-col>
								<el-col :span="2">
								</el-col>
								<el-col :span="11">
									<el-button style="width:100%" @click="defalutForm(settingFormRef)">恢复默认</el-button>
								</el-col>
							</el-row>
						</el-form-item>
					</el-form>

				</div>
			</div>
		</div>
	</div>
</template>

<style>
	.menu_panel .inner_contaner {
		width: v-bind(menuPanelWidth+"px");
		height: v-bind(menuPanelHeight+"px");
		top: v-bind(menuPanelTop+"px");
		left: v-bind(menuPanelLeft+"px");
	}

	.setting_panel .inner_contaner {
		width: v-bind(settingPanelWidth+"px");
		height: v-bind(settingPanelHeight+"px");
		top: v-bind(settingPanelTop+"px");
		left: v-bind(settingPanelLeft+"px");
	}

	.bounce-enter-active {
	  animation: bounce-in .5s ease-out both;
	}
	
	.bounce-leave-active {
	  animation: bounce-in .5s reverse ease-in both;
	}
	
	@keyframes bounce-in {
	  0% {
	    transform: scale(0);
	  }
	  50% {
	    transform: scale(1.25);
	  }
	  100% {
	    transform: scale(1);
	  }
	}
</style>
