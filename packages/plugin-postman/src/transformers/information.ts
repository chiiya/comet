import { ApiModel } from '@comet-cli/types';
import { PostmanInformation } from '../../types';
const uuidv4 = require('uuid/v4');

/**
 * Transform information section into Postman format.
 * @param model
 */
export const transformInformation = (model: ApiModel): PostmanInformation => {
  return {
    name: model.info.name,
    description: model.info.description,
    version: model.info.version,
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    _postman_id: uuidv4(),
  };
};
