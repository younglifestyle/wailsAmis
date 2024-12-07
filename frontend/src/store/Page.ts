import {types} from 'mobx-state-tree';

export const PageStore = types
    .model('Page', {
        id: types.identifier,
        icon: '',
        path: '',
        label: '',
        currFile: '', // 新增路由对应的文件
        schema: types.frozen({})
    })
    .views(self => ({}))
    .actions(self => {
        function updateSchema(schema: any) {
            self.schema = schema;
        }

        function updateCurrFile(value: string) {
            self.currFile = value;
        }

        return {
            updateSchema,
            updateCurrFile
        };
    });

export type IPageStore = typeof PageStore.Type;
