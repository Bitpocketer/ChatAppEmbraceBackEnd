import {knex} from '../services/DatabaseService';
import * as Bookshelf from 'bookshelf';

var bookshelf: Bookshelf = require('bookshelf')(knex)

export class MessageOrmModel extends bookshelf.Model <MessageOrmModel> {

    constructor(attributes?: any , options?: Bookshelf.ModelOptions) {

        super(attributes, options);
    }

    get tableName() {
        return 'conversation_reply'
    }


    get idAttribute() {
        return 'cr_id';
    }
}

