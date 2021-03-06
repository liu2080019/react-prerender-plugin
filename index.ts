import * as fs from 'fs';
import * as path from'path';
import StaticRender from './src/static-render';
import Server from './src/server';
import DealFile from './src/deal-file';
const mkdirp = require('mkdirp-promise');
const { minify } = require('html-minifier');
const PORT = 6789;

interface argsType {
  // 路由地址
  routes: any[],
  // 资源文件
  resource: any,
  // 渲染延迟
  delay: number,
  // 端口
  port: number,
  // log
  isLog: boolean
}

function PreRenderPlugin (args: argsType) {
  this._server = new Server(args.resource, PORT);
  this._staticRender = new StaticRender(args.routes, args.delay, args.port || PORT, args.isLog || false);
  this._dealFile = new DealFile(args.resource);
}

PreRenderPlugin.prototype.apply = function (compiler: any) {
  compiler.plugin('after-emit', async (compilation: any, done: any) => {
    await this._server.init();
    await this._staticRender.init();
    const res = await this._staticRender.go();
    await this._dealFile.createHtml(res);
    this._server.closeFunc();
    this._staticRender.closeFunc();
    done();
  })
};

module.exports = PreRenderPlugin;
