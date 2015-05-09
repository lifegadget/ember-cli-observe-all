/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-cli-observe-all',
  description: 'A Mixin to help you monitor change in objects',
	included: function(app) {
		this._super.included(app);
  }
};
