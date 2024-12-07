package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"net/http/httputil"
	"net/url"
	"sort"
	"strings"
)

// 代理处理器
type ProxyHandler struct {
	proxies     map[string]*httputil.ReverseProxy
	sortedPaths []string
}

// NewProxyHandler 创建代理处理器并排序路径
func NewProxyHandler(config *Config) (*ProxyHandler, error) {
	handler := &ProxyHandler{
		proxies: make(map[string]*httputil.ReverseProxy),
	}

	for _, proxyConfig := range config.Proxies {
		targetURL, err := url.Parse(proxyConfig.Target)
		if err != nil {
			return nil, err
		}

		proxy := httputil.NewSingleHostReverseProxy(targetURL)
		// 自定义 Director
		originalDirector := proxy.Director
		proxy.Director = func(req *http.Request) {
			originalDirector(req)
			req.Host = targetURL.Host

			// 设置配置文件中定义的头部
			for _, header := range config.ProxyHeaders {
				req.Header.Set(header.Key, header.Value)
			}
			for _, header := range proxyConfig.Headers {
				req.Header.Set(header.Key, header.Value)
			}
		}

		// 自定义 ModifyResponse
		proxy.ModifyResponse = func(resp *http.Response) error {
			resp.Header.Del("Access-Control-Allow-Origin")
			resp.Header.Del("Access-Control-Allow-Credentials")
			resp.Header.Del("Vary")
			resp.Header.Add("Access-Control-Allow-Headers", "Origin, Content-Length, Content-Type, Accept, Authorization, Content-Disposition")
			return nil
		}

		handler.proxies[proxyConfig.Path] = proxy
	}

	// 提取并排序路径，从长到短
	for path := range handler.proxies {
		handler.sortedPaths = append(handler.sortedPaths, path)
	}

	sort.Slice(handler.sortedPaths, func(i, j int) bool {
		return len(handler.sortedPaths[i]) > len(handler.sortedPaths[j])
	})

	return handler, nil
}

func (h *ProxyHandler) ServeHTTP(c *gin.Context) {
	requestPath := c.Request.URL.Path

	for _, path := range h.sortedPaths {
		if strings.HasPrefix(requestPath, path) {
			proxy := h.proxies[path]
			proxy.ServeHTTP(c.Writer, c.Request)
			return
		}
	}

	c.JSON(http.StatusNotFound, gin.H{"message": "Not found"})
}
