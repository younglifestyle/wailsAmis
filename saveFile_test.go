package main

import (
	"encoding/json"
	"fmt"
	"path/filepath"
	"testing"
	"time"
)

func TestFileName(t *testing.T) {
	fmt.Println(generateNewFileName("E:\\Project\\linkSee\\GoAmis\\pages\\printerEditor - 副本.json"))
}

func TestBaseFile(t *testing.T) {
	fmt.Println(filepath.Base("E:\\Project\\linkSee\\GoAmis\\pages\\printerEditor - 副本.json"))
	fmt.Println(filepath.Dir("E:\\Project\\linkSee\\GoAmis\\pages\\printerEditor - 副本.json"))
	fmt.Println(generateNewFileName("E:\\Project\\linkSee\\GoAmis\\pages\\printerEditor - 副本.json"))

	runPath, _ := GetRunPath()
	baseHistoryFilePath := filepath.Join(runPath, "history", time.Now().Format("20060102"))
	fmt.Println(baseHistoryFilePath)
}

func TestJson(t *testing.T) {
	jsonData, err := json.MarshalIndent([]byte{}, "", "  ")
	if err != nil {
		fmt.Println(err)
	}

	fmt.Println(string(jsonData))
}
