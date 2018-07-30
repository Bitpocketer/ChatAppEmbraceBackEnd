
import {knex} from '../services/DatabaseService';
import * as Bookshelf from 'bookshelf';

var bookshelf : Bookshelf = require('bookshelf')(knex);
bookshelf.plugin('registry');

export class ConversationOrmModel extends bookshelf.Model <ConversationOrmModel>{

    constructor(attributes?: any , options?: Bookshelf.ModelOptions) {

        super(attributes, options);

    }

    get tableName () {
        return 'conversation';
    }

}


