import React from 'react';
import { View, Animated, PanResponder, PanResponderInstance, PanResponderGestureState } from 'react-native';

type Mode = 'decay' | 'snap' | 'spring-origin';
type Overshoot = 'spring' | 'clamp';

interface PanControllerProps {
  lockDirection?: boolean;
  horizontal?: boolean;
  vertical?: boolean;
  overshootX?: Overshoot;
  overshootY?: Overshoot;
  xBounds?: [number, number];
  yBounds?: [number, number];
  xMode?: Mode;
  yMode?: Mode;
  snapSpacingX?: number;
  snapSpacingY?: number;

  panX: Animated.Value;
  panY: Animated.Value;

  overshootSpringConfig?: any;
  momentumDecayConfig?: { deceleration?: number };
  springOriginConfig?: any;
  directionLockDistance?: number;
  overshootReductionFactor?: number;

  onOvershoot?: () => void;
  onDirectionChange?: (direction: 'x' | 'y', gestureState: PanResponderGestureState) => void;
  onReleaseX?: (gestureState: PanResponderGestureState) => boolean | void;
  onReleaseY?: (gestureState: PanResponderGestureState) => boolean | void;
  onRelease?: (gestureState: PanResponderGestureState) => boolean | void;

  onStartShouldSetPanResponder?: () => boolean;
  onMoveShouldSetPanResponder?: () => boolean;
  onPanResponderGrant?: (...args: any[]) => void;
  onPanResponderMove?: (event: any, gestureState: PanResponderGestureState) => void;
}

interface PanControllerState {}

class PanController extends React.Component<PanControllerProps, PanControllerState> {
  deceleration: number;
  _responder: PanResponderInstance;
  _listener: string | null;
  _direction: 'x' | 'y' | null;

  constructor(props: PanControllerProps) {
    super(props);
    this.deceleration = 0.997;
    if (props.momentumDecayConfig && props.momentumDecayConfig.deceleration) {
      this.deceleration = props.momentumDecayConfig.deceleration;
    }
    this._responder = PanResponder.create({
      onStartShouldSetPanResponder: props.onStartShouldSetPanResponder,
      onMoveShouldSetPanResponder: props.onMoveShouldSetPanResponder,
      onPanResponderGrant: this.onPanResponderGrant,
      onPanResponderMove: this.onPanResponderMove,
      onPanResponderRelease: this.onPanResponderRelease,
    });
    this._listener = null;
    this._direction = null;
  }

  onPanResponderGrant = (...args: any[]) => {
    if (this.props.onPanResponderGrant) {
      this.props.onPanResponderGrant(...args);
    }
    let { panX, panY, horizontal, vertical, xMode, yMode } = this.props;

    this.handleResponderGrant(panX, xMode);
    this.handleResponderGrant(panY, yMode);

    this._direction = horizontal && !vertical ? 'x' : vertical && !horizontal ? 'y' : null;
  };

  onPanResponderMove = (_: any, { dx, dy, x0, y0 }: PanResponderGestureState) => {
    let {
      panX,
      panY,
      xBounds = [0, 0],
      yBounds = [0, 0],
      overshootX,
      overshootY,
      horizontal,
      vertical,
      lockDirection,
      directionLockDistance = 0,
    } = this.props;

    if (!this._direction) {
      const dx2 = dx * dx;
      const dy2 = dy * dy;
      if (dx2 + dy2 > directionLockDistance) {
        this._direction = dx2 > dy2 ? 'x' : 'y';
        if (this.props.onDirectionChange) {
          this.props.onDirectionChange(this._direction, { dx, dy, x0, y0 });
        }
      }
    }

    const dir = this._direction;

    if (this.props.onPanResponderMove) {
      this.props.onPanResponderMove(_, { dx, dy, x0, y0 });
    }

    if (horizontal && (!lockDirection || dir === 'x')) {
      let [xMin, xMax] = xBounds;

      this.handleResponderMove(panX, dx, xMin, xMax, overshootX);
    }

    if (vertical && (!lockDirection || dir === 'y')) {
      let [yMin, yMax] = yBounds;

      this.handleResponderMove(panY, dy, yMin, yMax, overshootY);
    }
  };

