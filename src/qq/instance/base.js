import {randomUserAgent} from '../../util'

export default function (createInstance) {
    const fly = createInstance()
    // fly.config.proxy = 'http://localhost:8888'
    fly.config.baseURL = 'https://c.y.qq.com'
    fly.config.timeout = 5000
    fly.config.parseJson = false
    fly.config.headers = {
        Referer: 'https://y.qq.com/portal/player.html',
        'User-Agent': randomUserAgent()
    }

    fly.interceptors.request.use(config => {
        if(config.headers.newApi) {
            config.baseURL = 'https://u.y.qq.com'
            delete config.headers.newApi
        }
        return config
    }, e => Promise.reject(e))
    fly.interceptors.response.use(res => {
        if (!res.data) {
            return Promise.reject({
                status: false,
                msg: '请求无结果'
            })
        }
        // 是否有回调
        let hasCallback = false
        const callbackArr = ['callback', 'jsonCallback', 'MusicJsonCallback']
        callbackArr.forEach(item => {
            if (res.data.toString().trim().startsWith(item)) {
                res.data = eval(`function ${item}(val){return val} ${res.data}`)
                hasCallback = true
            }
        })
        if (!hasCallback) {
            return Promise.reject({
                status: false,
                msg: '请求结果错误',
                log: res.data
            })
        }
        // code是否正确
        if (!res.request.nocode && res.data.code !== 0) {
            return Promise.reject({
                status: false,
                msg: '请求结果报错',
                log: res.data
            })
        }
        return res.data
    }, e => Promise.reject(e))

    return fly
}