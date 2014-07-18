receiver
========

FIS receiver on node.js

### use

```bash
$ git clone https://github.com/fex-team/receiver.git
$ cd receiver
$ npm install
$ node server.js # default port 8999, use `node server.js <port>` change port
```



# fis-conf.js 配置方式

### 本地目录方式
```javascript
fis.config.merge({
    deploy: {
        remote: {
            receiver: 'http://<host>:8999/receiver',
            from: '/public',
            //远端目录
            to: '/home/fis/www/'
        }
    }
});
```

### Ftp上传方式
```javascript
fis.config.merge({
    deploy: {
        remote: {
            receiver: 'http://<host>:8999/receiver/ftp',
            from: '/',
            //远端ftp目录
            to: '/test/'
        }
    }
});
```
> ftp登陆账号，在receiver项目根目录新建文件 .ftppass
> 文件内容：
```javascript
{
  host: "myserver.com",
  port: 3331, // defaults to 21
  user: "user", // defaults to "anonymous"
  pass: "1234" // defaults to "@anonymous"
}
```

