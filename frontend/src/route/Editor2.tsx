import React, {useEffect, useState} from 'react';
import {Editor, ShortcutKey} from 'amis-editor';
import {render as renderAmis, Select, toast} from 'amis';
import {currentLocale} from 'i18n-runtime';
import {Icon} from '../icons/index';
import {IMainStore} from '../store';
import '../editor/DisabledEditorPlugin'; // 用于隐藏一些不需要的Editor预置组件
import '../renderer/MyRenderer';
import '../editor/MyRenderer';
// import {render as renderAmis} from "amis";

let currentIndex = -1;

let host = `${window.location.protocol}//${window.location.host}`;

// 如果在 gh-pages 里面
if (/^\/amis-editor-demo/.test(window.location.pathname)) {
    host += '/amis-editor';
}

const schemaUrl = `${host}/schema.json`;

const editorLanguages = [
    {label: '简体中文', value: 'zh-CN'},
    {label: 'English', value: 'en-US'}
];

// 使用函数组件，并传入 store
export function Amis({store}: { store: IMainStore }) {
    if (!store) {
        console.error("Store is not initialized");
        return <div>Loading...</div>; // 或者显示其他错误提示
    }

    const [mobile, setMobile] = useState(store.isMobile);
    const [preview, setPreview] = useState(store.preview);
    const [currFile, setCurrFile] = useState('');

    // 语言选择
    const curLanguage = currentLocale();

    useEffect(() => {
        // 在 index 发生变化时更新 schema
        if (store.pages[currentIndex]) {
            store.updateSchema(store.pages[currentIndex].schema);
        }
    }, [store]);

    // 处理保存
    function save() {
        store.updatePageSchemaAt(currentIndex);
        toast.success('保存成功', '提示');
    }

    // 更新 schema
    function onChange(value: any) {

        console.log("value : ", value);

        store.updateSchema(value);
        store.updatePageSchemaAt(currentIndex);
    }


    const selectFile = () => {
        // @ts-ignore
        window.go.main.App.SelectFile().then((result) => {
            if (result && result.FileName !== '') {
                setCurrFile(result.FileName);
                // 设置从文件中读取的template
                store.updateSchema(result.FileData);

                console.log(result.FileName, result.FileData);
            }
        });
    };

    const updateSchemaFrom = () => {
        // @ts-ignore
        window.go.main.App.ReadFileData(currFile).then((result) => {
            if (result !== '') {
                console.log(result);

                store.updateSchema(result.FileData);
            }
        });
    };

    // 修改语言
    function changeLocale(value: string) {
        localStorage.setItem('suda-i18n-locale', value);
        window.location.reload();
    }

    // 退出编辑
    function exit() {
        window.location.href = `/${store.pages[currentIndex].path}`;
    }

    // 切换模式
    const toggleMobileMode = () => {
        store.setIsMobile(!mobile);
        setMobile(!mobile);
    };

    const togglePreviewMode = () => {
        store.setPreview(!preview);
        setPreview(!preview);
    };

    return (
        <div className="Editor-Demo">
            <div className="Editor-header">
                <div className="Editor-title">
                    {renderAmis({
                        type: "form",
                        mode: "inline",
                        title: "",
                        wrapWithPanel: false,
                        body: [
                            {
                                type: "button",
                                label: "打开文件",
                                onClick: function () {
                                    selectFile();
                                },
                            },
                            {
                                "name": "currFile",
                                "type": "input-text",
                                "label": "当前编辑文件:",
                                "disabled": true,
                                "className": "mr-0",
                                "id": "u:c50a308f1b0a",
                                "size": "lg"
                            },
                            {
                                "type": "button",
                                "label": "刷新",
                                "id": "u:587e92d5ffcc",
                                "onClick": function () {
                                    updateSchemaFrom();
                                },
                            }
                        ],
                    })}
                </div>
                <div className="Editor-view-mode-group-container">
                    <div className="Editor-view-mode-group">
                        <div
                            className={`Editor-view-mode-btn editor-header-icon ${!mobile ? 'is-active' : ''}`}
                            onClick={toggleMobileMode}
                        >
                            <Icon icon="pc-preview" title="PC模式"/>
                        </div>
                        <div
                            className={`Editor-view-mode-btn editor-header-icon ${mobile ? 'is-active' : ''}`}
                            onClick={toggleMobileMode}
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
                        className={`header-action-btn m-1 ${preview ? 'primary' : ''}`}
                        onClick={togglePreviewMode}
                    >
                        {preview ? '编辑' : '预览'}
                    </div>
                    {/*{!preview && (*/}
                    {/*    <div className="header-action-btn exit-btn" onClick={exit}>*/}
                    {/*      退出*/}
                    {/*    </div>*/}
                    {/*)}*/}
                </div>
            </div>

            <div className="Editor-inner">
                <Editor
                    theme="cxd"
                    preview={preview}
                    isMobile={mobile}
                    value={store.schema}
                    onChange={onChange}
                    onPreview={() => store.setPreview(true)}
                    onSave={save}
                    className="is-fixed"
                    $schemaUrl={schemaUrl}
                    showCustomRenderersPanel={true}
                    amisEnv={{
                        fetcher: store.fetcher,
                        notify: store.notify,
                        alert: store.alert,
                        copy: store.copy,
                    }}
                />
            </div>
        </div>
    );
}

export default Amis;
