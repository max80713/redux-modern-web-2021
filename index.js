const initialState = {
  money: 0,
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'withdraw':
      return {
        money: state.money === 0 ? state.money : state.money - action.payload,
      };
    case 'deposit':
      return {
        money: state.money + action.payload,
      };
    default:
      return state;
  }
};

const preloadedState = {
  money: 0,
};

const store = window.Redux.createStore(reducer, preloadedState);

document.getElementById('money').textContent = `$${store.getState().money}`;

store.subscribe(() => {
  console.log('clicked');
  document.getElementById('money').textContent = `$${store.getState().money}`;
});

// withdraw
document.getElementById('withdraw').addEventListener('click', () => {
  store.dispatch({
    type: 'withdraw',
    payload: 10,
  });
});

// deposit
document.getElementById('deposit').addEventListener('click', () => {
  store.dispatch({
    type: 'deposit',
    payload: 10,
  });
});

// log
let unsubscribe = null;

document.getElementById('log').addEventListener('click', () => {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  } else {
    unsubscribe = store.subscribe(() => {
      console.log('current money is', store.getState().money);
    });
  }
});
