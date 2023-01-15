Caddy Mysql Config Adapter
==========================

This is a [config adapter](https://caddyserver.com/docs/config-adapters) for Caddy which Store And Update Configuration.

**This project is not complete, and we are asking the community to help finish its development.


Currently supported key in mysql table:

* verison 
* config (now all the configuration is in config key, should be seperate to others in future,welcome to create Pull Request )


Thank you, and we hope you have fun with it!

## Install

First, the [xcaddy](https://github.com/caddyserver/xcaddy) command:

```shell
$ go get -u github.com/caddyserver/xcaddy/cmd/xcaddy
```

Then build Caddy with this Go module plugged in. For example:

```shell
$ xcaddy build --with github.com/zhangjiayin/caddy-mysql-adapter
```

## Use

Using this config adapter is the same as all the other config adapters.

- [Learn about config adapters in the Caddy docs](https://caddyserver.com/docs/config-adapters)
- You can adapt your config with the [`adapt` command](https://caddyserver.com/docs/command-line#caddy-adapt)
```
caddy run --adapter mysql --config ./mysql.json
```
- mysql.json
```
{
  "dsn": "caddy_user:caddy_password@tcp(127.0.0.1:3306)/caddy?charset=utf8mb4",  //ref: https://github.com/go-sql-driver/mysql#dsn-data-source-name
  "maxLifetime": 180,  //in seconds , ref: https://pkg.go.dev/database/sql#DB.SetConnMaxLifetime
  "maxOpenConns": 10, //ref: https://pkg.go.dev/database/sql#DB.SetMaxOpenConns
  "maxIdleConns": 1, //ref: https://pkg.go.dev/database/sql#DB.SetMaxIdleConns
  "ConnMaxIdleTime": 60, //in seconds ,  ref: https://pkg.go.dev/database/sql#DB.SetConnMaxIdleTime
  "tableNamePrefix": "CADDY", //table prefix in mysql ,full table name should be CADDY_CONFIG
  "refreshInterval": 3 //in seconds ,  auto check version in  CADDY_CONFIG table,reload caddy server if the version updated.
}
```
- table schema (it shoud be created atomically)
```SQL
CREATE TABLE `CADDY_CONFIG` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `key` char(255) NOT NULL,
  `value` longtext,
  `created` int(11) DEFAULT NULL,
  `updated` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key_UNIQUE` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8
```
- table data should be 
```
INSERT INTO `CADDY_CONFIG` (`id`,`key`,`value`,`created`,`updated`) VALUES (1,'config','{\"apps\":{\"http\":{\"http_port\":80,\"https_port\":443,\"servers\":{\"srv0\":{\"listen\":[\":80\"],\"routes\":[{\"handle\":[{\"handler\":\"subroute\",\"routes\":[{\"handle\":[{\"body\":\"Hello, world!\",\"handler\":\"static_response\"}]}]}],\"match\":[{\"host\":[\"localhost\"]}],\"terminal\":true},{\"handle\":[{\"handler\":\"subroute\",\"routes\":[{\"handle\":[{\"body\":\"Hello, world!\",\"handler\":\"static_response\"}]}]}],\"match\":[{\"host\":[\"localhost1\"]}],\"terminal\":true}]}}}},\"logging\":{\"logs\":{\"default\":{\"level\":\"DEBUG\"}}},\"storage\":{\"connection_string\":\"postgres://caddy:caddy@localhost:5432/caddy?sslmode=disable\",\"module\":\"postgres\"}}',1673794123,1673794123);
INSERT INTO `CADDY_CONFIG` (`id`,`key`,`value`,`created`,`updated`) VALUES (2,'version','5',1673794123,1673794123);

```
