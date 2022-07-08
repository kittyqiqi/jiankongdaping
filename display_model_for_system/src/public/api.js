import axios from 'axios';
const config = {
	// baseURL: process.env.baseURL
	baseURL: 'http://localhost:3000',
	timeout: 1000,
	headers: {
		'Content-Type': 'application/json',
	},
};
const api = axios.create(config);

// 默认 post 请求，使用 application/json 形式
api.defaults.headers.post['Content-Type'] = 'application/json';

/**
 * 接口地址配置
 */
const server_urls = {
	//cpu数据加载地址
	cpu_url: '/src/assets/data/cpu.json',
	//内存数据加载地址
	memory_url: '/src/assets/data/memory.json',
	//磁盘数据加载地址
	dist_url: '/src/assets/data/dist.json',
	//网络数据加载地址
	net_url: '/src/assets/data/net.json',
	//浏览量数据加载地址
	view_url: '/src/assets/data/view.json',
	//磁盘数据加载地址
	dist_url: '/src/assets/data/dist.json',
	//数据库数据加载地址
	database_url: '/src/assets/data/database.json',
	//告警数据加载地址
	alert_url: '/src/assets/data/alert.json'
};

export default {
	name: "api",
	/**
	 * 加載CPU数据
	 * @param {Object} params
	 * @param {Object} callback
	 */
	loadCpuData: function(params, callback) {
		axios({
			method: 'post',
			url: config.baseURL + server_urls.cpu_url,
			params,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
			},
		}).then(response => {
			callback && callback(response);
		})
	},
	/**
	 * 加載內存数据
	 * @param {Object} params
	 * @param {Object} callback
	 */
	loadMemoryData: function(params, callback) {
		axios({
			method: 'post',
			url: config.baseURL + server_urls.memory_url,
			params,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
			},
		}).then(response => {
			callback && callback(response);
		})
	},
	/**
	 * 加載网络数据
	 * @param {Object} params
	 * @param {Object} callback
	 */
	loadNetData: function(params, callback) {
		axios({
			method: 'post',
			url: config.baseURL + server_urls.net_url,
			params,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
			},
		}).then(response => {
			callback && callback(response);
		})
	},
	/**
	 * 加載浏览量数据
	 * @param {Object} params
	 * @param {Object} callback
	 */
	loadViewData: function(params, callback) {
		axios({
			method: 'post',
			url: config.baseURL + server_urls.view_url,
			params,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
			},
		}).then(response => {
			callback && callback(response);
		})
	},
	/**
	 * 加載磁盘数据
	 * @param {Object} params
	 * @param {Object} callback
	 */
	loadDistData: function(params, callback) {
		axios({
			method: 'post',
			url: config.baseURL + server_urls.dist_url,
			params,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
			},
		}).then(response => {
			callback && callback(response);
		})
	},
	/**
	 * 加載数据库数据
	 * @param {Object} params
	 * @param {Object} callback
	 */
	loadDatabaseData: function(params, callback) {
		axios({
			method: 'post',
			url: config.baseURL + server_urls.database_url,
			params,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
			},
		}).then(response => {
			callback && callback(response);
		})
	},
	/**
	 * 加載告警数据
	 * @param {Object} params
	 * @param {Object} callback
	 */
	loadAlertData: function(params, callback) {
		axios({
			method: 'post',
			url: config.baseURL + server_urls.alert_url,
			params,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
			},
		}).then(response => {
			callback && callback(response);
		})
	}
}
