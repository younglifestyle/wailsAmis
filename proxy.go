package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"log"
	"strings"
	"time"
)

var proxyHandler *ProxyHandler

func proxyHttp() {
	var err error

	// 创建代理处理器
	proxyHandler, err = NewProxyHandler()
	if err != nil {
		log.Fatalf("Error creating proxy handler: %v", err)
	}

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://wails.localhost"},
		AllowMethods:     []string{"PUT", "PATCH", "GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length", "Content-Type", "Content-Disposition"},
		AllowCredentials: true,
		MaxAge:           24 * time.Hour,
	}))
	r.Any("/*proxyPath", filterEmptyQueryParams(), func(c *gin.Context) {
		proxyHandler.ServeHTTP(c)
	})

	err = r.Run("127.0.0.1:32155")
	if err != nil {
		log.Fatal(err)
	}
}

func filterEmptyQueryParams() gin.HandlerFunc {
	return func(c *gin.Context) {
		query := c.Request.URL.Query()
		for key, values := range query {
			var nonEmptyValues []string
			for _, value := range values {
				if strings.TrimSpace(value) != "" {
					nonEmptyValues = append(nonEmptyValues, value)
				}
			}
			if len(nonEmptyValues) > 0 {
				query[key] = nonEmptyValues
			} else {
				delete(query, key)
			}
		}
		c.Request.URL.RawQuery = query.Encode()
		c.Next()
	}
}

func proxy(c *gin.Context) {

	//remote, err := url.Parse(config.ProxyDomain)
	//if err != nil {
	//    log.Fatal(err)
	//}
	//
	//proxy := httputil.NewSingleHostReverseProxy(remote)
	//proxy.Director = func(req *http.Request) {
	//    req.Header = c.Request.Header
	//    req.Host = remote.Host
	//    req.URL.Scheme = remote.Scheme
	//    req.URL.Host = remote.Host
	//    req.URL.Path = c.Param("proxyPath")
	//
	//    // 设置配置文件中定义的头部
	//    for _, header := range config.ProxyHeaders {
	//        req.Header.Set(header.Key, header.Value)
	//    }
	//}
	//proxy.ModifyResponse = func(resp *http.Response) error {
	//    resp.Header.Del("Access-Control-Allow-Origin")
	//    resp.Header.Del("Access-Control-Allow-Credentials")
	//    resp.Header.Del("vary")
	//    resp.Header.Add("Access-Control-Allow-Headers", "Origin, Content-Length, Content-Type, Accept, Authorization, Content-Disposition")
	//    return nil
	//}
	//
	//proxy.ServeHTTP(c.Writer, c.Request)
}
