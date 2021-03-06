import classNames from 'classnames';
import css from 'dom-helpers/style';
import React from 'react';
import PropTypes from 'prop-types';
import Transition from 'react-overlays/lib/Transition';

import capitalize from './utils/capitalize';
import createChainedFunction from './utils/createChainedFunction';

const MARGINS = {
  height: ['marginTop', 'marginBottom'],
  width: ['marginLeft', 'marginRight'],
};

// reading a dimension prop will cause the browser to recalculate,
// which will let our animations work
function triggerBrowserReflow(node) {
  node.offsetHeight; // eslint-disable-line no-unused-expressions
}

function getDimensionValue(dimension, elem) {
  let value = elem[`offset${capitalize(dimension)}`];
  let margins = MARGINS[dimension];

  return (value +
    parseInt(css(elem, margins[0]), 10) +
    parseInt(css(elem, margins[1]), 10)
  );
}

const propTypes = {
  /**
   * Show the component; triggers the expand or collapse animation
   */
  in: PropTypes.bool,

  /**
   * Wait until the first "enter" transition to mount the component (add it to the DOM)
   */
  mountOnEnter: PropTypes.bool,

  /**
   * Unmount the component (remove it from the DOM) when it is collapsed
   */
  unmountOnExit: PropTypes.bool,

  /**
   * Run the expand animation when the component mounts, if it is initially
   * shown
   */
  transitionAppear: PropTypes.bool,

  /**
   * Duration of the collapse animation in milliseconds, to ensure that
   * finishing callbacks are fired even if the original browser transition end
   * events are canceled
   */
  timeout: PropTypes.number,

  /**
   * Callback fired before the component expands
   */
  onEnter: PropTypes.func,
  /**
   * Callback fired after the component starts to expand
   */
  onEntering: PropTypes.func,
  /**
   * Callback fired after the component has expanded
   */
  onEntered: PropTypes.func,
  /**
   * Callback fired before the component collapses
   */
  onExit: PropTypes.func,
  /**
   * Callback fired after the component starts to collapse
   */
  onExiting: PropTypes.func,
  /**
   * Callback fired after the component has collapsed
   */
  onExited: PropTypes.func,

  /**
   * The dimension used when collapsing, or a function that returns the
   * dimension
   *
   * _Note: Bootstrap only partially supports 'width'!
   * You will need to supply your own CSS animation for the `.width` CSS class._
   */
  dimension: PropTypes.oneOfType([
    PropTypes.oneOf(['height', 'width']),
    PropTypes.func,
  ]),

  /**
   * Function that returns the height or width of the animating DOM node
   *
   * Allows for providing some custom logic for how much the Collapse component
   * should animate in its specified dimension. Called with the current
   * dimension prop value and the DOM node.
   */
  getDimensionValue: PropTypes.func,

  /**
   * ARIA role of collapsible element
   */
  role: PropTypes.string,
};

const defaultProps = {
  in: false,
  timeout: 300,
  mountOnEnter: false,
  unmountOnExit: false,
  transitionAppear: false,

  dimension: 'height',
  getDimensionValue,
};

class Collapse extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.handleEnter = this.handleEnter.bind(this);
    this.handleEntering = this.handleEntering.bind(this);
    this.handleEntered = this.handleEntered.bind(this);
    this.handleExit = this.handleExit.bind(this);
    this.handleExiting = this.handleExiting.bind(this);
  }

  _dimension() {
    return typeof this.props.dimension === 'function'
      ? this.props.dimension()
      : this.props.dimension;
  }

  // for testing
  _getScrollDimensionValue(elem, dimension) {
    return `${elem[`scroll${capitalize(dimension)}`]}px`;
  }

  /* -- Expanding -- */
  handleEnter(elem) {
    const dimension = this._dimension();
    elem.style[dimension] = '0';
  }

  handleEntered(elem) {
    const dimension = this._dimension();
    elem.style[dimension] = null;
  }

  handleEntering(elem) {
    const dimension = this._dimension();
    elem.style[dimension] = this._getScrollDimensionValue(elem, dimension);
  }

  /* -- Collapsing -- */
  handleExit(elem) {
    const dimension = this._dimension();
    elem.style[dimension] = `${this.props.getDimensionValue(dimension, elem)}px`;
    triggerBrowserReflow(elem);
  }

  handleExiting(elem) {
    const dimension = this._dimension();
    elem.style[dimension] = '0';
  }

  render() {
    const {
      onEnter, onEntering, onEntered, onExit, onExiting, className, ...props
    } = this.props;

    delete props.dimension;
    delete props.getDimensionValue;

    const handleEnter =
      createChainedFunction(this.handleEnter, onEnter);
    const handleEntering =
      createChainedFunction(this.handleEntering, onEntering);
    const handleEntered =
      createChainedFunction(this.handleEntered, onEntered);
    const handleExit =
      createChainedFunction(this.handleExit, onExit);
    const handleExiting =
      createChainedFunction(this.handleExiting, onExiting);

    const classes = {
      width: this._dimension() === 'width',
    };

    return (
      <Transition
        {...props}
        aria-expanded={props.role ? props.in : null}
        className={classNames(className, classes)}
        exitedClassName="collapse"
        exitingClassName="collapsing"
        enteredClassName="collapse in"
        enteringClassName="collapsing"
        onEnter={handleEnter}
        onEntering={handleEntering}
        onEntered={handleEntered}
        onExit={handleExit}
        onExiting={handleExiting}
      />
    );
  }
}

Collapse.propTypes = propTypes;
Collapse.defaultProps = defaultProps;

export default Collapse;
