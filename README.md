# Caddy Mysql Config Adapter

This is a [config adapter](https://caddyserver.com/docs/config-adapters) for Caddy which Store And Update Configuration.

- This project is not complete, and we are asking the community to help finish its development.

Currently supported key in mysql table:

- verison
- config (now all the configuration is in config key, should be seperate to others in future,welcome to create Pull Request https://caddyserver.com/docs/json/ https://caddyserver.com/docs/caddyfile/options)

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

![This is an image](./table.jpg)

- table DDL should like below

```SQL
CREATE TABLE `CADDY_CONFIG` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `key` char(255) NOT NULL,
  `value` longtext,
  `enable` tinyint(1) NOT NULL DEFAULT '1',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8
```

- table data should be

```
INSERT INTO `CADDY_CONFIG` (`id`,`key`,`value`,`enable`,`created`,`updated`) VALUES (NULL,'version','15',1,NULL,NULL);
INSERT INTO `CADDY_CONFIG` (`id`,`key`,`value`,`enable`,`created`,`updated`) VALUES (NULL,'config','{\"apps\":{\"http\":{\"http_port\":80,\"https_port\":443,\"servers\":{\"srv0\":{\"listen\":[\":80\"],\"routes\":[{\"handle\":[{\"handler\":\"subroute\",\"routes\":[{\"handle\":[{\"body\":\"Hello, world!\",\"handler\":\"static_response\"}]}]}],\"match\":[{\"host\":[\"localhost\"]}],\"terminal\":true},{\"handle\":[{\"handler\":\"subroute\",\"routes\":[{\"handle\":[{\"body\":\"Hello, world!\",\"handler\":\"static_response\"}]}]}],\"match\":[{\"host\":[\"localhost3\"]}],\"terminal\":true}]}}}},\"logging\":{\"logs\":{\"default\":{\"level\":\"DEBUG\"}}},\"storage\":{\"connection_string\":\"postgres://caddy:caddy@localhost:5432/caddy?sslmode=disable\",\"module\":\"postgres\"}}',1,NULL,NULL);
INSERT INTO `CADDY_CONFIG` (`id`,`key`,`value`,`enable`,`created`,`updated`) VALUES (NULL,'config.admin','{\n    \"listen\": \"localhost:2019\"\n  }',1,NULL,NULL);
INSERT INTO `CADDY_CONFIG` (`id`,`key`,`value`,`enable`,`created`,`updated`) VALUES (NULL,'config.storage',' {\n    \"connection_string\": \"postgres://caddy:caddy@localhost:5432/caddy?sslmode=disable\",\n    \"module\": \"postgres\"\n  }',1,NULL,NULL);
INSERT INTO `CADDY_CONFIG` (`id`,`key`,`value`,`enable`,`created`,`updated`) VALUES (NULL,'config.logging','{\n    \"logs\": {\n      \"default\": {\n        \"level\": \"DEBUG\",\n        \"writer\": {\n          \"filename\": \"./logs/access.log\",\n          \"output\": \"file\",\n          \"roll_keep\": 5,\n          \"roll_keep_days\": 30,\n          \"roll_size_mb\": 954\n        }\n      }\n    }\n  }',1,NULL,NULL);
INSERT INTO `CADDY_CONFIG` (`id`,`key`,`value`,`enable`,`created`,`updated`) VALUES (NULL,'config.apps','{\n    \"http\": {\n      \"http_port\": 80,\n      \"https_port\": 443,\n      \"servers\": {\n        \"srv0\": {\n          \"listen\": [\n            \":80\"\n          ],\n          \"routes\": [\n            {\n              \"handle\": [\n                {\n                  \"handler\": \"subroute\",\n                  \"routes\": [\n                    {\n                      \"handle\": [\n                        {\n                          \"body\": \"Hello, world!\",\n                          \"handler\": \"static_response\"\n                        }\n                      ]\n                    }\n                  ]\n                }\n              ],\n              \"match\": [\n                {\n                  \"host\": [\n                    \"localhost\"\n                  ]\n                }\n              ],\n              \"terminal\": true\n            }\n          ]\n        }\n      }\n    }\n  }',1,NULL,NULL);
INSERT INTO `CADDY_CONFIG` (`id`,`key`,`value`,`enable`,`created`,`updated`) VALUES (NULL,'config.apps.http.servers.srv0.routes','{\n  \"handle\": [\n    {\n      \"handler\": \"subroute\",\n      \"routes\": [\n        {\n          \"group\": \"group0\",\n          \"handle\": [\n            {\n              \"handler\": \"rewrite\",\n              \"uri\": \"/jonz\"\n            }\n          ],\n          \"match\": [\n            {\n              \"path\": [\n                \"/\"\n              ]\n            }\n          ]\n        },\n        {\n          \"handle\": [\n            {\n              \"handler\": \"reverse_proxy\",\n              \"headers\": {\n                \"request\": {\n                  \"set\": {\n                    \"Host\": [\n                      \"{http.reverse_proxy.upstream.hostport}\"\n                    ]\n                  }\n                }\n              },\n              \"transport\": {\n                \"protocol\": \"http\",\n                \"tls\": {}\n              },\n              \"upstreams\": [\n                {\n                  \"dial\": \"google.com:443\"\n                }\n              ]\n            }\n          ]\n        }\n      ]\n    }\n  ],\n  \"match\": [\n    {\n      \"host\": [\n        \"google.proxy.vip\"\n      ]\n    }\n  ],\n  \"terminal\": true\n}',1,NULL,NULL);


```

- mysql rows data means
  - `key` == "version" when you have a row with `key` if the `value` changed or added , the caddyserver should reload configuration in refreshInterval
  - `key` == "config" you can store the caddy json config in value completely.
  - `key` == "admin" admin json value in https://caddyserver.com/docs/json/
  - `key` == "storage" storage json value in https://caddyserver.com/docs/json/
  - `key` == "logging" logging json value in https://caddyserver.com/docs/json/
  - `key` == "apps" apps json value in https://caddyserver.com/docs/json/
  - `key` == "config.apps.http.servers.srv0.routes" if you have srv0 in config.apps.http.servers then you can add multiple config.apps.http.servers.srv0.routes rows , one row may be means a http host which to be access from browser, do not forget update the `version` after add or changed row value.