  onPanResponderRelease = (_: any, { vx, vy, dx, dy }: PanResponderGestureState) => {
    let {
      panX,
      panY,
      xBounds = [0, 0],
      yBounds = [0, 0],
      overshootX,
      overshootY,
      horizontal,
      vertical,
      lockDirection,
      xMode,
      yMode,
      snapSpacingX,
      snapSpacingY,
    } = this.props;

    let cancel = false;

    const dir = this._direction;

    if (this.props.onRelease) {
      cancel = this.props.onRelease({ vx, vy, dx, dy }) === false;
    }

    if (!cancel && horizontal && (!lockDirection || dir === 'x')) {
      let [xMin, xMax] = xBounds;
      if (this.props.onReleaseX) {
        cancel = this.props.onReleaseX({ vx, vy, dx, dy }) === false;
      }
      !cancel &&
        this.handleResponderRelease(panX, xMin, xMax, vx, overshootX, xMode, snapSpacingX);
    }

    if (!cancel && vertical && (!lockDirection || dir === 'y')) {
      let [yMin, yMax] = yBounds;
      if (this.props.onReleaseY) {
        cancel = this.props.onReleaseY({ vx, vy, dx, dy }) === false;
      }
      !cancel &&
        this.handleResponderRelease(panY, yMin, yMax, vy, overshootY, yMode, snapSpacingY);
    }

    this._direction = horizontal && !vertical ? 'x' : vertical && !horizontal ? 'y' : null;
  };

  handleResponderMove(anim: Animated.Value, delta: number, min: number, max: number, overshoot?: Overshoot) {
    let val = anim.__getValue() + delta;

    if (val > max) {
      switch (overshoot) {
        case 'spring':
          val = max + (val - max) / (this.props.overshootReductionFactor || 1);
          break;
        case 'clamp':
          val = max;
          break;
      }
    }
    if (val < min) {
      switch (overshoot) {
        case 'spring':
          val = min - (min - val) / (this.props.overshootReductionFactor || 1);
          break;
        case 'clamp':
          val = min;
          break;
      }
    }
    val = val - anim.__getValue();
    anim.setValue(val);
  }

  handleResponderRelease(
    anim: Animated.Value,
    min: number,
    max: number,
    velocity: number,
    overshoot?: Overshoot,
    mode?: Mode,
    snapSpacing?: number
  ) {
    anim.flattenOffset();

    if (anim.__getValue() < min) {
      if (this.props.onOvershoot) {
        this.props.onOvershoot(); // TODO: what args should we pass to this
      }
      switch (overshoot) {
        case 'spring':
          Animated.spring(anim, {
            ...this.props.overshootSpringConfig,
            toValue: min,
            velocity,
          }).start();
          break;
        case 'clamp':
          anim.setValue(min);
          break;
      }
    } else if (anim.__getValue() > max) {
      if (this.props.onOvershoot) {
        this.props.onOvershoot(); // TODO: what args should we pass to this
      }
      switch (overshoot) {
        case 'spring':
          Animated.spring(anim, {
            ...this.props.overshootSpringConfig,
            toValue: max,
            velocity,
          }).start();
          break;
        case 'clamp':
          anim.setValue(min);
          break;
      }
    } else {
      switch (mode) {
        case 'snap':
          this.handleSnappedScroll(anim, min, max, velocity, snapSpacing || 0, overshoot);
          break;

        case 'decay':
          this.handleMomentumScroll(anim, min, max, velocity, overshoot);
          break;

        case 'spring-origin':
          Animated.spring(anim, {
            ...this.props.springOriginConfig,
            toValue: 0,
            velocity,
          }).start();
          break;
      }
    }
  }

