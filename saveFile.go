package main

import (
	"fmt"
	"os"
	"path/filepath"
	"time"
)

// GetRunPath 获取程序执行目录
func GetRunPath() (string, error) {
	path, err := filepath.Abs(filepath.Dir(os.Args[0]))
	return path, err
}

func generateNewFileName(originalFileName string) string {
	// 获取当前时间并格式化
	currentTime := time.Now()
	timeString := currentTime.Format("2006-01-02 15-04-05")

	// 使用 filepath 包提取文件名和扩展名
	ext := filepath.Ext(originalFileName)
	baseName := originalFileName[:len(originalFileName)-len(ext)]

	// 拼接新的文件名
	newFileName := fmt.Sprintf("%s %s%s", baseName, timeString, ext)

	return newFileName
}
