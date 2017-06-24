import React from 'react';
import {Iterable} from 'immutable';
import _ from 'lodash';

export const ensureNativeJSValue = 
  state => state 
    ? Iterable.isIterable(state) ? state.toJS() : _.mapValues(state, ensureNativeJSValue) 
    : state;

export function toJS(WrappedComponent) {
  function ToJSWrapper(wrappedComponentProps) {
    const propsJS = Object.entries(wrappedComponentProps)
      .reduce((newProps, [key, value]) => ({
        ...newProps,
        [key]: ensureNativeJSValue(value)
      }), {});

    return <WrappedComponent {...propsJS} />;
  }

  ToJSWrapper.displayName = `toJS(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return ToJSWrapper;
}
