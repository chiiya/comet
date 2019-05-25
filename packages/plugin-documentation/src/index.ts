import {
  ApiModel,
  DocumentationPluginConfig,
  LoggerInterface,
  PluginInterface,
} from '@comet-cli/types';
import { readFile, writeFile, ensureDir } from 'fs-extra';
import { resolve } from 'path';
import { Stats } from 'webpack';
const { createBundleRenderer } = require('vue-server-renderer');
const webpack = require('webpack');
const clientConfig = require('../config/webpack.client.config.js');
const serverConfig = require('../config/webpack.server.config.js');

export default class DocumentationPlugin implements PluginInterface {
  public async execute(model: ApiModel, config: DocumentationPluginConfig, logger: LoggerInterface): Promise<any> {
    logger.spin('Compiling API documentation');
    const outputDir = resolve(config.output || './');
    await this.compile([serverConfig, clientConfig]);
    const serverBundle = require(resolve(__dirname, '../dist/vue-ssr-server-bundle.json'));
    const renderer = createBundleRenderer(serverBundle, {
      runInNewContext: false,
      template: await readFile(resolve(__dirname, './index.template.html'), 'utf-8'),
    });
    const context = {
      model: model,
    };
    const html = await renderer.renderToString(context);
    await ensureDir(outputDir);
    await writeFile(resolve(outputDir, 'documentation.html'), html);
    // const cssSource = await readFile(css, 'utf-8');
    // const jsSource = await readFile(js, 'utf-8');
    // const jsBundle = await readFile(resolve(__dirname, '../dist/app.js'), 'utf-8');
    // await writeFile(resolve(outputDir, 'style.css'), cssSource);
    // await writeFile(resolve(outputDir, 'bundle.js'), `${jsSource}${jsBundle}`);

    logger.succeed('API documentation compiled');
  }

  public name(): string {
    return 'documentation';
  }

  protected compile(config: any[]) {
    return new Promise((resolve, reject) => {
      webpack(config, (error: Error, stats: Stats) => {
        if (error) {
          return reject(error);
        }
        if (stats.hasErrors()) {
          stats.toJson().errors.forEach((err) => {
            console.error(err);
          });
          reject(new Error('Failed to compile with errors.'));
          return;
        }
        resolve(stats.toJson({ modules: false }));
      });
    });
  }
}
