import React from 'react';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'mobx-react';
import { MainStore } from './store/index';
import Amis from './route/Editor2';
import axios from "axios";
import {toast} from "amis";
import copy from "copy-to-clipboard";

// 创建 store
const store = MainStore.create(
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
);

function App() {
    return (
        <Provider store={store}>
            <HashRouter>
                <Amis store={store} />
            </HashRouter>
        </Provider>
    );
}

export default App;
