"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Redis = require("ioredis");
class RedisHandler {
    constructor() {
        this.redisOptions = {
            retryStrategy: function (times) {
                if (times < 3) {
                    return 200;
                }
                return false;
            },
            lazyConnect: true,
            maxRetriesPerRequest: 1
        };
    }
    connect(redisHost) {
        return new Promise(resolve => {
            this.redisClient = new Redis(redisHost, this.redisOptions);
            this.redisClient.connect(function () {
                resolve();
            });
        });
    }
    setTlsOn() {
        this.redisOptions.tls = true;
    }
    disconnect() {
        if (this.redisClient) {
            this.redisClient.disconnect();
        }
    }
    get isConnected() {
        if (this.redisClient) {
            return true;
        }
        return false;
    }
    getValue(key) {
        if (!this.isConnected) {
            return Promise.reject();
        }
        return new Promise((resolve, reject) => {
            this.redisClient.hgetall(`${key}`, (error, result) => {
                if (error) {
                    this.redisClient.get(`${key}`, (error, singleResult) => {
                        if (error) {
                            console.log(error);
                            reject();
                        }
                        resolve(singleResult);
                    });
                    return;
                }
                resolve(result);
            });
        }).catch(e => {
            console.log(e);
            return {};
        });
    }
    /**
     * This function returns all the redis keys after filtering using text pattern
     * Warning: This uses Redis keys() method, that should not be used in production environment
     * with large number of keys.
     * @param pattern Text pattern to use and filter the Redis keys
     */
    getKeys(pattern) {
        if (!this.isConnected) {
            return Promise.reject();
        }
        return new Promise((resolve, reject) => {
            this.redisClient.keys(pattern, (error, result) => {
                if (error) {
                    reject();
                    return;
                }
                resolve(result.sort());
            });
        }).catch(() => {
            return [];
        });
    }
    /**
     * This function returns all the redis keys after filtering using text pattern.
     * This method can be safetly used in production environment, as it reads small set of records on
     * each scan request.
     * @param pattern Text pattern to use and filter the Redis keys
     */
    getKeysV2(pattern, scanLimit) {
        if (!this.isConnected) {
            return Promise.reject();
        }
        return new Promise((resolve, reject) => {
            let stream = this.redisClient.scanStream({ match: pattern, count: scanLimit });
            let result = [];
            stream.on('data', (resultKeys) => {
                for (var i = 0; i < resultKeys.length; i++) {
                    result.push(resultKeys[i]);
                }
            });
            stream.on('error', (err) => {
                console.log(err);
                reject();
                return;
            });
            stream.on('end', () => {
                resolve(result.sort());
            });
        }).catch(() => {
            return [];
        });
    }
    getInfo() {
        if (!this.isConnected) {
            return Promise.reject();
        }
        return new Promise((resolve, reject) => {
            this.redisClient.info((error, result) => {
                if (error) {
                    reject();
                    return;
                }
                resolve(result);
            });
        }).catch(() => {
            return "";
        });
    }
    setObject(key, value) {
        if (!this.isConnected) {
            return;
        }
        let keys = Object.keys(value);
        let convertArr = [];
        for (let key of keys) {
            convertArr.push(key);
            convertArr.push(value[key]);
        }
        this.redisClient.hmset(key, convertArr);
    }
    setValue(key, value) {
        if (!this.isConnected) {
            return;
        }
        this.redisClient.set(key, value);
    }
    delete(key) {
        if (!this.isConnected) {
            return;
        }
        this.redisClient.del(key);
    }
    flushAll() {
        if (!this.isConnected) {
            return;
        }
        this.redisClient.flushall();
    }
}
exports.default = RedisHandler;
//# sourceMappingURL=RedisHandler.js.map