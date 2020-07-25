const isObject = obj => typeof obj === 'object' && obj !== null

const baseHandler = {
  get(target, key, receiver) {
    // Reflect用于执行对象默认操作，更规范、更友好
    // Proxy和Object的方法Reflect都有对应
    // http://es6.ruanyifeng.com/#docs/reflect
    const res = Reflect.get(target, key, receiver)
    console.log(`获取${key}:${res}`)
    track(target, key)
    return isObject(res) ? reactive(res) : res
  },
  set(target, key, value, receiver) {
    const res = Reflect.set(target, key, value, receiver)
    console.log(`设置${key}:${value}`)
    trigger(target, key)
    return res
  },
  deleteProperty(target, key) {
    const res = Reflect.deleteProperty(target, key)
    console.log(`删除${key}:${res}`)
    trigger(target, key)
    return res
  }
}

function reactive(obj) {
  if (!isObject(obj)) {
    return obj
  }
  // Proxy相当于在对象外层加拦截
  // http://es6.ruanyifeng.com/#docs/proxy
  const observed = new Proxy(obj, baseHandler)
  return observed
}

const effectStack = []

// 将传入fn
function effect(fn, options = {}) {
  // 创建reactiveEffect
  const e = createReactiveEffect(fn, options)

  // 执行一次触发依赖收集
  if (!options.lazy) {
    e()
  }

  return e
}

function createReactiveEffect(fn, options) {
  const effect = function reactiveEffect(...args) {
    if (!effectStack.includes(effect)) {
      // effect入栈
      // 执行fn
      // effect出栈
      try {
        effectStack.push(effect)
        return fn(...args)
      } finally {
        effectStack.pop()
      }
    }
  }

  // 标记该effect是一个computed
  effect.computed = options.computed

  return effect
}

const targetMap = new WeakMap()

function track(target, key) {
  const effect = effectStack[effectStack.length - 1]
  if (effect) {
    let depMap = targetMap.get(target)
    if (!depMap) {
      depMap = new Map()
      targetMap.set(target, depMap)
    }

    let deps = depMap.get(key)
    if (!deps) {
      deps = new Set()
      depMap.set(key, deps)
    }

    deps.add(effect)
  }
}
function trigger(target, key) {
  const depMap = targetMap.get(target)
  if (!depMap) {
    return
  }
  const deps = depMap.get(key)
  if (deps) {
    // 将普通effect和computed区分开
    const effects = new Set()
    const computedRunners = new Set()
    deps.forEach(dep => {
      if (dep.computed) {
        computedRunners.add(dep)
      } else {
        effects.add(dep)
      }
    })
    effects.forEach(effect => effect())
    // computedRunners.forEach(computed => computed())
  }
}

function computed(fn) {
  const runner = effect(fn, { computed: true, lazy: true })
  return {
    effect: runner,
    get value() {
      return runner()
    }
  }
}

// 测试
const state = reactive({ foo: 'foo' })
// const arr = reactive([1,2,3])

effect(() => {
  console.log('effect', state.foo)
})

// 获取
state.foo // ok
// 设置已存在属性
state.foo = 'fooooooo' // ok
// 设置不存在属性
// state.dong = 'dong' // ok
// 删除属性
// delete state.dong // ok
// arr.push(4)
// arr.splice(1,0,1.5)
