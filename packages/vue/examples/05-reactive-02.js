// vue3: Proxy
const isObject = v => typeof v === 'object' && v !== null

function reactive(obj) {
  if (!isObject(obj)) {
    return obj
  }
  
  return new Proxy(obj, {
    get(target, key) {
      const res = Reflect.get(target, key)
      // console.log('get', key);

      track(target, key)
      
      return isObject(res) ? reactive(res) : res
    },
    set(target, key, val) {
      const res = Reflect.set(target, key, val)
      // console.log('set', key);
      trigger(target, key)
      return res
    },
    deleteProperty(target, key) {
      const res = Reflect.deleteProperty(target, key)
      console.log('delete', key);
      return res
    }
  })
}

// 存储响应函数
const effectStack = []

// 将fn转换为一个响应式函数
function effect(fn) {
  // 包装成响应函数
  const e = createReactiveEffect(fn)

  // 立即执行
  e()

  return e
}

function createReactiveEffect(fn) {
  const effect = function reactiveEffect(...args) {
    if (!effectStack.includes(effect)) {
      // 捕获可能的错误
      try {
        // 1.入栈
        effectStack.push(effect)

        // 2.执行
        return fn(...args)
      } finally {
        // 3.出栈
        effectStack.pop()
      }
    }
  }
  return effect
}

const targetMap = new WeakMap()

// 依赖收集：保存target/key和fn之间映射关系
function track(target, key) {
  // 获取effect
  const effect = effectStack[effectStack.length - 1]
  if (effect) {
    let depMap = targetMap.get(target)
    if (!depMap) {
      // 首次执行
      depMap = new Map()
      targetMap.set(target, depMap)
    }

    // 获取key对应的回调数组
    let deps = depMap.get(key)
    if (!deps) {
      deps = new Set()
      depMap.set(key, deps)
    }
    deps.add(effect)
  }
}

// 触发函数：从映射关系中拿出响应函数数组并执行他们
function trigger(target, key) {
  const depMap = targetMap.get(target)

  if (!depMap) {
    return 
  }

  // 获取key对应的cbs
  const deps = depMap.get(key)
  if (deps) {
    deps.forEach(dep => dep())
  }
}

const obj = { foo: 'foo', dong: { n: 1 }, arr: [1,2,3] }
const observed = reactive(obj)

// 指定一个响应式函数
effect(() => {
  console.log('foo', observed.foo);
  
})


// observed.foo
observed.foo = 'foooooooo'
// observed.bar = 'bar'
// delete observed.bar

// observed.dong.n = 1
// observed.arr[0]
// delete observed.arr[2]
// observed.arr.push(4)