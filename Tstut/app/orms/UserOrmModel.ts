
import {knex} from '../services/DatabaseService';
import * as Bookshelf from 'bookshelf';

var bookshelf : Bookshelf = require('bookshelf')(knex);
bookshelf.plugin('registry');

export class UserOrmModel extends bookshelf.Model <UserOrmModel>{

    constructor(attributes?: any , options?: Bookshelf.ModelOptions) {

        super(attributes, options);

    }

    get tableName () {
        return 'chatusers';
    }
}


