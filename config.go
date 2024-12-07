package main

import (
	"gopkg.in/yaml.v3"
	"os"
)

type ProxyHeader struct {
	Key   string `yaml:"key"`
	Value string `yaml:"value"`
}

type ProxyConfig struct {
	Path    string        `yaml:"path"`
	Target  string        `yaml:"target"`
	Headers []ProxyHeader `yaml:"headers"`
}

type Config struct {
	Proxies      []ProxyConfig `yaml:"proxies"`
	ProxyHeaders []ProxyHeader `yaml:"proxy_headers"`
}

// loadConfig 从指定路径加载 YAML 配置文件
func loadConfig(path string) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}

	err = yaml.Unmarshal(data, config)
	if err != nil {
		return err
	}

	return nil
}
