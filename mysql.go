package mysqladapter

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	// "github.com/caddyserver/caddy/v2"
	"github.com/caddyserver/caddy/v2"
	"github.com/caddyserver/caddy/v2/caddyconfig"

	// "github.com/caddyserver/caddy/v2/modules/caddyhttp"

	_ "github.com/go-sql-driver/mysql"
)

func init() {
	caddyconfig.RegisterAdapter("mysql", Adapter{})
}

type MysqlAdapterConfig struct{
	Dsn string  `json:"dsn"`
	MaxLifetime int64  `json:"maxLifetime"`
	MaxOpenConns int64  `json:"maxOpenConns"`
	MaxIdleConns int64  `json:"maxIdleConns"`
	ConnMaxIdleTime int64 `json:"connMaxIdleTime"`
	TableNamePrefix string  `json:"tableNamePrefix"`
	RefreshInterval int64  `json:"refreshInterval"`
}

var db *sql.DB

var createTableSql = "CREATE TABLE `%s` ( `id` bigint(20) NOT NULL AUTO_INCREMENT, `key` char(255) NOT NULL, `value` longtext, `created` int(11) DEFAULT NULL, `updated` int(11) DEFAULT NULL, PRIMARY KEY (`id`), UNIQUE KEY `key_UNIQUE` (`key`) ) ENGINE=InnoDB DEFAULT CHARSET=utf8"
var tableName = ""

var config_version = "0"

type Adapter struct{}

func getDb(mysqlAdapterConfig MysqlAdapterConfig) (*sql.DB ,error){
	var err error
	if db == nil {
 		db,err = sql.Open("mysql", mysqlAdapterConfig.Dsn)
		if err != nil {
			return nil, err
		}
		db.SetConnMaxLifetime(time.Second * time.Duration(mysqlAdapterConfig.MaxLifetime))
		db.SetMaxOpenConns(int(mysqlAdapterConfig.MaxOpenConns))
		db.SetMaxIdleConns(int(mysqlAdapterConfig.MaxIdleConns))
		db.SetConnMaxIdleTime(time.Second*time.Duration(mysqlAdapterConfig.ConnMaxIdleTime))
		tableName =  mysqlAdapterConfig.TableNamePrefix + "_" + "CONFIG"

		var rows *sql.Rows

		rows,err = db.Query("SHOW TABLES LIKE \"" + tableName + "\"")
		if err != nil {  
			caddy.Log().Named("adapters.mysql.config").Error(fmt.Sprintf("Can not Run Check Table SQL Error %v",err))
		} 
		if(!rows.Next()) {
			createSQL := fmt.Sprintf(createTableSql,tableName)
			 _, err = db.Exec(createSQL)
			 if err != nil {
				caddy.Log().Named("adapters.mysql.config").Error(fmt.Sprintf(" Create Table Error %v",err))
				return nil,err
    		}
		}
		rows.Close()
	}
	return db,nil
}




func (a Adapter) Adapt(body []byte, options map[string]interface{}) (
	[]byte, []caddyconfig.Warning, error) {

	mysqlAdapterConfig := MysqlAdapterConfig{
		MaxLifetime:1,
		MaxOpenConns:10,
		MaxIdleConns:3,
		ConnMaxIdleTime:1,
		TableNamePrefix:"CADDY",
		RefreshInterval:100,
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
	config ,err = getConfiguration()
    if  err != nil {
		return nil, nil, err
    }

	config_version_new := getConfigVersion()
	config_version = config_version_new

	runCheckLoop(mysqlAdapterConfig)
	return config, nil, err
}

func getConfiguration() ([]byte,error ) {
	var value string
	var err error
	row := db.QueryRow("SELECT value FROM "+ tableName +" WHERE `key` = \"config\" LIMIT 1")
    if err := row.Scan(&value); err != nil {
		return nil, err
    }
	caddy.Log().Named("adapters.mysql.config").Debug(fmt.Sprintf("config %s",value))
	return []byte(value),err
}

func getConfigVersion() (string ){
	caddy.Log().Named("adapters.mysql.checkloop").Debug(fmt.Sprintf("getConfigVersion"))

	var version  = config_version
	var verRows *sql.Rows
	var err error
	verRows,err = db.Query("SELECT value FROM "+ tableName +" WHERE `key` = \"version\" LIMIT 1")
	caddy.Log().Named("adapters.mysql.checkloop").Debug(fmt.Sprintf("SELECT value FROM "+ tableName +" WHERE `key` = \"version\" LIMIT 1" + " getConfigVersion %v",err))
	if err != nil {
		caddy.Log().Named("adapters.mysql.load").Error(fmt.Sprintf("SELECT value FROM "+ tableName +" WHERE `key` = \"version\" LIMIT 1 %v",err))
	}	
	if(verRows.Next()){
		verRows.Scan(&version)
	}
	verRows.Close()
	return version
}
func refreshConfig(config_version_new string){
	config,err := getConfiguration()
	if err != nil {
		caddy.Log().Named("adapters.mysql.refreshConfig").Debug(fmt.Sprintf("err %v",err))
		return
	}
	config_version = config_version_new 
	caddy.Load(config, false)
}

func checkAndRefreshConfig(mysqlAdapterConfig MysqlAdapterConfig){
	config_version_new := getConfigVersion()
	if config_version_new != config_version {
		go refreshConfig(config_version_new)
	}
	caddy.Log().Named("adapters.mysql.checkloop").Debug(fmt.Sprintf("checkAndRefreshConfig config_version_new %s",config_version_new))
}

func runCheckLoop(mysqlAdapterConfig MysqlAdapterConfig) {
	done := make(chan bool)
	go func(t time.Duration) {
		tick := time.NewTicker(t).C
		for {
			select {
			// t has passed, so id can be destroyed
			case <-tick:
				caddy.Log().Named("adapters.mysql.checkloop").Debug(fmt.Sprintf("version %s",config_version))
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