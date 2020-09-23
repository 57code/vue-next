// function defineReactive(obj, key, val) {
//   Object.defineProperty(obj, key, {
//     get() {
//       return val
//     },
//     set(v) {
//       val = v
//       update()
//     }
//   })
// }

function update() {
  console.log(obj.foo)
}

// const obj = {}
// defineReactive(obj, 'foo', 'foo')
// obj.foo = 'foooooooooo'

// vue3: Proxy
const isObject = obj => typeof obj === 'object' && obj !== null
function reactive(obj) {
  if (!isObject(obj)) {
    return obj
  }

  return new Proxy(obj, {
    get(target, key) {
      const res = Reflect.get(target, key)
      console.log('get', key)
      track(target, key)
      return isObject(res) ? defineReactive(res) : res
    },
    set(target, key, val) {
      const res = Reflect.set(target, key, val)
      console.log('set', key)
      trigger(target, key)
      return res
    },
    deleteProperty(target, key) {
      const res = Reflect.deleteProperty(target, key)
      console.log('deleteProperty', key)
      trigger(target, key)
      return res
    }
  })
}

// 暂存回调函数
const effectStack = []
// 建立回调和响应式数据之间映射关系
function effect(cb) {
  // 创建reactiveEffect
  const e = createReactiveEffect(cb)
  // 立即调用
  e()

  return e
}
function createReactiveEffect(cb) {
  const effect = function() {
    try {
      // 1.入栈
      effectStack.push(cb)
      // 2.执行
      return cb()
    } finally {
      effectStack.pop()
    }
  }

  return effect
}
// 将target,key以及上面cb之间关系存入targetMap
const targetMap = new WeakMap()
function track(target, key) {
  // 获取effect
  const effect = effectStack[effectStack.length - 1]

  if (effect) {
    // 获取target在targetMap中的值
    let depMap = targetMap.get(target)
    if (!depMap) {
      depMap = new Map()
      targetMap.set(target, depMap)
    }

    // 获取cbs
    let deps = depMap.get(key)
    if (!deps) {
      deps = new Set()
      depMap.set(key, deps)
    }

    // 依赖加入deps
    deps.add(effect)
    console.log(targetMap)
  }
}
// 把track中建立的关系拿出来，获取cbs，并执行他们
function trigger(target, key) {
  const depMap = targetMap.get(target)

  if (depMap) {
    const deps = depMap.get(key)

    if (deps) {
      deps.forEach(effect => effect())
    }
  }
}

const obj = { foo: 'foo', bar: { n: 1 }, arr: [1, 2, 3] }
const proxy = reactive(obj)
// proxy.foo
proxy.foo = 'foooooooooo'

effect(() => {
  console.log('effect1', proxy.foo)
})

effect(() => {
  console.log('effect2', proxy.foo)
})

// proxy.bar = 'bar'
// delete proxy.bar

// proxy.arr.push(4)
