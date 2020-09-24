/**
 * File management plugin manager for Q3 datasources.
 * The following members and methods exist on the resulting schema object.
 *
 * @module PluginFilemanager
 * @param {Object} DatasourceInst The data model to attach file management capabilities
 * @param {Object} Datasource The data model to attach file management capabilities
 * @param {Object} AdapterInst The adapter used to perform file CRUD operations
 * @return {Function}
 *
 * @example
 * const AdapterS3 = require('@3merge/adapter-s3');
 * const PluginFilemanager = require('@3merge/plugin-filemanager');
 * const Q3 = require('q3-api');
 *
 * const s3 = AdapterS3({
 *    // see package for instance props
 * });
 *
 * Q3
 *   .initDatasource(
 *      Q3.Adapters.Mongo(
 *        process.env.CONNECTION
 *      ),
 *      [
 *        // register plugins
 *        PluginFilemanager(s3)
 *      ])
 *    .start(() => {
 *      // all datasources have been decorated
 *      Q3.datasources.test.getFilePath('foo.pdf');
 *    });
 *
 */

const makeFileContainerSchema = require('./fileContainerSchema');
const makeFileSchema = require('./fileSchema');

const PluginFilemanager = (AdapterInst) => (
  DatasourceInst,
  Datasource,
) =>
  makeFileContainerSchema(
    AdapterInst,
    DatasourceInst,
  ).extend({
    /**
     * Sub-document of sensitive file uploads.
     * @name uploads
     * @type {Array}
     */
    uploads: {
      type: [makeFileSchema(AdapterInst, Datasource).out()],
      select: false,
    },

    /**
     * The primary photo for the document.
     * @name featuredUpload
     * @type {String}
     */
    featuredUpload: {
      type: Datasource.Types.String,
    },
  });

module.exports = PluginFilemanager;
