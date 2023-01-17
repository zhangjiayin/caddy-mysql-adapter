package mysqladapter

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/caddyserver/caddy/v2"
	"github.com/caddyserver/caddy/v2/caddyconfig"
	"github.com/caddyserver/caddy/v2/modules/caddyhttp"

	_ "github.com/go-sql-driver/mysql"
)

func init() {
	caddyconfig.RegisterAdapter("mysql", Adapter{})
}

type MysqlAdapterConfig struct {
	Dsn             string `json:"dsn"`
	MaxLifetime     int64  `json:"maxLifetime"`
	MaxOpenConns    int64  `json:"maxOpenConns"`
	MaxIdleConns    int64  `json:"maxIdleConns"`
	ConnMaxIdleTime int64  `json:"connMaxIdleTime"`
	TableNamePrefix string `json:"tableNamePrefix"`
	RefreshInterval int64  `json:"refreshInterval"`
}

var db *sql.DB

var createTableSql = "CREATE TABLE `%s` ( `id` bigint(20) NOT NULL AUTO_INCREMENT, `key` char(255) NOT NULL, `value` longtext, `enable` tinyint(1) NOT NULL DEFAULT '1',   `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (`id`),  KEY `key` (`key`) ) ENGINE=InnoDB DEFAULT CHARSET=utf8"
var tableName = ""

var config_version = "0"

type Adapter struct{}

func getDb(mysqlAdapterConfig MysqlAdapterConfig) (*sql.DB, error) {
	var err error
	if db == nil {
		db, err = sql.Open("mysql", mysqlAdapterConfig.Dsn)
		if err != nil {
			return nil, err
		}
		db.SetConnMaxLifetime(time.Second * time.Duration(mysqlAdapterConfig.MaxLifetime))
		db.SetMaxOpenConns(int(mysqlAdapterConfig.MaxOpenConns))
		db.SetMaxIdleConns(int(mysqlAdapterConfig.MaxIdleConns))
		db.SetConnMaxIdleTime(time.Second * time.Duration(mysqlAdapterConfig.ConnMaxIdleTime))
		tableName = mysqlAdapterConfig.TableNamePrefix + "_" + "CONFIG"

		var rows *sql.Rows

		rows, err = db.Query("SHOW TABLES LIKE \"" + tableName + "\"")
		if err != nil {
			caddy.Log().Named("adapters.mysql.config").Error(fmt.Sprintf("Can not Run Check Table SQL Error %v", err))
		}
		if !rows.Next() {
			createSQL := fmt.Sprintf(createTableSql, tableName)
			_, err = db.Exec(createSQL)
			if err != nil {
				caddy.Log().Named("adapters.mysql.config").Error(fmt.Sprintf(" Create Table Error sql: %s err: %v", createSQL, err))
				return nil, err
			}
		}
		rows.Close()
	}
	return db, nil
}

func getValueFromDb(key string) (string, error) {
	var value string
	rows, err := db.Query("SELECT value FROM " + tableName + " WHERE `key` = \"" + key + "\" AND `enable` = 1 ORDER BY CREATED DESC LIMIT 1")
	if err != nil {
		return value, err
	}
	if rows.Next() {
		rows.Scan(&value)
	}
	return value, err
}

func getValuesFromDb(key string) ([]string, error) {
	var values []string
	rows, err := db.Query("SELECT value FROM " + tableName + " WHERE `key` = \"" + key + "\"  AND `enable` = 1  ORDER BY CREATED DESC")
	if err != nil {
		return values, err
	}
	for rows.Next() {
		var value string
		rows.Scan(&value)
		//加入数组
		values = append(values, value)
	}
	return values, err
}

// func getConfiguration() ([]byte, error) {
// 	return getConfigurationv1()
// 	var value string
// 	var err error
// 	row := db.QueryRow("SELECT value FROM " + tableName + " WHERE `key` = \"config\" ORDER BY CREATED DESC LIMIT 1")
// 	if err := row.Scan(&value); err != nil {
// 		return nil, err
// 	}
// 	caddy.Log().Named("adapters.mysql.config").Debug(fmt.Sprintf("config %s", value))
// 	return []byte(value), err
// }

