export default {
	defaultconfig:[{
		key:'theme',
		value:'dark',
		label:'界面主题',
		type:'select',
		required:true,
		options:[{
			value:'dark',
			label:'深色主题'
		},{
			value:'blue',
			label:'蓝色主题'
		}]
	},{
		key:'refreshtime',
		value:10*1000,
		label:'刷新时间',
		type:'number',
		required:true
	},{
		key:'turntime',
		value:20*1000,
		label:'切换时间',
		type:'select',
		required:true,
		options:[{
			value:20*1000,
			label:'20秒'
		},{
			value:60*1000,
			label:'1分钟'
		},{
			value:2*60*1000,
			label:'2分钟'
		},{
			value:5*60*1000,
			label:'5分钟'
		}]
	},{
		key:'serverurl',
		value:'./',
		label:'接口地址',
		type:'text',
		required:true
	}],
	/**
	 * 获取系统配置
	 */
	getConfig:function(){
		var config = localStorage.getItem("config");
		if(!config){
			config = this.defaultconfig;
		}else{
			config = JSON.parse(config);
		}
		return config;
	}
}