  handleResponderGrant(anim: Animated.Value, mode?: Mode) {
    switch (mode) {
      case 'spring-origin':
        anim.setValue(0);
        break;
      case 'snap':
      case 'decay':
        anim.setOffset(anim.__getValue() + anim.__getOffset());
        anim.setValue(0);
        break;
    }
  }

  handleMomentumScroll(anim: Animated.Value, min: number, max: number, velocity: number, overshoot?: Overshoot) {
    Animated.decay(anim, {
      ...this.props.momentumDecayConfig,
      velocity,
    }).start(() => {
      anim.removeListener(this._listener as string);
    });

    this._listener = anim.addListener(({ value }) => {
      if (value < min) {
        anim.removeListener(this._listener as string);
        if (this.props.onOvershoot) {
          this.props.onOvershoot(); // TODO: what args should we pass to this
        }
        switch (overshoot) {
          case 'spring':
            Animated.spring(anim, {
              ...this.props.overshootSpringConfig,
              toValue: min,
              velocity,
            }).start();
            break;
          case 'clamp':
            anim.setValue(min);
            break;
        }
      } else if (value > max) {
        anim.removeListener(this._listener as string);
        if (this.props.onOvershoot) {
          this.props.onOvershoot(); // TODO: what args should we pass to this
        }
        switch (overshoot) {
          case 'spring':
            Animated.spring(anim, {
              ...this.props.overshootSpringConfig,
              toValue: max,
              velocity,
            }).start();
            break;
          case 'clamp':
            anim.setValue(max);
            break;
        }
      }
    });
  }

  handleSnappedScroll(anim: Animated.Value, min: number, max: number, velocity: number, spacing: number, overshoot?: Overshoot) {
    let endX = this.momentumCenter(anim.__getValue(), velocity, spacing);
    endX = Math.max(endX, min);
    endX = Math.min(endX, max);
    const bounds = [endX - spacing / 2, endX + spacing / 2];
    const endV = this.velocityAtBounds(anim.__getValue(), velocity, bounds);

    this._listener = anim.addListener(({ value }) => {
      if (value > bounds[0] && value < bounds[1]) {
        Animated.spring(anim, {
          toValue: endX,
          velocity: endV,
        }).start();
      }
    });

    Animated.decay(anim, {
      ...this.props.momentumDecayConfig,
      velocity,
    }).start(() => {
      anim.removeListener(this._listener as string);
    });
  }

  closestCenter(x: number, spacing: number) {
    const plus = x % spacing < spacing / 2 ? 0 : spacing;
    return Math.round(x / spacing) * spacing + plus;
  }

  momentumCenter(x0: number, vx: number, spacing: number) {
    let t = 0;
    let x1 = x0;
    let x = x1;

    while (true) {
      t += 16;
      x = x0 + (vx / (1 - this.deceleration)) * (1 - Math.exp(-(1 - this.deceleration) * t));
      if (Math.abs(x - x1) < 0.1) {
        x1 = x;
        break;
      }
      x1 = x;
    }
    return this.closestCenter(x1, spacing);
  }

  velocityAtBounds(x0: number, vx: number, bounds: [number, number]) {
    let t = 0;
    let x1 = x0;
    let x = x1;
    let vf;
    while (true) {
      t += 16;
      x = x0 + (vx / (1 - this.deceleration)) * (1 - Math.exp(-(1 - this.deceleration) * t));
      vf = (x - x1) / 16;
      if (x > bounds[0] && x < bounds[1]) {
        break;
      }
      if (Math.abs(vf) < 0.1) {
        break;
      }
      x1 = x;
    }
    return vf;
  }

  // componentDidMount() {
  //    //TODO: we may need to measure the children width/height here?
  // },
  //
  // componentWillUnmount() {
  //
  // },
  //
  // componentDidUnmount() {
  //
  // },

  render() {
    return <View {...this.props} {...this._responder.panHandlers} />;
  }
}

export default PanController;
