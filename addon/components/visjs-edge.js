import Ember from 'ember';
import VisJsChild from 'ember-cli-visjs/components/visjs-child';

export default VisJsChild.extend({
  type: 'edge',

  /**
   * @public
   *
   * Node-ID for the starting-point of this edge.
   * @type {String}
   */
  from: '',

  /**
   * @public
   *
   * Node-ID for the target-point of this edge.
   * @type {String}
   */
  to: '',
  id: null,
  color: false,

  colorChanged: Ember.observer('color', function() {
    let container = this.get('containerLayer');
    container.updateEdgeColor(this.get('eId'), this.get('color'));
  }),


  eId: Ember.computed('from', 'to', 'id', function() {
    console.log('DEBUG', this.get('id'), this.get('from'), this.get('to'));
    if(this.get('id')) {
      return this.get('id');
    } else {
      return `${this.get('from')}-${this.get('to')}`;
    }
  }),

  arrowChanged: Ember.observer('arrows', function() {
    let container = this.get('containerLayer');
    container.updateEdgeArrow(this.get('eId'), this.get('arrows'));
  })

});
