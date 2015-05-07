# ember-cli-observe-all ![ ](https://travis-ci.org/lifegadget/ember-cli-observe-all.svg) [![npm version](https://badge.fury.io/js/ember-cli-observe-all.svg)](http://badge.fury.io/js/ember-cli-observe-all)
> A **Mixin** to help you monitor change in objects

## Install ##

- Ember-CLI versions 0.2.3+
    ````bash
    ember install ember-cli-observe-all
    ````

- Earlier CLI versions
    ````bash
    npm install ember-cli-observe-all --save-dev
    ````

## Usage ##
There are two primary ways to use this addon:

### As a Mixin ###

````javascript
import ObserveAll as '../mixins/observe-all';
export default Ember.Component.extend(ObserveAll,{ 
    foo: 'bar',
    bar: 'baz'
});
````

In the above scenario, observers will automatically be added to the `foo` and `bar` properties. This might not seem terribly 
interesting but it can be useful when you have an array of objects and you want to observe property level changes but the actual properties
involved is fairly dynamic. So let's imagine you have an array `myStuff` which contains "stuff" (what else would it have in after all). You now want to 
create a computed property to fire whenever objects within this array change. 

If you just did the following:

````javascript
export default Ember.Component.extend({ 

    myStuff: [
        {id:1, name:'book', desc:'hitchhikers guide'},
        {id:2, name:'wallet', desc:'money and cards', amount: 5.86},
        {id:3, name:'movie ticket', desc:'a little entertainment', cinema:'itsy-bitsy theater'},
        {id:4, name:'report card', desc:'money and cards', grade: 'A+', comments:'you are the best student ever'},
        // ...
    ],
    insight: Ember.computed('myStuff.[]', function() {
        // do something amazing
        return amazing;
    })
});
````

Of course in the above scenario you'd only be alerted when items were added or removed. What if your amazing insights relied on more granular data?
Well if the properties in the objects were consistent then you might just do something like:

````javascript
insight: Ember.computed('myStuff.[]', 'myStuff.@each.name', 'myStuff.@each.desc', function() { ... }
````

The problem comes in when the properties which are contained by the objects are dynamic and only really knowable at run-time (or alternatively that the enumerable 
set of possible attributes is so large that adding a large string of observers adds too much of a cost to the heap). In any event, 
this is the problem space this addon is trying to solve for.

So, here's how it would work in the "observe-all" world:

````javascript
import ObserveAll as '../mixins/observe-all';
const OA = Ember.Object.extend(ObserveAll);
export default Ember.Component.extend({ 
    myStuff: [
        {id:1, name:'book', desc:'hitchhikers guide'},
        {id:2, name:'wallet', desc:'money and cards', amount: 5.86},
        {id:3, name:'movie ticket', desc:'a little entertainment', cinema:'itsy-bitsy theater'},
        {id:4, name:'report card', desc:'money and cards', grade: 'A+', comments:'you are the best student ever'},
        // ...
    ].map( item => {
        return OA.create(item);
    }),
    insight: Ember.computed('myStuff.[]', 'myStuff.@each._propertyChanged', function() {
        // do something amazing
        return amazing;
    })
});
````

> Note: the mixin will automatically add properties that are passed to the `create()` method not the `extend()` (typically a good thing). Also, properties which start with an underscore are excluded to help minimise observer bloat and protect against some ember-data messiness.

### As a Utility Function ###

If you want to auto-observe an object that is NOT the current object that too is possible. Goals are the same but let imagine you're getting a record or snapshot from ember-data and you don't want to much around with the bindings that are already in place you just want to add the observers for your special magic show. Well then, your syntax might something like:

````javascript
import ObserveAll as '../mixins/observe-all';
const OA = Ember.Object.extend(ObserveAll);
export default Ember.Component.extend({ 
    myStuff: Ember.on('init', function() {
        return this.store.find('stuff').then( payload => {
            let watcher = OA.create();
            payload.map( item => {
                return watcher.observeAll(item);
            });
        })
    }),
    insight: Ember.computed('myStuff.[]', 'myStuff.@each._propertyChanged', function() {
        // do something amazing
        return amazing;
    })
});
````


## Version Compatibility

This may very well work with older version of Ember and Ember-CLI but it was intended for:

- Ember 1.11.0+
- Ember-CLI 0.2.3+

## Repo Contribution

We're open to your creative suggestions but please move past the "idea" stage 
and send us a PR so we can incorporate your ideas without killing ourselves. :)

## Licensing

This component is free to use under the MIT license:

Copyright (c) 2015 LifeGadget Ltd

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
