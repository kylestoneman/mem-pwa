const moment = require('moment');

// Public API
let helpers = {};

/**
 * Format dates
 *
 * Usage:
 *  {{dateFormat date 'MMMM D[, ] YYYY'}}
 *
 * @param {String} date
 * @param {String} format. default 'MMMM D, YYYY H[:]mm z'
 * @return {String}
 */

helpers.dateFormat = (date, format) => {
  let fmt = 'MMMM D, YYYY';

  if (format && typeof format === 'string') {
    fmt = format;
  }

  return moment(date).format(fmt);
};



helpers.urlEncode = (url) => {
	let encodedUrl = "";

	if (url && typeof url === 'string') {
		encodedUrl = encodeURI(url)
	}

	return encodedUrl;
}


module.exports = helpers;
