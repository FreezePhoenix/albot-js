/**
 * Created by Nexus on 16.08.2017.
 */

var DataExchanger = function (publisher, id) {
    this.publisher = publisher;
    this.id = id;
    this.dataSource = {}
    this.modifications = []
};

DataExchanger.prototype.setDataSource = function(val) {
  this.dataSource = val;
}

DataExchanger.prototype.getData = function () {
    return this.dataSource;
};
const		forIn = ( obj, fn ) => entries( obj ).forEach( fn ),
		isObject = prop=>prop !== null && typeof prop === 'object',

		{ setPrototypeOf, entries, keys, create, assign } = Object,
		{ reduce } = Array.prototype,
		{ hasOwnProperty, toString } = Object.prototype,
		{ isArray } = Array,

		isDate = obj => obj instanceof Date,
		isRegExp = obj => obj instanceof RegExp;
/**
 * Tests if the properties of an object are equal, recursively.
 * @param {*} obj1 The first object to compare
 * @param {*} obj2 The second object to compate
 * @returns {boolean} Whether the objects are equal
 * @memberof XtraUtils.Object#
 */
function deepEqual( obj1, obj2 ) {
  const a = obj1,
        b = obj2;
  if ( a === b ) {
    return true;
  } else if ( a && b && typeof a === 'object' && typeof b === 'object' ) {
    const arrA = isArray( a ),
      arrB = isArray( b );
    let i, length, key;

    if ( arrA && arrB ) {
      length = a.length;
      if ( length !== b.length ) { return false; }
      for ( i = length; i-- !== 0; ) {
        if ( !deepEqual( a[i], b[i] ) ) {
          return false;
        }
      }
      return true;
    }

    if ( arrA !== arrB ) {
      return false;
    }

    const dateA = isDate( a ),
      dateB = isDate( b );

    if( dateA !== dateB ) {
      return false;
    }
    if ( dateA && dateB ) {
      return a.getTime() == b.getTime();
    }

    const regexpA = isRegExp( a ),
      regexpB = isRegExp( b );

    if ( regexpA !== regexpB ) {
      return false;
    }
    if ( regexpA && regexpB ) {
      return a.toString() === b.toString();
    }

    let keys1 = keys( a );
    length = keys1.length;

    if ( length !== keys( b ).length ) {
      return false;
    }
    for ( i = length; i-- !== 0; ) {
      if ( !hasOwnProperty.call( b, keys1[i] ) ) {
        return false;
      }
    }
    for ( i = length; i-- !== 0; ) {
      key = keys1[i];
      if ( !deepEqual( a[key], b[key] ) ) {
        return false;
      }
    }
    if( a.__proto__ !== b.__proto__ ) {
      return false;
    }

    return true;
  }

  return a !== a && b !== b;
}
DataExchanger.prototype.pushData = function (name, value) {
  if(!deepEqual(this.dataSource[name], value)) {
      this.modifications.push([name, value]);
  }
};
DataExchanger.prototype.flush = function (name, value) {
  if(this.modifications.length > 0) {
    this.publisher.flush(this.id, this.modifications);
    this.modifications.length = 0;
  }
};

module.exports = DataExchanger;