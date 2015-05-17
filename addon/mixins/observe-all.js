import Ember from 'ember';
const { computed, run, on, typeOf, keys, Mixin, debug, A } = Ember;    // jshint ignore:line

var ObserveAll =  Mixin.create({
  // serves as a property to base your computed properties on
  // and as a nominal extra benefit it counts your changes (for what its worth)
  _propertyChanged: false,
  _changedProperty: null, 
  _propertyChangedCallback: null,
  // initialize
  _initObserveAll: on('init',function() {
    let callback = this.get('_propertyChangedCallback');
    return this.observeAll(this, callback);
  }),
  _destroyObservers: on('willDestroyElement', 'destroyObservers'),
  
  /**
   * Adds observers to all properties of an external object (ignoring those starting with '_'); and takes the following actions:
   * 1. Toggles the '_propertyChanged' so observers/CP can monitor this
   * 2. Sets the 'key' that changes to the '_propertyChanged' (note: this is fairly transient so mileage may vary)
   * 3. Provides a callback hook which is called if available
   */
  observeAll: function(object, callback) {
    if(!object.addObserver) {
      debug('An object passed into addObservers() is not "observer aware"; object observers will not be setup: %o', object);
      return false;
    }
    // iterate properties of sent in object 
    keys(object).forEach( key => {
      const currentObservers = this.get('_currentObservers');
      const objectKey = object.get(key);
      const cb = () => {
        Ember.run.next( () => {
          object.notifyPropertyChange('_propertyChanged');
          object.set('_changedProperty', key);
          if(callback) {
            callback(key);
          }            
        });
      };
      if(typeOf(objectKey) !== 'function' && key.substr(0,1) !== '_') {
        object.set('_propertyChanged','mutex');
        object.addObserver(key, cb);
        currentObservers.pushObject({object: object, key: key, callback: cb});
      }
    });    
  },
  _currentObservers: new A([]),
  destroyObservers: function() {
    let currentObservers = new A(this.get('_currentObservers'));
    currentObservers.forEach( observer => {
      observer.object.removeObserver(observer.key);
    });
  }
});

ObserveAll[Ember.NAME_KEY] = 'ObserveAll Mixin';
export default ObserveAll; 