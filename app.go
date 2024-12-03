package main

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"os"
	"path/filepath"
	"time"
)

// App struct
type App struct {
	ctx     context.Context
	runPath string
}

// NewApp creates a new App application struct
func NewApp() *App {

	runPath, err := GetRunPath()
	if err != nil {
		err := os.WriteFile("error.log", []byte(fmt.Sprintf("获取运行所在目录错误:%s", err)), 0666)
		if err != nil {
			return nil
		}
	}
	return &App{runPath: runPath}
}

func (a *App) Notify(title, msg string) {
	a.message(title, msg, runtime.InfoDialog)
}

func (a *App) Warn(title, msg string) {
	a.message(title, msg, runtime.WarningDialog)
}

func (a *App) Error(title, msg string) {
	a.message(title, msg, runtime.ErrorDialog)
}

func (a *App) message(title, msg string, dialogType runtime.DialogType) {
	_, err := runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
		Type:    dialogType,
		Title:   title,
		Message: msg,
	})
	if err != nil {
		fmt.Errorf("error showing notification: %s", err)
	}
}

// startup is called at application startup
func (a *App) startup(ctx context.Context) {
	// Perform your setup here
	a.ctx = ctx
}

// domReady is called after the front-end dom has been loaded
func (a App) domReady(ctx context.Context) {
	// Add your action here
}

// shutdown is called at application termination
func (a *App) shutdown(ctx context.Context) {
	// Perform your teardown here
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s!", name)
}

type FileResp struct {
	FileName string
	FileData interface{}
}

func (a *App) SelectFile() (fileResp FileResp) {
	filename, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "amis模板文件",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "template file",
				Pattern:     "*.json;*.txt",
			},
		},
	})
	if err != nil {
		a.Error("open file error", err.Error())
		return
	}

	if filename == "" {
		return
	}

	data, err := os.ReadFile(filename)
	if err != nil {
		a.Error("Error importing workflow", err.Error())
		return
	}

	if len(data) == 0 {
		data = []byte(`{
  "type": "page",
  "title": "newPage",
  "body": [
    {
      "type": "tpl",
      "tpl": "这是你默认填充的页面内容。",
      "wrapperComponent": "",
      "inline": false,
      "id": "u:8a0fabf0ee75"
    }
  ]
}`)
	}

	var jsonData interface{}
	err = json.Unmarshal(data, &jsonData)
	if err != nil {
		a.Error("Error unmarshalling JSON", err.Error())
		return
	}
	return FileResp{
		FileName: filename,
		FileData: jsonData,
	}
}

func (a *App) ReadFileData(filename string) interface{} {
	if filename == "" {
		return nil
	}

	data, err := os.ReadFile(filename)
	if err != nil {
		a.Error("Error importing workflow", err.Error())
		return nil
	}

	var jsonData interface{}
	err = json.Unmarshal(data, &jsonData)
	if err != nil {
		a.Error("Error unmarshalling JSON", err.Error())
		return nil
	}
	return jsonData
}

func (a *App) SaveJsonToFile(filename string, fileData interface{}) string {

	// fileData map[string]interface
	jsonData, err := json.MarshalIndent(fileData, "", "  ")
	if err != nil {
		a.Error("保存json数据异常", err.Error())
		return err.Error()
	}

	baseFileName := filepath.Base(filename)
	baseHistoryFilePath := filepath.Join(a.runPath, "history", time.Now().Format("20060102"))
	_ = os.MkdirAll(baseHistoryFilePath, 0666)

	// 将数据写入历史文件
	err = os.WriteFile(filepath.Join(baseHistoryFilePath, generateNewFileName(baseFileName)),
		jsonData, 0666)
	if err != nil {
		a.Error("写入文件失败", fmt.Sprintf("文件: %s", err.Error()))
		return err.Error()
	}

	// 将数据写回源文件
	err = os.WriteFile(filename, jsonData, 0666)
	if err != nil {
		a.Error("写入文件失败", fmt.Sprintf("文件: %s", err.Error()))
		return err.Error()
	}
	return ""
}
