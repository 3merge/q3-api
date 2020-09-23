/**
 * File management plugin manager for Q3 datasources.
 * @module CoreFilemanager
 * @param {Object} DatasourceInst The data model to attach file management capabilities
 * @param {Object} AdapterInst The adapter used to perform file CRUD operations
 * @example
 * const S3Adapter = require('@3merge/adapter-s3');
 * const CoreFilemanager = require('@3merge/core-filemanager');
 * const { Schemas } = require('q3-api');
 *
 * // Schemas.Sample now has several methods appended to its object
 * CoreFilemanager(Schemas.Sample, S3Adapter())
 */
const plugins = require('./plugins');

const CoreFilemanager = (DatasourceInst, AdapterInst) => {
  const plugin = plugins[DatasourceInst.strategy];

  if (plugin && typeof DatasourceInst.extend === 'function')
    DatasourceInst.extend(plugin(AdapterInst));
};

module.exports = CoreFilemanager;
