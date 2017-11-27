class QObserve {
  constructor(obj, callback) {
    if (Object.prototype.toString.call(obj) !== '[object Object]') {
      return error('error')
    }
    this._callback = callback;
    this.observe(obj)
  }

  observe(obj) {
    if(Object.prototype.toString.call(obj) === '[object Array]'){
      this.overrideArrayProto(obj)
    }

    Object.keys(obj).forEach((key, i) => {
      let oldVal = obj[key];
      Object.defineProperty(obj, key, {
        get: () => {
          return oldVal;
        },
        set: ((newVal) => {
          if (oldVal !== newVal) {
            if (Object.prototype.toString.call(newVal) === '[object Object]' || Object.prototype.toString.call(newVal) === '[object Array]') {
              this.observe(newVal)
            }
            this._callback(newVal, oldVal);
            oldVal = newVal
          }
        }).bind(this)
      })

      if (Object.prototype.toString.call(obj[key]) === '[object Object]' || Object.prototype.toString.call(obj[key]) === '[object Array]') {
        this.observe(obj[key])
      }
    }, this)
  }
  overrideArrayProto(array) {
    const overrideMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
    let originProto = Array.prototype;
    let overrideProto = Object.create(Array.prototype);
    let self = this;

    overrideMethods.forEach((v, i) => {
      var method = v;

      Object.defineProperty(overrideProto,method,{
        value(){
          let oldArray = this.slice(0);
          let arg = Array.prototype.slice.apply(arguments);

          let result = originProto[method].apply(this,arg);

          self.observe(this);
          self._callback(this, oldArray);

          return result
        },
        writable: true,
        enumerable: false,
        configurable: true
      })
    })
    array.__proto__ = overrideProto

  }
}


var data = {
  a: 200,
  level_1: {
    b: 'str',
    c: [1, 2, 3],
    level_2: {
      d: 90,
      e:1
    }
  }
}

var fn = function (newVal, oldVal) {
  console.log(newVal, oldVal)
}

var o = new QObserve(data, fn)
var btn = document.querySelector('#btn')
btn.addEventListener('click', function () {
  let num = Math.random()
  data.level_1.c[0] = num
  // console.log(data.level_1.b)
})

cosnole.log('sdkfj')
