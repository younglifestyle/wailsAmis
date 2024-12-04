import React from 'react';
import {Provider} from 'mobx-react';
import {MainStore} from './store';
import Amis from './route/Editor';
import axios from "axios";
import {toast, alert, confirm, ToastComponent, AlertComponent} from 'amis';
import copy from "copy-to-clipboard";

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
                    return (axios as any)[method](url, config);
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

    // // 设置 Axios 拦截器
    // axios.interceptors.request.use(
    //     config => {
    //         // 访问 store 的 currFile
    //         const currFile = store.currFile;
    //         console.log("Axios interceptor - url:", config.url, "currFile:", currFile);
    //
    //         // 如果 config.url 是相对路径，例如 "/api/v1/pREST/print_barcode"
    //         if (config.url && config.url.startsWith('/api/v1')) {
    //             try {
    //                 // 创建新的 URL 对象，将协议、主机名替换为新的域名
    //                 const newUrl = new URL(config.url, 'https://test.longsys.com');  // 基于目标域名创建完整的 URL
    //                 console.log("Updated URL (relative):", newUrl.toString());
    //
    //                 // 如果有需要，追加 query 参数（如 currFile）
    //                 if (currFile) {
    //                     newUrl.searchParams.append('file', currFile);
    //                 }
    //
    //                 // 更新请求的 URL 为新生成的 URL
    //                 config.url = newUrl.toString();
    //             } catch (error) {
    //                 console.error('Invalid URL (relative):', config.url, error);
    //                 return Promise.reject(error);
    //             }
    //         }
    //
    //         // 如果 config.url 是完整的 URL，例如 "https://xxxxxx.com/api/v1/pREST/print_barcode?..."
    //         else if (config.url && config.url.startsWith('http')) {
    //             try {
    //                 // 将原始的 URL 转换为 URL 对象，方便处理
    //                 const originalUrl = new URL(config.url);
    //
    //                 // 判断路径是否包含 "/api/v1"，如果是则替换域名
    //                 if (originalUrl.pathname.startsWith('/api/v1')) {
    //                     originalUrl.hostname = 'test.longsys.com';  // 替换为目标域名
    //                     console.log("Updated URL (absolute):", originalUrl.toString());
    //
    //                     // 如果有需要，追加 query 参数（如 currFile）
    //                     if (currFile) {
    //                         originalUrl.searchParams.append('file', currFile);
    //                     }
    //
    //                     // 更新请求的 URL 为新生成的 URL
    //                     config.url = originalUrl.toString();
    //                 }
    //             } catch (error) {
    //                 console.error('Invalid URL (absolute):', config.url, error);
    //                 return Promise.reject(error);
    //             }
    //         }
    //
    //         // 返回修改后的 config
    //         return config;
    //     },
    //     error => {
    //         return Promise.reject(error);
    //     }
    // );

    return (
        <Provider store={store}>
            <ToastComponent key="toast" position={'top-center'} />
            <AlertComponent key="alert" />

            <Amis store={store} />
        </Provider>
    );
}
