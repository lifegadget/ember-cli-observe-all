import Ember from 'ember';
import ObserveAllMixin from 'ember-cli-observe-all/mixins/observe-all';
import { module, test } from 'qunit';

module('ObserveAllMixin');

// Replace this with your real tests.
test('it works', function(assert) {
  var ObserveAllObject = Ember.Object.extend(ObserveAllMixin);
  var subject = ObserveAllObject.create();
  assert.ok(subject);
});
