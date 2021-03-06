export const createStore = function (reducer, fn) {
  let state;
  let listeners = [];
  let dispatch = function (action) {
    state = reducer(state, action);
    listeners.forEach((update) => {
      update && update();
    });
  };

  let getState = function () {
    return JSON.parse(JSON.stringify(state));
  };

  let subscribe = function (f) {
    // 接收了一个回调函数
    // react-redux给的
    // 这个回调函数其实是触发视图更新的一个操作
    listeners.push(f);

    return function () {
      // 这个回调函数会把当前事件从事件池中移除
      listeners = listeners.filter((item) => item !== f);
    };
  };

  dispatch({});

  if (typeof fn === "function") {
    return fn(createStore)(reducer);
  }

  return {
    dispatch,
    getState,
    subscribe,
  };
};

export const combineReducers = function (obj) {
  return function (state = {}, action) {
    state = Object.keys(obj).reduce((state, current) => {
      state[current] = obj[current](state[current], action);
      return state;
    }, state);
    return state;
  };
};

// export const applyMiddleware = function (middleware) {
//   return function (createStore) {
//     return function (reducer) {
//       let store = createStore(reducer);
//       let middle = middleware(store);
//       let midDispatch = middle(store.dispatch);
//       return {
//         ...store,
//         dispatch: midDispatch,
//       };
//     };
//   };
// };

export const compose = (...fns) => (...args) => {
  let first = fns.shift();
  return fns.reduce((prev, next) => {
    return next(prev);
  }, first(...args));
};

export const applyMiddleware = (...middlewares) => (createStore) => (
  reducer
) => {
  let store = createStore(reducer);
  //   let middle = middlewares(store);
  let middles = middlewares.map((middleware) => {
    return middleware(store);
  });
  let midDispatch = compose(...middles)(store.dispatch);
  //   let midDispatch = middle(store.dispatch);
  return {
    ...store,
    dispatch: midDispatch,
  };
};
