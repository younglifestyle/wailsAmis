import React from 'react';
import {Editor, ShortcutKey} from 'amis-editor';
import {inject, observer} from 'mobx-react';
import {render as renderAmis, Select, toast} from 'amis';
import {currentLocale} from 'i18n-runtime';
import {Icon} from '../icons/index';
import {IMainStore} from '../store';
import '../editor/DisabledEditorPlugin'; // 用于隐藏一些不需要的Editor预置组件
import '../renderer/MyRenderer';
import '../editor/MyRenderer';

let currentIndex = 0;

let host = `${window.location.protocol}//${window.location.host}`;

// 如果在 gh-pages 里面
if (/^\/amis-editor-demo/.test(window.location.pathname)) {
    host += '/amis-editor';
}

const schemaUrl = `${host}/schema.json`;

const editorLanguages = [
    {
        label: '简体中文',
        value: 'zh-CN'
    },
    {
        label: 'English',
        value: 'en-US'
    }
];

export default inject('store')(
    observer(function ({
                           store,
                       }: { store: IMainStore }) {
        // const index: number = parseInt(match.params.id, 10);
        const index: number = 0;
        const curLanguage = currentLocale(); // 获取当前语料类型

        if (index !== currentIndex) {
            currentIndex = index;
            store.updateSchema(store.pages[index].schema);
        }

        function save() {
            store.updatePageSchemaAt(index);

            // @ts-ignore
            window.go.main.App.SaveJsonToFile(store.currFile, store.schema)
                .then((result: any) => {
                    console.log('保存成功', result);
                    toast.success('保存成功', '提示');
                })
                .catch((error: any) => {
                    console.error('保存文件失败:', error);
                    toast.error('保存文件失败', '提示');
                });
            // toast.success('保存成功', '提示');
        }

        function onChange(value: any) {
            store.updateSchema(value);
            store.updatePageSchemaAt(index);
        }

        function changeLocale(value: string) {
            localStorage.setItem('suda-i18n-locale', value);
            window.location.reload();
        }


        const selectFile = () => {
            // @ts-ignore
            window.go.main.App.SelectFile().then((result) => {
                if (result && result.FileName !== '') {
                    // setCurrFile(result.FileName);
                    // 设置 currFile 到 store 中
                    store.setCurrFile(result.FileName);
                    // 设置从文件中读取的template
                    store.updateSchema(result.FileData);

                    // console.log(result.FileName, result.FileData);
                }
            });
        };

        const updateSchemaFrom = () => {
            // @ts-ignore
            window.go.main.App.ReadFileData(store.currFile).then((result) => {
                if (result !== '') {
                    // console.log(result);
                    store.updateSchema(result);
                }
            });
        };

        // 保存内容到文件中
        function saveScheme() {
            // @ts-ignore
            window.go.main.App.SaveJsonToFile(store.currFile, store.schema)
                .then((result: any) => {
                    if (result === "") {
                        console.log('保存成功');
                        toast.success('保存成功', '提示');
                    }
                })
                .catch((error: any) => {
                    console.error('保存文件失败:', error);
                    toast.error('保存文件失败', '提示');
                });
        }


        return (
            <div className="Editor-Demo">
                <div className="Editor-header">
                    <div className="Editor-title">
                        {renderAmis({
                            type: "form",
                            mode: "inline",
                            title: "",
                            wrapWithPanel: false,
                            className: "m-t-sm",
                            body: [
                                {
                                    type: "button",
                                    label: "打开文件",
                                    onClick: function () {
                                        selectFile();
                                    },
                                },
                                {
                                    type: "button",
                                    label: "重开文件",
                                    id: "u:587e92d5ffcc",
                                    onClick: function () {
                                        updateSchemaFrom();
                                    },
                                },
                                {
                                    type: "tpl",
                                    tpl: store.currFile,
                                }
                                // {
                                //     name: store.currFile,
                                //     type: "input-text",
                                //     label: "当前编辑文件:",
                                //     disabled: true,
                                //     className: "mr-0",
                                //     id: "u:c50a308f1b0a",
                                //     size: "lg",
                                //     value: store.currFile, // 直接绑定 currFile
                                //     onChange: (e: any) => store.setCurrFile(e.target.value), // 设置 onChange 事件来更新 currFile
                                // }
                            ],
                        })}
                    </div>
                    <div className="Editor-view-mode-group-container">
                        <div className="Editor-view-mode-group">
                            <div
                                className={`Editor-view-mode-btn editor-header-icon ${
                                    !store.isMobile ? 'is-active' : ''
                                }`}
                                onClick={() => {
                                    store.setIsMobile(false);
                                }}
                            >
                                <Icon icon="pc-preview" title="PC模式"/>
                            </div>
                            <div
                                className={`Editor-view-mode-btn editor-header-icon ${
                                    store.isMobile ? 'is-active' : ''
                                }`}
                                onClick={() => {
                                    store.setIsMobile(true);
                                }}
                            >
                                <Icon icon="h5-preview" title="移动模式"/>
                            </div>
                        </div>
                    </div>

                    <div className="Editor-header-actions">
                        <ShortcutKey/>
                        <Select
                            className="margin-left-space"
                            options={editorLanguages}
                            value={curLanguage}
                            clearable={false}
                            onChange={(e: any) => changeLocale(e.value)}
                        />
                        <div
                            className={`header-action-btn m-1 ${
                                store.preview ? 'primary' : ''
                            }`}
                            onClick={() => {
                                store.setPreview(!store.preview);
                            }}
                        >
                            {store.preview ? '编辑' : '预览'}
                        </div>
                        {!store.preview && (
                            <div className="header-action-btn exit-btn" onClick={saveScheme}>
                                保存
                            </div>
                        )}
                    </div>
                </div>
                <div className="Editor-inner">
                    <Editor
                        theme={'cxd'}
                        preview={store.preview}
                        isMobile={store.isMobile}
                        value={store.schema}
                        onChange={onChange}
                        onPreview={() => {
                            store.setPreview(true);
                        }}
                        onSave={save}
                        className="is-fixed"
                        $schemaUrl={schemaUrl}
                        showCustomRenderersPanel={true}
                        amisEnv={{
                            fetcher: store.fetcher,
                            notify: store.notify,
                            alert: store.alert,
                            copy: store.copy
                        }}
                    />
                </div>
            </div>
        );
    })
);
