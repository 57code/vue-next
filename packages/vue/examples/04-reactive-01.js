// let state = 'foo'

// function setState(newState) {
//   state = newState
//   update()
// }

// function update() {
//   console.log(state);
  
// }

// setState('foooooooo')

// vue2
// Object.defineProperty()

// function defineReactive(obj, key, val) {
//   Object.defineProperty(obj, key, {
//     get(){
//       return val
//     },
//     set(v) {
//       val = v
//       update()
//     }
//   })
// }

// function update() {
//   console.log(obj.foo);
  
// }

// const obj = {}
// defineReactive(obj, 'foo', 'foo')

// obj.foo = 'foooooooo'



// vue3: Proxy
function defineReactive(obj) {
  return new Proxy(obj, {
    get(target, key){
      return target[key]
    },
    set(target, key, val) {
      target[key] = val
      update()
    }
  })
}

function update() {
  console.log(obj.foo);
  
}

const obj = {}
const observed = defineReactive(obj)

observed.foo = 'foooooooo'