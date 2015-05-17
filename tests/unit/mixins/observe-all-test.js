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
      assert.equal('baz', watched.bar, 'callback called and bar property is now set to "baz"');
      watched.set('success', true);
      done();
    }
  });
  assert.equal(watched.bar, 'bar', 'the bar property was initialized at create time with value of "bar"');
  watched.set('bar','baz'); 
  
  run.later( () => {
    const success = watched.get('success');
    assert.ok(success, 'Observation of "bar" property happened; finishing test');
    if (!success) {
      done();      
    }
  },25);
});

test('Observers are removed after destroyObservers called', function(assert) {
  let done = assert.async();
  let done2 = assert.async();
  assert.expect(4);
  let watched = TestObject.create({
    bar: 'bar',
    _propertyChangedCallback: () => {
      const bar = watched.get('bar');
      if(bar === 'baz') {
        assert.equal(bar, 'baz', 'INIT: callback called and bar property is now set to "baz"');
        watched.set('success', true);
        done();        
      } else if(bar === 'stop watching me') {
        assert.notEqual(bar, 'stop watching me', 'still observing property AFTER destroy was called!');
        watched.set('success', false);
        done2();
      }
    }
  });
  assert.equal(watched.get('bar'), 'bar', 'the bar property was initialized at create time with value of "bar"');
  watched.set('bar','baz'); 
  
  run.later( () => {
    const success = watched.get('success');
    assert.ok(success, 'INIT: Observation of "bar" property happened; now removing observer');
    if (!success) {
      done(); 
    }
    // post DESTROY test
    watched.destroyObservers();
    watched.set('bar','stop watching me'); 
    run.later( () => {
      assert.ok(watched.get('success'), 'The observer did NOT fire after call to destroyObservers');
      done2();
    },25);
  },25);
});


test('Using ObserveAll on an external object', function(assert) {
  let done = assert.async();
  let done2 = assert.async();
  let done3 = assert.async();
  // assert.expect(4);
  let object = Ember.Object.create({
    item: new Ember.A([{id: 'foo'}, {id: 'bar'}, {id: 'baz'}]),
    success: false
  });
  let watcher = TestObject.create();
  
  assert.equal(typeOf(object.get('item')), 'array', 'INIT: the item property is an array of objects');
  assert.equal(object.get('item.length'), 3, 'INIT: there should be three items in the array');
  watcher.observeAll(object.item, (key) => {
    assert.ok(true,'Observed change key was: ' + key);
    assert.equal(object.get('item.0.id'), 'foey', 'Observed change of first array item to foey');
    object.set('success', true);
    done();
  });
  object.set('item.0.id', 'foey');
  run.later( () => {
    assert.ok(object.get('success'), 'Observer caught change to object property being set.');
    done2();
    watcher.destroyObservers();
    object.set('success', false);
    object.set('item.0.id', 'fe fi fo');
    run.later( () => {
      assert.ok(!object.get('success'), 'After removing the observers setting the array item does not fire an observer');
      done3();
    },25); 
    
    
  },50); 
  
  
});



