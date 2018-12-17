import { FileInformation } from '../types/FileInformation';

const os = require('os');
const path = require('path');
const fs = require('fs-extra');

/**
 * File helper class
 */
export default class File {

  absolutePath: string;
  filePath: string;
  segments: FileInformation;

  /**
   * Create a new instance.
   *
   * @param {string} filePath
   */
  constructor(filePath: string) {
    this.absolutePath = path.resolve(filePath);
    this.filePath = this.relativePath();
    this.segments = this.parse();
  }

  /**
   * Static constructor.
   * @param {string} file
   * @return {File} New File instance
   */
  static find(file: string): File {
    return new File(file);
  }

  /**
   * Get the size of the file.
   * @return {number}
   */
  size(): number {
    return fs.statSync(this.path()).size;
  }

  /**
   * Determine if the given file exists.
   * @param {string} file
   * @return {boolean}
   */
  static exists(file: string): boolean {
    return fs.existsSync(file);
  }

  /**
   * Delete/Unlink the current file.
   */
  delete(): void {
    if (fs.existsSync(this.path())) {
      fs.unlinkSync(this.path());
    }
  }

  /**
   * Get the name of the file.
   * @return {string}
   */
  name(): string {
    return this.segments.file;
  }

  /**
   * Get the name of the file, minus the extension.
   * @return {string}
   */
  nameWithoutExtension(): string {
    return this.segments.name;
  }

  /**
   * Get the extension of the file.
   * @return {string}
   */
  extension(): string {
    return this.segments.ext;
  }

  /**
   * Get the absolute path to the file.
   * @return {string}
   */
  path(): string {
    return this.absolutePath;
  }

  /**
   * Get the relative path to the file, from the project root.
   * @return {string}
   */
  relativePath(): string {
    return path.relative(process.cwd(), this.path());
  }

  /**
   * Get the absolute path to the file, minus the extension.
   * @return {string}
   */
  pathWithoutExtension(): string {
    return this.segments.pathWithoutExt;
  }

  /**
   * Get the base directory of the file.
   * @return {string}
   */
  base(): string {
    return this.segments.base;
  }

  /**
   * Determine if the file is a directory.
   * @return {boolean}
   */
  isDirectory(): boolean {
    return this.segments.isDir;
  }

  /**
   * Determine if the path is a file, and not a directory.
   * @return {boolean}
   */
  isFile(): boolean {
    return this.segments.isFile;
  }

  /**
   * Write the given contents to the file.
   *
   * @param {string} body
   * @return {File}
   */
  write(body: object | string): File {
    let contents = body;
    if (typeof body === 'object') {
      contents = JSON.stringify(body, null, 4);
    }

    contents = contents + os.EOL;

    fs.writeFileSync(this.absolutePath, contents);

    return this;
  }

  /**
   * Read the file's contents.
   * @return {string}
   */
  read(): string {
    return fs.readFileSync(this.path(), {
      encoding: 'utf-8',
    });
  }

  /**
   * Copy the current file to a new location.
   * @param {string} destination
   * @return {File}
   */
  copyTo(destination: string): File {
    fs.copySync(this.path(), destination);
    return this;
  }

  /**
   * Rename the file.
   * @param {string} to
   * @return {File}
   */
  rename(to: string): File {
    const toPath = path.join(this.base(), to);
    fs.renameSync(this.path(), toPath);
    return new File(toPath);
  }

  /**
   * Parse the file path.
   * @return {object}
   */
  parse(): FileInformation {
    const parsed = path.parse(this.absolutePath);

    return {
      path: this.filePath,
      absolutePath: this.absolutePath,
      pathWithoutExt: path.join(parsed.dir, `${parsed.name}`),
      isDir: !parsed.ext && !parsed.name.endsWith('*'),
      isFile: !!parsed.ext,
      name: parsed.name,
      ext: parsed.ext,
      file: parsed.base,
      base: parsed.dir,
    };
  }
}
