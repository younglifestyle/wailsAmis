package main

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"os"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
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
				Pattern:     "*.json",
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
		return ""
	}

	err = os.WriteFile(filename, jsonData, 0666)
	if err != nil {
		a.Error("写入文件失败", fmt.Sprintf("文件: %s", err.Error()))
		return ""
	}
	return ""
}
