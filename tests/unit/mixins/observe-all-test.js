import Ember from 'ember';
const { computed, observer, $, A, run, on, typeOf, defineProperty } = Ember;    // jshint ignore:line

import ObserveAllMixin from 'ember-cli-observe-all/mixins/observe-all';
import { module, test } from 'qunit';

module('ObserveAllMixin');

let TestObject = Ember.Object.extend(ObserveAllMixin, {
  foo: 'foo'
});

// Replace this with your real tests.
test('it works', function(assert) {
  var ObserveAllObject = Ember.Object.extend(ObserveAllMixin);
  var subject = ObserveAllObject.create();
  assert.ok(subject);
});

test('does NOT observe properties before create()', function(assert) {
  assert.expect(3);
  let watched = TestObject.create({
    bar: 'bar'
  });
  let watcher = computed('watched', function() {
    throw(new Error("the foo property changed but it shouldn't have been observed"));
  });
  assert.equal('foo', watched.foo);
  assert.equal('bar', watched.bar);
  watched.set('foo','foey');  
  assert.equal('foey', watched.foo);
});

test('does NOT observe properties which prefixed with "_"', function(assert) {
  let done = assert.async();
  assert.expect(3);
  let watched = TestObject.create({
    _bar: 'bar',
    _propertyChangedCallback: function() {
        this.set('_somethingBadHappened', true);
        done();
    }
  });
  watched.set('_somethingBadHappened', false);
  assert.equal(watched._bar, 'bar');
  watched.set('_bar','barred');
  run.later( () => {
    assert.equal(watched.get('_bar'), 'barred');
    assert.equal(watched.get('_somethingBadHappened'), false);
    done();
  },50);
}); 

test('DOES observe changed properties created after call to create() which are not prefixed with "_"', function(assert) {
  let done = assert.async();
  assert.expect(2);
  let watched = TestObject.create({
    bar: 'bar',
    _propertyChangedCallback: () => {
      assert.equal('barred', watched.bar);
      done();
    }
  });
  assert.equal('bar', watched.bar);
  watched.set('bar','barred'); 
  
  run.later( () => {
    assert.ok(false, 'Observation of "bar" property change did not happen');
  },50);
});

