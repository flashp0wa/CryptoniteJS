/*eslint-disable*/

class lol {
  constructor() {
    this.test = 'test';
  }

  testFunct() {
    return this.test;
  }
}

const {testFunct} = new lol();

console.log(testFunct());