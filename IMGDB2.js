/*
* 参数
* db: 已建或未建数据库
* pouchId: 数据库唯一的主键_id
* src： 图片img的DOM对象
* bg： 判断是否是背景图
* */
function addTodo(db, pouchId,src,bg) {
    // 查询数据库中是否有该文档 根据主键pouchId查询
    db.get(pouchId).then(function(doc) {
        return db.put({         //  如有该文档 则更新版本号_rev
            _id: pouchId,
            _rev: doc._rev,     // 版本号
            imgFile:doc.imgFile     //图片Blob对象
        });
    }).then(function(response) {
        // handle response
        console.log('查询成功');     // 文档查询成功
        console.log(response);       // 响应查询文档信息
        db.get(pouchId).then(function (doc) {   // 查询数据库中该主键_id的文档信息
            // handle doc
            var imgBlob = doc.imgFile  // blob图片对象
            console.log(imgBlob)
            // 判断是否存在该图片对象Blob
            if (imgBlob) {
                // 传入blob对象 dom对象
                showImg(imgBlob, src,bg);
            } else {
                getByRequest(db,pouchId, src);
            }
        }).catch(function (err) {
            console.log(err);
        });

    }).catch(function (err) {
        console.log(err);
        console.log('查询失败，进行创建')    // 文档查询失败
        // 新建文档
        db.put({
            _id: pouchId
        }).then(function (response) {
            // handle response
            console.log('创建成功')
        }).catch(function (err) {
            console.log(err);
        });
    });
}

// 传入blob对象 显示图片
function showImg(imgFile, src,bg) {

    console.log("showImg" + imgFile);

    // Get window.URL object
    var URL = window.URL || window.webkitURL;

    // Create and revoke ObjectURL
    // 利用blob对象 创建一个URL对象
    var imgURL = URL.createObjectURL(imgFile);

    // Set img src to ObjectURL
    // 获取图片的dom对象 并将URL设置为该对象的SRC
    var imgElephant = document.getElementById(src);
    if(!bg){
        imgElephant.setAttribute("src", imgURL);
    }else{
        imgElephant.style.background = "url("+imgURL+")";
    }


    // Revoking ObjectURL
    // 当图片加载完成后
    // 使用URL.revokeObjectURL() 方法释放之前创建的URL对象
    imgElephant.onload = function () {
        window.URL.revokeObjectURL(this.src);
    }
}

// 当数据库查询主键 无该图片数据时 通过项目自身存储图片blob
function getByRequest(db,pouchId, src) {
    // Create XHR
    var xhr = new XMLHttpRequest(), // 创建 XMLHttpRequest 对象   目前请求项目自身
        blob;
    xhr.open("GET", pouchId, true);   // 在项目中get请求该图片
    // Set the responseType to blob
    // 将响应类型设为blob类型
    xhr.responseType = "blob";
    // 响应加载
    xhr.addEventListener("load", function () {
        // 响应为200 请求完成
        if (xhr.status === 200) {
            console.log("Image retrieved");

            // Blob as response
            blob = xhr.response;  // blob对象为响应后的对象
            console.log("Blob:" + blob);
            //  获得blob图片信息  存入pouchDB文档
            save(db,blob, pouchId);
            //  从pouchDB查询该文档
            showImg(blob, src);
        }
    }, false);
    // Send XHR
    xhr.send();
}

//根据blob对象为keyPath  更新键值
function save(db,blob, pouchId) {
    // 根据主键_id 查询文档 并追加文档imgFile内容 更新版本号_rev
    db.get(pouchId).then(function(doc) {
        return db.put({
            _id: pouchId,
            _rev: doc._rev,
            imgFile: blob
        });
    }).then(function(response) {
        // handle response
        console.log('图片存储成功')
        console.log(response)
    }).catch(function (err) {
        console.log(err);
    });

}
