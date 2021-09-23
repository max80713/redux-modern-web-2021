window.Redux = {
    createStore(reducer, preloadedState) {
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
                throw new Error();
            }

            return currentState;
        }

        function dispatch(action) {
            if (isDispatching) {
                throw new Error();
            }

            try {
                isDispatching = true;
                currentState = currentReducer(currentState, action)
            } finally {
                isDispatching = false;
            }

            currentListeners = nextListeners;
            for (let i = 0; i < currentListeners.length; i += 1) {
                const listener = currentListeners[i];
                listener();
            }
        }

        function subscribe(listener) {
            if (isDispatching) {
                throw new Error();
            }

            ensureCanMutateNextListeners()
            nextListeners.push(listener);

            return function unsubscribe() {
                if (isDispatching) {
                    throw new Error();
                }

                ensureCanMutateNextListeners()
                const index = nextListeners.indexOf(listener);
                nextListeners.splice(index, 1);
            }
        }

        dispatch({
            type: 'INIT'
        })

        return {
            getState,
            dispatch,
            subscribe
        }
    }
}