func getConfiguration() ([]byte, error) {
	var value string
	var err error

	value, err = getValueFromDb("config")
	if err != nil {
		return nil, err
	}
	caddy.Log().Named("adapters.mysql.config").Debug(fmt.Sprintf("config %s", value))

	config := caddy.Config{}

	if value != "" {
		err = json.Unmarshal([]byte(value), &config)
		if err != nil {
			return nil, err
		}
	}

	value, err = getValueFromDb("config.admin")
	if err == nil && value != "" {
		if config.Admin == nil {
			configAdmin := &caddy.AdminConfig{}
			err = json.Unmarshal([]byte(value), configAdmin)
			config.Admin = configAdmin
		} else {
			err = json.Unmarshal([]byte(value), config.Admin)
		}
	}
	value, err = getValueFromDb("config.logging")
	if err == nil && value != "" {
		if config.Logging == nil {
			configLogging := &caddy.Logging{}
			err = json.Unmarshal([]byte(value), configLogging)
			config.Logging = configLogging
		} else {
			err = json.Unmarshal([]byte(value), config.Logging)
		}
	}
	value, err = getValueFromDb("config.storage")
	if err == nil && value != "" {
		if config.StorageRaw == nil {
			configStorageRaw := json.RawMessage{}
			err = json.Unmarshal([]byte(value), &configStorageRaw)
			config.StorageRaw = configStorageRaw
		} else {
			err = json.Unmarshal([]byte(value), &config.StorageRaw)
		}
	}

	value, err = getValueFromDb("config.apps")
	if err == nil && value != "" {
		if config.AppsRaw == nil {
			configAppsRaw := caddy.ModuleMap{}
			err = json.Unmarshal([]byte(value), &configAppsRaw)
			config.AppsRaw = configAppsRaw
		} else {
			err = json.Unmarshal([]byte(value), &config.AppsRaw)
		}
	}
	if config.AppsRaw != nil {
		for k := range config.AppsRaw {
			if k == "http" {
				httpAppConfig := config.AppsRaw["http"]

				httpApp := caddyhttp.App{}
				err := json.Unmarshal(httpAppConfig, &httpApp)
				httpAppChanged := false
				if err == nil {
					if httpApp.Servers != nil {
						for serverKey := range httpApp.Servers {
							var values []string
							values, err = getValuesFromDb("config.apps.http.servers." + serverKey + ".routes")
							if err == nil && len(values) > 0 {
								if httpApp.Servers[serverKey].Routes == nil {
									httpApp.Servers[serverKey].Routes = make([]caddyhttp.Route, 0)
								}
								for _, routeJson := range values {
									var route caddyhttp.Route
									err = json.Unmarshal([]byte(routeJson), &route)
									if err == nil {
										httpApp.Servers[serverKey].Routes = append(httpApp.Servers[serverKey].Routes, route)
										httpAppChanged = true
									} else {
										caddy.Log().Named("adapters.mysql.config").Error(fmt.Sprintf("config.apps.http.servers."+serverKey+".routes %v", err))
									}

								}
							}
						}
					}
				} else {
					caddy.Log().Named("adapters.mysql.config").Error(fmt.Sprintf("error when  json.Unmarshal(httpConfig, &httpApp) %v", httpAppConfig))
				}
				if httpAppChanged {
					var warnings []caddyconfig.Warning
					config.AppsRaw["http"] = caddyconfig.JSON(&httpApp, &warnings)
					if len(warnings) > 0 {
						caddy.Log().Named("adapters.mysql.config").Warn(fmt.Sprintf(" caddyconfig.JSON(&httpApp, &warnings) %v", warnings))
					}
				}

			}
		}
	}

	return json.Marshal(config)
}

func (a Adapter) Adapt(body []byte, options map[string]interface{}) (
	[]byte, []caddyconfig.Warning, error) {

	mysqlAdapterConfig := MysqlAdapterConfig{
		MaxLifetime:     1,
		MaxOpenConns:    10,
		MaxIdleConns:    3,
		ConnMaxIdleTime: 1,
		TableNamePrefix: "CADDY",
		RefreshInterval: 100,
	}

	err := json.Unmarshal(body, &mysqlAdapterConfig)

	if err != nil {
		return nil, nil, err
	}

	if mysqlAdapterConfig.Dsn == "" {
		caddy.Log().Named("adapters.mysql.config").Error(fmt.Sprintf(" Dsn Not Found"))
		panic("CaddyMysqlAdapter Dsn Not Found")
	}

	db, err = getDb(mysqlAdapterConfig)
	if err != nil {
		return nil, nil, err
	}

	var config []byte
	config, err = getConfiguration()
	if err != nil {
		return nil, nil, err
	}

	config_version_new := getConfigVersion()
	config_version = config_version_new

	runCheckLoop(mysqlAdapterConfig)
	return config, nil, err
}

func getConfigVersion() string {
	caddy.Log().Named("adapters.mysql.checkloop").Debug(fmt.Sprintf("getConfigVersion"))

	var version = config_version
	var rows *sql.Rows
	var err error
	rows, err = db.Query("SELECT value FROM " + tableName + " WHERE `key` = \"version\" AND `enable` = 1  ORDER BY CREATED DESC LIMIT 1")
	caddy.Log().Named("adapters.mysql.checkloop").Debug(fmt.Sprintf("SELECT value FROM "+tableName+" WHERE `key` = \"version\" AND `enable` = 1  LIMIT  ORDER BY CREATED DESC "+" getConfigVersion %v", err))
	if err != nil {
		caddy.Log().Named("adapters.mysql.load").Error(fmt.Sprintf("SELECT value FROM "+tableName+" WHERE `key` = \"version\" AND `enable` = 1  LIMIT  ORDER BY CREATED DESC %v", err))
	}
	if rows.Next() {
		rows.Scan(&version)
	}
	rows.Close()
	return version
}
func refreshConfig(config_version_new string) {
	config, err := getConfiguration()
	if err != nil {
		caddy.Log().Named("adapters.mysql.refreshConfig").Debug(fmt.Sprintf("err %v", err))
		return
	}
	config_version = config_version_new
	caddy.Load(config, false)
}

func checkAndRefreshConfig(mysqlAdapterConfig MysqlAdapterConfig) {
	config_version_new := getConfigVersion()
	if config_version_new != config_version {
		refreshConfig(config_version_new)
	}
	caddy.Log().Named("adapters.mysql.checkloop").Debug(fmt.Sprintf("checkAndRefreshConfig config_version_new %s", config_version_new))
}

func runCheckLoop(mysqlAdapterConfig MysqlAdapterConfig) {
	done := make(chan bool)
	go func(t time.Duration) {
		tick := time.NewTicker(t).C
		for {
			select {
			// t has passed, so id can be destroyed
			case <-tick:
				caddy.Log().Named("adapters.mysql.checkloop").Debug(fmt.Sprintf("version %s", config_version))
				// We are finished destroying stuff
				checkAndRefreshConfig(mysqlAdapterConfig)
			case <-done:
				caddy.Log().Named("adapters.mysql.checkloop").Debug(fmt.Sprintf("destroying"))
				return
			}
		}

	}(time.Second * time.Duration(mysqlAdapterConfig.RefreshInterval))
}

var _ caddyconfig.Adapter = (*Adapter)(nil)
