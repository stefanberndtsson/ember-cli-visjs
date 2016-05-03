/* globals vis */

import Ember from 'ember';
import ContainerMixin from 'ember-cli-visjs/mixins/container';
import layout from '../templates/components/visjs-network';

const { A, assert, debug } = Ember;

export default Ember.Component.extend(ContainerMixin, {
  layout,
  classNames: ['ember-cli-visjs ember-cli-visjs-network'],

  network: false,

  init() {
    this._super(...arguments);

    this.set('nodes', new vis.DataSet([]));
    this.set('edges', new vis.DataSet([]));
  },

  didInsertElement() {
    this._super(...arguments);

    let options = this.get('options') || {};
    options.manipulation = options.manipulation || {};
    options.manipulation.addEdge = this.cEdgeAdded.bind(this);

    let network = new vis.Network(
      $(`#${this.get('elementId')} .network-canvas`)[0],
      { nodes: this.get('nodes'), edges: this.get('edges') },
      options
    );

    let _this = this;

    network.on('selectNode', (e) => {
      let [ selectedNode ] = e.nodes;
      let matchingChildNode = _this.get('_childLayers').find((c) => {
        return `${c.get('nId')}` === `${selectedNode}`;
      });

      if (matchingChildNode) {
        matchingChildNode.get('select')(selectedNode, e);
      }
    });

    network.on('dragEnd', (e) => {
      let newPositions = network.getPositions(e.nodes);

      Object.keys(newPositions).forEach((id) => {
        let matchingChild = _this.get('_childLayers').find((c) => {
          return `${c.get('nId')}` === `${id}`;
        });
        matchingChild.set('posX', newPositions[id].x);
        matchingChild.set('posY', newPositions[id].y);
      });
    });

    this.set('network', network);
    this.set('storeAs', this);
    this.setupBackgroundImage();
  },

  didUpdateAttrs(changes) {
    this._super(...arguments);

    if (changes.newAttrs.backgroundImage) {
      this.setupBackgroundImage();
    }

    if (changes.newAttrs.addEdges) {
      this.setupAddEdges();
    }
  },

  setupBackgroundImage() {
    if (!this.get('backgroundImage')) {
      return;
    }

    console.log("foo");

    let backgroundImage = new Image();
    let network = this.get('network');
    let _this = this;

    backgroundImage.onload = function() {
      network.on('beforeDrawing', (ctx) => {
        let offset = {
          x: _this.get('backgroundOffsetX') || backgroundImage.width / -2,
          y: _this.get('backgroundOffsetY') || backgroundImage.height / -2
        };
        ctx.drawImage(backgroundImage, offset.x, offset.y);
      });
      network.redraw();
    };

    backgroundImage.src = this.get('backgroundImage');
  },

  setupAddEdges() {
    if (this.get('addEdges')) {
      this.get('network').addEdgeMode();
    } else {
      this.get('network').disableEditMode();
    }
  },

  cEdgeAdded(edge, callback) {
    // Trigger the optional callback
    if (this.get('edgeAdded')) {
      this.get('edgeAdded')(edge);
    }

    // Actually places the adge on visjs
    callback(edge);

    // vis disables adding edges after every edge by default
    // this way we will reenable it after every edge if addEdges
    // is still set
    this.setupAddEdges();
  },

  registerChild(child) {
    this._super(...arguments);

    let type = child.get('type');

    if (type === 'node') {
      this.addNode(child);
    } else if (type === 'edge') {
      this.addEdge(child);
    } else {
      debug(`Child of type ${type} not supported by ember-cli-visjs`);
    }
  },

  unregisterChild(child) {
    this._super(...arguments);

    let type = child.get('type');

    if (type === 'node') {
      this.get('nodes').remove(child.get('nId'));
    } else if (type !== 'edge') {
      debug(`Child of type ${type} not supported by ember-cli-visjs`);
    }
  },

  addNode(node) {
    let nodes = this.get('nodes');
    let simplifiedNode = { id: node.get('nId'), label: node.get('label') };

    if (node.get('color')) {
      simplifiedNode.color = node.get('color');
    }

    if (node.get('posX') || node.get('posX') === 0) {
      simplifiedNode.x = node.get('posX');
    }

    if (node.get('posY') || node.get('posY') === 0) {
      simplifiedNode.y = node.get('posY');
    }

    nodes.add(simplifiedNode);
  },

  addEdge(edge) {
    let edges = this.get('edges');
    let simplifiedEdge = { from: edge.get('from'), to: edge.get('to') };

    if (edge.get('arrows')) {
      simplifiedEdge.arrows = edge.get('arrows');
    }

    edges.add(simplifiedEdge);
  },

  moveTo(id) {
    this.get('network').focus(id, {
      scale: 1,
      animation: true
    });
  },

  focus(id) {
    this.get('network').focus(id, {
      scale: 1,
      animation: false
    });
  },

  updateNodeColor(nId, color) {
    this.get('nodes').update({ id: nId, color });
  }

});
