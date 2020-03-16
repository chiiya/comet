import {
  ApiModel,
  DocumentationPluginConfig,
  LoggerInterface,
  PluginInterface,
} from '@comet-cli/types';
import { readFile, writeFile, ensureDir } from 'fs-extra';
import { resolve, join } from 'path';
import { Stats } from 'webpack';
const { createBundleRenderer } = require('vue-server-renderer');
const webpack = require('webpack');

export default class DocumentationPlugin implements PluginInterface {
  public async execute(model: ApiModel, config: DocumentationPluginConfig, logger: LoggerInterface): Promise<any> {
    logger.spin('Compiling API documentation');
    const outputDir = resolve(config.output || './');

    // Compile server bundles
    // await this.compile([serverConfig]);
    const template = await this.getTemplate(config);
    const serverBundle = require(resolve(__dirname, '../dist/vue-ssr-server-bundle.json'));
    const renderer = createBundleRenderer(serverBundle, {
      runInNewContext: false,
      template: template,
    });

    const metaData = this.generateMetadata(config);

    const context = {
      model: model,
      config: config,
      title: this.getTitle(config, model),
      meta: metaData,
      styleTag: this.getStyleTag(config),
      jsTag: this.getJsTag(config),
    };
    const html = await renderer.renderToString(context);

    await ensureDir(outputDir);
    await writeFile(resolve(outputDir, 'index.html'), html);
    const assets = await this.bundleAssets(config);
    await ensureDir(join(outputDir, 'assets'));
    await writeFile(join(outputDir, 'assets', 'style.css'), assets.css);
    await writeFile(join(outputDir, 'assets', 'bundle.js'), assets.js);

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

  protected getTitle(config: DocumentationPluginConfig, model: ApiModel): string {
    if (config.data && config.data.title) {
      return config.data.title;
    }
    if (model.info.name) {
      return model.info.name;
    }
    return 'API Reference';
  }

  protected getStyleTag(config: DocumentationPluginConfig): string {
    if (config.data && config.data.asset_src) {
      const src = config.data.asset_src;
      const resolved = src !== '' && !src.endsWith('/') ? `${src}/` : src;
      return `<link rel="stylesheet" href="${resolved}style.css">`;
    }

    return '<link rel="stylesheet" href="assets/style.css">';
  }

  protected getJsTag(config: DocumentationPluginConfig): string {
    if (config.data && config.data.asset_src) {
      const src = config.data.asset_src;
      const resolved = src !== '' && !src.endsWith('/') ? `${src}/` : src;
      return `<script src="${resolved}bundle.js"></script>`;
    }

    return '<script src="assets/bundle.js"></script>';
  }

  protected async getTemplate(config: DocumentationPluginConfig): Promise<string> {
    let template = await readFile(resolve(__dirname, './index.template.html'), 'utf-8');
    if (config.template) {
      template = await readFile(resolve(config.template), 'utf-8');
    }
    return template;
  }

  protected generateMetadata(config: DocumentationPluginConfig): string | undefined {
    if (config.data && config.data.description) {
      return `
      <meta name="description" content="${config.data.description}">
      `;
    }
    return undefined;
  }

  protected async bundleAssets(config: DocumentationPluginConfig): Promise<{ css: string, js: string }> {
    let cssBundle =  await readFile(resolve(__dirname, 'assets/dist/style.css'), 'utf-8');
    const jsSource = await readFile(resolve(__dirname, 'assets/dist/bundle.js'), 'utf-8');
    const jsBundle = await readFile(resolve(__dirname, '../dist/app.js'), 'utf-8');
    if (config.css !== undefined) {
      const userCss = await readFile(resolve(config.css), 'utf-8');
      cssBundle += `\n${userCss}`;
    }
    return {
      css: cssBundle,
      js: `${jsSource}\n${jsBundle}`,
    };
  }
}
