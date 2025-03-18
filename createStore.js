import $$observable from './utils/symbol-observable';
import ActionTypes from './utils/actionTypes';
import isPlainObject from './utils/isPlainObject';
import { kindOf } from './utils/kindOf';
export default function createStore(reducer, preloadedState, enhancer) {
    
    let currentReducer = reducer;
    let currentState = preloadedState;
    let currentListeners = [];
    let nextListeners = currentListeners;
    let isDispatching = false;
    
    function ensureCanMutateNextListeners() {
        if (nextListeners === currentListeners) {
            nextListeners = currentListeners.slice();
        }
    }
    
    function getState() {
        if (isDispatching) {
            throw new Error('You may not call store.getState() while the reducer is executing. ' +
                'The reducer has already received the state as an argument. ' +
                'Pass it down from the top reducer instead of reading it from the store.');
        }
        return currentState;
    }
    
    function subscribe(listener) {
        if (isDispatching) {
            throw new Error('You may not call store.subscribe() while the reducer is executing. ' +
                'If you would like to be notified after the store has been updated, subscribe from a ' +
                'component and invoke store.getState() in the callback to access the latest state. ' +
                'See https://redux.js.org/api/store#subscribelistener for more details.');
        }
        let isSubscribed = true;
        ensureCanMutateNextListeners();
        nextListeners.push(listener);
        return function unsubscribe() {
            if (!isSubscribed) {
                return;
            }
            if (isDispatching) {
                throw new Error('You may not unsubscribe from a store listener while the reducer is executing. ' +
                    'See https://redux.js.org/api/store#subscribelistener for more details.');
            }
            isSubscribed = false;
            ensureCanMutateNextListeners();
            const index = nextListeners.indexOf(listener);
            nextListeners.splice(index, 1);
            currentListeners = null;
        };
    }
    
    function dispatch(action) {
        if (isDispatching) {
            throw new Error('Reducers may not dispatch actions.');
        }
        try {
            isDispatching = true;
            currentState = currentReducer(currentState, action);
        }
        finally {
            isDispatching = false;
        }
        const listeners = (currentListeners = nextListeners);
        for (let i = 0; i < listeners.length; i++) {
            const listener = listeners[i];
            listener();
        }
        return action;
    }

    function replaceReducer(nextReducer) {
        if (typeof nextReducer !== 'function') {
            throw new Error(`Expected the nextReducer to be a function. Instead, received: '${kindOf(nextReducer)}`);
        }
        // TODO: do this more elegantly
        ;
        currentReducer = nextReducer;
        // This action has a similar effect to ActionTypes.INIT.
        // Any reducers that existed in both the new and old rootReducer
        // will receive the previous state. This effectively populates
        // the new state tree with any relevant data from the old one.
        dispatch({ type: ActionTypes.REPLACE });
        // change the type of the store by casting it to the new store
        return store;
    }
    /**
     * Interoperability point for observable/reactive libraries.
     * @returns A minimal observable of state changes.
     * For more information, see the observable proposal:
     * https://github.com/tc39/proposal-observable
     */
    function observable() {
        const outerSubscribe = subscribe;
        return {
            /**
             * The minimal observable subscription method.
             * @param observer Any object that can be used as an observer.
             * The observer object should have a `next` method.
             * @returns An object with an `unsubscribe` method that can
             * be used to unsubscribe the observable from the store, and prevent further
             * emission of values from the observable.
             */
            subscribe(observer) {
                if (typeof observer !== 'object' || observer === null) {
                    throw new TypeError(`Expected the observer to be an object. Instead, received: '${kindOf(observer)}'`);
                }
                function observeState() {
                    const observerAsObserver = observer;
                    if (observerAsObserver.next) {
                        observerAsObserver.next(getState());
                    }
                }
                observeState();
                const unsubscribe = outerSubscribe(observeState);
                return { unsubscribe };
            },
            [$$observable]() {
                return this;
            }
        };
    }
    // When a store is created, an "INIT" action is dispatched so that every
    // reducer returns their initial state. This effectively populates
    // the initial state tree.
    dispatch({ type: ActionTypes.INIT });
    const store = {
        dispatch: dispatch,
        subscribe,
        getState,
        replaceReducer,
        [$$observable]: observable
    };
    return store;
}