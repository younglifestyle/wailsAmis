package main

import (
	"github.com/fsnotify/fsnotify"
	"gopkg.in/yaml.v3"
	"log"
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
	DisableProxy bool          `yaml:"disable_proxy"`
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

	watchConfigFile(path)

	return nil
}

func watchConfigFile(path string) {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatal(err)
	}
	//defer watcher.Close()

	go func() {
		for {
			select {
			case event, ok := <-watcher.Events:
				if !ok {
					return
				}
				if event.Has(fsnotify.Write) {
					log.Println("modified file:", event.Name)
					var configTmp = &Config{}
					data, err := os.ReadFile(path)
					if err != nil {
						log.Printf("read config file:%s, %s\n", path, err)
						continue
					}

					err = yaml.Unmarshal(data, configTmp)
					if err != nil {
						log.Printf("unmarshal config file:%s, %s\n", path, err)
						continue
					}
					config = configTmp

					proxyHandlerTmp, err := NewProxyHandler()
					if err != nil {
						log.Printf("Error creating proxy handler: %v \n", err)
						continue
					}
					proxyHandler = proxyHandlerTmp
				}
			case err, ok := <-watcher.Errors:
				if !ok {
					return
				}
				log.Println("error:", err)
			}
		}
	}()

	err = watcher.Add(path)
	if err != nil {
		log.Fatal(err)
	}
}
