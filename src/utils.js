import {Iterable} from 'immutable';

export const ensureNativeJSValue = state => Iterable.isIterable(state) ? state.toJS() : state;

