import React from 'react';
import {Provider} from 'mobx-react';
import {alert, confirm, toast} from 'amis';
import axios from 'axios';
import {MainStore} from './store/index';
import RootRoute from './route/index';
import copy from 'copy-to-clipboard';

export default function (): JSX.Element {
    const store = ((window as any).store = MainStore.create(
        {},
        {
            fetcher: ({url, method, data, config, headers}: any) => {

                config = config || {};
                config.headers = config.headers || headers || {};
                config.withCredentials = true;

                if (method !== 'post' && method !== 'put' && method !== 'patch') {
                    if (data) {
                        config.params = data;
                    }

                    // @ts-ignore
                    return (axios as any)[method](url, config).then(response => {
                        if (response.headers['content-disposition']) {
                            // 处理文件下载逻辑
                            const contentDisposition = response.headers['content-disposition'];
                            let filename = contentDisposition ? contentDisposition.split('filename=')[1] : 'downloaded_file';
                            filename = decodeURIComponent(filename)

                            const blob = new Blob([response.data], { type: response.headers['content-type'] });
                            const urlBlob = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = urlBlob;
                            a.download = filename;
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            window.URL.revokeObjectURL(urlBlob);
                        }
                        return response;
                    });
                } else if (data && data instanceof FormData) {
                    // config.headers = config.headers || {};
                    // config.headers['Content-Type'] = 'multipart/form-data';
                } else if (
                    data &&
                    typeof data !== 'string' &&
                    !(data instanceof Blob) &&
                    !(data instanceof ArrayBuffer)
                ) {
                    data = JSON.stringify(data);
                    config.headers['Content-Type'] = 'application/json';
                }

                return (axios as any)[method](url, data, config);
            },
            isCancel: (e: any) => axios.isCancel(e),
            notify: (type: 'success' | 'error' | 'info', msg: string) => {
                toast[type]
                    ? toast[type](msg, type === 'error' ? '系统错误' : '系统消息')
                    : console.warn('[Notify]', type, msg);
                console.log('[notify]', type, msg);
            },
            alert,
            confirm,
            copy: (contents: string, options: any = {}) => {
                const ret = copy(contents, options);
                ret &&
                (!options || options.shutup !== true) &&
                toast.info('内容已拷贝到剪切板');
                return ret;
            }
        }
    ));

    // 将 fetcher 函数赋值给全局变量
    // @ts-ignore
    window.amisFetcher = store.fetcher;

    // 设置 Axios 拦截器
    axios.interceptors.request.use(
        config => {
            // 访问 store 的 currFile
            const LOCAL_API_BASE_URL = store.proxyIp;
            console.log("Axios interceptor - url:", config.url, "ip:", LOCAL_API_BASE_URL);

            // http://localhost:33152
            // 检查 URL 是否为相对地址
            if (config.url && !/^https?:\/\//i.test(config.url)) {
                // 确保路径之间有一个斜杠
                const separator = config.url.startsWith('/') ? '' : '/';
                config.url = `${LOCAL_API_BASE_URL}${separator}${config.url}`;
            }

            // 返回修改后的 config
            return config;
        },
        error => {
            return Promise.reject(error);
        }
    );

    return (
        <Provider store={store}>
            <RootRoute store={store}/>
        </Provider>
    );
}