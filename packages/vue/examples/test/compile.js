const template = '<div class="title">开课吧</div>'
// const ename = /[a-zA-Z_][\w-]*/
// const attr = /([a-zA-Z_:@][a-zA-Z0-9:.]*)=("([^"]*)"|'([^"]*)')/

function parse(template) {
  return {
    tag: 'div',
    type: 1,
    props: [
      { name: 'class', type: 6, value: { type: 2, content: 'title' } },
      {
        name: 'on',
        type: 7,
        arg: {
          content: 'click',
          isConstant: true,
          isStatic: true,
          type: 4
        },
        exp: {
          content: 'onclick',
          isConstant: false,
          isStatic: false,
          type: 4
        }
      }
    ],
    children: [
      {
        type: 2,
        content: 'hello, vue3!'
      }
    ]
  }
}

function transform(ast) {}

function generate(ast) {}
