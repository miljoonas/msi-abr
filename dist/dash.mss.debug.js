(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(_dereq_,module,exports){
"use strict";

var bigInt = (function (undefined) {
  "use strict";var BASE = 1e7,
      LOG_BASE = 7,
      MAX_INT = 9007199254740992,
      MAX_INT_ARR = smallToArray(MAX_INT),
      DEFAULT_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";var supportsNativeBigInt = typeof BigInt === "function";function Integer(v, radix, alphabet, caseSensitive) {
    if (typeof v === "undefined") return Integer[0];if (typeof radix !== "undefined") return +radix === 10 && !alphabet ? parseValue(v) : parseBase(v, radix, alphabet, caseSensitive);return parseValue(v);
  }function BigInteger(value, sign) {
    this.value = value;this.sign = sign;this.isSmall = false;
  }BigInteger.prototype = Object.create(Integer.prototype);function SmallInteger(value) {
    this.value = value;this.sign = value < 0;this.isSmall = true;
  }SmallInteger.prototype = Object.create(Integer.prototype);function NativeBigInt(value) {
    this.value = value;
  }NativeBigInt.prototype = Object.create(Integer.prototype);function isPrecise(n) {
    return -MAX_INT < n && n < MAX_INT;
  }function smallToArray(n) {
    if (n < 1e7) return [n];if (n < 1e14) return [n % 1e7, Math.floor(n / 1e7)];return [n % 1e7, Math.floor(n / 1e7) % 1e7, Math.floor(n / 1e14)];
  }function arrayToSmall(arr) {
    trim(arr);var length = arr.length;if (length < 4 && compareAbs(arr, MAX_INT_ARR) < 0) {
      switch (length) {case 0:
          return 0;case 1:
          return arr[0];case 2:
          return arr[0] + arr[1] * BASE;default:
          return arr[0] + (arr[1] + arr[2] * BASE) * BASE;}
    }return arr;
  }function trim(v) {
    var i = v.length;while (v[--i] === 0);v.length = i + 1;
  }function createArray(length) {
    var x = new Array(length);var i = -1;while (++i < length) {
      x[i] = 0;
    }return x;
  }function truncate(n) {
    if (n > 0) return Math.floor(n);return Math.ceil(n);
  }function add(a, b) {
    var l_a = a.length,
        l_b = b.length,
        r = new Array(l_a),
        carry = 0,
        base = BASE,
        sum,
        i;for (i = 0; i < l_b; i++) {
      sum = a[i] + b[i] + carry;carry = sum >= base ? 1 : 0;r[i] = sum - carry * base;
    }while (i < l_a) {
      sum = a[i] + carry;carry = sum === base ? 1 : 0;r[i++] = sum - carry * base;
    }if (carry > 0) r.push(carry);return r;
  }function addAny(a, b) {
    if (a.length >= b.length) return add(a, b);return add(b, a);
  }function addSmall(a, carry) {
    var l = a.length,
        r = new Array(l),
        base = BASE,
        sum,
        i;for (i = 0; i < l; i++) {
      sum = a[i] - base + carry;carry = Math.floor(sum / base);r[i] = sum - carry * base;carry += 1;
    }while (carry > 0) {
      r[i++] = carry % base;carry = Math.floor(carry / base);
    }return r;
  }BigInteger.prototype.add = function (v) {
    var n = parseValue(v);if (this.sign !== n.sign) {
      return this.subtract(n.negate());
    }var a = this.value,
        b = n.value;if (n.isSmall) {
      return new BigInteger(addSmall(a, Math.abs(b)), this.sign);
    }return new BigInteger(addAny(a, b), this.sign);
  };BigInteger.prototype.plus = BigInteger.prototype.add;SmallInteger.prototype.add = function (v) {
    var n = parseValue(v);var a = this.value;if (a < 0 !== n.sign) {
      return this.subtract(n.negate());
    }var b = n.value;if (n.isSmall) {
      if (isPrecise(a + b)) return new SmallInteger(a + b);b = smallToArray(Math.abs(b));
    }return new BigInteger(addSmall(b, Math.abs(a)), a < 0);
  };SmallInteger.prototype.plus = SmallInteger.prototype.add;NativeBigInt.prototype.add = function (v) {
    return new NativeBigInt(this.value + parseValue(v).value);
  };NativeBigInt.prototype.plus = NativeBigInt.prototype.add;function subtract(a, b) {
    var a_l = a.length,
        b_l = b.length,
        r = new Array(a_l),
        borrow = 0,
        base = BASE,
        i,
        difference;for (i = 0; i < b_l; i++) {
      difference = a[i] - borrow - b[i];if (difference < 0) {
        difference += base;borrow = 1;
      } else borrow = 0;r[i] = difference;
    }for (i = b_l; i < a_l; i++) {
      difference = a[i] - borrow;if (difference < 0) difference += base;else {
        r[i++] = difference;break;
      }r[i] = difference;
    }for (; i < a_l; i++) {
      r[i] = a[i];
    }trim(r);return r;
  }function subtractAny(a, b, sign) {
    var value;if (compareAbs(a, b) >= 0) {
      value = subtract(a, b);
    } else {
      value = subtract(b, a);sign = !sign;
    }value = arrayToSmall(value);if (typeof value === "number") {
      if (sign) value = -value;return new SmallInteger(value);
    }return new BigInteger(value, sign);
  }function subtractSmall(a, b, sign) {
    var l = a.length,
        r = new Array(l),
        carry = -b,
        base = BASE,
        i,
        difference;for (i = 0; i < l; i++) {
      difference = a[i] + carry;carry = Math.floor(difference / base);difference %= base;r[i] = difference < 0 ? difference + base : difference;
    }r = arrayToSmall(r);if (typeof r === "number") {
      if (sign) r = -r;return new SmallInteger(r);
    }return new BigInteger(r, sign);
  }BigInteger.prototype.subtract = function (v) {
    var n = parseValue(v);if (this.sign !== n.sign) {
      return this.add(n.negate());
    }var a = this.value,
        b = n.value;if (n.isSmall) return subtractSmall(a, Math.abs(b), this.sign);return subtractAny(a, b, this.sign);
  };BigInteger.prototype.minus = BigInteger.prototype.subtract;SmallInteger.prototype.subtract = function (v) {
    var n = parseValue(v);var a = this.value;if (a < 0 !== n.sign) {
      return this.add(n.negate());
    }var b = n.value;if (n.isSmall) {
      return new SmallInteger(a - b);
    }return subtractSmall(b, Math.abs(a), a >= 0);
  };SmallInteger.prototype.minus = SmallInteger.prototype.subtract;NativeBigInt.prototype.subtract = function (v) {
    return new NativeBigInt(this.value - parseValue(v).value);
  };NativeBigInt.prototype.minus = NativeBigInt.prototype.subtract;BigInteger.prototype.negate = function () {
    return new BigInteger(this.value, !this.sign);
  };SmallInteger.prototype.negate = function () {
    var sign = this.sign;var small = new SmallInteger(-this.value);small.sign = !sign;return small;
  };NativeBigInt.prototype.negate = function () {
    return new NativeBigInt(-this.value);
  };BigInteger.prototype.abs = function () {
    return new BigInteger(this.value, false);
  };SmallInteger.prototype.abs = function () {
    return new SmallInteger(Math.abs(this.value));
  };NativeBigInt.prototype.abs = function () {
    return new NativeBigInt(this.value >= 0 ? this.value : -this.value);
  };function multiplyLong(a, b) {
    var a_l = a.length,
        b_l = b.length,
        l = a_l + b_l,
        r = createArray(l),
        base = BASE,
        product,
        carry,
        i,
        a_i,
        b_j;for (i = 0; i < a_l; ++i) {
      a_i = a[i];for (var j = 0; j < b_l; ++j) {
        b_j = b[j];product = a_i * b_j + r[i + j];carry = Math.floor(product / base);r[i + j] = product - carry * base;r[i + j + 1] += carry;
      }
    }trim(r);return r;
  }function multiplySmall(a, b) {
    var l = a.length,
        r = new Array(l),
        base = BASE,
        carry = 0,
        product,
        i;for (i = 0; i < l; i++) {
      product = a[i] * b + carry;carry = Math.floor(product / base);r[i] = product - carry * base;
    }while (carry > 0) {
      r[i++] = carry % base;carry = Math.floor(carry / base);
    }return r;
  }function shiftLeft(x, n) {
    var r = [];while (n-- > 0) r.push(0);return r.concat(x);
  }function multiplyKaratsuba(x, y) {
    var n = Math.max(x.length, y.length);if (n <= 30) return multiplyLong(x, y);n = Math.ceil(n / 2);var b = x.slice(n),
        a = x.slice(0, n),
        d = y.slice(n),
        c = y.slice(0, n);var ac = multiplyKaratsuba(a, c),
        bd = multiplyKaratsuba(b, d),
        abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d));var product = addAny(addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)), shiftLeft(bd, 2 * n));trim(product);return product;
  }function useKaratsuba(l1, l2) {
    return -.012 * l1 - .012 * l2 + 15e-6 * l1 * l2 > 0;
  }BigInteger.prototype.multiply = function (v) {
    var n = parseValue(v),
        a = this.value,
        b = n.value,
        sign = this.sign !== n.sign,
        abs;if (n.isSmall) {
      if (b === 0) return Integer[0];if (b === 1) return this;if (b === -1) return this.negate();abs = Math.abs(b);if (abs < BASE) {
        return new BigInteger(multiplySmall(a, abs), sign);
      }b = smallToArray(abs);
    }if (useKaratsuba(a.length, b.length)) return new BigInteger(multiplyKaratsuba(a, b), sign);return new BigInteger(multiplyLong(a, b), sign);
  };BigInteger.prototype.times = BigInteger.prototype.multiply;function multiplySmallAndArray(a, b, sign) {
    if (a < BASE) {
      return new BigInteger(multiplySmall(b, a), sign);
    }return new BigInteger(multiplyLong(b, smallToArray(a)), sign);
  }SmallInteger.prototype._multiplyBySmall = function (a) {
    if (isPrecise(a.value * this.value)) {
      return new SmallInteger(a.value * this.value);
    }return multiplySmallAndArray(Math.abs(a.value), smallToArray(Math.abs(this.value)), this.sign !== a.sign);
  };BigInteger.prototype._multiplyBySmall = function (a) {
    if (a.value === 0) return Integer[0];if (a.value === 1) return this;if (a.value === -1) return this.negate();return multiplySmallAndArray(Math.abs(a.value), this.value, this.sign !== a.sign);
  };SmallInteger.prototype.multiply = function (v) {
    return parseValue(v)._multiplyBySmall(this);
  };SmallInteger.prototype.times = SmallInteger.prototype.multiply;NativeBigInt.prototype.multiply = function (v) {
    return new NativeBigInt(this.value * parseValue(v).value);
  };NativeBigInt.prototype.times = NativeBigInt.prototype.multiply;function square(a) {
    var l = a.length,
        r = createArray(l + l),
        base = BASE,
        product,
        carry,
        i,
        a_i,
        a_j;for (i = 0; i < l; i++) {
      a_i = a[i];carry = 0 - a_i * a_i;for (var j = i; j < l; j++) {
        a_j = a[j];product = 2 * (a_i * a_j) + r[i + j] + carry;carry = Math.floor(product / base);r[i + j] = product - carry * base;
      }r[i + l] = carry;
    }trim(r);return r;
  }BigInteger.prototype.square = function () {
    return new BigInteger(square(this.value), false);
  };SmallInteger.prototype.square = function () {
    var value = this.value * this.value;if (isPrecise(value)) return new SmallInteger(value);return new BigInteger(square(smallToArray(Math.abs(this.value))), false);
  };NativeBigInt.prototype.square = function (v) {
    return new NativeBigInt(this.value * this.value);
  };function divMod1(a, b) {
    var a_l = a.length,
        b_l = b.length,
        base = BASE,
        result = createArray(b.length),
        divisorMostSignificantDigit = b[b_l - 1],
        lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)),
        remainder = multiplySmall(a, lambda),
        divisor = multiplySmall(b, lambda),
        quotientDigit,
        shift,
        carry,
        borrow,
        i,
        l,
        q;if (remainder.length <= a_l) remainder.push(0);divisor.push(0);divisorMostSignificantDigit = divisor[b_l - 1];for (shift = a_l - b_l; shift >= 0; shift--) {
      quotientDigit = base - 1;if (remainder[shift + b_l] !== divisorMostSignificantDigit) {
        quotientDigit = Math.floor((remainder[shift + b_l] * base + remainder[shift + b_l - 1]) / divisorMostSignificantDigit);
      }carry = 0;borrow = 0;l = divisor.length;for (i = 0; i < l; i++) {
        carry += quotientDigit * divisor[i];q = Math.floor(carry / base);borrow += remainder[shift + i] - (carry - q * base);carry = q;if (borrow < 0) {
          remainder[shift + i] = borrow + base;borrow = -1;
        } else {
          remainder[shift + i] = borrow;borrow = 0;
        }
      }while (borrow !== 0) {
        quotientDigit -= 1;carry = 0;for (i = 0; i < l; i++) {
          carry += remainder[shift + i] - base + divisor[i];if (carry < 0) {
            remainder[shift + i] = carry + base;carry = 0;
          } else {
            remainder[shift + i] = carry;carry = 1;
          }
        }borrow += carry;
      }result[shift] = quotientDigit;
    }remainder = divModSmall(remainder, lambda)[0];return [arrayToSmall(result), arrayToSmall(remainder)];
  }function divMod2(a, b) {
    var a_l = a.length,
        b_l = b.length,
        result = [],
        part = [],
        base = BASE,
        guess,
        xlen,
        highx,
        highy,
        check;while (a_l) {
      part.unshift(a[--a_l]);trim(part);if (compareAbs(part, b) < 0) {
        result.push(0);continue;
      }xlen = part.length;highx = part[xlen - 1] * base + part[xlen - 2];highy = b[b_l - 1] * base + b[b_l - 2];if (xlen > b_l) {
        highx = (highx + 1) * base;
      }guess = Math.ceil(highx / highy);do {
        check = multiplySmall(b, guess);if (compareAbs(check, part) <= 0) break;guess--;
      } while (guess);result.push(guess);part = subtract(part, check);
    }result.reverse();return [arrayToSmall(result), arrayToSmall(part)];
  }function divModSmall(value, lambda) {
    var length = value.length,
        quotient = createArray(length),
        base = BASE,
        i,
        q,
        remainder,
        divisor;remainder = 0;for (i = length - 1; i >= 0; --i) {
      divisor = remainder * base + value[i];q = truncate(divisor / lambda);remainder = divisor - q * lambda;quotient[i] = q | 0;
    }return [quotient, remainder | 0];
  }function divModAny(self, v) {
    var value,
        n = parseValue(v);if (supportsNativeBigInt) {
      return [new NativeBigInt(self.value / n.value), new NativeBigInt(self.value % n.value)];
    }var a = self.value,
        b = n.value;var quotient;if (b === 0) throw new Error("Cannot divide by zero");if (self.isSmall) {
      if (n.isSmall) {
        return [new SmallInteger(truncate(a / b)), new SmallInteger(a % b)];
      }return [Integer[0], self];
    }if (n.isSmall) {
      if (b === 1) return [self, Integer[0]];if (b == -1) return [self.negate(), Integer[0]];var abs = Math.abs(b);if (abs < BASE) {
        value = divModSmall(a, abs);quotient = arrayToSmall(value[0]);var remainder = value[1];if (self.sign) remainder = -remainder;if (typeof quotient === "number") {
          if (self.sign !== n.sign) quotient = -quotient;return [new SmallInteger(quotient), new SmallInteger(remainder)];
        }return [new BigInteger(quotient, self.sign !== n.sign), new SmallInteger(remainder)];
      }b = smallToArray(abs);
    }var comparison = compareAbs(a, b);if (comparison === -1) return [Integer[0], self];if (comparison === 0) return [Integer[self.sign === n.sign ? 1 : -1], Integer[0]];if (a.length + b.length <= 200) value = divMod1(a, b);else value = divMod2(a, b);quotient = value[0];var qSign = self.sign !== n.sign,
        mod = value[1],
        mSign = self.sign;if (typeof quotient === "number") {
      if (qSign) quotient = -quotient;quotient = new SmallInteger(quotient);
    } else quotient = new BigInteger(quotient, qSign);if (typeof mod === "number") {
      if (mSign) mod = -mod;mod = new SmallInteger(mod);
    } else mod = new BigInteger(mod, mSign);return [quotient, mod];
  }BigInteger.prototype.divmod = function (v) {
    var result = divModAny(this, v);return { quotient: result[0], remainder: result[1] };
  };NativeBigInt.prototype.divmod = SmallInteger.prototype.divmod = BigInteger.prototype.divmod;BigInteger.prototype.divide = function (v) {
    return divModAny(this, v)[0];
  };NativeBigInt.prototype.over = NativeBigInt.prototype.divide = function (v) {
    return new NativeBigInt(this.value / parseValue(v).value);
  };SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide;BigInteger.prototype.mod = function (v) {
    return divModAny(this, v)[1];
  };NativeBigInt.prototype.mod = NativeBigInt.prototype.remainder = function (v) {
    return new NativeBigInt(this.value % parseValue(v).value);
  };SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod;BigInteger.prototype.pow = function (v) {
    var n = parseValue(v),
        a = this.value,
        b = n.value,
        value,
        x,
        y;if (b === 0) return Integer[1];if (a === 0) return Integer[0];if (a === 1) return Integer[1];if (a === -1) return n.isEven() ? Integer[1] : Integer[-1];if (n.sign) {
      return Integer[0];
    }if (!n.isSmall) throw new Error("The exponent " + n.toString() + " is too large.");if (this.isSmall) {
      if (isPrecise(value = Math.pow(a, b))) return new SmallInteger(truncate(value));
    }x = this;y = Integer[1];while (true) {
      if (b & 1 === 1) {
        y = y.times(x);--b;
      }if (b === 0) break;b /= 2;x = x.square();
    }return y;
  };SmallInteger.prototype.pow = BigInteger.prototype.pow;NativeBigInt.prototype.pow = function (v) {
    var n = parseValue(v);var a = this.value,
        b = n.value;var _0 = BigInt(0),
        _1 = BigInt(1),
        _2 = BigInt(2);if (b === _0) return Integer[1];if (a === _0) return Integer[0];if (a === _1) return Integer[1];if (a === BigInt(-1)) return n.isEven() ? Integer[1] : Integer[-1];if (n.isNegative()) return new NativeBigInt(_0);var x = this;var y = Integer[1];while (true) {
      if ((b & _1) === _1) {
        y = y.times(x);--b;
      }if (b === _0) break;b /= _2;x = x.square();
    }return y;
  };BigInteger.prototype.modPow = function (exp, mod) {
    exp = parseValue(exp);mod = parseValue(mod);if (mod.isZero()) throw new Error("Cannot take modPow with modulus 0");var r = Integer[1],
        base = this.mod(mod);while (exp.isPositive()) {
      if (base.isZero()) return Integer[0];if (exp.isOdd()) r = r.multiply(base).mod(mod);exp = exp.divide(2);base = base.square().mod(mod);
    }return r;
  };NativeBigInt.prototype.modPow = SmallInteger.prototype.modPow = BigInteger.prototype.modPow;function compareAbs(a, b) {
    if (a.length !== b.length) {
      return a.length > b.length ? 1 : -1;
    }for (var i = a.length - 1; i >= 0; i--) {
      if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
    }return 0;
  }BigInteger.prototype.compareAbs = function (v) {
    var n = parseValue(v),
        a = this.value,
        b = n.value;if (n.isSmall) return 1;return compareAbs(a, b);
  };SmallInteger.prototype.compareAbs = function (v) {
    var n = parseValue(v),
        a = Math.abs(this.value),
        b = n.value;if (n.isSmall) {
      b = Math.abs(b);return a === b ? 0 : a > b ? 1 : -1;
    }return -1;
  };NativeBigInt.prototype.compareAbs = function (v) {
    var a = this.value;var b = parseValue(v).value;a = a >= 0 ? a : -a;b = b >= 0 ? b : -b;return a === b ? 0 : a > b ? 1 : -1;
  };BigInteger.prototype.compare = function (v) {
    if (v === Infinity) {
      return -1;
    }if (v === -Infinity) {
      return 1;
    }var n = parseValue(v),
        a = this.value,
        b = n.value;if (this.sign !== n.sign) {
      return n.sign ? 1 : -1;
    }if (n.isSmall) {
      return this.sign ? -1 : 1;
    }return compareAbs(a, b) * (this.sign ? -1 : 1);
  };BigInteger.prototype.compareTo = BigInteger.prototype.compare;SmallInteger.prototype.compare = function (v) {
    if (v === Infinity) {
      return -1;
    }if (v === -Infinity) {
      return 1;
    }var n = parseValue(v),
        a = this.value,
        b = n.value;if (n.isSmall) {
      return a == b ? 0 : a > b ? 1 : -1;
    }if (a < 0 !== n.sign) {
      return a < 0 ? -1 : 1;
    }return a < 0 ? 1 : -1;
  };SmallInteger.prototype.compareTo = SmallInteger.prototype.compare;NativeBigInt.prototype.compare = function (v) {
    if (v === Infinity) {
      return -1;
    }if (v === -Infinity) {
      return 1;
    }var a = this.value;var b = parseValue(v).value;return a === b ? 0 : a > b ? 1 : -1;
  };NativeBigInt.prototype.compareTo = NativeBigInt.prototype.compare;BigInteger.prototype.equals = function (v) {
    return this.compare(v) === 0;
  };NativeBigInt.prototype.eq = NativeBigInt.prototype.equals = SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals;BigInteger.prototype.notEquals = function (v) {
    return this.compare(v) !== 0;
  };NativeBigInt.prototype.neq = NativeBigInt.prototype.notEquals = SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals;BigInteger.prototype.greater = function (v) {
    return this.compare(v) > 0;
  };NativeBigInt.prototype.gt = NativeBigInt.prototype.greater = SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater;BigInteger.prototype.lesser = function (v) {
    return this.compare(v) < 0;
  };NativeBigInt.prototype.lt = NativeBigInt.prototype.lesser = SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser;BigInteger.prototype.greaterOrEquals = function (v) {
    return this.compare(v) >= 0;
  };NativeBigInt.prototype.geq = NativeBigInt.prototype.greaterOrEquals = SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;BigInteger.prototype.lesserOrEquals = function (v) {
    return this.compare(v) <= 0;
  };NativeBigInt.prototype.leq = NativeBigInt.prototype.lesserOrEquals = SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;BigInteger.prototype.isEven = function () {
    return (this.value[0] & 1) === 0;
  };SmallInteger.prototype.isEven = function () {
    return (this.value & 1) === 0;
  };NativeBigInt.prototype.isEven = function () {
    return (this.value & BigInt(1)) === BigInt(0);
  };BigInteger.prototype.isOdd = function () {
    return (this.value[0] & 1) === 1;
  };SmallInteger.prototype.isOdd = function () {
    return (this.value & 1) === 1;
  };NativeBigInt.prototype.isOdd = function () {
    return (this.value & BigInt(1)) === BigInt(1);
  };BigInteger.prototype.isPositive = function () {
    return !this.sign;
  };SmallInteger.prototype.isPositive = function () {
    return this.value > 0;
  };NativeBigInt.prototype.isPositive = SmallInteger.prototype.isPositive;BigInteger.prototype.isNegative = function () {
    return this.sign;
  };SmallInteger.prototype.isNegative = function () {
    return this.value < 0;
  };NativeBigInt.prototype.isNegative = SmallInteger.prototype.isNegative;BigInteger.prototype.isUnit = function () {
    return false;
  };SmallInteger.prototype.isUnit = function () {
    return Math.abs(this.value) === 1;
  };NativeBigInt.prototype.isUnit = function () {
    return this.abs().value === BigInt(1);
  };BigInteger.prototype.isZero = function () {
    return false;
  };SmallInteger.prototype.isZero = function () {
    return this.value === 0;
  };NativeBigInt.prototype.isZero = function () {
    return this.value === BigInt(0);
  };BigInteger.prototype.isDivisibleBy = function (v) {
    var n = parseValue(v);if (n.isZero()) return false;if (n.isUnit()) return true;if (n.compareAbs(2) === 0) return this.isEven();return this.mod(n).isZero();
  };NativeBigInt.prototype.isDivisibleBy = SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy;function isBasicPrime(v) {
    var n = v.abs();if (n.isUnit()) return false;if (n.equals(2) || n.equals(3) || n.equals(5)) return true;if (n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5)) return false;if (n.lesser(49)) return true;
  }function millerRabinTest(n, a) {
    var nPrev = n.prev(),
        b = nPrev,
        r = 0,
        d,
        t,
        i,
        x;while (b.isEven()) b = b.divide(2), r++;next: for (i = 0; i < a.length; i++) {
      if (n.lesser(a[i])) continue;x = bigInt(a[i]).modPow(b, n);if (x.isUnit() || x.equals(nPrev)) continue;for (d = r - 1; d != 0; d--) {
        x = x.square().mod(n);if (x.isUnit()) return false;if (x.equals(nPrev)) continue next;
      }return false;
    }return true;
  }BigInteger.prototype.isPrime = function (strict) {
    var isPrime = isBasicPrime(this);if (isPrime !== undefined) return isPrime;var n = this.abs();var bits = n.bitLength();if (bits <= 64) return millerRabinTest(n, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]);var logN = Math.log(2) * bits.toJSNumber();var t = Math.ceil(strict === true ? 2 * Math.pow(logN, 2) : logN);for (var a = [], i = 0; i < t; i++) {
      a.push(bigInt(i + 2));
    }return millerRabinTest(n, a);
  };NativeBigInt.prototype.isPrime = SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime;BigInteger.prototype.isProbablePrime = function (iterations) {
    var isPrime = isBasicPrime(this);if (isPrime !== undefined) return isPrime;var n = this.abs();var t = iterations === undefined ? 5 : iterations;for (var a = [], i = 0; i < t; i++) {
      a.push(bigInt.randBetween(2, n.minus(2)));
    }return millerRabinTest(n, a);
  };NativeBigInt.prototype.isProbablePrime = SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime;BigInteger.prototype.modInv = function (n) {
    var t = bigInt.zero,
        newT = bigInt.one,
        r = parseValue(n),
        newR = this.abs(),
        q,
        lastT,
        lastR;while (!newR.isZero()) {
      q = r.divide(newR);lastT = t;lastR = r;t = newT;r = newR;newT = lastT.subtract(q.multiply(newT));newR = lastR.subtract(q.multiply(newR));
    }if (!r.isUnit()) throw new Error(this.toString() + " and " + n.toString() + " are not co-prime");if (t.compare(0) === -1) {
      t = t.add(n);
    }if (this.isNegative()) {
      return t.negate();
    }return t;
  };NativeBigInt.prototype.modInv = SmallInteger.prototype.modInv = BigInteger.prototype.modInv;BigInteger.prototype.next = function () {
    var value = this.value;if (this.sign) {
      return subtractSmall(value, 1, this.sign);
    }return new BigInteger(addSmall(value, 1), this.sign);
  };SmallInteger.prototype.next = function () {
    var value = this.value;if (value + 1 < MAX_INT) return new SmallInteger(value + 1);return new BigInteger(MAX_INT_ARR, false);
  };NativeBigInt.prototype.next = function () {
    return new NativeBigInt(this.value + BigInt(1));
  };BigInteger.prototype.prev = function () {
    var value = this.value;if (this.sign) {
      return new BigInteger(addSmall(value, 1), true);
    }return subtractSmall(value, 1, this.sign);
  };SmallInteger.prototype.prev = function () {
    var value = this.value;if (value - 1 > -MAX_INT) return new SmallInteger(value - 1);return new BigInteger(MAX_INT_ARR, true);
  };NativeBigInt.prototype.prev = function () {
    return new NativeBigInt(this.value - BigInt(1));
  };var powersOfTwo = [1];while (2 * powersOfTwo[powersOfTwo.length - 1] <= BASE) powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);var powers2Length = powersOfTwo.length,
      highestPower2 = powersOfTwo[powers2Length - 1];function shift_isSmall(n) {
    return Math.abs(n) <= BASE;
  }BigInteger.prototype.shiftLeft = function (v) {
    var n = parseValue(v).toJSNumber();if (!shift_isSmall(n)) {
      throw new Error(String(n) + " is too large for shifting.");
    }if (n < 0) return this.shiftRight(-n);var result = this;if (result.isZero()) return result;while (n >= powers2Length) {
      result = result.multiply(highestPower2);n -= powers2Length - 1;
    }return result.multiply(powersOfTwo[n]);
  };NativeBigInt.prototype.shiftLeft = SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft;BigInteger.prototype.shiftRight = function (v) {
    var remQuo;var n = parseValue(v).toJSNumber();if (!shift_isSmall(n)) {
      throw new Error(String(n) + " is too large for shifting.");
    }if (n < 0) return this.shiftLeft(-n);var result = this;while (n >= powers2Length) {
      if (result.isZero() || result.isNegative() && result.isUnit()) return result;remQuo = divModAny(result, highestPower2);result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];n -= powers2Length - 1;
    }remQuo = divModAny(result, powersOfTwo[n]);return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
  };NativeBigInt.prototype.shiftRight = SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight;function bitwise(x, y, fn) {
    y = parseValue(y);var xSign = x.isNegative(),
        ySign = y.isNegative();var xRem = xSign ? x.not() : x,
        yRem = ySign ? y.not() : y;var xDigit = 0,
        yDigit = 0;var xDivMod = null,
        yDivMod = null;var result = [];while (!xRem.isZero() || !yRem.isZero()) {
      xDivMod = divModAny(xRem, highestPower2);xDigit = xDivMod[1].toJSNumber();if (xSign) {
        xDigit = highestPower2 - 1 - xDigit;
      }yDivMod = divModAny(yRem, highestPower2);yDigit = yDivMod[1].toJSNumber();if (ySign) {
        yDigit = highestPower2 - 1 - yDigit;
      }xRem = xDivMod[0];yRem = yDivMod[0];result.push(fn(xDigit, yDigit));
    }var sum = fn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? bigInt(-1) : bigInt(0);for (var i = result.length - 1; i >= 0; i -= 1) {
      sum = sum.multiply(highestPower2).add(bigInt(result[i]));
    }return sum;
  }BigInteger.prototype.not = function () {
    return this.negate().prev();
  };NativeBigInt.prototype.not = SmallInteger.prototype.not = BigInteger.prototype.not;BigInteger.prototype.and = function (n) {
    return bitwise(this, n, function (a, b) {
      return a & b;
    });
  };NativeBigInt.prototype.and = SmallInteger.prototype.and = BigInteger.prototype.and;BigInteger.prototype.or = function (n) {
    return bitwise(this, n, function (a, b) {
      return a | b;
    });
  };NativeBigInt.prototype.or = SmallInteger.prototype.or = BigInteger.prototype.or;BigInteger.prototype.xor = function (n) {
    return bitwise(this, n, function (a, b) {
      return a ^ b;
    });
  };NativeBigInt.prototype.xor = SmallInteger.prototype.xor = BigInteger.prototype.xor;var LOBMASK_I = 1 << 30,
      LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I;function roughLOB(n) {
    var v = n.value,
        x = typeof v === "number" ? v | LOBMASK_I : typeof v === "bigint" ? v | BigInt(LOBMASK_I) : v[0] + v[1] * BASE | LOBMASK_BI;return x & -x;
  }function integerLogarithm(value, base) {
    if (base.compareTo(value) <= 0) {
      var tmp = integerLogarithm(value, base.square(base));var p = tmp.p;var e = tmp.e;var t = p.multiply(base);return t.compareTo(value) <= 0 ? { p: t, e: e * 2 + 1 } : { p: p, e: e * 2 };
    }return { p: bigInt(1), e: 0 };
  }BigInteger.prototype.bitLength = function () {
    var n = this;if (n.compareTo(bigInt(0)) < 0) {
      n = n.negate().subtract(bigInt(1));
    }if (n.compareTo(bigInt(0)) === 0) {
      return bigInt(0);
    }return bigInt(integerLogarithm(n, bigInt(2)).e).add(bigInt(1));
  };NativeBigInt.prototype.bitLength = SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength;function max(a, b) {
    a = parseValue(a);b = parseValue(b);return a.greater(b) ? a : b;
  }function min(a, b) {
    a = parseValue(a);b = parseValue(b);return a.lesser(b) ? a : b;
  }function gcd(a, b) {
    a = parseValue(a).abs();b = parseValue(b).abs();if (a.equals(b)) return a;if (a.isZero()) return b;if (b.isZero()) return a;var c = Integer[1],
        d,
        t;while (a.isEven() && b.isEven()) {
      d = min(roughLOB(a), roughLOB(b));a = a.divide(d);b = b.divide(d);c = c.multiply(d);
    }while (a.isEven()) {
      a = a.divide(roughLOB(a));
    }do {
      while (b.isEven()) {
        b = b.divide(roughLOB(b));
      }if (a.greater(b)) {
        t = b;b = a;a = t;
      }b = b.subtract(a);
    } while (!b.isZero());return c.isUnit() ? a : a.multiply(c);
  }function lcm(a, b) {
    a = parseValue(a).abs();b = parseValue(b).abs();return a.divide(gcd(a, b)).multiply(b);
  }function randBetween(a, b) {
    a = parseValue(a);b = parseValue(b);var low = min(a, b),
        high = max(a, b);var range = high.subtract(low).add(1);if (range.isSmall) return low.add(Math.floor(Math.random() * range));var digits = toBase(range, BASE).value;var result = [],
        restricted = true;for (var i = 0; i < digits.length; i++) {
      var top = restricted ? digits[i] : BASE;var digit = truncate(Math.random() * top);result.push(digit);if (digit < top) restricted = false;
    }return low.add(Integer.fromArray(result, BASE, false));
  }var parseBase = function parseBase(text, base, alphabet, caseSensitive) {
    alphabet = alphabet || DEFAULT_ALPHABET;text = String(text);if (!caseSensitive) {
      text = text.toLowerCase();alphabet = alphabet.toLowerCase();
    }var length = text.length;var i;var absBase = Math.abs(base);var alphabetValues = {};for (i = 0; i < alphabet.length; i++) {
      alphabetValues[alphabet[i]] = i;
    }for (i = 0; i < length; i++) {
      var c = text[i];if (c === "-") continue;if (c in alphabetValues) {
        if (alphabetValues[c] >= absBase) {
          if (c === "1" && absBase === 1) continue;throw new Error(c + " is not a valid digit in base " + base + ".");
        }
      }
    }base = parseValue(base);var digits = [];var isNegative = text[0] === "-";for (i = isNegative ? 1 : 0; i < text.length; i++) {
      var c = text[i];if (c in alphabetValues) digits.push(parseValue(alphabetValues[c]));else if (c === "<") {
        var start = i;do {
          i++;
        } while (text[i] !== ">" && i < text.length);digits.push(parseValue(text.slice(start + 1, i)));
      } else throw new Error(c + " is not a valid character");
    }return parseBaseFromArray(digits, base, isNegative);
  };function parseBaseFromArray(digits, base, isNegative) {
    var val = Integer[0],
        pow = Integer[1],
        i;for (i = digits.length - 1; i >= 0; i--) {
      val = val.add(digits[i].times(pow));pow = pow.times(base);
    }return isNegative ? val.negate() : val;
  }function stringify(digit, alphabet) {
    alphabet = alphabet || DEFAULT_ALPHABET;if (digit < alphabet.length) {
      return alphabet[digit];
    }return "<" + digit + ">";
  }function toBase(n, base) {
    base = bigInt(base);if (base.isZero()) {
      if (n.isZero()) return { value: [0], isNegative: false };throw new Error("Cannot convert nonzero numbers to base 0.");
    }if (base.equals(-1)) {
      if (n.isZero()) return { value: [0], isNegative: false };if (n.isNegative()) return { value: [].concat.apply([], Array.apply(null, Array(-n.toJSNumber())).map(Array.prototype.valueOf, [1, 0])), isNegative: false };var arr = Array.apply(null, Array(n.toJSNumber() - 1)).map(Array.prototype.valueOf, [0, 1]);arr.unshift([1]);return { value: [].concat.apply([], arr), isNegative: false };
    }var neg = false;if (n.isNegative() && base.isPositive()) {
      neg = true;n = n.abs();
    }if (base.isUnit()) {
      if (n.isZero()) return { value: [0], isNegative: false };return { value: Array.apply(null, Array(n.toJSNumber())).map(Number.prototype.valueOf, 1), isNegative: neg };
    }var out = [];var left = n,
        divmod;while (left.isNegative() || left.compareAbs(base) >= 0) {
      divmod = left.divmod(base);left = divmod.quotient;var digit = divmod.remainder;if (digit.isNegative()) {
        digit = base.minus(digit).abs();left = left.next();
      }out.push(digit.toJSNumber());
    }out.push(left.toJSNumber());return { value: out.reverse(), isNegative: neg };
  }function toBaseString(n, base, alphabet) {
    var arr = toBase(n, base);return (arr.isNegative ? "-" : "") + arr.value.map(function (x) {
      return stringify(x, alphabet);
    }).join("");
  }BigInteger.prototype.toArray = function (radix) {
    return toBase(this, radix);
  };SmallInteger.prototype.toArray = function (radix) {
    return toBase(this, radix);
  };NativeBigInt.prototype.toArray = function (radix) {
    return toBase(this, radix);
  };BigInteger.prototype.toString = function (radix, alphabet) {
    if (radix === undefined) radix = 10;if (radix !== 10) return toBaseString(this, radix, alphabet);var v = this.value,
        l = v.length,
        str = String(v[--l]),
        zeros = "0000000",
        digit;while (--l >= 0) {
      digit = String(v[l]);str += zeros.slice(digit.length) + digit;
    }var sign = this.sign ? "-" : "";return sign + str;
  };SmallInteger.prototype.toString = function (radix, alphabet) {
    if (radix === undefined) radix = 10;if (radix != 10) return toBaseString(this, radix, alphabet);return String(this.value);
  };NativeBigInt.prototype.toString = SmallInteger.prototype.toString;NativeBigInt.prototype.toJSON = BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function () {
    return this.toString();
  };BigInteger.prototype.valueOf = function () {
    return parseInt(this.toString(), 10);
  };BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;SmallInteger.prototype.valueOf = function () {
    return this.value;
  };SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;NativeBigInt.prototype.valueOf = NativeBigInt.prototype.toJSNumber = function () {
    return parseInt(this.toString(), 10);
  };function parseStringValue(v) {
    if (isPrecise(+v)) {
      var x = +v;if (x === truncate(x)) return supportsNativeBigInt ? new NativeBigInt(BigInt(x)) : new SmallInteger(x);throw new Error("Invalid integer: " + v);
    }var sign = v[0] === "-";if (sign) v = v.slice(1);var split = v.split(/e/i);if (split.length > 2) throw new Error("Invalid integer: " + split.join("e"));if (split.length === 2) {
      var exp = split[1];if (exp[0] === "+") exp = exp.slice(1);exp = +exp;if (exp !== truncate(exp) || !isPrecise(exp)) throw new Error("Invalid integer: " + exp + " is not a valid exponent.");var text = split[0];var decimalPlace = text.indexOf(".");if (decimalPlace >= 0) {
        exp -= text.length - decimalPlace - 1;text = text.slice(0, decimalPlace) + text.slice(decimalPlace + 1);
      }if (exp < 0) throw new Error("Cannot include negative exponent part for integers");text += new Array(exp + 1).join("0");v = text;
    }var isValid = /^([0-9][0-9]*)$/.test(v);if (!isValid) throw new Error("Invalid integer: " + v);if (supportsNativeBigInt) {
      return new NativeBigInt(BigInt(sign ? "-" + v : v));
    }var r = [],
        max = v.length,
        l = LOG_BASE,
        min = max - l;while (max > 0) {
      r.push(+v.slice(min, max));min -= l;if (min < 0) min = 0;max -= l;
    }trim(r);return new BigInteger(r, sign);
  }function parseNumberValue(v) {
    if (supportsNativeBigInt) {
      return new NativeBigInt(BigInt(v));
    }if (isPrecise(v)) {
      if (v !== truncate(v)) throw new Error(v + " is not an integer.");return new SmallInteger(v);
    }return parseStringValue(v.toString());
  }function parseValue(v) {
    if (typeof v === "number") {
      return parseNumberValue(v);
    }if (typeof v === "string") {
      return parseStringValue(v);
    }if (typeof v === "bigint") {
      return new NativeBigInt(v);
    }return v;
  }for (var i = 0; i < 1e3; i++) {
    Integer[i] = parseValue(i);if (i > 0) Integer[-i] = parseValue(-i);
  }Integer.one = Integer[1];Integer.zero = Integer[0];Integer.minusOne = Integer[-1];Integer.max = max;Integer.min = min;Integer.gcd = gcd;Integer.lcm = lcm;Integer.isInstance = function (x) {
    return x instanceof BigInteger || x instanceof SmallInteger || x instanceof NativeBigInt;
  };Integer.randBetween = randBetween;Integer.fromArray = function (digits, base, isNegative) {
    return parseBaseFromArray(digits.map(parseValue), parseValue(base || 10), isNegative);
  };return Integer;
})();if (typeof module !== "undefined" && module.hasOwnProperty("exports")) {
  module.exports = bigInt;
}if (typeof define === "function" && define.amd) {
  define("big-integer", [], function () {
    return bigInt;
  });
}

},{}],2:[function(_dereq_,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */
/**
 * @module FactoryMaker
 * @ignore
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var FactoryMaker = (function () {

    var instance = undefined;
    var singletonContexts = [];
    var singletonFactories = {};
    var classFactories = {};

    function extend(name, childInstance, override, context) {
        if (!context[name] && childInstance) {
            context[name] = {
                instance: childInstance,
                override: override
            };
        }
    }

    /**
     * Use this method from your extended object.  this.factory is injected into your object.
     * this.factory.getSingletonInstance(this.context, 'VideoModel')
     * will return the video model for use in the extended object.
     *
     * @param {Object} context - injected into extended object as this.context
     * @param {string} className - string name found in all dash.js objects
     * with name __dashjs_factory_name Will be at the bottom. Will be the same as the object's name.
     * @returns {*} Context aware instance of specified singleton name.
     * @memberof module:FactoryMaker
     * @instance
     */
    function getSingletonInstance(context, className) {
        for (var i in singletonContexts) {
            var obj = singletonContexts[i];
            if (obj.context === context && obj.name === className) {
                return obj.instance;
            }
        }
        return null;
    }

    /**
     * Use this method to add an singleton instance to the system.  Useful for unit testing to mock objects etc.
     *
     * @param {Object} context
     * @param {string} className
     * @param {Object} instance
     * @memberof module:FactoryMaker
     * @instance
     */
    function setSingletonInstance(context, className, instance) {
        for (var i in singletonContexts) {
            var obj = singletonContexts[i];
            if (obj.context === context && obj.name === className) {
                singletonContexts[i].instance = instance;
                return;
            }
        }
        singletonContexts.push({
            name: className,
            context: context,
            instance: instance
        });
    }

    /**
     * Use this method to remove all singleton instances associated with a particular context.
     *
     * @param {Object} context
     * @memberof module:FactoryMaker
     * @instance
     */
    function deleteSingletonInstances(context) {
        singletonContexts = singletonContexts.filter(function (x) {
            return x.context !== context;
        });
    }

    /*------------------------------------------------------------------------------------------*/

    // Factories storage Management

    /*------------------------------------------------------------------------------------------*/

    function getFactoryByName(name, factoriesArray) {
        return factoriesArray[name];
    }

    function updateFactory(name, factory, factoriesArray) {
        if (name in factoriesArray) {
            factoriesArray[name] = factory;
        }
    }

    /*------------------------------------------------------------------------------------------*/

    // Class Factories Management

    /*------------------------------------------------------------------------------------------*/

    function updateClassFactory(name, factory) {
        updateFactory(name, factory, classFactories);
    }

    function getClassFactoryByName(name) {
        return getFactoryByName(name, classFactories);
    }

    function getClassFactory(classConstructor) {
        var factory = getFactoryByName(classConstructor.__dashjs_factory_name, classFactories);

        if (!factory) {
            factory = function (context) {
                if (context === undefined) {
                    context = {};
                }
                return {
                    create: function create() {
                        return merge(classConstructor, context, arguments);
                    }
                };
            };

            classFactories[classConstructor.__dashjs_factory_name] = factory; // store factory
        }
        return factory;
    }

    /*------------------------------------------------------------------------------------------*/

    // Singleton Factory MAangement

    /*------------------------------------------------------------------------------------------*/

    function updateSingletonFactory(name, factory) {
        updateFactory(name, factory, singletonFactories);
    }

    function getSingletonFactoryByName(name) {
        return getFactoryByName(name, singletonFactories);
    }

    function getSingletonFactory(classConstructor) {
        var factory = getFactoryByName(classConstructor.__dashjs_factory_name, singletonFactories);
        if (!factory) {
            factory = function (context) {
                var instance = undefined;
                if (context === undefined) {
                    context = {};
                }
                return {
                    getInstance: function getInstance() {
                        // If we don't have an instance yet check for one on the context
                        if (!instance) {
                            instance = getSingletonInstance(context, classConstructor.__dashjs_factory_name);
                        }
                        // If there's no instance on the context then create one
                        if (!instance) {
                            instance = merge(classConstructor, context, arguments);
                            singletonContexts.push({
                                name: classConstructor.__dashjs_factory_name,
                                context: context,
                                instance: instance
                            });
                        }
                        return instance;
                    }
                };
            };
            singletonFactories[classConstructor.__dashjs_factory_name] = factory; // store factory
        }

        return factory;
    }

    function merge(classConstructor, context, args) {

        var classInstance = undefined;
        var className = classConstructor.__dashjs_factory_name;
        var extensionObject = context[className];

        if (extensionObject) {

            var extension = extensionObject.instance;

            if (extensionObject.override) {
                //Override public methods in parent but keep parent.

                classInstance = classConstructor.apply({ context: context }, args);
                extension = extension.apply({
                    context: context,
                    factory: instance,
                    parent: classInstance
                }, args);

                for (var prop in extension) {
                    if (classInstance.hasOwnProperty(prop)) {
                        classInstance[prop] = extension[prop];
                    }
                }
            } else {
                //replace parent object completely with new object. Same as dijon.

                return extension.apply({
                    context: context,
                    factory: instance
                }, args);
            }
        } else {
            // Create new instance of the class
            classInstance = classConstructor.apply({ context: context }, args);
        }

        // Add getClassName function to class instance prototype (used by Debug)
        classInstance.getClassName = function () {
            return className;
        };

        return classInstance;
    }

    instance = {
        extend: extend,
        getSingletonInstance: getSingletonInstance,
        setSingletonInstance: setSingletonInstance,
        deleteSingletonInstances: deleteSingletonInstances,
        getSingletonFactory: getSingletonFactory,
        getSingletonFactoryByName: getSingletonFactoryByName,
        updateSingletonFactory: updateSingletonFactory,
        getClassFactory: getClassFactory,
        getClassFactoryByName: getClassFactoryByName,
        updateClassFactory: updateClassFactory
    };

    return instance;
})();

exports["default"] = FactoryMaker;
module.exports = exports["default"];

},{}],3:[function(_dereq_,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */
/**
 * @class
 * @ignore
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var ErrorsBase = (function () {
    function ErrorsBase() {
        _classCallCheck(this, ErrorsBase);
    }

    _createClass(ErrorsBase, [{
        key: 'extend',
        value: function extend(errors, config) {
            if (!errors) return;

            var override = config ? config.override : false;
            var publicOnly = config ? config.publicOnly : false;

            for (var err in errors) {
                if (!errors.hasOwnProperty(err) || this[err] && !override) continue;
                if (publicOnly && errors[err].indexOf('public_') === -1) continue;
                this[err] = errors[err];
            }
        }
    }]);

    return ErrorsBase;
})();

exports['default'] = ErrorsBase;
module.exports = exports['default'];

},{}],4:[function(_dereq_,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */
/**
 * @class
 * @ignore
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var EventsBase = (function () {
    function EventsBase() {
        _classCallCheck(this, EventsBase);
    }

    _createClass(EventsBase, [{
        key: 'extend',
        value: function extend(events, config) {
            if (!events) return;

            var override = config ? config.override : false;
            var publicOnly = config ? config.publicOnly : false;

            for (var evt in events) {
                if (!events.hasOwnProperty(evt) || this[evt] && !override) continue;
                if (publicOnly && events[evt].indexOf('public_') === -1) continue;
                this[evt] = events[evt];
            }
        }
    }]);

    return EventsBase;
})();

exports['default'] = EventsBase;
module.exports = exports['default'];

},{}],5:[function(_dereq_,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _streamingVoFragmentRequest = _dereq_('../streaming/vo/FragmentRequest');

var _streamingVoFragmentRequest2 = _interopRequireDefault(_streamingVoFragmentRequest);

var _streamingVoMetricsHTTPRequest = _dereq_('../streaming/vo/metrics/HTTPRequest');

function MssFragmentInfoController(config) {

    config = config || {};

    var instance = undefined,
        logger = undefined,
        fragmentModel = undefined,
        started = undefined,
        type = undefined,
        loadFragmentTimeout = undefined,
        startTime = undefined,
        startFragmentTime = undefined,
        index = undefined;

    var streamProcessor = config.streamProcessor;
    var baseURLController = config.baseURLController;
    var debug = config.debug;
    var controllerType = 'MssFragmentInfoController';

    function setup() {
        logger = debug.getLogger(instance);
    }

    function initialize() {
        type = streamProcessor.getType();
        fragmentModel = streamProcessor.getFragmentModel();

        started = false;
        startTime = null;
        startFragmentTime = null;
    }

    function start() {
        if (started) return;

        logger.debug('Start');

        started = true;
        index = 0;

        loadNextFragmentInfo();
    }

    function stop() {
        if (!started) return;

        logger.debug('Stop');

        clearTimeout(loadFragmentTimeout);
        started = false;
        startTime = null;
        startFragmentTime = null;
    }

    function reset() {
        stop();
    }

    function loadNextFragmentInfo() {
        if (!started) return;

        // Get last segment from SegmentTimeline
        var representation = getCurrentRepresentation();
        var manifest = representation.adaptation.period.mpd.manifest;
        var adaptation = manifest.Period_asArray[representation.adaptation.period.index].AdaptationSet_asArray[representation.adaptation.index];
        var segments = adaptation.SegmentTemplate.SegmentTimeline.S_asArray;
        var segment = segments[segments.length - 1];

        // logger.debug('Last fragment time: ' + (segment.t / adaptation.SegmentTemplate.timescale));

        // Generate segment request
        var request = getRequestForSegment(adaptation, representation, segment);

        // Send segment request
        requestFragment.call(this, request);
    }

    function getRequestForSegment(adaptation, representation, segment) {
        var timescale = adaptation.SegmentTemplate.timescale;
        var request = new _streamingVoFragmentRequest2['default']();

        request.mediaType = type;
        request.type = _streamingVoMetricsHTTPRequest.HTTPRequest.MSS_FRAGMENT_INFO_SEGMENT_TYPE;
        // request.range = segment.mediaRange;
        request.startTime = segment.t / timescale;
        request.duration = segment.d / timescale;
        request.timescale = timescale;
        // request.availabilityStartTime = segment.availabilityStartTime;
        // request.availabilityEndTime = segment.availabilityEndTime;
        // request.wallStartTime = segment.wallStartTime;
        request.quality = representation.index;
        request.index = index++;
        request.mediaInfo = streamProcessor.getMediaInfo();
        request.adaptationIndex = representation.adaptation.index;
        request.representationId = representation.id;
        request.url = baseURLController.resolve(representation.path).url + adaptation.SegmentTemplate.media;
        request.url = request.url.replace('$Bandwidth$', representation.bandwidth);
        request.url = request.url.replace('$Time$', segment.tManifest ? segment.tManifest : segment.t);
        request.url = request.url.replace('/Fragments(', '/FragmentInfo(');

        return request;
    }

    function getCurrentRepresentation() {
        var representationController = streamProcessor.getRepresentationController();
        var representation = representationController.getCurrentRepresentation();
        return representation;
    }

    function requestFragment(request) {
        // logger.debug('Load FragmentInfo for time: ' + request.startTime);
        if (streamProcessor.getFragmentModel().isFragmentLoadedOrPending(request)) {
            // We may have reached end of timeline in case of start-over streams
            logger.debug('End of timeline');
            stop();
            return;
        }

        fragmentModel.executeRequest(request);
    }

    function fragmentInfoLoaded(e) {
        if (!started) return;

        var request = e.request;
        if (!e.response) {
            logger.error('Load error', request.url);
            return;
        }

        var deltaFragmentTime = undefined,
            deltaTime = undefined,
            delay = undefined;

        // logger.debug('FragmentInfo loaded: ', request.url);

        if (startTime === null) {
            startTime = new Date().getTime();
        }

        if (!startFragmentTime) {
            startFragmentTime = request.startTime;
        }

        // Determine delay before requesting next FragmentInfo
        deltaTime = (new Date().getTime() - startTime) / 1000;
        deltaFragmentTime = request.startTime + request.duration - startFragmentTime;
        delay = Math.max(0, deltaFragmentTime - deltaTime);

        // Set timeout for requesting next FragmentInfo
        clearTimeout(loadFragmentTimeout);
        loadFragmentTimeout = setTimeout(function () {
            loadFragmentTimeout = null;
            loadNextFragmentInfo();
        }, delay * 1000);
    }

    function getType() {
        return type;
    }

    instance = {
        initialize: initialize,
        controllerType: controllerType,
        start: start,
        fragmentInfoLoaded: fragmentInfoLoaded,
        getType: getType,
        reset: reset
    };

    setup();

    return instance;
}

MssFragmentInfoController.__dashjs_factory_name = 'MssFragmentInfoController';
exports['default'] = dashjs.FactoryMaker.getClassFactory(MssFragmentInfoController);
/* jshint ignore:line */
module.exports = exports['default'];

},{"../streaming/vo/FragmentRequest":17,"../streaming/vo/metrics/HTTPRequest":18}],6:[function(_dereq_,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _streamingVoDashJSError = _dereq_('../streaming/vo/DashJSError');

var _streamingVoDashJSError2 = _interopRequireDefault(_streamingVoDashJSError);

var _errorsMssErrors = _dereq_('./errors/MssErrors');

var _errorsMssErrors2 = _interopRequireDefault(_errorsMssErrors);

var _streamingMediaPlayerEvents = _dereq_('../streaming/MediaPlayerEvents');

var _streamingMediaPlayerEvents2 = _interopRequireDefault(_streamingMediaPlayerEvents);

/**
 * @module MssFragmentMoofProcessor
 * @ignore
 * @param {Object} config object
 */
function MssFragmentMoofProcessor(config) {

    config = config || {};
    var instance = undefined,
        type = undefined,
        logger = undefined;
    var dashMetrics = config.dashMetrics;
    var playbackController = config.playbackController;
    var errorHandler = config.errHandler;
    var eventBus = config.eventBus;
    var ISOBoxer = config.ISOBoxer;
    var debug = config.debug;

    function setup() {
        logger = debug.getLogger(instance);
        type = '';
    }

    function processTfrf(request, tfrf, tfdt, streamProcessor) {
        var representationController = streamProcessor.getRepresentationController();
        var representation = representationController.getCurrentRepresentation();

        var manifest = representation.adaptation.period.mpd.manifest;
        var adaptation = manifest.Period_asArray[representation.adaptation.period.index].AdaptationSet_asArray[representation.adaptation.index];
        var timescale = adaptation.SegmentTemplate.timescale;

        type = streamProcessor.getType();

        // Process tfrf only for live streams or start-over static streams (timeShiftBufferDepth > 0)
        if (manifest.type !== 'dynamic' && !manifest.timeShiftBufferDepth) {
            return;
        }

        if (!tfrf) {
            errorHandler.error(new _streamingVoDashJSError2['default'](_errorsMssErrors2['default'].MSS_NO_TFRF_CODE, _errorsMssErrors2['default'].MSS_NO_TFRF_MESSAGE));
            return;
        }

        // Get adaptation's segment timeline (always a SegmentTimeline in Smooth Streaming use case)
        var segments = adaptation.SegmentTemplate.SegmentTimeline.S;
        var entries = tfrf.entry;
        var entry = undefined,
            segmentTime = undefined,
            range = undefined;
        var segment = null;
        var t = 0;
        var endTime = undefined;
        var availabilityStartTime = null;

        if (entries.length === 0) {
            return;
        }

        // Consider only first tfrf entry (to avoid pre-condition failure on fragment info requests)
        entry = entries[0];

        // In case of start-over streams, check if we have reached end of original manifest duration (set in timeShiftBufferDepth)
        // => then do not update anymore timeline
        if (manifest.type === 'static') {
            // Get first segment time
            segmentTime = segments[0].tManifest ? parseFloat(segments[0].tManifest) : segments[0].t;
            if (entry.fragment_absolute_time > segmentTime + manifest.timeShiftBufferDepth * timescale) {
                return;
            }
        }

        // logger.debug('entry - t = ', (entry.fragment_absolute_time / timescale));

        // Get last segment time
        segmentTime = segments[segments.length - 1].tManifest ? parseFloat(segments[segments.length - 1].tManifest) : segments[segments.length - 1].t;
        // logger.debug('Last segment - t = ', (segmentTime / timescale));

        // Check if we have to append new segment to timeline
        if (entry.fragment_absolute_time <= segmentTime) {
            // Update DVR window range => set range end to end time of current segment
            range = {
                start: segments[0].t / timescale,
                end: tfdt.baseMediaDecodeTime / timescale + request.duration
            };

            updateDVR(request.mediaType, range, streamProcessor.getStreamInfo().manifestInfo);
            return;
        }

        // logger.debug('Add new segment - t = ', (entry.fragment_absolute_time / timescale));
        segment = {};
        segment.t = entry.fragment_absolute_time;
        segment.d = entry.fragment_duration;
        // If timestamps starts at 0 relative to 1st segment (dynamic to static) then update segment time
        if (segments[0].tManifest) {
            segment.t -= parseFloat(segments[0].tManifest) - segments[0].t;
            segment.tManifest = entry.fragment_absolute_time;
        }

        // Patch previous segment duration
        var lastSegment = segments[segments.length - 1];
        if (lastSegment.t + lastSegment.d !== segment.t) {
            logger.debug('Patch segment duration - t = ', lastSegment.t + ', d = ' + lastSegment.d + ' => ' + (segment.t - lastSegment.t));
            lastSegment.d = segment.t - lastSegment.t;
        }

        segments.push(segment);

        // In case of static start-over streams, update content duration
        if (manifest.type === 'static') {
            if (type === 'video') {
                segment = segments[segments.length - 1];
                endTime = (segment.t + segment.d) / timescale;
                if (endTime > representation.adaptation.period.duration) {
                    eventBus.trigger(_streamingMediaPlayerEvents2['default'].MANIFEST_VALIDITY_CHANGED, { sender: this, newDuration: endTime });
                }
            }
            return;
        } else {
            // In case of live streams, update segment timeline according to DVR window
            if (manifest.timeShiftBufferDepth && manifest.timeShiftBufferDepth > 0) {
                // Get timestamp of the last segment
                segment = segments[segments.length - 1];
                t = segment.t;

                // Determine the segments' availability start time
                availabilityStartTime = (t - manifest.timeShiftBufferDepth * timescale) / timescale;

                // Remove segments prior to availability start time
                segment = segments[0];
                endTime = (segment.t + segment.d) / timescale;
                while (endTime < availabilityStartTime) {
                    // Check if not currently playing the segment to be removed
                    if (!playbackController.isPaused() && playbackController.getTime() < endTime) {
                        break;
                    }
                    // logger.debug('Remove segment  - t = ' + (segment.t / timescale));
                    segments.splice(0, 1);
                    segment = segments[0];
                    endTime = (segment.t + segment.d) / timescale;
                }
            }

            // Update DVR window range => set range end to end time of current segment
            range = {
                start: segments[0].t / timescale,
                end: tfdt.baseMediaDecodeTime / timescale + request.duration
            };

            updateDVR(type, range, streamProcessor.getStreamInfo().manifestInfo);
        }

        representationController.updateRepresentation(representation, true);
    }

    function updateDVR(type, range, manifestInfo) {
        if (type !== 'video' && type !== 'audio') return;
        var dvrInfos = dashMetrics.getCurrentDVRInfo(type);
        if (!dvrInfos || range.end > dvrInfos.range.end) {
            logger.debug('Update DVR range: [' + range.start + ' - ' + range.end + ']');
            dashMetrics.addDVRInfo(type, playbackController.getTime(), manifestInfo, range);
            playbackController.updateCurrentTime(type);
        }
    }

    // This function returns the offset of the 1st byte of a child box within a container box
    function getBoxOffset(parent, type) {
        var offset = 8;
        var i = 0;

        for (i = 0; i < parent.boxes.length; i++) {
            if (parent.boxes[i].type === type) {
                return offset;
            }
            offset += parent.boxes[i].size;
        }
        return offset;
    }

    function convertFragment(e, streamProcessor) {
        var i = undefined;

        // e.request contains request description object
        // e.response contains fragment bytes
        var isoFile = ISOBoxer.parseBuffer(e.response);
        // Update track_Id in tfhd box
        var tfhd = isoFile.fetch('tfhd');
        tfhd.track_ID = e.request.mediaInfo.index + 1;

        // Add tfdt box
        var tfdt = isoFile.fetch('tfdt');
        var traf = isoFile.fetch('traf');
        if (tfdt === null) {
            tfdt = ISOBoxer.createFullBox('tfdt', traf, tfhd);
            tfdt.version = 1;
            tfdt.flags = 0;
            tfdt.baseMediaDecodeTime = Math.floor(e.request.startTime * e.request.timescale);
        }

        var trun = isoFile.fetch('trun');

        // Process tfxd boxes
        // This box provide absolute timestamp but we take the segment start time for tfdt
        var tfxd = isoFile.fetch('tfxd');
        if (tfxd) {
            tfxd._parent.boxes.splice(tfxd._parent.boxes.indexOf(tfxd), 1);
            tfxd = null;
        }
        var tfrf = isoFile.fetch('tfrf');
        processTfrf(e.request, tfrf, tfdt, streamProcessor);
        if (tfrf) {
            tfrf._parent.boxes.splice(tfrf._parent.boxes.indexOf(tfrf), 1);
            tfrf = null;
        }

        // If protected content in PIFF1.1 format (sepiff box = Sample Encryption PIFF)
        // => convert sepiff box it into a senc box
        // => create saio and saiz boxes (if not already present)
        var sepiff = isoFile.fetch('sepiff');
        if (sepiff !== null) {
            sepiff.type = 'senc';
            sepiff.usertype = undefined;

            var _saio = isoFile.fetch('saio');
            if (_saio === null) {
                // Create Sample Auxiliary Information Offsets Box box (saio)
                _saio = ISOBoxer.createFullBox('saio', traf);
                _saio.version = 0;
                _saio.flags = 0;
                _saio.entry_count = 1;
                _saio.offset = [0];

                var saiz = ISOBoxer.createFullBox('saiz', traf);
                saiz.version = 0;
                saiz.flags = 0;
                saiz.sample_count = sepiff.sample_count;
                saiz.default_sample_info_size = 0;
                saiz.sample_info_size = [];

                if (sepiff.flags & 0x02) {
                    // Sub-sample encryption => set sample_info_size for each sample
                    for (i = 0; i < sepiff.sample_count; i += 1) {
                        // 10 = 8 (InitializationVector field size) + 2 (subsample_count field size)
                        // 6 = 2 (BytesOfClearData field size) + 4 (BytesOfEncryptedData field size)
                        saiz.sample_info_size[i] = 10 + 6 * sepiff.entry[i].NumberOfEntries;
                    }
                } else {
                    // No sub-sample encryption => set default sample_info_size = InitializationVector field size (8)
                    saiz.default_sample_info_size = 8;
                }
            }
        }

        tfhd.flags &= 0xFFFFFE; // set tfhd.base-data-offset-present to false
        tfhd.flags |= 0x020000; // set tfhd.default-base-is-moof to true
        trun.flags |= 0x000001; // set trun.data-offset-present to true

        // Update trun.data_offset field that corresponds to first data byte (inside mdat box)
        var moof = isoFile.fetch('moof');
        var length = moof.getLength();
        trun.data_offset = length + 8;

        // Update saio box offset field according to new senc box offset
        var saio = isoFile.fetch('saio');
        if (saio !== null) {
            var trafPosInMoof = getBoxOffset(moof, 'traf');
            var sencPosInTraf = getBoxOffset(traf, 'senc');
            // Set offset from begin fragment to the first IV field in senc box
            saio.offset[0] = trafPosInMoof + sencPosInTraf + 16; // 16 = box header (12) + sample_count field size (4)
        }

        // Write transformed/processed fragment into request reponse data
        e.response = isoFile.write();
    }

    function updateSegmentList(e, streamProcessor) {
        // e.request contains request description object
        // e.response contains fragment bytes
        if (!e.response) {
            throw new Error('e.response parameter is missing');
        }

        var isoFile = ISOBoxer.parseBuffer(e.response);
        // Update track_Id in tfhd box
        var tfhd = isoFile.fetch('tfhd');
        tfhd.track_ID = e.request.mediaInfo.index + 1;

        // Add tfdt box
        var tfdt = isoFile.fetch('tfdt');
        var traf = isoFile.fetch('traf');
        if (tfdt === null) {
            tfdt = ISOBoxer.createFullBox('tfdt', traf, tfhd);
            tfdt.version = 1;
            tfdt.flags = 0;
            tfdt.baseMediaDecodeTime = Math.floor(e.request.startTime * e.request.timescale);
        }

        var tfrf = isoFile.fetch('tfrf');
        processTfrf(e.request, tfrf, tfdt, streamProcessor);
        if (tfrf) {
            tfrf._parent.boxes.splice(tfrf._parent.boxes.indexOf(tfrf), 1);
            tfrf = null;
        }
    }

    function getType() {
        return type;
    }

    instance = {
        convertFragment: convertFragment,
        updateSegmentList: updateSegmentList,
        getType: getType
    };

    setup();
    return instance;
}

MssFragmentMoofProcessor.__dashjs_factory_name = 'MssFragmentMoofProcessor';
exports['default'] = dashjs.FactoryMaker.getClassFactory(MssFragmentMoofProcessor);
/* jshint ignore:line */
module.exports = exports['default'];

},{"../streaming/MediaPlayerEvents":13,"../streaming/vo/DashJSError":15,"./errors/MssErrors":10}],7:[function(_dereq_,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _errorsMssErrors = _dereq_('./errors/MssErrors');

var _errorsMssErrors2 = _interopRequireDefault(_errorsMssErrors);

/**
 * @module MssFragmentMoovProcessor
 * @ignore
 * @param {Object} config object
 */
function MssFragmentMoovProcessor(config) {
    config = config || {};
    var NALUTYPE_SPS = 7;
    var NALUTYPE_PPS = 8;
    var constants = config.constants;
    var ISOBoxer = config.ISOBoxer;

    var protectionController = config.protectionController;
    var instance = undefined,
        period = undefined,
        adaptationSet = undefined,
        representation = undefined,
        contentProtection = undefined,
        timescale = undefined,
        trackId = undefined;

    function createFtypBox(isoFile) {
        var ftyp = ISOBoxer.createBox('ftyp', isoFile);
        ftyp.major_brand = 'iso6';
        ftyp.minor_version = 1; // is an informative integer for the minor version of the major brand
        ftyp.compatible_brands = []; //is a list, to the end of the box, of brands isom, iso6 and msdh
        ftyp.compatible_brands[0] = 'isom'; // => decimal ASCII value for isom
        ftyp.compatible_brands[1] = 'iso6'; // => decimal ASCII value for iso6
        ftyp.compatible_brands[2] = 'msdh'; // => decimal ASCII value for msdh

        return ftyp;
    }

    function createMoovBox(isoFile) {

        // moov box
        var moov = ISOBoxer.createBox('moov', isoFile);

        // moov/mvhd
        createMvhdBox(moov);

        // moov/trak
        var trak = ISOBoxer.createBox('trak', moov);

        // moov/trak/tkhd
        createTkhdBox(trak);

        // moov/trak/mdia
        var mdia = ISOBoxer.createBox('mdia', trak);

        // moov/trak/mdia/mdhd
        createMdhdBox(mdia);

        // moov/trak/mdia/hdlr
        createHdlrBox(mdia);

        // moov/trak/mdia/minf
        var minf = ISOBoxer.createBox('minf', mdia);

        switch (adaptationSet.type) {
            case constants.VIDEO:
                // moov/trak/mdia/minf/vmhd
                createVmhdBox(minf);
                break;
            case constants.AUDIO:
                // moov/trak/mdia/minf/smhd
                createSmhdBox(minf);
                break;
            default:
                break;
        }

        // moov/trak/mdia/minf/dinf
        var dinf = ISOBoxer.createBox('dinf', minf);

        // moov/trak/mdia/minf/dinf/dref
        createDrefBox(dinf);

        // moov/trak/mdia/minf/stbl
        var stbl = ISOBoxer.createBox('stbl', minf);

        // Create empty stts, stsc, stco and stsz boxes
        // Use data field as for codem-isoboxer unknown boxes for setting fields value

        // moov/trak/mdia/minf/stbl/stts
        var stts = ISOBoxer.createFullBox('stts', stbl);
        stts._data = [0, 0, 0, 0, 0, 0, 0, 0]; // version = 0, flags = 0, entry_count = 0

        // moov/trak/mdia/minf/stbl/stsc
        var stsc = ISOBoxer.createFullBox('stsc', stbl);
        stsc._data = [0, 0, 0, 0, 0, 0, 0, 0]; // version = 0, flags = 0, entry_count = 0

        // moov/trak/mdia/minf/stbl/stco
        var stco = ISOBoxer.createFullBox('stco', stbl);
        stco._data = [0, 0, 0, 0, 0, 0, 0, 0]; // version = 0, flags = 0, entry_count = 0

        // moov/trak/mdia/minf/stbl/stsz
        var stsz = ISOBoxer.createFullBox('stsz', stbl);
        stsz._data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // version = 0, flags = 0, sample_size = 0, sample_count = 0

        // moov/trak/mdia/minf/stbl/stsd
        createStsdBox(stbl);

        // moov/mvex
        var mvex = ISOBoxer.createBox('mvex', moov);

        // moov/mvex/trex
        createTrexBox(mvex);

        if (contentProtection && protectionController) {
            var supportedKS = protectionController.getSupportedKeySystemsFromContentProtection(contentProtection);
            createProtectionSystemSpecificHeaderBox(moov, supportedKS);
        }
    }

    function createMvhdBox(moov) {

        var mvhd = ISOBoxer.createFullBox('mvhd', moov);

        mvhd.version = 1; // version = 1  in order to have 64bits duration value

        mvhd.creation_time = 0; // the creation time of the presentation => ignore (set to 0)
        mvhd.modification_time = 0; // the most recent time the presentation was modified => ignore (set to 0)
        mvhd.timescale = timescale; // the time-scale for the entire presentation => 10000000 for MSS
        mvhd.duration = period.duration === Infinity ? 0xFFFFFFFFFFFFFFFF : Math.round(period.duration * timescale); // the length of the presentation (in the indicated timescale) =>  take duration of period
        mvhd.rate = 1.0; // 16.16 number, '1.0' = normal playback
        mvhd.volume = 1.0; // 8.8 number, '1.0' = full volume
        mvhd.reserved1 = 0;
        mvhd.reserved2 = [0x0, 0x0];
        mvhd.matrix = [1, 0, 0, // provides a transformation matrix for the video;
        0, 1, 0, // (u,v,w) are restricted here to (0,0,1)
        0, 0, 16384];
        mvhd.pre_defined = [0, 0, 0, 0, 0, 0];
        mvhd.next_track_ID = trackId + 1; // indicates a value to use for the track ID of the next track to be added to this presentation

        return mvhd;
    }

    function createTkhdBox(trak) {

        var tkhd = ISOBoxer.createFullBox('tkhd', trak);

        tkhd.version = 1; // version = 1  in order to have 64bits duration value
        tkhd.flags = 0x1 | // Track_enabled (0x000001): Indicates that the track is enabled
        0x2 | // Track_in_movie (0x000002):  Indicates that the track is used in the presentation
        0x4; // Track_in_preview (0x000004):  Indicates that the track is used when previewing the presentation

        tkhd.creation_time = 0; // the creation time of the presentation => ignore (set to 0)
        tkhd.modification_time = 0; // the most recent time the presentation was modified => ignore (set to 0)
        tkhd.track_ID = trackId; // uniquely identifies this track over the entire life-time of this presentation
        tkhd.reserved1 = 0;
        tkhd.duration = period.duration === Infinity ? 0xFFFFFFFFFFFFFFFF : Math.round(period.duration * timescale); // the duration of this track (in the timescale indicated in the Movie Header Box) =>  take duration of period
        tkhd.reserved2 = [0x0, 0x0];
        tkhd.layer = 0; // specifies the front-to-back ordering of video tracks; tracks with lower numbers are closer to the viewer => 0 since only one video track
        tkhd.alternate_group = 0; // specifies a group or collection of tracks => ignore
        tkhd.volume = 1.0; // '1.0' = full volume
        tkhd.reserved3 = 0;
        tkhd.matrix = [1, 0, 0, // provides a transformation matrix for the video;
        0, 1, 0, // (u,v,w) are restricted here to (0,0,1)
        0, 0, 16384];
        tkhd.width = representation.width; // visual presentation width
        tkhd.height = representation.height; // visual presentation height

        return tkhd;
    }

    function createMdhdBox(mdia) {

        var mdhd = ISOBoxer.createFullBox('mdhd', mdia);

        mdhd.version = 1; // version = 1  in order to have 64bits duration value

        mdhd.creation_time = 0; // the creation time of the presentation => ignore (set to 0)
        mdhd.modification_time = 0; // the most recent time the presentation was modified => ignore (set to 0)
        mdhd.timescale = timescale; // the time-scale for the entire presentation
        mdhd.duration = period.duration === Infinity ? 0xFFFFFFFFFFFFFFFF : Math.round(period.duration * timescale); // the duration of this media (in the scale of the timescale). If the duration cannot be determined then duration is set to all 1s.
        mdhd.language = adaptationSet.lang || 'und'; // declares the language code for this media
        mdhd.pre_defined = 0;

        return mdhd;
    }

    function createHdlrBox(mdia) {

        var hdlr = ISOBoxer.createFullBox('hdlr', mdia);

        hdlr.pre_defined = 0;
        switch (adaptationSet.type) {
            case constants.VIDEO:
                hdlr.handler_type = 'vide';
                break;
            case constants.AUDIO:
                hdlr.handler_type = 'soun';
                break;
            default:
                hdlr.handler_type = 'meta';
                break;
        }
        hdlr.name = representation.id;
        hdlr.reserved = [0, 0, 0];

        return hdlr;
    }

    function createVmhdBox(minf) {

        var vmhd = ISOBoxer.createFullBox('vmhd', minf);

        vmhd.flags = 1;

        vmhd.graphicsmode = 0; // specifies a composition mode for this video track, from the following enumerated set, which may be extended by derived specifications: copy = 0 copy over the existing image
        vmhd.opcolor = [0, 0, 0]; // is a set of 3 colour values (red, green, blue) available for use by graphics modes

        return vmhd;
    }

    function createSmhdBox(minf) {

        var smhd = ISOBoxer.createFullBox('smhd', minf);

        smhd.flags = 1;

        smhd.balance = 0; // is a fixed-point 8.8 number that places mono audio tracks in a stereo space; 0 is centre (the normal value); full left is -1.0 and full right is 1.0.
        smhd.reserved = 0;

        return smhd;
    }

    function createDrefBox(dinf) {

        var dref = ISOBoxer.createFullBox('dref', dinf);

        dref.entry_count = 1;
        dref.entries = [];

        var url = ISOBoxer.createFullBox('url ', dref, false);
        url.location = '';
        url.flags = 1;

        dref.entries.push(url);

        return dref;
    }

    function createStsdBox(stbl) {

        var stsd = ISOBoxer.createFullBox('stsd', stbl);

        stsd.entries = [];
        switch (adaptationSet.type) {
            case constants.VIDEO:
            case constants.AUDIO:
                stsd.entries.push(createSampleEntry(stsd));
                break;
            default:
                break;
        }

        stsd.entry_count = stsd.entries.length; // is an integer that counts the actual entries
        return stsd;
    }

    function createSampleEntry(stsd) {
        var codec = representation.codecs.substring(0, representation.codecs.indexOf('.'));

        switch (codec) {
            case 'avc1':
                return createAVCVisualSampleEntry(stsd, codec);
            case 'mp4a':
                return createMP4AudioSampleEntry(stsd, codec);
            default:
                throw {
                    code: _errorsMssErrors2['default'].MSS_UNSUPPORTED_CODEC_CODE,
                    message: _errorsMssErrors2['default'].MSS_UNSUPPORTED_CODEC_MESSAGE,
                    data: {
                        codec: codec
                    }
                };
        }
    }

    function createAVCVisualSampleEntry(stsd, codec) {
        var avc1 = undefined;

        if (contentProtection) {
            avc1 = ISOBoxer.createBox('encv', stsd, false);
        } else {
            avc1 = ISOBoxer.createBox('avc1', stsd, false);
        }

        // SampleEntry fields
        avc1.reserved1 = [0x0, 0x0, 0x0, 0x0, 0x0, 0x0];
        avc1.data_reference_index = 1;

        // VisualSampleEntry fields
        avc1.pre_defined1 = 0;
        avc1.reserved2 = 0;
        avc1.pre_defined2 = [0, 0, 0];
        avc1.height = representation.height;
        avc1.width = representation.width;
        avc1.horizresolution = 72; // 72 dpi
        avc1.vertresolution = 72; // 72 dpi
        avc1.reserved3 = 0;
        avc1.frame_count = 1; // 1 compressed video frame per sample
        avc1.compressorname = [0x0A, 0x41, 0x56, 0x43, 0x20, 0x43, 0x6F, 0x64, // = 'AVC Coding';
        0x69, 0x6E, 0x67, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        avc1.depth = 0x0018; // 0x0018 – images are in colour with no alpha.
        avc1.pre_defined3 = 65535;
        avc1.config = createAVC1ConfigurationRecord();
        if (contentProtection) {
            // Create and add Protection Scheme Info Box
            var sinf = ISOBoxer.createBox('sinf', avc1);

            // Create and add Original Format Box => indicate codec type of the encrypted content
            createOriginalFormatBox(sinf, codec);

            // Create and add Scheme Type box
            createSchemeTypeBox(sinf);

            // Create and add Scheme Information Box
            createSchemeInformationBox(sinf);
        }

        return avc1;
    }

    function createAVC1ConfigurationRecord() {

        var avcC = null;
        var avcCLength = 15; // length = 15 by default (0 SPS and 0 PPS)

        // First get all SPS and PPS from codecPrivateData
        var sps = [];
        var pps = [];
        var AVCProfileIndication = 0;
        var AVCLevelIndication = 0;
        var profile_compatibility = 0;

        var nalus = representation.codecPrivateData.split('00000001').slice(1);
        var naluBytes = undefined,
            naluType = undefined;

        for (var _i = 0; _i < nalus.length; _i++) {
            naluBytes = hexStringtoBuffer(nalus[_i]);

            naluType = naluBytes[0] & 0x1F;

            switch (naluType) {
                case NALUTYPE_SPS:
                    sps.push(naluBytes);
                    avcCLength += naluBytes.length + 2; // 2 = sequenceParameterSetLength field length
                    break;
                case NALUTYPE_PPS:
                    pps.push(naluBytes);
                    avcCLength += naluBytes.length + 2; // 2 = pictureParameterSetLength field length
                    break;
                default:
                    break;
            }
        }

        // Get profile and level from SPS
        if (sps.length > 0) {
            AVCProfileIndication = sps[0][1];
            profile_compatibility = sps[0][2];
            AVCLevelIndication = sps[0][3];
        }

        // Generate avcC buffer
        avcC = new Uint8Array(avcCLength);

        var i = 0;
        // length
        avcC[i++] = (avcCLength & 0xFF000000) >> 24;
        avcC[i++] = (avcCLength & 0x00FF0000) >> 16;
        avcC[i++] = (avcCLength & 0x0000FF00) >> 8;
        avcC[i++] = avcCLength & 0x000000FF;
        avcC.set([0x61, 0x76, 0x63, 0x43], i); // type = 'avcC'
        i += 4;
        avcC[i++] = 1; // configurationVersion = 1
        avcC[i++] = AVCProfileIndication;
        avcC[i++] = profile_compatibility;
        avcC[i++] = AVCLevelIndication;
        avcC[i++] = 0xFF; // '11111' + lengthSizeMinusOne = 3
        avcC[i++] = 0xE0 | sps.length; // '111' + numOfSequenceParameterSets
        for (var n = 0; n < sps.length; n++) {
            avcC[i++] = (sps[n].length & 0xFF00) >> 8;
            avcC[i++] = sps[n].length & 0x00FF;
            avcC.set(sps[n], i);
            i += sps[n].length;
        }
        avcC[i++] = pps.length; // numOfPictureParameterSets
        for (var n = 0; n < pps.length; n++) {
            avcC[i++] = (pps[n].length & 0xFF00) >> 8;
            avcC[i++] = pps[n].length & 0x00FF;
            avcC.set(pps[n], i);
            i += pps[n].length;
        }

        return avcC;
    }

    function createMP4AudioSampleEntry(stsd, codec) {
        var mp4a = undefined;

        if (contentProtection) {
            mp4a = ISOBoxer.createBox('enca', stsd, false);
        } else {
            mp4a = ISOBoxer.createBox('mp4a', stsd, false);
        }

        // SampleEntry fields
        mp4a.reserved1 = [0x0, 0x0, 0x0, 0x0, 0x0, 0x0];
        mp4a.data_reference_index = 1;

        // AudioSampleEntry fields
        mp4a.reserved2 = [0x0, 0x0];
        mp4a.channelcount = representation.audioChannels;
        mp4a.samplesize = 16;
        mp4a.pre_defined = 0;
        mp4a.reserved_3 = 0;
        mp4a.samplerate = representation.audioSamplingRate << 16;

        mp4a.esds = createMPEG4AACESDescriptor();

        if (contentProtection) {
            // Create and add Protection Scheme Info Box
            var sinf = ISOBoxer.createBox('sinf', mp4a);

            // Create and add Original Format Box => indicate codec type of the encrypted content
            createOriginalFormatBox(sinf, codec);

            // Create and add Scheme Type box
            createSchemeTypeBox(sinf);

            // Create and add Scheme Information Box
            createSchemeInformationBox(sinf);
        }

        return mp4a;
    }

    function createMPEG4AACESDescriptor() {

        // AudioSpecificConfig (see ISO/IEC 14496-3, subpart 1) => corresponds to hex bytes contained in 'codecPrivateData' field
        var audioSpecificConfig = hexStringtoBuffer(representation.codecPrivateData);

        // ESDS length = esds box header length (= 12) +
        //               ES_Descriptor header length (= 5) +
        //               DecoderConfigDescriptor header length (= 15) +
        //               decoderSpecificInfo header length (= 2) +
        //               AudioSpecificConfig length (= codecPrivateData length)
        var esdsLength = 34 + audioSpecificConfig.length;
        var esds = new Uint8Array(esdsLength);

        var i = 0;
        // esds box
        esds[i++] = (esdsLength & 0xFF000000) >> 24; // esds box length
        esds[i++] = (esdsLength & 0x00FF0000) >> 16; // ''
        esds[i++] = (esdsLength & 0x0000FF00) >> 8; // ''
        esds[i++] = esdsLength & 0x000000FF; // ''
        esds.set([0x65, 0x73, 0x64, 0x73], i); // type = 'esds'
        i += 4;
        esds.set([0, 0, 0, 0], i); // version = 0, flags = 0
        i += 4;
        // ES_Descriptor (see ISO/IEC 14496-1 (Systems))
        esds[i++] = 0x03; // tag = 0x03 (ES_DescrTag)
        esds[i++] = 20 + audioSpecificConfig.length; // size
        esds[i++] = (trackId & 0xFF00) >> 8; // ES_ID = track_id
        esds[i++] = trackId & 0x00FF; // ''
        esds[i++] = 0; // flags and streamPriority

        // DecoderConfigDescriptor (see ISO/IEC 14496-1 (Systems))
        esds[i++] = 0x04; // tag = 0x04 (DecoderConfigDescrTag)
        esds[i++] = 15 + audioSpecificConfig.length; // size
        esds[i++] = 0x40; // objectTypeIndication = 0x40 (MPEG-4 AAC)
        esds[i] = 0x05 << 2; // streamType = 0x05 (Audiostream)
        esds[i] |= 0 << 1; // upStream = 0
        esds[i++] |= 1; // reserved = 1
        esds[i++] = 0xFF; // buffersizeDB = undefined
        esds[i++] = 0xFF; // ''
        esds[i++] = 0xFF; // ''
        esds[i++] = (representation.bandwidth & 0xFF000000) >> 24; // maxBitrate
        esds[i++] = (representation.bandwidth & 0x00FF0000) >> 16; // ''
        esds[i++] = (representation.bandwidth & 0x0000FF00) >> 8; // ''
        esds[i++] = representation.bandwidth & 0x000000FF; // ''
        esds[i++] = (representation.bandwidth & 0xFF000000) >> 24; // avgbitrate
        esds[i++] = (representation.bandwidth & 0x00FF0000) >> 16; // ''
        esds[i++] = (representation.bandwidth & 0x0000FF00) >> 8; // ''
        esds[i++] = representation.bandwidth & 0x000000FF; // ''

        // DecoderSpecificInfo (see ISO/IEC 14496-1 (Systems))
        esds[i++] = 0x05; // tag = 0x05 (DecSpecificInfoTag)
        esds[i++] = audioSpecificConfig.length; // size
        esds.set(audioSpecificConfig, i); // AudioSpecificConfig bytes

        return esds;
    }

    function createOriginalFormatBox(sinf, codec) {
        var frma = ISOBoxer.createBox('frma', sinf);
        frma.data_format = stringToCharCode(codec);
    }

    function createSchemeTypeBox(sinf) {
        var schm = ISOBoxer.createFullBox('schm', sinf);

        schm.flags = 0;
        schm.version = 0;
        schm.scheme_type = 0x63656E63; // 'cenc' => common encryption
        schm.scheme_version = 0x00010000; // version set to 0x00010000 (Major version 1, Minor version 0)
    }

    function createSchemeInformationBox(sinf) {
        var schi = ISOBoxer.createBox('schi', sinf);

        // Create and add Track Encryption Box
        createTrackEncryptionBox(schi);
    }

    function createProtectionSystemSpecificHeaderBox(moov, keySystems) {
        var pssh_bytes = undefined,
            pssh = undefined,
            i = undefined,
            parsedBuffer = undefined;

        for (i = 0; i < keySystems.length; i += 1) {
            pssh_bytes = keySystems[i].initData;
            if (pssh_bytes) {
                parsedBuffer = ISOBoxer.parseBuffer(pssh_bytes);
                pssh = parsedBuffer.fetch('pssh');
                if (pssh) {
                    ISOBoxer.Utils.appendBox(moov, pssh);
                }
            }
        }
    }

    function createTrackEncryptionBox(schi) {
        var tenc = ISOBoxer.createFullBox('tenc', schi);

        tenc.flags = 0;
        tenc.version = 0;

        tenc.default_IsEncrypted = 0x1;
        tenc.default_IV_size = 8;
        tenc.default_KID = contentProtection && contentProtection.length > 0 && contentProtection[0]['cenc:default_KID'] ? contentProtection[0]['cenc:default_KID'] : [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0];
    }

    function createTrexBox(moov) {
        var trex = ISOBoxer.createFullBox('trex', moov);

        trex.track_ID = trackId;
        trex.default_sample_description_index = 1;
        trex.default_sample_duration = 0;
        trex.default_sample_size = 0;
        trex.default_sample_flags = 0;

        return trex;
    }

    function hexStringtoBuffer(str) {
        var buf = new Uint8Array(str.length / 2);
        var i = undefined;

        for (i = 0; i < str.length / 2; i += 1) {
            buf[i] = parseInt('' + str[i * 2] + str[i * 2 + 1], 16);
        }
        return buf;
    }

    function stringToCharCode(str) {
        var code = 0;
        var i = undefined;

        for (i = 0; i < str.length; i += 1) {
            code |= str.charCodeAt(i) << (str.length - i - 1) * 8;
        }
        return code;
    }

    function generateMoov(rep) {
        if (!rep || !rep.adaptation) {
            return;
        }

        var isoFile = undefined,
            arrayBuffer = undefined;

        representation = rep;
        adaptationSet = representation.adaptation;

        period = adaptationSet.period;
        trackId = adaptationSet.index + 1;
        contentProtection = period.mpd.manifest.Period_asArray[period.index].AdaptationSet_asArray[adaptationSet.index].ContentProtection;

        timescale = period.mpd.manifest.Period_asArray[period.index].AdaptationSet_asArray[adaptationSet.index].SegmentTemplate.timescale;

        isoFile = ISOBoxer.createFile();
        createFtypBox(isoFile);
        createMoovBox(isoFile);

        arrayBuffer = isoFile.write();

        return arrayBuffer;
    }

    instance = {
        generateMoov: generateMoov
    };

    return instance;
}

MssFragmentMoovProcessor.__dashjs_factory_name = 'MssFragmentMoovProcessor';
exports['default'] = dashjs.FactoryMaker.getClassFactory(MssFragmentMoovProcessor);
/* jshint ignore:line */
module.exports = exports['default'];

},{"./errors/MssErrors":10}],8:[function(_dereq_,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _MssFragmentMoofProcessor = _dereq_('./MssFragmentMoofProcessor');

var _MssFragmentMoofProcessor2 = _interopRequireDefault(_MssFragmentMoofProcessor);

var _MssFragmentMoovProcessor = _dereq_('./MssFragmentMoovProcessor');

var _MssFragmentMoovProcessor2 = _interopRequireDefault(_MssFragmentMoovProcessor);

var _streamingVoMetricsHTTPRequest = _dereq_('../streaming/vo/metrics/HTTPRequest');

// Add specific box processors not provided by codem-isoboxer library

function arrayEqual(arr1, arr2) {
    return arr1.length === arr2.length && arr1.every(function (element, index) {
        return element === arr2[index];
    });
}

function saioProcessor() {
    this._procFullBox();
    if (this.flags & 1) {
        this._procField('aux_info_type', 'uint', 32);
        this._procField('aux_info_type_parameter', 'uint', 32);
    }
    this._procField('entry_count', 'uint', 32);
    this._procFieldArray('offset', this.entry_count, 'uint', this.version === 1 ? 64 : 32);
}

function saizProcessor() {
    this._procFullBox();
    if (this.flags & 1) {
        this._procField('aux_info_type', 'uint', 32);
        this._procField('aux_info_type_parameter', 'uint', 32);
    }
    this._procField('default_sample_info_size', 'uint', 8);
    this._procField('sample_count', 'uint', 32);
    if (this.default_sample_info_size === 0) {
        this._procFieldArray('sample_info_size', this.sample_count, 'uint', 8);
    }
}

function sencProcessor() {
    this._procFullBox();
    this._procField('sample_count', 'uint', 32);
    if (this.flags & 1) {
        this._procField('IV_size', 'uint', 8);
    }
    this._procEntries('entry', this.sample_count, function (entry) {
        this._procEntryField(entry, 'InitializationVector', 'data', 8);
        if (this.flags & 2) {
            this._procEntryField(entry, 'NumberOfEntries', 'uint', 16);
            this._procSubEntries(entry, 'clearAndCryptedData', entry.NumberOfEntries, function (clearAndCryptedData) {
                this._procEntryField(clearAndCryptedData, 'BytesOfClearData', 'uint', 16);
                this._procEntryField(clearAndCryptedData, 'BytesOfEncryptedData', 'uint', 32);
            });
        }
    });
}

function uuidProcessor() {
    var tfxdUserType = [0x6D, 0x1D, 0x9B, 0x05, 0x42, 0xD5, 0x44, 0xE6, 0x80, 0xE2, 0x14, 0x1D, 0xAF, 0xF7, 0x57, 0xB2];
    var tfrfUserType = [0xD4, 0x80, 0x7E, 0xF2, 0xCA, 0x39, 0x46, 0x95, 0x8E, 0x54, 0x26, 0xCB, 0x9E, 0x46, 0xA7, 0x9F];
    var sepiffUserType = [0xA2, 0x39, 0x4F, 0x52, 0x5A, 0x9B, 0x4f, 0x14, 0xA2, 0x44, 0x6C, 0x42, 0x7C, 0x64, 0x8D, 0xF4];

    if (arrayEqual(this.usertype, tfxdUserType)) {
        this._procFullBox();
        if (this._parsing) {
            this.type = 'tfxd';
        }
        this._procField('fragment_absolute_time', 'uint', this.version === 1 ? 64 : 32);
        this._procField('fragment_duration', 'uint', this.version === 1 ? 64 : 32);
    }

    if (arrayEqual(this.usertype, tfrfUserType)) {
        this._procFullBox();
        if (this._parsing) {
            this.type = 'tfrf';
        }
        this._procField('fragment_count', 'uint', 8);
        this._procEntries('entry', this.fragment_count, function (entry) {
            this._procEntryField(entry, 'fragment_absolute_time', 'uint', this.version === 1 ? 64 : 32);
            this._procEntryField(entry, 'fragment_duration', 'uint', this.version === 1 ? 64 : 32);
        });
    }

    if (arrayEqual(this.usertype, sepiffUserType)) {
        if (this._parsing) {
            this.type = 'sepiff';
        }
        sencProcessor.call(this);
    }
}

function MssFragmentProcessor(config) {

    config = config || {};
    var context = this.context;
    var dashMetrics = config.dashMetrics;
    var playbackController = config.playbackController;
    var eventBus = config.eventBus;
    var protectionController = config.protectionController;
    var ISOBoxer = config.ISOBoxer;
    var debug = config.debug;
    var mssFragmentMoovProcessor = undefined,
        mssFragmentMoofProcessor = undefined,
        instance = undefined;

    function setup() {
        ISOBoxer.addBoxProcessor('uuid', uuidProcessor);
        ISOBoxer.addBoxProcessor('saio', saioProcessor);
        ISOBoxer.addBoxProcessor('saiz', saizProcessor);
        ISOBoxer.addBoxProcessor('senc', sencProcessor);

        mssFragmentMoovProcessor = (0, _MssFragmentMoovProcessor2['default'])(context).create({
            protectionController: protectionController,
            constants: config.constants,
            ISOBoxer: ISOBoxer });

        mssFragmentMoofProcessor = (0, _MssFragmentMoofProcessor2['default'])(context).create({
            dashMetrics: dashMetrics,
            playbackController: playbackController,
            ISOBoxer: ISOBoxer,
            eventBus: eventBus,
            debug: debug,
            errHandler: config.errHandler
        });
    }

    function generateMoov(rep) {
        return mssFragmentMoovProcessor.generateMoov(rep);
    }

    function processFragment(e, streamProcessor) {
        if (!e || !e.request || !e.response) {
            throw new Error('e parameter is missing or malformed');
        }

        if (e.request.type === 'MediaSegment') {
            // MediaSegment => convert to Smooth Streaming moof format
            mssFragmentMoofProcessor.convertFragment(e, streamProcessor);
        } else if (e.request.type === _streamingVoMetricsHTTPRequest.HTTPRequest.MSS_FRAGMENT_INFO_SEGMENT_TYPE) {
            // FragmentInfo (live) => update segments list
            mssFragmentMoofProcessor.updateSegmentList(e, streamProcessor);

            // Stop event propagation (FragmentInfo must not be added to buffer)
            e.sender = null;
        }
    }

    instance = {
        generateMoov: generateMoov,
        processFragment: processFragment
    };

    setup();

    return instance;
}

MssFragmentProcessor.__dashjs_factory_name = 'MssFragmentProcessor';
exports['default'] = dashjs.FactoryMaker.getClassFactory(MssFragmentProcessor);
/* jshint ignore:line */
module.exports = exports['default'];

},{"../streaming/vo/metrics/HTTPRequest":18,"./MssFragmentMoofProcessor":6,"./MssFragmentMoovProcessor":7}],9:[function(_dereq_,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _streamingVoDataChunk = _dereq_('../streaming/vo/DataChunk');

var _streamingVoDataChunk2 = _interopRequireDefault(_streamingVoDataChunk);

var _streamingVoFragmentRequest = _dereq_('../streaming/vo/FragmentRequest');

var _streamingVoFragmentRequest2 = _interopRequireDefault(_streamingVoFragmentRequest);

var _MssFragmentInfoController = _dereq_('./MssFragmentInfoController');

var _MssFragmentInfoController2 = _interopRequireDefault(_MssFragmentInfoController);

var _MssFragmentProcessor = _dereq_('./MssFragmentProcessor');

var _MssFragmentProcessor2 = _interopRequireDefault(_MssFragmentProcessor);

var _parserMssParser = _dereq_('./parser/MssParser');

var _parserMssParser2 = _interopRequireDefault(_parserMssParser);

var _errorsMssErrors = _dereq_('./errors/MssErrors');

var _errorsMssErrors2 = _interopRequireDefault(_errorsMssErrors);

var _streamingVoDashJSError = _dereq_('../streaming/vo/DashJSError');

var _streamingVoDashJSError2 = _interopRequireDefault(_streamingVoDashJSError);

var _streamingUtilsInitCache = _dereq_('../streaming/utils/InitCache');

var _streamingUtilsInitCache2 = _interopRequireDefault(_streamingUtilsInitCache);

var _streamingVoMetricsHTTPRequest = _dereq_('../streaming/vo/metrics/HTTPRequest');

function MssHandler(config) {

    config = config || {};
    var context = this.context;
    var eventBus = config.eventBus;
    var events = config.events;
    var constants = config.constants;
    var initSegmentType = config.initSegmentType;
    var dashMetrics = config.dashMetrics;
    var playbackController = config.playbackController;
    var streamController = config.streamController;
    var protectionController = config.protectionController;
    var mssFragmentProcessor = (0, _MssFragmentProcessor2['default'])(context).create({
        dashMetrics: dashMetrics,
        playbackController: playbackController,
        protectionController: protectionController,
        streamController: streamController,
        eventBus: eventBus,
        constants: constants,
        ISOBoxer: config.ISOBoxer,
        debug: config.debug,
        errHandler: config.errHandler
    });
    var mssParser = undefined,
        fragmentInfoControllers = undefined,
        initCache = undefined,
        instance = undefined;

    function setup() {
        fragmentInfoControllers = [];
        initCache = (0, _streamingUtilsInitCache2['default'])(context).getInstance();
    }

    function getStreamProcessor(type) {
        return streamController.getActiveStreamProcessors().filter(function (processor) {
            return processor.getType() === type;
        })[0];
    }

    function getFragmentInfoController(type) {
        return fragmentInfoControllers.filter(function (controller) {
            return controller.getType() === type;
        })[0];
    }

    function createDataChunk(request, streamId, endFragment) {
        var chunk = new _streamingVoDataChunk2['default']();

        chunk.streamId = streamId;
        chunk.mediaInfo = request.mediaInfo;
        chunk.segmentType = request.type;
        chunk.start = request.startTime;
        chunk.duration = request.duration;
        chunk.end = chunk.start + chunk.duration;
        chunk.index = request.index;
        chunk.quality = request.quality;
        chunk.representationId = request.representationId;
        chunk.endFragment = endFragment;

        return chunk;
    }

    function startFragmentInfoControllers() {

        // Create MssFragmentInfoControllers for each StreamProcessor of active stream (only for audio, video or fragmentedText)
        var processors = streamController.getActiveStreamProcessors();
        processors.forEach(function (processor) {
            if (processor.getType() === constants.VIDEO || processor.getType() === constants.AUDIO || processor.getType() === constants.FRAGMENTED_TEXT) {

                var fragmentInfoController = getFragmentInfoController(processor.getType());
                if (!fragmentInfoController) {
                    fragmentInfoController = (0, _MssFragmentInfoController2['default'])(context).create({
                        streamProcessor: processor,
                        baseURLController: config.baseURLController,
                        debug: config.debug
                    });
                    fragmentInfoController.initialize();
                    fragmentInfoControllers.push(fragmentInfoController);
                }
                fragmentInfoController.start();
            }
        });
    }

    function stopFragmentInfoControllers() {
        fragmentInfoControllers.forEach(function (c) {
            c.reset();
        });
        fragmentInfoControllers = [];
    }

    function onInitFragmentNeeded(e) {
        var streamProcessor = getStreamProcessor(e.mediaType);
        if (!streamProcessor) return;

        // Create init segment request
        var representationController = streamProcessor.getRepresentationController();
        var representation = representationController.getCurrentRepresentation();
        var mediaInfo = streamProcessor.getMediaInfo();

        var request = new _streamingVoFragmentRequest2['default']();
        request.mediaType = representation.adaptation.type;
        request.type = initSegmentType;
        request.range = representation.range;
        request.quality = representation.index;
        request.mediaInfo = mediaInfo;
        request.representationId = representation.id;

        var chunk = createDataChunk(request, mediaInfo.streamInfo.id, e.type !== events.FRAGMENT_LOADING_PROGRESS);

        try {
            // Generate init segment (moov)
            chunk.bytes = mssFragmentProcessor.generateMoov(representation);

            // Notify init segment has been loaded
            eventBus.trigger(events.INIT_FRAGMENT_LOADED, { chunk: chunk }, { streamId: mediaInfo.streamInfo.id, mediaType: representation.adaptation.type });
        } catch (e) {
            config.errHandler.error(new _streamingVoDashJSError2['default'](e.code, e.message, e.data));
        }

        // Change the sender value to stop event to be propagated
        e.sender = null;
    }

    function onSegmentMediaLoaded(e) {
        if (e.error) return;

        var streamProcessor = getStreamProcessor(e.request.mediaType);
        if (!streamProcessor) return;

        // Process moof to transcode it from MSS to DASH (or to update segment timeline for SegmentInfo fragments)
        mssFragmentProcessor.processFragment(e, streamProcessor);

        if (e.request.type === _streamingVoMetricsHTTPRequest.HTTPRequest.MSS_FRAGMENT_INFO_SEGMENT_TYPE) {
            // If FragmentInfo loaded, then notify corresponding MssFragmentInfoController
            var fragmentInfoController = getFragmentInfoController(e.request.mediaType);
            if (fragmentInfoController) {
                fragmentInfoController.fragmentInfoLoaded(e);
            }
        }

        // Start MssFragmentInfoControllers in case of start-over streams
        var manifestInfo = e.request.mediaInfo.streamInfo.manifestInfo;
        if (!manifestInfo.isDynamic && manifestInfo.DVRWindowSize !== Infinity) {
            startFragmentInfoControllers();
        }
    }

    function onPlaybackPaused() {
        if (playbackController.getIsDynamic() && playbackController.getTime() !== 0) {
            startFragmentInfoControllers();
        }
    }

    function onPlaybackSeekAsked() {
        if (playbackController.getIsDynamic() && playbackController.getTime() !== 0) {
            startFragmentInfoControllers();
        }
    }

    function onTTMLPreProcess(ttmlSubtitles) {
        if (!ttmlSubtitles || !ttmlSubtitles.data) {
            return;
        }

        ttmlSubtitles.data = ttmlSubtitles.data.replace(/http:\/\/www.w3.org\/2006\/10\/ttaf1/gi, 'http://www.w3.org/ns/ttml');
    }

    function registerEvents() {
        eventBus.on(events.INIT_FRAGMENT_NEEDED, onInitFragmentNeeded, instance, { priority: dashjs.FactoryMaker.getSingletonFactoryByName(eventBus.getClassName()).EVENT_PRIORITY_HIGH }); /* jshint ignore:line */
        eventBus.on(events.PLAYBACK_PAUSED, onPlaybackPaused, instance, { priority: dashjs.FactoryMaker.getSingletonFactoryByName(eventBus.getClassName()).EVENT_PRIORITY_HIGH }); /* jshint ignore:line */
        eventBus.on(events.PLAYBACK_SEEK_ASKED, onPlaybackSeekAsked, instance, { priority: dashjs.FactoryMaker.getSingletonFactoryByName(eventBus.getClassName()).EVENT_PRIORITY_HIGH }); /* jshint ignore:line */
        eventBus.on(events.FRAGMENT_LOADING_COMPLETED, onSegmentMediaLoaded, instance, { priority: dashjs.FactoryMaker.getSingletonFactoryByName(eventBus.getClassName()).EVENT_PRIORITY_HIGH }); /* jshint ignore:line */
        eventBus.on(events.TTML_TO_PARSE, onTTMLPreProcess, instance);
    }

    function reset() {
        if (mssParser) {
            mssParser.reset();
            mssParser = undefined;
        }

        eventBus.off(events.INIT_FRAGMENT_NEEDED, onInitFragmentNeeded, this);
        eventBus.off(events.PLAYBACK_PAUSED, onPlaybackPaused, this);
        eventBus.off(events.PLAYBACK_SEEK_ASKED, onPlaybackSeekAsked, this);
        eventBus.off(events.FRAGMENT_LOADING_COMPLETED, onSegmentMediaLoaded, this);
        eventBus.off(events.TTML_TO_PARSE, onTTMLPreProcess, this);

        // Reset FragmentInfoControllers
        stopFragmentInfoControllers();
    }

    function createMssParser() {
        mssParser = (0, _parserMssParser2['default'])(context).create(config);
        return mssParser;
    }

    instance = {
        reset: reset,
        createMssParser: createMssParser,
        registerEvents: registerEvents
    };

    setup();

    return instance;
}

MssHandler.__dashjs_factory_name = 'MssHandler';
var factory = dashjs.FactoryMaker.getClassFactory(MssHandler); /* jshint ignore:line */
factory.errors = _errorsMssErrors2['default'];
dashjs.FactoryMaker.updateClassFactory(MssHandler.__dashjs_factory_name, factory); /* jshint ignore:line */
exports['default'] = factory;
/* jshint ignore:line */
module.exports = exports['default'];

},{"../streaming/utils/InitCache":14,"../streaming/vo/DashJSError":15,"../streaming/vo/DataChunk":16,"../streaming/vo/FragmentRequest":17,"../streaming/vo/metrics/HTTPRequest":18,"./MssFragmentInfoController":5,"./MssFragmentProcessor":8,"./errors/MssErrors":10,"./parser/MssParser":12}],10:[function(_dereq_,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _coreErrorsErrorsBase = _dereq_('../../core/errors/ErrorsBase');

var _coreErrorsErrorsBase2 = _interopRequireDefault(_coreErrorsErrorsBase);

/**
 * @class
 *
 */

var MssErrors = (function (_ErrorsBase) {
  _inherits(MssErrors, _ErrorsBase);

  function MssErrors() {
    _classCallCheck(this, MssErrors);

    _get(Object.getPrototypeOf(MssErrors.prototype), 'constructor', this).call(this);
    /**
     * Error code returned when no tfrf box is detected in MSS live stream
     */
    this.MSS_NO_TFRF_CODE = 200;

    /**
     * Error code returned when one of the codecs defined in the manifest is not supported
     */
    this.MSS_UNSUPPORTED_CODEC_CODE = 201;

    this.MSS_NO_TFRF_MESSAGE = 'Missing tfrf in live media segment';
    this.MSS_UNSUPPORTED_CODEC_MESSAGE = 'Unsupported codec';
  }

  return MssErrors;
})(_coreErrorsErrorsBase2['default']);

var mssErrors = new MssErrors();
exports['default'] = mssErrors;
module.exports = exports['default'];

},{"../../core/errors/ErrorsBase":3}],11:[function(_dereq_,module,exports){
(function (global){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _MssHandler = _dereq_('./MssHandler');

var _MssHandler2 = _interopRequireDefault(_MssHandler);

// Shove both of these into the global scope
var context = typeof window !== 'undefined' && window || global;

var dashjs = context.dashjs;
if (!dashjs) {
  dashjs = context.dashjs = {};
}

dashjs.MssHandler = _MssHandler2['default'];

exports['default'] = dashjs;
exports.MssHandler = _MssHandler2['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./MssHandler":9}],12:[function(_dereq_,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @module MssParser
 * @ignore
 * @param {Object} config object
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _externalsBigInteger = _dereq_('../../../externals/BigInteger');

var _externalsBigInteger2 = _interopRequireDefault(_externalsBigInteger);

function MssParser(config) {
    config = config || {};
    var BASE64 = config.BASE64;
    var debug = config.debug;
    var constants = config.constants;
    var manifestModel = config.manifestModel;
    var mediaPlayerModel = config.mediaPlayerModel;
    var settings = config.settings;

    var DEFAULT_TIME_SCALE = 10000000.0;
    var SUPPORTED_CODECS = ['AAC', 'AACL', 'AVC1', 'H264', 'TTML', 'DFXP'];
    // MPEG-DASH Role and accessibility mapping for text tracks according to ETSI TS 103 285 v1.1.1 (section 7.1.2)
    var ROLE = {
        'CAPT': 'main',
        'SUBT': 'alternate',
        'DESC': 'main'
    };
    var ACCESSIBILITY = {
        'DESC': '2'
    };
    var samplingFrequencyIndex = {
        96000: 0x0,
        88200: 0x1,
        64000: 0x2,
        48000: 0x3,
        44100: 0x4,
        32000: 0x5,
        24000: 0x6,
        22050: 0x7,
        16000: 0x8,
        12000: 0x9,
        11025: 0xA,
        8000: 0xB,
        7350: 0xC
    };
    var mimeTypeMap = {
        'video': 'video/mp4',
        'audio': 'audio/mp4',
        'text': 'application/mp4'
    };

    var instance = undefined,
        logger = undefined,
        initialBufferSettings = undefined;

    function setup() {
        logger = debug.getLogger(instance);
    }

    function getAttributeAsBoolean(node, attrName) {
        var value = node.getAttribute(attrName);
        if (!value) return false;
        return value.toLowerCase() === 'true';
    }

    function mapPeriod(smoothStreamingMedia, timescale) {
        var period = {};
        var streams = undefined,
            adaptation = undefined;

        // For each StreamIndex node, create an AdaptationSet element
        period.AdaptationSet_asArray = [];
        streams = smoothStreamingMedia.getElementsByTagName('StreamIndex');
        for (var i = 0; i < streams.length; i++) {
            adaptation = mapAdaptationSet(streams[i], timescale);
            if (adaptation !== null) {
                period.AdaptationSet_asArray.push(adaptation);
            }
        }

        if (period.AdaptationSet_asArray.length > 0) {
            period.AdaptationSet = period.AdaptationSet_asArray.length > 1 ? period.AdaptationSet_asArray : period.AdaptationSet_asArray[0];
        }

        return period;
    }

    function mapAdaptationSet(streamIndex, timescale) {
        var adaptationSet = {};
        var representations = [];
        var segmentTemplate = undefined;
        var qualityLevels = undefined,
            representation = undefined,
            segments = undefined,
            i = undefined,
            index = undefined;

        var name = streamIndex.getAttribute('Name');
        var type = streamIndex.getAttribute('Type');
        var lang = streamIndex.getAttribute('Language');
        var fallBackId = lang ? type + '_' + lang : type;

        adaptationSet.id = name || fallBackId;
        adaptationSet.contentType = type;
        adaptationSet.lang = lang || 'und';
        adaptationSet.mimeType = mimeTypeMap[type];
        adaptationSet.subType = streamIndex.getAttribute('Subtype');
        adaptationSet.maxWidth = streamIndex.getAttribute('MaxWidth');
        adaptationSet.maxHeight = streamIndex.getAttribute('MaxHeight');

        // Map text tracks subTypes to MPEG-DASH AdaptationSet role and accessibility (see ETSI TS 103 285 v1.1.1, section 7.1.2)
        if (adaptationSet.subType) {
            if (ROLE[adaptationSet.subType]) {
                var role = {
                    schemeIdUri: 'urn:mpeg:dash:role:2011',
                    value: ROLE[adaptationSet.subType]
                };
                adaptationSet.Role = role;
                adaptationSet.Role_asArray = [role];
            }
            if (ACCESSIBILITY[adaptationSet.subType]) {
                var accessibility = {
                    schemeIdUri: 'urn:tva:metadata:cs:AudioPurposeCS:2007',
                    value: ACCESSIBILITY[adaptationSet.subType]
                };
                adaptationSet.Accessibility = accessibility;
                adaptationSet.Accessibility_asArray = [accessibility];
            }
        }

        // Create a SegmentTemplate with a SegmentTimeline
        segmentTemplate = mapSegmentTemplate(streamIndex, timescale);

        qualityLevels = streamIndex.getElementsByTagName('QualityLevel');
        // For each QualityLevel node, create a Representation element
        for (i = 0; i < qualityLevels.length; i++) {
            // Propagate BaseURL and mimeType
            qualityLevels[i].BaseURL = adaptationSet.BaseURL;
            qualityLevels[i].mimeType = adaptationSet.mimeType;

            // Set quality level id
            index = qualityLevels[i].getAttribute('Index');
            qualityLevels[i].Id = adaptationSet.id + (index !== null ? '_' + index : '');

            // Map Representation to QualityLevel
            representation = mapRepresentation(qualityLevels[i], streamIndex);

            if (representation !== null) {
                // Copy SegmentTemplate into Representation
                representation.SegmentTemplate = segmentTemplate;

                representations.push(representation);
            }
        }

        if (representations.length === 0) {
            return null;
        }

        adaptationSet.Representation = representations.length > 1 ? representations : representations[0];
        adaptationSet.Representation_asArray = representations;

        // Set SegmentTemplate
        adaptationSet.SegmentTemplate = segmentTemplate;

        segments = segmentTemplate.SegmentTimeline.S_asArray;

        return adaptationSet;
    }

    function mapRepresentation(qualityLevel, streamIndex) {
        var representation = {};
        var type = streamIndex.getAttribute('Type');
        var fourCCValue = null;
        var width = null;
        var height = null;

        representation.id = qualityLevel.Id;
        representation.bandwidth = parseInt(qualityLevel.getAttribute('Bitrate'), 10);
        representation.mimeType = qualityLevel.mimeType;

        width = parseInt(qualityLevel.getAttribute('MaxWidth'), 10);
        height = parseInt(qualityLevel.getAttribute('MaxHeight'), 10);
        if (!isNaN(width)) representation.width = width;
        if (!isNaN(height)) representation.height = height;

        fourCCValue = qualityLevel.getAttribute('FourCC');

        // If FourCC not defined at QualityLevel level, then get it from StreamIndex level
        if (fourCCValue === null || fourCCValue === '') {
            fourCCValue = streamIndex.getAttribute('FourCC');
        }

        // If still not defined (optionnal for audio stream, see https://msdn.microsoft.com/en-us/library/ff728116%28v=vs.95%29.aspx),
        // then we consider the stream is an audio AAC stream
        if (fourCCValue === null || fourCCValue === '') {
            if (type === constants.AUDIO) {
                fourCCValue = 'AAC';
            } else if (type === constants.VIDEO) {
                logger.debug('FourCC is not defined whereas it is required for a QualityLevel element for a StreamIndex of type "video"');
                return null;
            }
        }

        // Check if codec is supported
        if (SUPPORTED_CODECS.indexOf(fourCCValue.toUpperCase()) === -1) {
            // Do not send warning
            logger.warn('Codec not supported: ' + fourCCValue);
            return null;
        }

        // Get codecs value according to FourCC field
        if (fourCCValue === 'H264' || fourCCValue === 'AVC1') {
            representation.codecs = getH264Codec(qualityLevel);
        } else if (fourCCValue.indexOf('AAC') >= 0) {
            representation.codecs = getAACCodec(qualityLevel, fourCCValue);
            representation.audioSamplingRate = parseInt(qualityLevel.getAttribute('SamplingRate'), 10);
            representation.audioChannels = parseInt(qualityLevel.getAttribute('Channels'), 10);
        } else if (fourCCValue.indexOf('TTML') || fourCCValue.indexOf('DFXP')) {
            representation.codecs = constants.STPP;
        }

        representation.codecPrivateData = '' + qualityLevel.getAttribute('CodecPrivateData');
        representation.BaseURL = qualityLevel.BaseURL;

        return representation;
    }

    function getH264Codec(qualityLevel) {
        var codecPrivateData = qualityLevel.getAttribute('CodecPrivateData').toString();
        var nalHeader = undefined,
            avcoti = undefined;

        // Extract from the CodecPrivateData field the hexadecimal representation of the following
        // three bytes in the sequence parameter set NAL unit.
        // => Find the SPS nal header
        nalHeader = /00000001[0-9]7/.exec(codecPrivateData);
        // => Find the 6 characters after the SPS nalHeader (if it exists)
        avcoti = nalHeader && nalHeader[0] ? codecPrivateData.substr(codecPrivateData.indexOf(nalHeader[0]) + 10, 6) : undefined;

        return 'avc1.' + avcoti;
    }

    function getAACCodec(qualityLevel, fourCCValue) {
        var samplingRate = parseInt(qualityLevel.getAttribute('SamplingRate'), 10);
        var codecPrivateData = qualityLevel.getAttribute('CodecPrivateData').toString();
        var objectType = 0;
        var codecPrivateDataHex = undefined,
            arr16 = undefined,
            indexFreq = undefined,
            extensionSamplingFrequencyIndex = undefined;

        //chrome problem, in implicit AAC HE definition, so when AACH is detected in FourCC
        //set objectType to 5 => strange, it should be 2
        if (fourCCValue === 'AACH') {
            objectType = 0x05;
        }
        //if codecPrivateData is empty, build it :
        if (codecPrivateData === undefined || codecPrivateData === '') {
            objectType = 0x02; //AAC Main Low Complexity => object Type = 2
            indexFreq = samplingFrequencyIndex[samplingRate];
            if (fourCCValue === 'AACH') {
                // 4 bytes :     XXXXX         XXXX          XXXX             XXXX                  XXXXX      XXX   XXXXXXX
                //           ' ObjectType' 'Freq Index' 'Channels value'   'Extens Sampl Freq'  'ObjectType'  'GAS' 'alignment = 0'
                objectType = 0x05; // High Efficiency AAC Profile = object Type = 5 SBR
                codecPrivateData = new Uint8Array(4);
                extensionSamplingFrequencyIndex = samplingFrequencyIndex[samplingRate * 2]; // in HE AAC Extension Sampling frequence
                // equals to SamplingRate*2
                //Freq Index is present for 3 bits in the first byte, last bit is in the second
                codecPrivateData[0] = objectType << 3 | indexFreq >> 1;
                codecPrivateData[1] = indexFreq << 7 | qualityLevel.Channels << 3 | extensionSamplingFrequencyIndex >> 1;
                codecPrivateData[2] = extensionSamplingFrequencyIndex << 7 | 0x02 << 2; // origin object type equals to 2 => AAC Main Low Complexity
                codecPrivateData[3] = 0x0; //alignment bits

                arr16 = new Uint16Array(2);
                arr16[0] = (codecPrivateData[0] << 8) + codecPrivateData[1];
                arr16[1] = (codecPrivateData[2] << 8) + codecPrivateData[3];
                //convert decimal to hex value
                codecPrivateDataHex = arr16[0].toString(16);
                codecPrivateDataHex = arr16[0].toString(16) + arr16[1].toString(16);
            } else {
                // 2 bytes :     XXXXX         XXXX          XXXX              XXX
                //           ' ObjectType' 'Freq Index' 'Channels value'   'GAS = 000'
                codecPrivateData = new Uint8Array(2);
                //Freq Index is present for 3 bits in the first byte, last bit is in the second
                codecPrivateData[0] = objectType << 3 | indexFreq >> 1;
                codecPrivateData[1] = indexFreq << 7 | parseInt(qualityLevel.getAttribute('Channels'), 10) << 3;
                // put the 2 bytes in an 16 bits array
                arr16 = new Uint16Array(1);
                arr16[0] = (codecPrivateData[0] << 8) + codecPrivateData[1];
                //convert decimal to hex value
                codecPrivateDataHex = arr16[0].toString(16);
            }

            codecPrivateData = '' + codecPrivateDataHex;
            codecPrivateData = codecPrivateData.toUpperCase();
            qualityLevel.setAttribute('CodecPrivateData', codecPrivateData);
        } else if (objectType === 0) {
            objectType = (parseInt(codecPrivateData.substr(0, 2), 16) & 0xF8) >> 3;
        }

        return 'mp4a.40.' + objectType;
    }

    function mapSegmentTemplate(streamIndex, timescale) {
        var segmentTemplate = {};
        var mediaUrl = undefined,
            streamIndexTimeScale = undefined,
            url = undefined;

        url = streamIndex.getAttribute('Url');
        mediaUrl = url ? url.replace('{bitrate}', '$Bandwidth$') : null;
        mediaUrl = mediaUrl ? mediaUrl.replace('{start time}', '$Time$') : null;

        streamIndexTimeScale = streamIndex.getAttribute('TimeScale');
        streamIndexTimeScale = streamIndexTimeScale ? parseFloat(streamIndexTimeScale) : timescale;

        segmentTemplate.media = mediaUrl;
        segmentTemplate.timescale = streamIndexTimeScale;

        segmentTemplate.SegmentTimeline = mapSegmentTimeline(streamIndex, segmentTemplate.timescale);

        return segmentTemplate;
    }

    function mapSegmentTimeline(streamIndex, timescale) {
        var segmentTimeline = {};
        var chunks = streamIndex.getElementsByTagName('c');
        var segments = [];
        var segment = undefined,
            prevSegment = undefined,
            tManifest = undefined,
            i = undefined,
            j = undefined,
            r = undefined;
        var duration = 0;

        for (i = 0; i < chunks.length; i++) {
            segment = {};

            // Get time 't' attribute value
            tManifest = chunks[i].getAttribute('t');

            // => segment.tManifest = original timestamp value as a string (for constructing the fragment request url, see DashHandler)
            // => segment.t = number value of timestamp (maybe rounded value, but only for 0.1 microsecond)
            if (tManifest && (0, _externalsBigInteger2['default'])(tManifest).greater((0, _externalsBigInteger2['default'])(Number.MAX_SAFE_INTEGER))) {
                segment.tManifest = tManifest;
            }
            segment.t = parseFloat(tManifest);

            // Get duration 'd' attribute value
            segment.d = parseFloat(chunks[i].getAttribute('d'));

            // If 't' not defined for first segment then t=0
            if (i === 0 && !segment.t) {
                segment.t = 0;
            }

            if (i > 0) {
                prevSegment = segments[segments.length - 1];
                // Update previous segment duration if not defined
                if (!prevSegment.d) {
                    if (prevSegment.tManifest) {
                        prevSegment.d = (0, _externalsBigInteger2['default'])(tManifest).subtract((0, _externalsBigInteger2['default'])(prevSegment.tManifest)).toJSNumber();
                    } else {
                        prevSegment.d = segment.t - prevSegment.t;
                    }
                    duration += prevSegment.d;
                }
                // Set segment absolute timestamp if not set in manifest
                if (!segment.t) {
                    if (prevSegment.tManifest) {
                        segment.tManifest = (0, _externalsBigInteger2['default'])(prevSegment.tManifest).add((0, _externalsBigInteger2['default'])(prevSegment.d)).toString();
                        segment.t = parseFloat(segment.tManifest);
                    } else {
                        segment.t = prevSegment.t + prevSegment.d;
                    }
                }
            }

            if (segment.d) {
                duration += segment.d;
            }

            // Create new segment
            segments.push(segment);

            // Support for 'r' attribute (i.e. "repeat" as in MPEG-DASH)
            r = parseFloat(chunks[i].getAttribute('r'));
            if (r) {

                for (j = 0; j < r - 1; j++) {
                    prevSegment = segments[segments.length - 1];
                    segment = {};
                    segment.t = prevSegment.t + prevSegment.d;
                    segment.d = prevSegment.d;
                    if (prevSegment.tManifest) {
                        segment.tManifest = (0, _externalsBigInteger2['default'])(prevSegment.tManifest).add((0, _externalsBigInteger2['default'])(prevSegment.d)).toString();
                    }
                    duration += segment.d;
                    segments.push(segment);
                }
            }
        }

        segmentTimeline.S = segments;
        segmentTimeline.S_asArray = segments;
        segmentTimeline.duration = duration / timescale;

        return segmentTimeline;
    }

    function getKIDFromProtectionHeader(protectionHeader) {
        var prHeader = undefined,
            wrmHeader = undefined,
            xmlReader = undefined,
            KID = undefined;

        // Get PlayReady header as byte array (base64 decoded)
        prHeader = BASE64.decodeArray(protectionHeader.firstChild.data);

        // Get Right Management header (WRMHEADER) from PlayReady header
        wrmHeader = getWRMHeaderFromPRHeader(prHeader);

        if (wrmHeader) {
            // Convert from multi-byte to unicode
            wrmHeader = new Uint16Array(wrmHeader.buffer);

            // Convert to string
            wrmHeader = String.fromCharCode.apply(null, wrmHeader);

            // Parse <WRMHeader> to get KID field value
            xmlReader = new DOMParser().parseFromString(wrmHeader, 'application/xml');
            KID = xmlReader.querySelector('KID').textContent;

            // Get KID (base64 decoded) as byte array
            KID = BASE64.decodeArray(KID);

            // Convert UUID from little-endian to big-endian
            convertUuidEndianness(KID);
        }

        return KID;
    }

    function getWRMHeaderFromPRHeader(prHeader) {
        var length = undefined,
            recordCount = undefined,
            recordType = undefined,
            recordLength = undefined,
            recordValue = undefined;
        var i = 0;

        // Parse PlayReady header

        // Length - 32 bits (LE format)
        length = (prHeader[i + 3] << 24) + (prHeader[i + 2] << 16) + (prHeader[i + 1] << 8) + prHeader[i];
        i += 4;

        // Record count - 16 bits (LE format)
        recordCount = (prHeader[i + 1] << 8) + prHeader[i];
        i += 2;

        // Parse records
        while (i < prHeader.length) {
            // Record type - 16 bits (LE format)
            recordType = (prHeader[i + 1] << 8) + prHeader[i];
            i += 2;

            // Check if Rights Management header (record type = 0x01)
            if (recordType === 0x01) {

                // Record length - 16 bits (LE format)
                recordLength = (prHeader[i + 1] << 8) + prHeader[i];
                i += 2;

                // Record value => contains <WRMHEADER>
                recordValue = new Uint8Array(recordLength);
                recordValue.set(prHeader.subarray(i, i + recordLength));
                return recordValue;
            }
        }

        return null;
    }

    function convertUuidEndianness(uuid) {
        swapBytes(uuid, 0, 3);
        swapBytes(uuid, 1, 2);
        swapBytes(uuid, 4, 5);
        swapBytes(uuid, 6, 7);
    }

    function swapBytes(bytes, pos1, pos2) {
        var temp = bytes[pos1];
        bytes[pos1] = bytes[pos2];
        bytes[pos2] = temp;
    }

    function createPRContentProtection(protectionHeader) {
        var pro = {
            __text: protectionHeader.firstChild.data,
            __prefix: 'mspr'
        };
        return {
            schemeIdUri: 'urn:uuid:9a04f079-9840-4286-ab92-e65be0885f95',
            value: 'com.microsoft.playready',
            pro: pro,
            pro_asArray: pro
        };
    }

    function createWidevineContentProtection(KID) {
        var widevineCP = {
            schemeIdUri: 'urn:uuid:edef8ba9-79d6-4ace-a3c8-27dcd51d21ed',
            value: 'com.widevine.alpha'
        };
        if (!KID) return widevineCP;
        // Create Widevine CENC header (Protocol Buffer) with KID value
        var wvCencHeader = new Uint8Array(2 + KID.length);
        wvCencHeader[0] = 0x12;
        wvCencHeader[1] = 0x10;
        wvCencHeader.set(KID, 2);

        // Create a pssh box
        var length = 12 /* box length, type, version and flags */ + 16 /* SystemID */ + 4 /* data length */ + wvCencHeader.length;
        var pssh = new Uint8Array(length);
        var i = 0;

        // Set box length value
        pssh[i++] = (length & 0xFF000000) >> 24;
        pssh[i++] = (length & 0x00FF0000) >> 16;
        pssh[i++] = (length & 0x0000FF00) >> 8;
        pssh[i++] = length & 0x000000FF;

        // Set type ('pssh'), version (0) and flags (0)
        pssh.set([0x70, 0x73, 0x73, 0x68, 0x00, 0x00, 0x00, 0x00], i);
        i += 8;

        // Set SystemID ('edef8ba9-79d6-4ace-a3c8-27dcd51d21ed')
        pssh.set([0xed, 0xef, 0x8b, 0xa9, 0x79, 0xd6, 0x4a, 0xce, 0xa3, 0xc8, 0x27, 0xdc, 0xd5, 0x1d, 0x21, 0xed], i);
        i += 16;

        // Set data length value
        pssh[i++] = (wvCencHeader.length & 0xFF000000) >> 24;
        pssh[i++] = (wvCencHeader.length & 0x00FF0000) >> 16;
        pssh[i++] = (wvCencHeader.length & 0x0000FF00) >> 8;
        pssh[i++] = wvCencHeader.length & 0x000000FF;

        // Copy Widevine CENC header
        pssh.set(wvCencHeader, i);

        // Convert to BASE64 string
        pssh = String.fromCharCode.apply(null, pssh);
        pssh = BASE64.encodeASCII(pssh);

        widevineCP.pssh = { __text: pssh };

        return widevineCP;
    }

    function processManifest(xmlDoc) {
        var manifest = {};
        var contentProtections = [];
        var smoothStreamingMedia = xmlDoc.getElementsByTagName('SmoothStreamingMedia')[0];
        var protection = xmlDoc.getElementsByTagName('Protection')[0];
        var protectionHeader = null;
        var period = undefined,
            adaptations = undefined,
            contentProtection = undefined,
            KID = undefined,
            timestampOffset = undefined,
            startTime = undefined,
            segments = undefined,
            timescale = undefined,
            segmentDuration = undefined,
            i = undefined,
            j = undefined;

        // Set manifest node properties
        manifest.protocol = 'MSS';
        manifest.profiles = 'urn:mpeg:dash:profile:isoff-live:2011';
        manifest.type = getAttributeAsBoolean(smoothStreamingMedia, 'IsLive') ? 'dynamic' : 'static';
        timescale = smoothStreamingMedia.getAttribute('TimeScale');
        manifest.timescale = timescale ? parseFloat(timescale) : DEFAULT_TIME_SCALE;
        var dvrWindowLength = parseFloat(smoothStreamingMedia.getAttribute('DVRWindowLength'));
        // If the DVRWindowLength field is omitted for a live presentation or set to 0, the DVR window is effectively infinite
        if (manifest.type === 'dynamic' && (dvrWindowLength === 0 || isNaN(dvrWindowLength))) {
            dvrWindowLength = Infinity;
        }
        // Star-over
        if (dvrWindowLength === 0 && getAttributeAsBoolean(smoothStreamingMedia, 'CanSeek')) {
            dvrWindowLength = Infinity;
        }

        if (dvrWindowLength > 0) {
            manifest.timeShiftBufferDepth = dvrWindowLength / manifest.timescale;
        }

        var duration = parseFloat(smoothStreamingMedia.getAttribute('Duration'));
        manifest.mediaPresentationDuration = duration === 0 ? Infinity : duration / manifest.timescale;
        // By default, set minBufferTime to 2 sec. (but set below according to video segment duration)
        manifest.minBufferTime = 2;
        manifest.ttmlTimeIsRelative = true;

        // Live manifest with Duration = start-over
        if (manifest.type === 'dynamic' && duration > 0) {
            manifest.type = 'static';
            // We set timeShiftBufferDepth to initial duration, to be used by MssFragmentController to update segment timeline
            manifest.timeShiftBufferDepth = duration / manifest.timescale;
            // Duration will be set according to current segment timeline duration (see below)
        }

        if (manifest.type === 'dynamic') {
            manifest.refreshManifestOnSwitchTrack = true; // Refresh manifest when switching tracks
            manifest.doNotUpdateDVRWindowOnBufferUpdated = true; // DVRWindow is update by MssFragmentMoofPocessor based on tfrf boxes
            manifest.ignorePostponeTimePeriod = true; // Never update manifest
        }

        // Map period node to manifest root node
        manifest.Period = mapPeriod(smoothStreamingMedia, manifest.timescale);
        manifest.Period_asArray = [manifest.Period];

        // Initialize period start time
        period = manifest.Period;
        period.start = 0;

        // Uncomment to test live to static manifests
        // if (manifest.type !== 'static') {
        //     manifest.type = 'static';
        //     manifest.mediaPresentationDuration = manifest.timeShiftBufferDepth;
        //     manifest.timeShiftBufferDepth = null;
        // }

        // ContentProtection node
        if (protection !== undefined) {
            protectionHeader = xmlDoc.getElementsByTagName('ProtectionHeader')[0];

            // Some packagers put newlines into the ProtectionHeader base64 string, which is not good
            // because this cannot be correctly parsed. Let's just filter out any newlines found in there.
            protectionHeader.firstChild.data = protectionHeader.firstChild.data.replace(/\n|\r/g, '');

            // Get KID (in CENC format) from protection header
            KID = getKIDFromProtectionHeader(protectionHeader);

            // Create ContentProtection for PlayReady
            contentProtection = createPRContentProtection(protectionHeader);
            contentProtection['cenc:default_KID'] = KID;
            contentProtections.push(contentProtection);

            // Create ContentProtection for Widevine (as a CENC protection)
            contentProtection = createWidevineContentProtection(KID);
            contentProtection['cenc:default_KID'] = KID;
            contentProtections.push(contentProtection);

            manifest.ContentProtection = contentProtections;
            manifest.ContentProtection_asArray = contentProtections;
        }

        adaptations = period.AdaptationSet_asArray;

        for (i = 0; i < adaptations.length; i += 1) {
            adaptations[i].SegmentTemplate.initialization = '$Bandwidth$';
            // Propagate content protection information into each adaptation
            if (manifest.ContentProtection !== undefined) {
                adaptations[i].ContentProtection = manifest.ContentProtection;
                adaptations[i].ContentProtection_asArray = manifest.ContentProtection_asArray;
            }

            if (adaptations[i].contentType === 'video') {
                // Get video segment duration
                segmentDuration = adaptations[i].SegmentTemplate.SegmentTimeline.S_asArray[0].d / adaptations[i].SegmentTemplate.timescale;
                // Set minBufferTime to one segment duration
                manifest.minBufferTime = segmentDuration;

                if (manifest.type === 'dynamic') {
                    // Match timeShiftBufferDepth to video segment timeline duration
                    if (manifest.timeShiftBufferDepth > 0 && manifest.timeShiftBufferDepth !== Infinity && manifest.timeShiftBufferDepth > adaptations[i].SegmentTemplate.SegmentTimeline.duration) {
                        manifest.timeShiftBufferDepth = adaptations[i].SegmentTemplate.SegmentTimeline.duration;
                    }
                }
            }
        }

        // Cap minBufferTime to timeShiftBufferDepth
        manifest.minBufferTime = Math.min(manifest.minBufferTime, manifest.timeShiftBufferDepth ? manifest.timeShiftBufferDepth : Infinity);

        // In case of live streams:
        // 1- configure player buffering properties according to target live delay
        // 2- adapt live delay and then buffers length in case timeShiftBufferDepth is too small compared to target live delay (see PlaybackController.computeLiveDelay())
        // 3- Set retry attempts and intervals for FragmentInfo requests
        if (manifest.type === 'dynamic') {
            var targetLiveDelay = mediaPlayerModel.getLiveDelay();
            if (!targetLiveDelay) {
                var liveDelayFragmentCount = settings.get().streaming.liveDelayFragmentCount !== null && !isNaN(settings.get().streaming.liveDelayFragmentCount) ? settings.get().streaming.liveDelayFragmentCount : 4;
                targetLiveDelay = segmentDuration * liveDelayFragmentCount;
            }
            var targetDelayCapping = Math.max(manifest.timeShiftBufferDepth - 10, /*END_OF_PLAYLIST_PADDING*/manifest.timeShiftBufferDepth / 2);
            var liveDelay = Math.min(targetDelayCapping, targetLiveDelay);
            // Consider a margin of more than one segment in order to avoid Precondition Failed errors (412), for example if audio and video are not correctly synchronized
            var bufferTime = liveDelay - segmentDuration * 1.5;

            // Store initial buffer settings
            initialBufferSettings = {
                'streaming': {
                    'calcSegmentAvailabilityRangeFromTimeline': settings.get().streaming.calcSegmentAvailabilityRangeFromTimeline,
                    'liveDelay': settings.get().streaming.liveDelay,
                    'stableBufferTime': settings.get().streaming.stableBufferTime,
                    'bufferTimeAtTopQuality': settings.get().streaming.bufferTimeAtTopQuality,
                    'bufferTimeAtTopQualityLongForm': settings.get().streaming.bufferTimeAtTopQualityLongForm
                }
            };

            settings.update({
                'streaming': {
                    'calcSegmentAvailabilityRangeFromTimeline': true,
                    'liveDelay': liveDelay,
                    'stableBufferTime': bufferTime,
                    'bufferTimeAtTopQuality': bufferTime,
                    'bufferTimeAtTopQualityLongForm': bufferTime
                }
            });
        }

        // Delete Content Protection under root manifest node
        delete manifest.ContentProtection;
        delete manifest.ContentProtection_asArray;

        // In case of VOD streams, check if start time is greater than 0
        // Then determine timestamp offset according to higher audio/video start time
        // (use case = live stream delinearization)
        if (manifest.type === 'static') {
            // In case of start-over stream and manifest reloading (due to track switch)
            // we consider previous timestampOffset to keep timelines synchronized
            var prevManifest = manifestModel.getValue();
            if (prevManifest && prevManifest.timestampOffset) {
                timestampOffset = prevManifest.timestampOffset;
            } else {
                for (i = 0; i < adaptations.length; i++) {
                    if (adaptations[i].contentType === constants.AUDIO || adaptations[i].contentType === constants.VIDEO) {
                        segments = adaptations[i].SegmentTemplate.SegmentTimeline.S_asArray;
                        startTime = segments[0].t;
                        if (timestampOffset === undefined) {
                            timestampOffset = startTime;
                        }
                        timestampOffset = Math.min(timestampOffset, startTime);
                        // Correct content duration according to minimum adaptation's segment timeline duration
                        // in order to force <video> element sending 'ended' event
                        manifest.mediaPresentationDuration = Math.min(manifest.mediaPresentationDuration, adaptations[i].SegmentTemplate.SegmentTimeline.duration);
                    }
                }
            }
            if (timestampOffset > 0) {
                // Patch segment templates timestamps and determine period start time (since audio/video should not be aligned to 0)
                manifest.timestampOffset = timestampOffset;
                for (i = 0; i < adaptations.length; i++) {
                    segments = adaptations[i].SegmentTemplate.SegmentTimeline.S_asArray;
                    for (j = 0; j < segments.length; j++) {
                        if (!segments[j].tManifest) {
                            segments[j].tManifest = segments[j].t.toString();
                        }
                        segments[j].t -= timestampOffset;
                    }
                    if (adaptations[i].contentType === constants.AUDIO || adaptations[i].contentType === constants.VIDEO) {
                        period.start = Math.max(segments[0].t, period.start);
                        adaptations[i].SegmentTemplate.presentationTimeOffset = period.start;
                    }
                }
                period.start /= manifest.timescale;
            }
        }

        // Floor the duration to get around precision differences between segments timestamps and MSE buffer timestamps
        // and then avoid 'ended' event not being raised
        manifest.mediaPresentationDuration = Math.floor(manifest.mediaPresentationDuration * 1000) / 1000;
        period.duration = manifest.mediaPresentationDuration;

        return manifest;
    }

    function parseDOM(data) {
        var xmlDoc = null;

        if (window.DOMParser) {
            var parser = new window.DOMParser();

            xmlDoc = parser.parseFromString(data, 'text/xml');
            if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
                throw new Error('parsing the manifest failed');
            }
        }

        return xmlDoc;
    }

    function getMatchers() {
        return null;
    }

    function getIron() {
        return null;
    }

    function internalParse(data) {
        var xmlDoc = null;
        var manifest = null;

        var startTime = window.performance.now();

        // Parse the MSS XML manifest
        xmlDoc = parseDOM(data);

        var xmlParseTime = window.performance.now();

        if (xmlDoc === null) {
            return null;
        }

        // Convert MSS manifest into DASH manifest
        manifest = processManifest(xmlDoc, new Date());

        var mss2dashTime = window.performance.now();

        logger.info('Parsing complete: (xmlParsing: ' + (xmlParseTime - startTime).toPrecision(3) + 'ms, mss2dash: ' + (mss2dashTime - xmlParseTime).toPrecision(3) + 'ms, total: ' + ((mss2dashTime - startTime) / 1000).toPrecision(3) + 's)');

        return manifest;
    }

    function reset() {
        // Restore initial buffer settings
        if (initialBufferSettings) {
            settings.update(initialBufferSettings);
        }
    }

    instance = {
        parse: internalParse,
        getMatchers: getMatchers,
        getIron: getIron,
        reset: reset
    };

    setup();

    return instance;
}

MssParser.__dashjs_factory_name = 'MssParser';
exports['default'] = dashjs.FactoryMaker.getClassFactory(MssParser);
/* jshint ignore:line */
module.exports = exports['default'];

},{"../../../externals/BigInteger":1}],13:[function(_dereq_,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _coreEventsEventsBase = _dereq_('../core/events/EventsBase');

var _coreEventsEventsBase2 = _interopRequireDefault(_coreEventsEventsBase);

/**
 * @class
 * @implements EventsBase
 */

var MediaPlayerEvents = (function (_EventsBase) {
  _inherits(MediaPlayerEvents, _EventsBase);

  /**
   * @description Public facing external events to be used when developing a player that implements dash.js.
   */

  function MediaPlayerEvents() {
    _classCallCheck(this, MediaPlayerEvents);

    _get(Object.getPrototypeOf(MediaPlayerEvents.prototype), 'constructor', this).call(this);
    /**
     * Triggered when playback will not start yet
     * as the MPD's availabilityStartTime is in the future.
     * Check delay property in payload to determine time before playback will start.
     * @event MediaPlayerEvents#AST_IN_FUTURE
     */
    this.AST_IN_FUTURE = 'astInFuture';

    /**
     * Triggered when the video element's buffer state changes to stalled.
     * Check mediaType in payload to determine type (Video, Audio, FragmentedText).
     * @event MediaPlayerEvents#BUFFER_EMPTY
     */
    this.BUFFER_EMPTY = 'bufferStalled';

    /**
     * Triggered when the video element's buffer state changes to loaded.
     * Check mediaType in payload to determine type (Video, Audio, FragmentedText).
     * @event MediaPlayerEvents#BUFFER_LOADED
     */
    this.BUFFER_LOADED = 'bufferLoaded';

    /**
     * Triggered when the video element's buffer state changes, either stalled or loaded. Check payload for state.
     * @event MediaPlayerEvents#BUFFER_LEVEL_STATE_CHANGED
     */
    this.BUFFER_LEVEL_STATE_CHANGED = 'bufferStateChanged';

    /**
     * Triggered when a dynamic stream changed to static (transition phase between Live and On-Demand).
     * @event MediaPlayerEvents#DYNAMIC_TO_STATIC
     */
    this.DYNAMIC_TO_STATIC = 'dynamicToStatic';

    /**
     * Triggered when there is an error from the element or MSE source buffer.
     * @event MediaPlayerEvents#ERROR
     */
    this.ERROR = 'error';
    /**
     * Triggered when a fragment download has completed.
     * @event MediaPlayerEvents#FRAGMENT_LOADING_COMPLETED
     */
    this.FRAGMENT_LOADING_COMPLETED = 'fragmentLoadingCompleted';

    /**
     * Triggered when a partial fragment download has completed.
     * @event MediaPlayerEvents#FRAGMENT_LOADING_PROGRESS
     */
    this.FRAGMENT_LOADING_PROGRESS = 'fragmentLoadingProgress';
    /**
     * Triggered when a fragment download has started.
     * @event MediaPlayerEvents#FRAGMENT_LOADING_STARTED
     */
    this.FRAGMENT_LOADING_STARTED = 'fragmentLoadingStarted';

    /**
     * Triggered when a fragment download is abandoned due to detection of slow download base on the ABR abandon rule..
     * @event MediaPlayerEvents#FRAGMENT_LOADING_ABANDONED
     */
    this.FRAGMENT_LOADING_ABANDONED = 'fragmentLoadingAbandoned';

    /**
     * Triggered when {@link module:Debug} logger methods are called.
     * @event MediaPlayerEvents#LOG
     */
    this.LOG = 'log';

    //TODO refactor with internal event
    /**
     * Triggered when the manifest load is complete
     * @event MediaPlayerEvents#MANIFEST_LOADED
     */
    this.MANIFEST_LOADED = 'manifestLoaded';

    /**
     * Triggered anytime there is a change to the overall metrics.
     * @event MediaPlayerEvents#METRICS_CHANGED
     */
    this.METRICS_CHANGED = 'metricsChanged';

    /**
     * Triggered when an individual metric is added, updated or cleared.
     * @event MediaPlayerEvents#METRIC_CHANGED
     */
    this.METRIC_CHANGED = 'metricChanged';

    /**
     * Triggered every time a new metric is added.
     * @event MediaPlayerEvents#METRIC_ADDED
     */
    this.METRIC_ADDED = 'metricAdded';

    /**
     * Triggered every time a metric is updated.
     * @event MediaPlayerEvents#METRIC_UPDATED
     */
    this.METRIC_UPDATED = 'metricUpdated';

    /**
     * Triggered at the stream end of a period.
     * @event MediaPlayerEvents#PERIOD_SWITCH_COMPLETED
     */
    this.PERIOD_SWITCH_COMPLETED = 'periodSwitchCompleted';

    /**
     * Triggered when a new period starts.
     * @event MediaPlayerEvents#PERIOD_SWITCH_STARTED
     */
    this.PERIOD_SWITCH_STARTED = 'periodSwitchStarted';

    /**
     * Triggered when an ABR up /down switch is initiated; either by user in manual mode or auto mode via ABR rules.
     * @event MediaPlayerEvents#QUALITY_CHANGE_REQUESTED
     */
    this.QUALITY_CHANGE_REQUESTED = 'qualityChangeRequested';

    /**
     * Triggered when the new ABR quality is being rendered on-screen.
     * @event MediaPlayerEvents#QUALITY_CHANGE_RENDERED
     */
    this.QUALITY_CHANGE_RENDERED = 'qualityChangeRendered';

    /**
     * Triggered when the new track is being rendered.
     * @event MediaPlayerEvents#TRACK_CHANGE_RENDERED
     */
    this.TRACK_CHANGE_RENDERED = 'trackChangeRendered';

    /**
     * Triggered when the source is setup and ready.
     * @event MediaPlayerEvents#SOURCE_INITIALIZED
     */
    this.SOURCE_INITIALIZED = 'sourceInitialized';

    /**
     * Triggered when a stream (period) is being loaded
     * @event MediaPlayerEvents#STREAM_INITIALIZING
     */
    this.STREAM_INITIALIZING = 'streamInitializing';

    /**
     * Triggered when a stream (period) is loaded
     * @event MediaPlayerEvents#STREAM_UPDATED
     */
    this.STREAM_UPDATED = 'streamUpdated';

    /**
     * Triggered when a stream (period) is updated
     * @event MediaPlayerEvents#STREAM_INITIALIZED
     */
    this.STREAM_INITIALIZED = 'streamInitialized';

    /**
     * Triggered when the player has been reset.
     * @event MediaPlayerEvents#STREAM_TEARDOWN_COMPLETE
     */
    this.STREAM_TEARDOWN_COMPLETE = 'streamTeardownComplete';

    /**
     * Triggered once all text tracks detected in the MPD are added to the video element.
     * @event MediaPlayerEvents#TEXT_TRACKS_ADDED
     */
    this.TEXT_TRACKS_ADDED = 'allTextTracksAdded';

    /**
     * Triggered when a text track is added to the video element's TextTrackList
     * @event MediaPlayerEvents#TEXT_TRACK_ADDED
     */
    this.TEXT_TRACK_ADDED = 'textTrackAdded';

    /**
     * Triggered when a ttml chunk is parsed.
     * @event MediaPlayerEvents#TTML_PARSED
     */
    this.TTML_PARSED = 'ttmlParsed';

    /**
     * Triggered when a ttml chunk has to be parsed.
     * @event MediaPlayerEvents#TTML_TO_PARSE
     */
    this.TTML_TO_PARSE = 'ttmlToParse';

    /**
     * Triggered when a caption is rendered.
     * @event MediaPlayerEvents#CAPTION_RENDERED
     */
    this.CAPTION_RENDERED = 'captionRendered';

    /**
     * Triggered when the caption container is resized.
     * @event MediaPlayerEvents#CAPTION_CONTAINER_RESIZE
     */
    this.CAPTION_CONTAINER_RESIZE = 'captionContainerResize';

    /**
     * Sent when enough data is available that the media can be played,
     * at least for a couple of frames.  This corresponds to the
     * HAVE_ENOUGH_DATA readyState.
     * @event MediaPlayerEvents#CAN_PLAY
     */
    this.CAN_PLAY = 'canPlay';

    /**
     * Sent when playback completes.
     * @event MediaPlayerEvents#PLAYBACK_ENDED
     */
    this.PLAYBACK_ENDED = 'playbackEnded';

    /**
     * Sent when an error occurs.  The element's error
     * attribute contains more information.
     * @event MediaPlayerEvents#PLAYBACK_ERROR
     */
    this.PLAYBACK_ERROR = 'playbackError';

    /**
     * Sent when playback is not allowed (for example if user gesture is needed).
     * @event MediaPlayerEvents#PLAYBACK_NOT_ALLOWED
     */
    this.PLAYBACK_NOT_ALLOWED = 'playbackNotAllowed';

    /**
     * The media's metadata has finished loading; all attributes now
     * contain as much useful information as they're going to.
     * @event MediaPlayerEvents#PLAYBACK_METADATA_LOADED
     */
    this.PLAYBACK_METADATA_LOADED = 'playbackMetaDataLoaded';

    /**
     * Sent when playback is paused.
     * @event MediaPlayerEvents#PLAYBACK_PAUSED
     */
    this.PLAYBACK_PAUSED = 'playbackPaused';

    /**
     * Sent when the media begins to play (either for the first time, after having been paused,
     * or after ending and then restarting).
     *
     * @event MediaPlayerEvents#PLAYBACK_PLAYING
     */
    this.PLAYBACK_PLAYING = 'playbackPlaying';

    /**
     * Sent periodically to inform interested parties of progress downloading
     * the media. Information about the current amount of the media that has
     * been downloaded is available in the media element's buffered attribute.
     * @event MediaPlayerEvents#PLAYBACK_PROGRESS
     */
    this.PLAYBACK_PROGRESS = 'playbackProgress';

    /**
     * Sent when the playback speed changes.
     * @event MediaPlayerEvents#PLAYBACK_RATE_CHANGED
     */
    this.PLAYBACK_RATE_CHANGED = 'playbackRateChanged';

    /**
     * Sent when a seek operation completes.
     * @event MediaPlayerEvents#PLAYBACK_SEEKED
     */
    this.PLAYBACK_SEEKED = 'playbackSeeked';

    /**
     * Sent when a seek operation begins.
     * @event MediaPlayerEvents#PLAYBACK_SEEKING
     */
    this.PLAYBACK_SEEKING = 'playbackSeeking';

    /**
     * Sent when a seek operation has been asked.
     * @event MediaPlayerEvents#PLAYBACK_SEEK_ASKED
     */
    this.PLAYBACK_SEEK_ASKED = 'playbackSeekAsked';

    /**
     * Sent when the video element reports stalled
     * @event MediaPlayerEvents#PLAYBACK_STALLED
     */
    this.PLAYBACK_STALLED = 'playbackStalled';

    /**
     * Sent when playback of the media starts after having been paused;
     * that is, when playback is resumed after a prior pause event.
     *
     * @event MediaPlayerEvents#PLAYBACK_STARTED
     */
    this.PLAYBACK_STARTED = 'playbackStarted';

    /**
     * The time indicated by the element's currentTime attribute has changed.
     * @event MediaPlayerEvents#PLAYBACK_TIME_UPDATED
     */
    this.PLAYBACK_TIME_UPDATED = 'playbackTimeUpdated';

    /**
     * Sent when the media playback has stopped because of a temporary lack of data.
     *
     * @event MediaPlayerEvents#PLAYBACK_WAITING
     */
    this.PLAYBACK_WAITING = 'playbackWaiting';

    /**
     * Manifest validity changed - As a result of an MPD validity expiration event.
     * @event MediaPlayerEvents#MANIFEST_VALIDITY_CHANGED
     */
    this.MANIFEST_VALIDITY_CHANGED = 'manifestValidityChanged';

    /**
     * A gap occured in the timeline which requires a seek to the next period
     * @event MediaPlayerEvents#GAP_CAUSED_SEEK_TO_PERIOD_END
     */
    this.GAP_CAUSED_SEEK_TO_PERIOD_END = 'gapCausedSeekToPeriodEnd';

    /**
     * A gap occured in the timeline which requires an internal seek
     * @event MediaPlayerEvents#GAP_CAUSED_INTERNAL_SEEK
     */
    this.GAP_CAUSED_INTERNAL_SEEK = 'gapCausedInternalSeek';

    /**
     * Dash events are triggered at their respective start points on the timeline.
     * @event MediaPlayerEvents#EVENT_MODE_ON_START
     */
    this.EVENT_MODE_ON_START = 'eventModeOnStart';

    /**
     * Dash events are triggered as soon as they were parsed.
     * @event MediaPlayerEvents#EVENT_MODE_ON_RECEIVE
     */
    this.EVENT_MODE_ON_RECEIVE = 'eventModeOnReceive';

    /**
     * Event that is dispatched whenever the player encounters a potential conformance validation that might lead to unexpected/not optimal behavior
     * @event MediaPlayerEvents#CONFORMANCE_VIOLATION
     */
    this.CONFORMANCE_VIOLATION = 'conformanceViolation';
  }

  return MediaPlayerEvents;
})(_coreEventsEventsBase2['default']);

var mediaPlayerEvents = new MediaPlayerEvents();
exports['default'] = mediaPlayerEvents;
module.exports = exports['default'];

},{"../core/events/EventsBase":4}],14:[function(_dereq_,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * Represents data structure to keep and drive {DataChunk}
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _coreFactoryMaker = _dereq_('../../core/FactoryMaker');

var _coreFactoryMaker2 = _interopRequireDefault(_coreFactoryMaker);

function InitCache() {

    var data = {};

    function save(chunk) {
        var id = chunk.streamId;
        var representationId = chunk.representationId;

        data[id] = data[id] || {};
        data[id][representationId] = chunk;
    }

    function extract(streamId, representationId) {
        if (data && data[streamId] && data[streamId][representationId]) {
            return data[streamId][representationId];
        } else {
            return null;
        }
    }

    function reset() {
        data = {};
    }

    var instance = {
        save: save,
        extract: extract,
        reset: reset
    };

    return instance;
}

InitCache.__dashjs_factory_name = 'InitCache';
exports['default'] = _coreFactoryMaker2['default'].getSingletonFactory(InitCache);
module.exports = exports['default'];

},{"../../core/FactoryMaker":2}],15:[function(_dereq_,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */
/**
 * @class
 * @ignore
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DashJSError = function DashJSError(code, message, data) {
  _classCallCheck(this, DashJSError);

  this.code = code || null;
  this.message = message || null;
  this.data = data || null;
};

exports["default"] = DashJSError;
module.exports = exports["default"];

},{}],16:[function(_dereq_,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @class
 * @ignore
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DataChunk =
//Represents a data structure that keep all the necessary info about a single init/media segment
function DataChunk() {
  _classCallCheck(this, DataChunk);

  this.streamId = null;
  this.mediaInfo = null;
  this.segmentType = null;
  this.quality = NaN;
  this.index = NaN;
  this.bytes = null;
  this.start = NaN;
  this.end = NaN;
  this.duration = NaN;
  this.representationId = null;
  this.endFragment = null;
};

exports["default"] = DataChunk;
module.exports = exports["default"];

},{}],17:[function(_dereq_,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _voMetricsHTTPRequest = _dereq_('../vo/metrics/HTTPRequest');

/**
 * @class
 * @ignore
 */

var FragmentRequest = (function () {
    function FragmentRequest(url) {
        _classCallCheck(this, FragmentRequest);

        this.action = FragmentRequest.ACTION_DOWNLOAD;
        this.startTime = NaN;
        this.mediaStartTime = NaN;
        this.mediaType = null;
        this.mediaInfo = null;
        this.type = null;
        this.duration = NaN;
        this.timescale = NaN;
        this.range = null;
        this.url = url || null;
        this.serviceLocation = null;
        this.requestStartDate = null;
        this.firstByteDate = null;
        this.requestEndDate = null;
        this.quality = NaN;
        this.index = NaN;
        this.availabilityStartTime = null;
        this.availabilityEndTime = null;
        this.wallStartTime = null;
        this.bytesLoaded = NaN;
        this.bytesTotal = NaN;
        this.delayLoadingTime = NaN;
        this.responseType = 'arraybuffer';
        this.representationId = null;
    }

    _createClass(FragmentRequest, [{
        key: 'isInitializationRequest',
        value: function isInitializationRequest() {
            return this.type && this.type === _voMetricsHTTPRequest.HTTPRequest.INIT_SEGMENT_TYPE;
        }
    }, {
        key: 'setInfo',
        value: function setInfo(info) {
            this.type = info && info.init ? _voMetricsHTTPRequest.HTTPRequest.INIT_SEGMENT_TYPE : _voMetricsHTTPRequest.HTTPRequest.MEDIA_SEGMENT_TYPE;
            this.url = info && info.url ? info.url : null;
            this.range = info && info.range ? info.range.start + '-' + info.range.end : null;
            this.mediaType = info && info.mediaType ? info.mediaType : null;
        }
    }]);

    return FragmentRequest;
})();

FragmentRequest.ACTION_DOWNLOAD = 'download';
FragmentRequest.ACTION_COMPLETE = 'complete';

exports['default'] = FragmentRequest;
module.exports = exports['default'];

},{"../vo/metrics/HTTPRequest":18}],18:[function(_dereq_,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */
/**
 * @classdesc This Object holds reference to the HTTPRequest for manifest, fragment and xlink loading.
 * Members which are not defined in ISO23009-1 Annex D should be prefixed by a _ so that they are ignored
 * by Metrics Reporting code.
 * @ignore
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var HTTPRequest =
/**
 * @class
 */
function HTTPRequest() {
  _classCallCheck(this, HTTPRequest);

  /**
   * Identifier of the TCP connection on which the HTTP request was sent.
   * @public
   */
  this.tcpid = null;
  /**
   * This is an optional parameter and should not be included in HTTP request/response transactions for progressive download.
   * The type of the request:
   * - MPD
   * - XLink expansion
   * - Initialization Fragment
   * - Index Fragment
   * - Media Fragment
   * - Bitstream Switching Fragment
   * - other
   * @public
   */
  this.type = null;
  /**
   * The original URL (before any redirects or failures)
   * @public
   */
  this.url = null;
  /**
   * The actual URL requested, if different from above
   * @public
   */
  this.actualurl = null;
  /**
   * The contents of the byte-range-spec part of the HTTP Range header.
   * @public
   */
  this.range = null;
  /**
   * Real-Time | The real time at which the request was sent.
   * @public
   */
  this.trequest = null;
  /**
   * Real-Time | The real time at which the first byte of the response was received.
   * @public
   */
  this.tresponse = null;
  /**
   * The HTTP response code.
   * @public
   */
  this.responsecode = null;
  /**
   * The duration of the throughput trace intervals (ms), for successful requests only.
   * @public
   */
  this.interval = null;
  /**
   * Throughput traces, for successful requests only.
   * @public
   */
  this.trace = [];

  /**
   * Type of stream ("audio" | "video" etc..)
   * @public
   */
  this._stream = null;
  /**
   * Real-Time | The real time at which the request finished.
   * @public
   */
  this._tfinish = null;
  /**
   * The duration of the media requests, if available, in seconds.
   * @public
   */
  this._mediaduration = null;
  /**
   * The media segment quality
   * @public
   */
  this._quality = null;
  /**
   * all the response headers from request.
   * @public
   */
  this._responseHeaders = null;
  /**
   * The selected service location for the request. string.
   * @public
   */
  this._serviceLocation = null;
}

/**
 * @classdesc This Object holds reference to the progress of the HTTPRequest.
 * @ignore
 */
;

var HTTPRequestTrace =
/**
* @class
*/
function HTTPRequestTrace() {
  _classCallCheck(this, HTTPRequestTrace);

  /**
   * Real-Time | Measurement stream start.
   * @public
   */
  this.s = null;
  /**
   * Measurement stream duration (ms).
   * @public
   */
  this.d = null;
  /**
   * List of integers counting the bytes received in each trace interval within the measurement stream.
   * @public
   */
  this.b = [];
};

HTTPRequest.GET = 'GET';
HTTPRequest.HEAD = 'HEAD';
HTTPRequest.MPD_TYPE = 'MPD';
HTTPRequest.XLINK_EXPANSION_TYPE = 'XLinkExpansion';
HTTPRequest.INIT_SEGMENT_TYPE = 'InitializationSegment';
HTTPRequest.INDEX_SEGMENT_TYPE = 'IndexSegment';
HTTPRequest.MEDIA_SEGMENT_TYPE = 'MediaSegment';
HTTPRequest.BITSTREAM_SWITCHING_SEGMENT_TYPE = 'BitstreamSwitchingSegment';
HTTPRequest.MSS_FRAGMENT_INFO_SEGMENT_TYPE = 'FragmentInfoSegment';
HTTPRequest.LICENSE = 'license';
HTTPRequest.OTHER_TYPE = 'other';

exports.HTTPRequest = HTTPRequest;
exports.HTTPRequestTrace = HTTPRequestTrace;

},{}]},{},[11])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9qb29uYXMvQ29kZXMvbXNpL2Rhc2guanMvZXh0ZXJuYWxzL0JpZ0ludGVnZXIuanMiLCIvaG9tZS9qb29uYXMvQ29kZXMvbXNpL2Rhc2guanMvc3JjL2NvcmUvRmFjdG9yeU1ha2VyLmpzIiwiL2hvbWUvam9vbmFzL0NvZGVzL21zaS9kYXNoLmpzL3NyYy9jb3JlL2Vycm9ycy9FcnJvcnNCYXNlLmpzIiwiL2hvbWUvam9vbmFzL0NvZGVzL21zaS9kYXNoLmpzL3NyYy9jb3JlL2V2ZW50cy9FdmVudHNCYXNlLmpzIiwiL2hvbWUvam9vbmFzL0NvZGVzL21zaS9kYXNoLmpzL3NyYy9tc3MvTXNzRnJhZ21lbnRJbmZvQ29udHJvbGxlci5qcyIsIi9ob21lL2pvb25hcy9Db2Rlcy9tc2kvZGFzaC5qcy9zcmMvbXNzL01zc0ZyYWdtZW50TW9vZlByb2Nlc3Nvci5qcyIsIi9ob21lL2pvb25hcy9Db2Rlcy9tc2kvZGFzaC5qcy9zcmMvbXNzL01zc0ZyYWdtZW50TW9vdlByb2Nlc3Nvci5qcyIsIi9ob21lL2pvb25hcy9Db2Rlcy9tc2kvZGFzaC5qcy9zcmMvbXNzL01zc0ZyYWdtZW50UHJvY2Vzc29yLmpzIiwiL2hvbWUvam9vbmFzL0NvZGVzL21zaS9kYXNoLmpzL3NyYy9tc3MvTXNzSGFuZGxlci5qcyIsIi9ob21lL2pvb25hcy9Db2Rlcy9tc2kvZGFzaC5qcy9zcmMvbXNzL2Vycm9ycy9Nc3NFcnJvcnMuanMiLCIvaG9tZS9qb29uYXMvQ29kZXMvbXNpL2Rhc2guanMvc3JjL21zcy9pbmRleC5qcyIsIi9ob21lL2pvb25hcy9Db2Rlcy9tc2kvZGFzaC5qcy9zcmMvbXNzL3BhcnNlci9Nc3NQYXJzZXIuanMiLCIvaG9tZS9qb29uYXMvQ29kZXMvbXNpL2Rhc2guanMvc3JjL3N0cmVhbWluZy9NZWRpYVBsYXllckV2ZW50cy5qcyIsIi9ob21lL2pvb25hcy9Db2Rlcy9tc2kvZGFzaC5qcy9zcmMvc3RyZWFtaW5nL3V0aWxzL0luaXRDYWNoZS5qcyIsIi9ob21lL2pvb25hcy9Db2Rlcy9tc2kvZGFzaC5qcy9zcmMvc3RyZWFtaW5nL3ZvL0Rhc2hKU0Vycm9yLmpzIiwiL2hvbWUvam9vbmFzL0NvZGVzL21zaS9kYXNoLmpzL3NyYy9zdHJlYW1pbmcvdm8vRGF0YUNodW5rLmpzIiwiL2hvbWUvam9vbmFzL0NvZGVzL21zaS9kYXNoLmpzL3NyYy9zdHJlYW1pbmcvdm8vRnJhZ21lbnRSZXF1ZXN0LmpzIiwiL2hvbWUvam9vbmFzL0NvZGVzL21zaS9kYXNoLmpzL3NyYy9zdHJlYW1pbmcvdm8vbWV0cmljcy9IVFRQUmVxdWVzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBSSxNQUFNLEdBQUMsQ0FBQSxVQUFTLFNBQVMsRUFBQztBQUFDLGNBQVksQ0FBQyxJQUFJLElBQUksR0FBQyxHQUFHO01BQUMsUUFBUSxHQUFDLENBQUM7TUFBQyxPQUFPLEdBQUMsZ0JBQWdCO01BQUMsV0FBVyxHQUFDLFlBQVksQ0FBQyxPQUFPLENBQUM7TUFBQyxnQkFBZ0IsR0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLG9CQUFvQixHQUFDLE9BQU8sTUFBTSxLQUFHLFVBQVUsQ0FBQyxTQUFTLE9BQU8sQ0FBQyxDQUFDLEVBQUMsS0FBSyxFQUFDLFFBQVEsRUFBQyxhQUFhLEVBQUM7QUFBQyxRQUFHLE9BQU8sQ0FBQyxLQUFHLFdBQVcsRUFBQyxPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLE9BQU8sS0FBSyxLQUFHLFdBQVcsRUFBQyxPQUFNLENBQUMsS0FBSyxLQUFHLEVBQUUsSUFBRSxDQUFDLFFBQVEsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUMsU0FBUyxDQUFDLENBQUMsRUFBQyxLQUFLLEVBQUMsUUFBUSxFQUFDLGFBQWEsQ0FBQyxDQUFDLE9BQU8sVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFBO0dBQUMsU0FBUyxVQUFVLENBQUMsS0FBSyxFQUFDLElBQUksRUFBQztBQUFDLFFBQUksQ0FBQyxLQUFLLEdBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUMsS0FBSyxDQUFBO0dBQUMsVUFBVSxDQUFDLFNBQVMsR0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxTQUFTLFlBQVksQ0FBQyxLQUFLLEVBQUM7QUFBQyxRQUFJLENBQUMsS0FBSyxHQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBQyxJQUFJLENBQUE7R0FBQyxZQUFZLENBQUMsU0FBUyxHQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFNBQVMsWUFBWSxDQUFDLEtBQUssRUFBQztBQUFDLFFBQUksQ0FBQyxLQUFLLEdBQUMsS0FBSyxDQUFBO0dBQUMsWUFBWSxDQUFDLFNBQVMsR0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxTQUFTLFNBQVMsQ0FBQyxDQUFDLEVBQUM7QUFBQyxXQUFNLENBQUMsT0FBTyxHQUFDLENBQUMsSUFBRSxDQUFDLEdBQUMsT0FBTyxDQUFBO0dBQUMsU0FBUyxZQUFZLENBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBRyxDQUFDLEdBQUMsR0FBRyxFQUFDLE9BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLENBQUMsR0FBQyxJQUFJLEVBQUMsT0FBTSxDQUFDLENBQUMsR0FBQyxHQUFHLEVBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFNLENBQUMsQ0FBQyxHQUFDLEdBQUcsRUFBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEVBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtHQUFDLFNBQVMsWUFBWSxDQUFDLEdBQUcsRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sR0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUcsTUFBTSxHQUFDLENBQUMsSUFBRSxVQUFVLENBQUMsR0FBRyxFQUFDLFdBQVcsQ0FBQyxHQUFDLENBQUMsRUFBQztBQUFDLGNBQU8sTUFBTSxHQUFFLEtBQUssQ0FBQztBQUFDLGlCQUFPLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFBQyxpQkFBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQUMsaUJBQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUM7QUFBUSxpQkFBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQSxHQUFFLElBQUksQ0FBQSxDQUFDO0tBQUMsT0FBTyxHQUFHLENBQUE7R0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQTtHQUFDLFNBQVMsV0FBVyxDQUFDLE1BQU0sRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU0sRUFBRSxDQUFDLEdBQUMsTUFBTSxFQUFDO0FBQUMsT0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQTtLQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQUMsU0FBUyxRQUFRLENBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBRyxDQUFDLEdBQUMsQ0FBQyxFQUFDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxHQUFHLEdBQUMsQ0FBQyxDQUFDLE1BQU07UUFBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLE1BQU07UUFBQyxDQUFDLEdBQUMsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDO1FBQUMsS0FBSyxHQUFDLENBQUM7UUFBQyxJQUFJLEdBQUMsSUFBSTtRQUFDLEdBQUc7UUFBQyxDQUFDLENBQUMsS0FBSSxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxHQUFHLEVBQUMsQ0FBQyxFQUFFLEVBQUM7QUFBQyxTQUFHLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxLQUFLLENBQUMsS0FBSyxHQUFDLEdBQUcsSUFBRSxJQUFJLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxHQUFDLEtBQUssR0FBQyxJQUFJLENBQUE7S0FBQyxPQUFNLENBQUMsR0FBQyxHQUFHLEVBQUM7QUFBQyxTQUFHLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUMsR0FBRyxLQUFHLElBQUksR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLEdBQUcsR0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFBO0tBQUMsSUFBRyxLQUFLLEdBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUE7R0FBQyxTQUFTLE1BQU0sQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBRyxDQUFDLENBQUMsTUFBTSxJQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLFNBQVMsUUFBUSxDQUFDLENBQUMsRUFBQyxLQUFLLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsTUFBTTtRQUFDLENBQUMsR0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFBQyxJQUFJLEdBQUMsSUFBSTtRQUFDLEdBQUc7UUFBQyxDQUFDLENBQUMsS0FBSSxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFFLEVBQUM7QUFBQyxTQUFHLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksR0FBQyxLQUFLLENBQUMsS0FBSyxHQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxHQUFHLEdBQUMsS0FBSyxHQUFDLElBQUksQ0FBQyxLQUFLLElBQUUsQ0FBQyxDQUFBO0tBQUMsT0FBTSxLQUFLLEdBQUMsQ0FBQyxFQUFDO0FBQUMsT0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsS0FBSyxHQUFDLElBQUksQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLENBQUE7S0FBQyxPQUFPLENBQUMsQ0FBQTtHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUcsSUFBSSxDQUFDLElBQUksS0FBRyxDQUFDLENBQUMsSUFBSSxFQUFDO0FBQUMsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFBO0tBQUMsSUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLEtBQUs7UUFBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUM7QUFBQyxhQUFPLElBQUksVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUFDLE9BQU8sSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7R0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBRyxDQUFDLEdBQUMsQ0FBQyxLQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUM7QUFBQyxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUE7S0FBQyxJQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBQztBQUFDLFVBQUcsU0FBUyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBQyxPQUFPLElBQUksWUFBWSxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLE9BQU8sSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFdBQU8sSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsUUFBUSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLEdBQUcsR0FBQyxDQUFDLENBQUMsTUFBTTtRQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsTUFBTTtRQUFDLENBQUMsR0FBQyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUM7UUFBQyxNQUFNLEdBQUMsQ0FBQztRQUFDLElBQUksR0FBQyxJQUFJO1FBQUMsQ0FBQztRQUFDLFVBQVUsQ0FBQyxLQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLEdBQUcsRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLGdCQUFVLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLE1BQU0sR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxVQUFVLEdBQUMsQ0FBQyxFQUFDO0FBQUMsa0JBQVUsSUFBRSxJQUFJLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQTtPQUFDLE1BQUssTUFBTSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsVUFBVSxDQUFBO0tBQUMsS0FBSSxDQUFDLEdBQUMsR0FBRyxFQUFDLENBQUMsR0FBQyxHQUFHLEVBQUMsQ0FBQyxFQUFFLEVBQUM7QUFBQyxnQkFBVSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsSUFBRyxVQUFVLEdBQUMsQ0FBQyxFQUFDLFVBQVUsSUFBRSxJQUFJLENBQUMsS0FBSTtBQUFDLFNBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLFVBQVUsQ0FBQyxNQUFLO09BQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLFVBQVUsQ0FBQTtLQUFDLE9BQUssQ0FBQyxHQUFDLEdBQUcsRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLE9BQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUE7R0FBQyxTQUFTLFdBQVcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLElBQUksRUFBQztBQUFDLFFBQUksS0FBSyxDQUFDLElBQUcsVUFBVSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsSUFBRSxDQUFDLEVBQUM7QUFBQyxXQUFLLEdBQUMsUUFBUSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLE1BQUk7QUFBQyxXQUFLLEdBQUMsUUFBUSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUMsQ0FBQyxJQUFJLENBQUE7S0FBQyxLQUFLLEdBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUcsT0FBTyxLQUFLLEtBQUcsUUFBUSxFQUFDO0FBQUMsVUFBRyxJQUFJLEVBQUMsS0FBSyxHQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sSUFBSSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUE7S0FBQyxPQUFPLElBQUksVUFBVSxDQUFDLEtBQUssRUFBQyxJQUFJLENBQUMsQ0FBQTtHQUFDLFNBQVMsYUFBYSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsSUFBSSxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsQ0FBQyxDQUFDLE1BQU07UUFBQyxDQUFDLEdBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQztRQUFDLElBQUksR0FBQyxJQUFJO1FBQUMsQ0FBQztRQUFDLFVBQVUsQ0FBQyxLQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLGdCQUFVLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxJQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsVUFBVSxHQUFDLENBQUMsR0FBQyxVQUFVLEdBQUMsSUFBSSxHQUFDLFVBQVUsQ0FBQTtLQUFDLENBQUMsR0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxPQUFPLENBQUMsS0FBRyxRQUFRLEVBQUM7QUFBQyxVQUFHLElBQUksRUFBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLE9BQU8sSUFBSSxVQUFVLENBQUMsQ0FBQyxFQUFDLElBQUksQ0FBQyxDQUFBO0dBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxJQUFJLENBQUMsSUFBSSxLQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUM7QUFBQyxhQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUE7S0FBQyxJQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsS0FBSztRQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBQyxPQUFPLGFBQWEsQ0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxXQUFXLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7R0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBRyxDQUFDLEdBQUMsQ0FBQyxLQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUM7QUFBQyxhQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUE7S0FBQyxJQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBQztBQUFDLGFBQU8sSUFBSSxZQUFZLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsT0FBTyxhQUFhLENBQUMsQ0FBQyxFQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxJQUFFLENBQUMsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFdBQU8sSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFDLFlBQVU7QUFBQyxXQUFPLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFDLFlBQVU7QUFBQyxRQUFJLElBQUksR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxHQUFDLElBQUksWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxLQUFLLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFDLFlBQVU7QUFBQyxXQUFPLElBQUksWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0dBQUMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBQyxZQUFVO0FBQUMsV0FBTyxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFDLEtBQUssQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBQyxZQUFVO0FBQUMsV0FBTyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBQyxZQUFVO0FBQUMsV0FBTyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFFLENBQUMsR0FBQyxJQUFJLENBQUMsS0FBSyxHQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0dBQUMsQ0FBQyxTQUFTLFlBQVksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxHQUFHLEdBQUMsQ0FBQyxDQUFDLE1BQU07UUFBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLE1BQU07UUFBQyxDQUFDLEdBQUMsR0FBRyxHQUFDLEdBQUc7UUFBQyxDQUFDLEdBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUFDLElBQUksR0FBQyxJQUFJO1FBQUMsT0FBTztRQUFDLEtBQUs7UUFBQyxDQUFDO1FBQUMsR0FBRztRQUFDLEdBQUcsQ0FBQyxLQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLEdBQUcsRUFBQyxFQUFFLENBQUMsRUFBQztBQUFDLFNBQUcsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSSxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLEdBQUcsRUFBQyxFQUFFLENBQUMsRUFBQztBQUFDLFdBQUcsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsR0FBQyxPQUFPLEdBQUMsS0FBSyxHQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsSUFBRSxLQUFLLENBQUE7T0FBQztLQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQTtHQUFDLFNBQVMsYUFBYSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsTUFBTTtRQUFDLENBQUMsR0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFBQyxJQUFJLEdBQUMsSUFBSTtRQUFDLEtBQUssR0FBQyxDQUFDO1FBQUMsT0FBTztRQUFDLENBQUMsQ0FBQyxLQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLGFBQU8sR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sR0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFBO0tBQUMsT0FBTSxLQUFLLEdBQUMsQ0FBQyxFQUFDO0FBQUMsT0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsS0FBSyxHQUFDLElBQUksQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLENBQUE7S0FBQyxPQUFPLENBQUMsQ0FBQTtHQUFDLFNBQVMsU0FBUyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxFQUFFLENBQUMsT0FBTSxDQUFDLEVBQUUsR0FBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxTQUFTLGlCQUFpQixDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUcsQ0FBQyxJQUFFLEVBQUUsRUFBQyxPQUFPLFlBQVksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztRQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO1FBQUMsRUFBRSxHQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7UUFBQyxJQUFJLEdBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxNQUFNLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLEdBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxDQUFDLEVBQUUsRUFBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxPQUFPLENBQUE7R0FBQyxTQUFTLFlBQVksQ0FBQyxFQUFFLEVBQUMsRUFBRSxFQUFDO0FBQUMsV0FBTSxDQUFDLElBQUksR0FBQyxFQUFFLEdBQUMsSUFBSSxHQUFDLEVBQUUsR0FBQyxLQUFLLEdBQUMsRUFBRSxHQUFDLEVBQUUsR0FBQyxDQUFDLENBQUE7R0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLEtBQUs7UUFBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEtBQUs7UUFBQyxJQUFJLEdBQUMsSUFBSSxDQUFDLElBQUksS0FBRyxDQUFDLENBQUMsSUFBSTtRQUFDLEdBQUcsQ0FBQyxJQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUM7QUFBQyxVQUFHLENBQUMsS0FBRyxDQUFDLEVBQUMsT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLEtBQUcsQ0FBQyxFQUFDLE9BQU8sSUFBSSxDQUFDLElBQUcsQ0FBQyxLQUFHLENBQUMsQ0FBQyxFQUFDLE9BQU8sSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUcsR0FBRyxHQUFDLElBQUksRUFBQztBQUFDLGVBQU8sSUFBSSxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBQyxHQUFHLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQTtPQUFDLENBQUMsR0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUE7S0FBQyxJQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBQyxPQUFPLElBQUksVUFBVSxDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLElBQUksVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLENBQUE7R0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMscUJBQXFCLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxJQUFJLEVBQUM7QUFBQyxRQUFHLENBQUMsR0FBQyxJQUFJLEVBQUM7QUFBQyxhQUFPLElBQUksVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLENBQUE7S0FBQyxPQUFPLElBQUksVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLENBQUE7R0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLGdCQUFnQixHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUM7QUFBQyxhQUFPLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0tBQUMsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsSUFBSSxLQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtHQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFFBQUcsQ0FBQyxDQUFDLEtBQUssS0FBRyxDQUFDLEVBQUMsT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLENBQUMsS0FBSyxLQUFHLENBQUMsRUFBQyxPQUFPLElBQUksQ0FBQyxJQUFHLENBQUMsQ0FBQyxLQUFLLEtBQUcsQ0FBQyxDQUFDLEVBQUMsT0FBTyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBQyxJQUFJLENBQUMsS0FBSyxFQUFDLElBQUksQ0FBQyxJQUFJLEtBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFdBQU8sVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFdBQU8sSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMsTUFBTSxDQUFDLENBQUMsRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNO1FBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQUMsSUFBSSxHQUFDLElBQUk7UUFBQyxPQUFPO1FBQUMsS0FBSztRQUFDLENBQUM7UUFBQyxHQUFHO1FBQUMsR0FBRyxDQUFDLEtBQUksQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsRUFBRSxFQUFDO0FBQUMsU0FBRyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUMsQ0FBQyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsS0FBSSxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLFdBQUcsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFDLENBQUMsSUFBRSxHQUFHLEdBQUMsR0FBRyxDQUFBLEFBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxHQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsR0FBQyxPQUFPLEdBQUMsS0FBSyxHQUFDLElBQUksQ0FBQTtPQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEdBQUMsS0FBSyxDQUFBO0tBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsWUFBVTtBQUFDLFdBQU8sSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBQyxLQUFLLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsWUFBVTtBQUFDLFFBQUksS0FBSyxHQUFDLElBQUksQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBQyxPQUFPLElBQUksWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUMsS0FBSyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsV0FBTyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtHQUFDLENBQUMsU0FBUyxPQUFPLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLFFBQUksR0FBRyxHQUFDLENBQUMsQ0FBQyxNQUFNO1FBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxNQUFNO1FBQUMsSUFBSSxHQUFDLElBQUk7UUFBQyxNQUFNLEdBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFBQywyQkFBMkIsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQztRQUFDLE1BQU0sR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBRSxDQUFDLEdBQUMsMkJBQTJCLENBQUEsQUFBQyxDQUFDO1FBQUMsU0FBUyxHQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUMsTUFBTSxDQUFDO1FBQUMsT0FBTyxHQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUMsTUFBTSxDQUFDO1FBQUMsYUFBYTtRQUFDLEtBQUs7UUFBQyxLQUFLO1FBQUMsTUFBTTtRQUFDLENBQUM7UUFBQyxDQUFDO1FBQUMsQ0FBQyxDQUFDLElBQUcsU0FBUyxDQUFDLE1BQU0sSUFBRSxHQUFHLEVBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLDJCQUEyQixHQUFDLE9BQU8sQ0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSSxLQUFLLEdBQUMsR0FBRyxHQUFDLEdBQUcsRUFBQyxLQUFLLElBQUUsQ0FBQyxFQUFDLEtBQUssRUFBRSxFQUFDO0FBQUMsbUJBQWEsR0FBQyxJQUFJLEdBQUMsQ0FBQyxDQUFDLElBQUcsU0FBUyxDQUFDLEtBQUssR0FBQyxHQUFHLENBQUMsS0FBRywyQkFBMkIsRUFBQztBQUFDLHFCQUFhLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUMsR0FBRyxDQUFDLEdBQUMsSUFBSSxHQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxDQUFBLEdBQUUsMkJBQTJCLENBQUMsQ0FBQTtPQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLGFBQUssSUFBRSxhQUFhLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUUsU0FBUyxDQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsSUFBRSxLQUFLLEdBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQSxBQUFDLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQyxJQUFHLE1BQU0sR0FBQyxDQUFDLEVBQUM7QUFBQyxtQkFBUyxDQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsR0FBQyxNQUFNLEdBQUMsSUFBSSxDQUFDLE1BQU0sR0FBQyxDQUFDLENBQUMsQ0FBQTtTQUFDLE1BQUk7QUFBQyxtQkFBUyxDQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQTtTQUFDO09BQUMsT0FBTSxNQUFNLEtBQUcsQ0FBQyxFQUFDO0FBQUMscUJBQWEsSUFBRSxDQUFDLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQyxLQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLGVBQUssSUFBRSxTQUFTLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxLQUFLLEdBQUMsQ0FBQyxFQUFDO0FBQUMscUJBQVMsQ0FBQyxLQUFLLEdBQUMsQ0FBQyxDQUFDLEdBQUMsS0FBSyxHQUFDLElBQUksQ0FBQyxLQUFLLEdBQUMsQ0FBQyxDQUFBO1dBQUMsTUFBSTtBQUFDLHFCQUFTLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQyxHQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUMsQ0FBQyxDQUFBO1dBQUM7U0FBQyxNQUFNLElBQUUsS0FBSyxDQUFBO09BQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFDLGFBQWEsQ0FBQTtLQUFDLFNBQVMsR0FBQyxXQUFXLENBQUMsU0FBUyxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEVBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUE7R0FBQyxTQUFTLE9BQU8sQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxHQUFHLEdBQUMsQ0FBQyxDQUFDLE1BQU07UUFBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLE1BQU07UUFBQyxNQUFNLEdBQUMsRUFBRTtRQUFDLElBQUksR0FBQyxFQUFFO1FBQUMsSUFBSSxHQUFDLElBQUk7UUFBQyxLQUFLO1FBQUMsSUFBSTtRQUFDLEtBQUs7UUFBQyxLQUFLO1FBQUMsS0FBSyxDQUFDLE9BQU0sR0FBRyxFQUFDO0FBQUMsVUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFHLFVBQVUsQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxFQUFDO0FBQUMsY0FBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFRO09BQUMsSUFBSSxHQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFDLElBQUksQ0FBQyxJQUFJLEdBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxHQUFDLElBQUksQ0FBQyxJQUFJLEdBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxJQUFJLEdBQUMsR0FBRyxFQUFDO0FBQUMsYUFBSyxHQUFDLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQSxHQUFFLElBQUksQ0FBQTtPQUFDLEtBQUssR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFFO0FBQUMsYUFBSyxHQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUMsS0FBSyxDQUFDLENBQUMsSUFBRyxVQUFVLENBQUMsS0FBSyxFQUFDLElBQUksQ0FBQyxJQUFFLENBQUMsRUFBQyxNQUFNLEtBQUssRUFBRSxDQUFBO09BQUMsUUFBTSxLQUFLLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEdBQUMsUUFBUSxDQUFDLElBQUksRUFBQyxLQUFLLENBQUMsQ0FBQTtLQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0dBQUMsU0FBUyxXQUFXLENBQUMsS0FBSyxFQUFDLE1BQU0sRUFBQztBQUFDLFFBQUksTUFBTSxHQUFDLEtBQUssQ0FBQyxNQUFNO1FBQUMsUUFBUSxHQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUM7UUFBQyxJQUFJLEdBQUMsSUFBSTtRQUFDLENBQUM7UUFBQyxDQUFDO1FBQUMsU0FBUztRQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUMsQ0FBQyxDQUFDLEtBQUksQ0FBQyxHQUFDLE1BQU0sR0FBQyxDQUFDLEVBQUMsQ0FBQyxJQUFFLENBQUMsRUFBQyxFQUFFLENBQUMsRUFBQztBQUFDLGFBQU8sR0FBQyxTQUFTLEdBQUMsSUFBSSxHQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsUUFBUSxDQUFDLE9BQU8sR0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLEdBQUMsT0FBTyxHQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBQyxPQUFNLENBQUMsUUFBUSxFQUFDLFNBQVMsR0FBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLFNBQVMsU0FBUyxDQUFDLElBQUksRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLEtBQUs7UUFBQyxDQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUcsb0JBQW9CLEVBQUM7QUFBQyxhQUFNLENBQUMsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUMsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtLQUFDLElBQUksQ0FBQyxHQUFDLElBQUksQ0FBQyxLQUFLO1FBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxRQUFRLENBQUMsSUFBRyxDQUFDLEtBQUcsQ0FBQyxFQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxJQUFHLElBQUksQ0FBQyxPQUFPLEVBQUM7QUFBQyxVQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUM7QUFBQyxlQUFNLENBQUMsSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLElBQUksWUFBWSxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO09BQUMsT0FBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQTtLQUFDLElBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBQztBQUFDLFVBQUcsQ0FBQyxLQUFHLENBQUMsRUFBQyxPQUFNLENBQUMsSUFBSSxFQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUcsQ0FBQyxJQUFFLENBQUMsQ0FBQyxFQUFDLE9BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLEdBQUcsR0FBQyxJQUFJLEVBQUM7QUFBQyxhQUFLLEdBQUMsV0FBVyxDQUFDLENBQUMsRUFBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLEdBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxHQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLElBQUksQ0FBQyxJQUFJLEVBQUMsU0FBUyxHQUFDLENBQUMsU0FBUyxDQUFDLElBQUcsT0FBTyxRQUFRLEtBQUcsUUFBUSxFQUFDO0FBQUMsY0FBRyxJQUFJLENBQUMsSUFBSSxLQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUMsUUFBUSxHQUFDLENBQUMsUUFBUSxDQUFDLE9BQU0sQ0FBQyxJQUFJLFlBQVksQ0FBQyxRQUFRLENBQUMsRUFBQyxJQUFJLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFBO1NBQUMsT0FBTSxDQUFDLElBQUksVUFBVSxDQUFDLFFBQVEsRUFBQyxJQUFJLENBQUMsSUFBSSxLQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBQyxJQUFJLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFBO09BQUMsQ0FBQyxHQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQTtLQUFDLElBQUksVUFBVSxHQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxVQUFVLEtBQUcsQ0FBQyxDQUFDLEVBQUMsT0FBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQyxJQUFHLFVBQVUsS0FBRyxDQUFDLEVBQUMsT0FBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxNQUFNLElBQUUsR0FBRyxFQUFDLEtBQUssR0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxHQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxHQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssR0FBQyxJQUFJLENBQUMsSUFBSSxLQUFHLENBQUMsQ0FBQyxJQUFJO1FBQUMsR0FBRyxHQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFHLE9BQU8sUUFBUSxLQUFHLFFBQVEsRUFBQztBQUFDLFVBQUcsS0FBSyxFQUFDLFFBQVEsR0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEdBQUMsSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUE7S0FBQyxNQUFLLFFBQVEsR0FBQyxJQUFJLFVBQVUsQ0FBQyxRQUFRLEVBQUMsS0FBSyxDQUFDLENBQUMsSUFBRyxPQUFPLEdBQUcsS0FBRyxRQUFRLEVBQUM7QUFBQyxVQUFHLEtBQUssRUFBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFDLElBQUksWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0tBQUMsTUFBSyxHQUFHLEdBQUMsSUFBSSxVQUFVLENBQUMsR0FBRyxFQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU0sQ0FBQyxRQUFRLEVBQUMsR0FBRyxDQUFDLENBQUE7R0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFFBQUksTUFBTSxHQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTSxFQUFDLFFBQVEsRUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFdBQU8sU0FBUyxDQUFDLElBQUksRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxXQUFPLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFdBQU8sU0FBUyxDQUFDLElBQUksRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxXQUFPLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLEtBQUs7UUFBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEtBQUs7UUFBQyxLQUFLO1FBQUMsQ0FBQztRQUFDLENBQUMsQ0FBQyxJQUFHLENBQUMsS0FBRyxDQUFDLEVBQUMsT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLEtBQUcsQ0FBQyxFQUFDLE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUcsQ0FBQyxLQUFHLENBQUMsRUFBQyxPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLENBQUMsS0FBRyxDQUFDLENBQUMsRUFBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLENBQUMsSUFBSSxFQUFDO0FBQUMsYUFBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxJQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBQyxNQUFNLElBQUksS0FBSyxDQUFDLGVBQWUsR0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEdBQUMsZ0JBQWdCLENBQUMsQ0FBQyxJQUFHLElBQUksQ0FBQyxPQUFPLEVBQUM7QUFBQyxVQUFHLFNBQVMsQ0FBQyxLQUFLLEdBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxPQUFPLElBQUksWUFBWSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0tBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU0sSUFBSSxFQUFDO0FBQUMsVUFBRyxDQUFDLEdBQUMsQ0FBQyxLQUFHLENBQUMsRUFBQztBQUFDLFNBQUMsR0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO09BQUMsSUFBRyxDQUFDLEtBQUcsQ0FBQyxFQUFDLE1BQU0sQ0FBQyxJQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFBO0tBQUMsT0FBTyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFDLElBQUksQ0FBQyxLQUFLO1FBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUFDLEVBQUUsR0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQUMsRUFBRSxHQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLENBQUMsS0FBRyxFQUFFLEVBQUMsT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLEtBQUcsRUFBRSxFQUFDLE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUcsQ0FBQyxLQUFHLEVBQUUsRUFBQyxPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLENBQUMsS0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUMsT0FBTyxJQUFJLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU0sSUFBSSxFQUFDO0FBQUMsVUFBRyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUEsS0FBSSxFQUFFLEVBQUM7QUFBQyxTQUFDLEdBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtPQUFDLElBQUcsQ0FBQyxLQUFHLEVBQUUsRUFBQyxNQUFNLENBQUMsSUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtLQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQUMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxVQUFTLEdBQUcsRUFBQyxHQUFHLEVBQUM7QUFBQyxPQUFHLEdBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBRyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFBQyxJQUFJLEdBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFNLEdBQUcsQ0FBQyxVQUFVLEVBQUUsRUFBQztBQUFDLFVBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFDLE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUcsR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtLQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLFVBQVUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBRyxDQUFDLENBQUMsTUFBTSxLQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUM7QUFBQyxhQUFPLENBQUMsQ0FBQyxNQUFNLEdBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxLQUFJLElBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUMsQ0FBQyxFQUFDLENBQUMsSUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFFLEVBQUM7QUFBQyxVQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxLQUFLO1FBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBRyxDQUFDLENBQUMsT0FBTyxFQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sVUFBVSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBQztBQUFDLE9BQUMsR0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFHLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxPQUFNLENBQUMsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUMsQ0FBQyxJQUFFLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsSUFBRSxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFHLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBRyxDQUFDLEtBQUcsUUFBUSxFQUFDO0FBQUMsYUFBTSxDQUFDLENBQUMsQ0FBQTtLQUFDLElBQUcsQ0FBQyxLQUFHLENBQUMsUUFBUSxFQUFDO0FBQUMsYUFBTyxDQUFDLENBQUE7S0FBQyxJQUFJLENBQUMsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxLQUFLO1FBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBRyxJQUFJLENBQUMsSUFBSSxLQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUM7QUFBQyxhQUFPLENBQUMsQ0FBQyxJQUFJLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsSUFBRyxDQUFDLENBQUMsT0FBTyxFQUFDO0FBQUMsYUFBTyxJQUFJLENBQUMsSUFBSSxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQTtLQUFDLE9BQU8sVUFBVSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsSUFBRSxJQUFJLENBQUMsSUFBSSxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQSxBQUFDLENBQUE7R0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBRyxDQUFDLEtBQUcsUUFBUSxFQUFDO0FBQUMsYUFBTSxDQUFDLENBQUMsQ0FBQTtLQUFDLElBQUcsQ0FBQyxLQUFHLENBQUMsUUFBUSxFQUFDO0FBQUMsYUFBTyxDQUFDLENBQUE7S0FBQyxJQUFJLENBQUMsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxLQUFLO1FBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBRyxDQUFDLENBQUMsT0FBTyxFQUFDO0FBQUMsYUFBTyxDQUFDLElBQUUsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLElBQUcsQ0FBQyxHQUFDLENBQUMsS0FBRyxDQUFDLENBQUMsSUFBSSxFQUFDO0FBQUMsYUFBTyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQTtLQUFDLE9BQU8sQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBRyxDQUFDLEtBQUcsUUFBUSxFQUFDO0FBQUMsYUFBTSxDQUFDLENBQUMsQ0FBQTtLQUFDLElBQUcsQ0FBQyxLQUFHLENBQUMsUUFBUSxFQUFDO0FBQUMsYUFBTyxDQUFDLENBQUE7S0FBQyxJQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUcsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxXQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUcsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFdBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBRyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsV0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxXQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLGVBQWUsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFdBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBRSxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsZUFBZSxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsZUFBZSxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsY0FBYyxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsV0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFFLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEdBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsWUFBVTtBQUFDLFdBQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQSxLQUFJLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsWUFBVTtBQUFDLFdBQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQSxLQUFJLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsWUFBVTtBQUFDLFdBQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQSxLQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUMsWUFBVTtBQUFDLFdBQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQSxLQUFJLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUMsWUFBVTtBQUFDLFdBQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQSxLQUFJLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUMsWUFBVTtBQUFDLFdBQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQSxLQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsWUFBVTtBQUFDLFdBQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBQyxZQUFVO0FBQUMsV0FBTyxJQUFJLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsWUFBVTtBQUFDLFdBQU8sSUFBSSxDQUFDLElBQUksQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsWUFBVTtBQUFDLFdBQU8sSUFBSSxDQUFDLEtBQUssR0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFDLFlBQVU7QUFBQyxXQUFPLEtBQUssQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsWUFBVTtBQUFDLFdBQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUcsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxZQUFVO0FBQUMsV0FBTyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxLQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsWUFBVTtBQUFDLFdBQU8sS0FBSyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxZQUFVO0FBQUMsV0FBTyxJQUFJLENBQUMsS0FBSyxLQUFHLENBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsWUFBVTtBQUFDLFdBQU8sSUFBSSxDQUFDLEtBQUssS0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsYUFBYSxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFDLE9BQU8sS0FBSyxDQUFDLElBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFDLE9BQU8sSUFBSSxDQUFDLElBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBRyxDQUFDLEVBQUMsT0FBTyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLGFBQWEsR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLGFBQWEsR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxTQUFTLFlBQVksQ0FBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUMsT0FBTyxLQUFLLENBQUMsSUFBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBQyxPQUFPLElBQUksQ0FBQyxJQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsSUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxJQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxLQUFLLENBQUMsSUFBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFDLE9BQU8sSUFBSSxDQUFBO0dBQUMsU0FBUyxlQUFlLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLFFBQUksS0FBSyxHQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUU7UUFBQyxDQUFDLEdBQUMsS0FBSztRQUFDLENBQUMsR0FBQyxDQUFDO1FBQUMsQ0FBQztRQUFDLENBQUM7UUFBQyxDQUFDO1FBQUMsQ0FBQyxDQUFDLE9BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBRSxDQUFDLElBQUksRUFBQyxLQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUMsQ0FBQyxFQUFFLEVBQUM7QUFBQyxVQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsU0FBUyxDQUFDLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLENBQUMsTUFBTSxFQUFFLElBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBQyxTQUFTLEtBQUksQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxJQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLFNBQUMsR0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFDLE9BQU8sS0FBSyxDQUFDLElBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBQyxTQUFTLElBQUksQ0FBQTtPQUFDLE9BQU8sS0FBSyxDQUFBO0tBQUMsT0FBTyxJQUFJLENBQUE7R0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBQyxVQUFTLE1BQU0sRUFBQztBQUFDLFFBQUksT0FBTyxHQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFHLE9BQU8sS0FBRyxTQUFTLEVBQUMsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksSUFBSSxHQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFHLElBQUksSUFBRSxFQUFFLEVBQUMsT0FBTyxlQUFlLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxHQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFHLElBQUksR0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLENBQUMsS0FBSSxJQUFJLENBQUMsR0FBQyxFQUFFLEVBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsRUFBRSxFQUFDO0FBQUMsT0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxPQUFPLGVBQWUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsZUFBZSxHQUFDLFVBQVMsVUFBVSxFQUFDO0FBQUMsUUFBSSxPQUFPLEdBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUcsT0FBTyxLQUFHLFNBQVMsRUFBQyxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUMsVUFBVSxLQUFHLFNBQVMsR0FBQyxDQUFDLEdBQUMsVUFBVSxDQUFDLEtBQUksSUFBSSxDQUFDLEdBQUMsRUFBRSxFQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLE9BQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxPQUFPLGVBQWUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsZUFBZSxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsZUFBZSxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsTUFBTSxDQUFDLElBQUk7UUFBQyxJQUFJLEdBQUMsTUFBTSxDQUFDLEdBQUc7UUFBQyxDQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUFDLElBQUksR0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQUMsQ0FBQztRQUFDLEtBQUs7UUFBQyxLQUFLLENBQUMsT0FBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBQztBQUFDLE9BQUMsR0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxHQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtLQUFDLElBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUMsT0FBTyxHQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsR0FBQyxtQkFBbUIsQ0FBQyxDQUFDLElBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBRyxDQUFDLENBQUMsRUFBQztBQUFDLE9BQUMsR0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsSUFBRyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUM7QUFBQyxhQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtLQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksR0FBQyxZQUFVO0FBQUMsUUFBSSxLQUFLLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFHLElBQUksQ0FBQyxJQUFJLEVBQUM7QUFBQyxhQUFPLGFBQWEsQ0FBQyxLQUFLLEVBQUMsQ0FBQyxFQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUFDLE9BQU8sSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFDLFlBQVU7QUFBQyxRQUFJLEtBQUssR0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUcsS0FBSyxHQUFDLENBQUMsR0FBQyxPQUFPLEVBQUMsT0FBTyxJQUFJLFlBQVksQ0FBQyxLQUFLLEdBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLFVBQVUsQ0FBQyxXQUFXLEVBQUMsS0FBSyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFDLFlBQVU7QUFBQyxXQUFPLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFDLFlBQVU7QUFBQyxRQUFJLEtBQUssR0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUcsSUFBSSxDQUFDLElBQUksRUFBQztBQUFDLGFBQU8sSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQTtLQUFDLE9BQU8sYUFBYSxDQUFDLEtBQUssRUFBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksR0FBQyxZQUFVO0FBQUMsUUFBSSxLQUFLLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFHLEtBQUssR0FBQyxDQUFDLEdBQUMsQ0FBQyxPQUFPLEVBQUMsT0FBTyxJQUFJLFlBQVksQ0FBQyxLQUFLLEdBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLFVBQVUsQ0FBQyxXQUFXLEVBQUMsSUFBSSxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFDLFlBQVU7QUFBQyxXQUFPLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLElBQUksV0FBVyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTSxDQUFDLEdBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUMsQ0FBQyxDQUFDLElBQUUsSUFBSSxFQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxhQUFhLEdBQUMsV0FBVyxDQUFDLE1BQU07TUFBQyxhQUFhLEdBQUMsV0FBVyxDQUFDLGFBQWEsR0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLGFBQWEsQ0FBQyxDQUFDLEVBQUM7QUFBQyxXQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUUsSUFBSSxDQUFBO0dBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBQztBQUFDLFlBQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFDLDZCQUE2QixDQUFDLENBQUE7S0FBQyxJQUFHLENBQUMsR0FBQyxDQUFDLEVBQUMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLEdBQUMsSUFBSSxDQUFDLElBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFDLE9BQU8sTUFBTSxDQUFDLE9BQU0sQ0FBQyxJQUFFLGFBQWEsRUFBQztBQUFDLFlBQU0sR0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBRSxhQUFhLEdBQUMsQ0FBQyxDQUFBO0tBQUMsT0FBTyxNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFFBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsWUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUMsNkJBQTZCLENBQUMsQ0FBQTtLQUFDLElBQUcsQ0FBQyxHQUFDLENBQUMsRUFBQyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sR0FBQyxJQUFJLENBQUMsT0FBTSxDQUFDLElBQUUsYUFBYSxFQUFDO0FBQUMsVUFBRyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUUsTUFBTSxDQUFDLFVBQVUsRUFBRSxJQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBQyxPQUFPLE1BQU0sQ0FBQyxNQUFNLEdBQUMsU0FBUyxDQUFDLE1BQU0sRUFBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxHQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFFLGFBQWEsR0FBQyxDQUFDLENBQUE7S0FBQyxNQUFNLEdBQUMsU0FBUyxDQUFDLE1BQU0sRUFBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsR0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxTQUFTLE9BQU8sQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQztBQUFDLEtBQUMsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLEdBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRTtRQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBSSxJQUFJLEdBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBQyxDQUFDO1FBQUMsSUFBSSxHQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxHQUFDLENBQUM7UUFBQyxNQUFNLEdBQUMsQ0FBQyxDQUFDLElBQUksT0FBTyxHQUFDLElBQUk7UUFBQyxPQUFPLEdBQUMsSUFBSSxDQUFDLElBQUksTUFBTSxHQUFDLEVBQUUsQ0FBQyxPQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFDO0FBQUMsYUFBTyxHQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxHQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFHLEtBQUssRUFBQztBQUFDLGNBQU0sR0FBQyxhQUFhLEdBQUMsQ0FBQyxHQUFDLE1BQU0sQ0FBQTtPQUFDLE9BQU8sR0FBQyxTQUFTLENBQUMsSUFBSSxFQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBRyxLQUFLLEVBQUM7QUFBQyxjQUFNLEdBQUMsYUFBYSxHQUFDLENBQUMsR0FBQyxNQUFNLENBQUE7T0FBQyxJQUFJLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7S0FBQyxJQUFJLEdBQUcsR0FBQyxFQUFFLENBQUMsS0FBSyxHQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsS0FBSyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsS0FBRyxDQUFDLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUksSUFBSSxDQUFDLEdBQUMsTUFBTSxDQUFDLE1BQU0sR0FBQyxDQUFDLEVBQUMsQ0FBQyxJQUFFLENBQUMsRUFBQyxDQUFDLElBQUUsQ0FBQyxFQUFDO0FBQUMsU0FBRyxHQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsT0FBTyxHQUFHLENBQUE7R0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBQyxZQUFVO0FBQUMsV0FBTyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsV0FBTyxPQUFPLENBQUMsSUFBSSxFQUFDLENBQUMsRUFBQyxVQUFTLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxhQUFPLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsV0FBTyxPQUFPLENBQUMsSUFBSSxFQUFDLENBQUMsRUFBQyxVQUFTLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxhQUFPLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsV0FBTyxPQUFPLENBQUMsSUFBSSxFQUFDLENBQUMsRUFBQyxVQUFTLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxhQUFPLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksU0FBUyxHQUFDLENBQUMsSUFBRSxFQUFFO01BQUMsVUFBVSxHQUFDLENBQUMsSUFBSSxHQUFDLENBQUMsSUFBSSxDQUFBLElBQUcsSUFBSSxHQUFDLENBQUMsSUFBSSxDQUFBLEFBQUMsR0FBQyxTQUFTLENBQUMsU0FBUyxRQUFRLENBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsQ0FBQyxDQUFDLEtBQUs7UUFBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLEtBQUcsUUFBUSxHQUFDLENBQUMsR0FBQyxTQUFTLEdBQUMsT0FBTyxDQUFDLEtBQUcsUUFBUSxHQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLEdBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFBO0dBQUMsU0FBUyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUMsSUFBSSxFQUFDO0FBQUMsUUFBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFFLENBQUMsRUFBQztBQUFDLFVBQUksR0FBRyxHQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFFLENBQUMsR0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxFQUFDLEdBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUE7S0FBQyxPQUFNLEVBQUMsQ0FBQyxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUE7R0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBQyxZQUFVO0FBQUMsUUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLEVBQUM7QUFBQyxPQUFDLEdBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLElBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBRyxDQUFDLEVBQUM7QUFBQyxhQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLE9BQU8sTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUMsRUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxLQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUE7R0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsS0FBQyxHQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFBO0dBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLEtBQUMsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUMsT0FBTyxDQUFDLENBQUMsSUFBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUMsT0FBTyxDQUFDLENBQUMsSUFBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUFDLENBQUM7UUFBQyxDQUFDLENBQUMsT0FBTSxDQUFDLENBQUMsTUFBTSxFQUFFLElBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFDO0FBQUMsT0FBQyxHQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxPQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBQztBQUFDLE9BQUMsR0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsR0FBRTtBQUFDLGFBQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFDO0FBQUMsU0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7T0FBQyxJQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUM7QUFBQyxTQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQTtPQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsUUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxLQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxTQUFTLFdBQVcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsS0FBQyxHQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxHQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO1FBQUMsSUFBSSxHQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLEdBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxLQUFLLENBQUMsT0FBTyxFQUFDLE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxHQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksTUFBTSxHQUFDLEVBQUU7UUFBQyxVQUFVLEdBQUMsSUFBSSxDQUFDLEtBQUksSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsTUFBTSxFQUFDLENBQUMsRUFBRSxFQUFDO0FBQUMsVUFBSSxHQUFHLEdBQUMsVUFBVSxHQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLEdBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUcsS0FBSyxHQUFDLEdBQUcsRUFBQyxVQUFVLEdBQUMsS0FBSyxDQUFBO0tBQUMsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFDLElBQUksRUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0dBQUMsSUFBSSxTQUFTLEdBQUMsU0FBVixTQUFTLENBQVUsSUFBSSxFQUFDLElBQUksRUFBQyxRQUFRLEVBQUMsYUFBYSxFQUFDO0FBQUMsWUFBUSxHQUFDLFFBQVEsSUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUcsQ0FBQyxhQUFhLEVBQUM7QUFBQyxVQUFJLEdBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLFFBQVEsR0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUE7S0FBQyxJQUFJLE1BQU0sR0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksT0FBTyxHQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxjQUFjLEdBQUMsRUFBRSxDQUFDLEtBQUksQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEdBQUMsUUFBUSxDQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLG9CQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFBO0tBQUMsS0FBSSxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxNQUFNLEVBQUMsQ0FBQyxFQUFFLEVBQUM7QUFBQyxVQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLEtBQUcsR0FBRyxFQUFDLFNBQVMsSUFBRyxDQUFDLElBQUksY0FBYyxFQUFDO0FBQUMsWUFBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUUsT0FBTyxFQUFDO0FBQUMsY0FBRyxDQUFDLEtBQUcsR0FBRyxJQUFFLE9BQU8sS0FBRyxDQUFDLEVBQUMsU0FBUyxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMsR0FBQyxnQ0FBZ0MsR0FBQyxJQUFJLEdBQUMsR0FBRyxDQUFDLENBQUE7U0FBQztPQUFDO0tBQUMsSUFBSSxHQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLE1BQU0sR0FBQyxFQUFFLENBQUMsSUFBSSxVQUFVLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFHLEdBQUcsQ0FBQyxLQUFJLENBQUMsR0FBQyxVQUFVLEdBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLFVBQUksQ0FBQyxHQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLENBQUMsSUFBSSxjQUFjLEVBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUcsQ0FBQyxLQUFHLEdBQUcsRUFBQztBQUFDLFlBQUksS0FBSyxHQUFDLENBQUMsQ0FBQyxHQUFFO0FBQUMsV0FBQyxFQUFFLENBQUE7U0FBQyxRQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBRyxHQUFHLElBQUUsQ0FBQyxHQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtPQUFDLE1BQUssTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLEdBQUMsMkJBQTJCLENBQUMsQ0FBQTtLQUFDLE9BQU8sa0JBQWtCLENBQUMsTUFBTSxFQUFDLElBQUksRUFBQyxVQUFVLENBQUMsQ0FBQTtHQUFDLENBQUMsU0FBUyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUMsSUFBSSxFQUFDLFVBQVUsRUFBQztBQUFDLFFBQUksR0FBRyxHQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFBQyxHQUFHLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUFDLENBQUMsQ0FBQyxLQUFJLENBQUMsR0FBQyxNQUFNLENBQUMsTUFBTSxHQUFDLENBQUMsRUFBQyxDQUFDLElBQUUsQ0FBQyxFQUFDLENBQUMsRUFBRSxFQUFDO0FBQUMsU0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBO0tBQUMsT0FBTyxVQUFVLEdBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxHQUFDLEdBQUcsQ0FBQTtHQUFDLFNBQVMsU0FBUyxDQUFDLEtBQUssRUFBQyxRQUFRLEVBQUM7QUFBQyxZQUFRLEdBQUMsUUFBUSxJQUFFLGdCQUFnQixDQUFDLElBQUcsS0FBSyxHQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUM7QUFBQyxhQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtLQUFDLE9BQU0sR0FBRyxHQUFDLEtBQUssR0FBQyxHQUFHLENBQUE7R0FBQyxTQUFTLE1BQU0sQ0FBQyxDQUFDLEVBQUMsSUFBSSxFQUFDO0FBQUMsUUFBSSxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBQztBQUFDLFVBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFDLE9BQU0sRUFBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsS0FBSyxFQUFDLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQywyQ0FBMkMsQ0FBQyxDQUFBO0tBQUMsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUM7QUFBQyxVQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBQyxPQUFNLEVBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLEtBQUssRUFBQyxDQUFDLElBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFDLE9BQU0sRUFBQyxLQUFLLEVBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsS0FBSyxFQUFDLENBQUMsSUFBSSxHQUFHLEdBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU0sRUFBQyxLQUFLLEVBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFDLEdBQUcsQ0FBQyxFQUFDLFVBQVUsRUFBQyxLQUFLLEVBQUMsQ0FBQTtLQUFDLElBQUksR0FBRyxHQUFDLEtBQUssQ0FBQyxJQUFHLENBQUMsQ0FBQyxVQUFVLEVBQUUsSUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUM7QUFBQyxTQUFHLEdBQUMsSUFBSSxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7S0FBQyxJQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBQztBQUFDLFVBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFDLE9BQU0sRUFBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUMsS0FBSyxFQUFDLENBQUMsT0FBTSxFQUFDLEtBQUssRUFBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksRUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFDLEdBQUcsRUFBQyxDQUFBO0tBQUMsSUFBSSxHQUFHLEdBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxHQUFDLENBQUM7UUFBQyxNQUFNLENBQUMsT0FBTSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBRSxDQUFDLEVBQUM7QUFBQyxZQUFNLEdBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEdBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEtBQUssR0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUcsS0FBSyxDQUFDLFVBQVUsRUFBRSxFQUFDO0FBQUMsYUFBSyxHQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxHQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtPQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUE7S0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLE9BQU0sRUFBQyxLQUFLLEVBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFDLFVBQVUsRUFBQyxHQUFHLEVBQUMsQ0FBQTtHQUFDLFNBQVMsWUFBWSxDQUFDLENBQUMsRUFBQyxJQUFJLEVBQUMsUUFBUSxFQUFDO0FBQUMsUUFBSSxHQUFHLEdBQUMsTUFBTSxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQyxPQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsR0FBQyxHQUFHLEdBQUMsRUFBRSxDQUFBLEdBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxhQUFPLFNBQVMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxDQUFDLENBQUE7S0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0dBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUMsVUFBUyxLQUFLLEVBQUM7QUFBQyxXQUFPLE1BQU0sQ0FBQyxJQUFJLEVBQUMsS0FBSyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFDLFVBQVMsS0FBSyxFQUFDO0FBQUMsV0FBTyxNQUFNLENBQUMsSUFBSSxFQUFDLEtBQUssQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBQyxVQUFTLEtBQUssRUFBQztBQUFDLFdBQU8sTUFBTSxDQUFDLElBQUksRUFBQyxLQUFLLENBQUMsQ0FBQTtHQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUMsVUFBUyxLQUFLLEVBQUMsUUFBUSxFQUFDO0FBQUMsUUFBRyxLQUFLLEtBQUcsU0FBUyxFQUFDLEtBQUssR0FBQyxFQUFFLENBQUMsSUFBRyxLQUFLLEtBQUcsRUFBRSxFQUFDLE9BQU8sWUFBWSxDQUFDLElBQUksRUFBQyxLQUFLLEVBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLEtBQUs7UUFBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLE1BQU07UUFBQyxHQUFHLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQUMsS0FBSyxHQUFDLFNBQVM7UUFBQyxLQUFLLENBQUMsT0FBTSxFQUFFLENBQUMsSUFBRSxDQUFDLEVBQUM7QUFBQyxXQUFLLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBQyxLQUFLLENBQUE7S0FBQyxJQUFJLElBQUksR0FBQyxJQUFJLENBQUMsSUFBSSxHQUFDLEdBQUcsR0FBQyxFQUFFLENBQUMsT0FBTyxJQUFJLEdBQUMsR0FBRyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBQyxVQUFTLEtBQUssRUFBQyxRQUFRLEVBQUM7QUFBQyxRQUFHLEtBQUssS0FBRyxTQUFTLEVBQUMsS0FBSyxHQUFDLEVBQUUsQ0FBQyxJQUFHLEtBQUssSUFBRSxFQUFFLEVBQUMsT0FBTyxZQUFZLENBQUMsSUFBSSxFQUFDLEtBQUssRUFBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFDLFlBQVU7QUFBQyxXQUFPLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQTtHQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUMsWUFBVTtBQUFDLFdBQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBQyxFQUFFLENBQUMsQ0FBQTtHQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUMsWUFBVTtBQUFDLFdBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsWUFBVTtBQUFDLFdBQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBQyxFQUFFLENBQUMsQ0FBQTtHQUFDLENBQUMsU0FBUyxnQkFBZ0IsQ0FBQyxDQUFDLEVBQUM7QUFBQyxRQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsVUFBSSxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLEtBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sb0JBQW9CLEdBQUMsSUFBSSxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsR0FBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLElBQUksSUFBSSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBRyxHQUFHLENBQUMsSUFBRyxJQUFJLEVBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLEdBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUMsQ0FBQyxFQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsbUJBQW1CLEdBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUcsS0FBSyxDQUFDLE1BQU0sS0FBRyxDQUFDLEVBQUM7QUFB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LENBQUMsQ0FBQTtLQUFDLElBQUcsT0FBTyxDQUFDLEtBQUcsUUFBUSxFQUFDO0FBQUMsYUFBTyxJQUFJLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQUMsS0FBSSxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLEdBQUcsRUFBQyxDQUFDLEVBQUUsRUFBQztBQUFDLFdBQU8sQ0FBQyxDQUFDLENBQUMsR0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLEdBQUMsQ0FBQyxFQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0dBQUMsT0FBTyxDQUFDLEdBQUcsR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsV0FBTyxDQUFDLFlBQVksVUFBVSxJQUFFLENBQUMsWUFBWSxZQUFZLElBQUUsQ0FBQyxZQUFZLFlBQVksQ0FBQTtHQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBQyxVQUFTLE1BQU0sRUFBQyxJQUFJLEVBQUMsVUFBVSxFQUFDO0FBQUMsV0FBTyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFDLFVBQVUsQ0FBQyxJQUFJLElBQUUsRUFBRSxDQUFDLEVBQUMsVUFBVSxDQUFDLENBQUE7R0FBQyxDQUFDLE9BQU8sT0FBTyxDQUFBO0NBQUMsQ0FBQSxFQUFFLENBQUMsSUFBRyxPQUFPLE1BQU0sS0FBRyxXQUFXLElBQUUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsRUFBQztBQUFDLFFBQU0sQ0FBQyxPQUFPLEdBQUMsTUFBTSxDQUFBO0NBQUMsSUFBRyxPQUFPLE1BQU0sS0FBRyxVQUFVLElBQUUsTUFBTSxDQUFDLEdBQUcsRUFBQztBQUFDLFFBQU0sQ0FBQyxhQUFhLEVBQUMsRUFBRSxFQUFDLFlBQVU7QUFBQyxXQUFPLE1BQU0sQ0FBQTtHQUFDLENBQUMsQ0FBQTtDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNrQ25uK0IsSUFBTSxZQUFZLEdBQUksQ0FBQSxZQUFZOztBQUU5QixRQUFJLFFBQVEsWUFBQSxDQUFDO0FBQ2IsUUFBSSxpQkFBaUIsR0FBRyxFQUFFLENBQUM7QUFDM0IsUUFBTSxrQkFBa0IsR0FBRyxFQUFFLENBQUM7QUFDOUIsUUFBTSxjQUFjLEdBQUcsRUFBRSxDQUFDOztBQUUxQixhQUFTLE1BQU0sQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUU7QUFDcEQsWUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxhQUFhLEVBQUU7QUFDakMsbUJBQU8sQ0FBQyxJQUFJLENBQUMsR0FBRztBQUNaLHdCQUFRLEVBQUUsYUFBYTtBQUN2Qix3QkFBUSxFQUFFLFFBQVE7YUFDckIsQ0FBQztTQUNMO0tBQ0o7Ozs7Ozs7Ozs7Ozs7O0FBY0QsYUFBUyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFO0FBQzlDLGFBQUssSUFBTSxDQUFDLElBQUksaUJBQWlCLEVBQUU7QUFDL0IsZ0JBQU0sR0FBRyxHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pDLGdCQUFJLEdBQUcsQ0FBQyxPQUFPLEtBQUssT0FBTyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO0FBQ25ELHVCQUFPLEdBQUcsQ0FBQyxRQUFRLENBQUM7YUFDdkI7U0FDSjtBQUNELGVBQU8sSUFBSSxDQUFDO0tBQ2Y7Ozs7Ozs7Ozs7O0FBV0QsYUFBUyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRTtBQUN4RCxhQUFLLElBQU0sQ0FBQyxJQUFJLGlCQUFpQixFQUFFO0FBQy9CLGdCQUFNLEdBQUcsR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQyxnQkFBSSxHQUFHLENBQUMsT0FBTyxLQUFLLE9BQU8sSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtBQUNuRCxpQ0FBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0FBQ3pDLHVCQUFPO2FBQ1Y7U0FDSjtBQUNELHlCQUFpQixDQUFDLElBQUksQ0FBQztBQUNuQixnQkFBSSxFQUFFLFNBQVM7QUFDZixtQkFBTyxFQUFFLE9BQU87QUFDaEIsb0JBQVEsRUFBRSxRQUFRO1NBQ3JCLENBQUMsQ0FBQztLQUNOOzs7Ozs7Ozs7QUFTRCxhQUFTLHdCQUF3QixDQUFDLE9BQU8sRUFBRTtBQUN2Qyx5QkFBaUIsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsVUFBQSxDQUFDO21CQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUssT0FBTztTQUFBLENBQUMsQ0FBQztLQUM1RTs7Ozs7Ozs7QUFRRCxhQUFTLGdCQUFnQixDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7QUFDNUMsZUFBTyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDL0I7O0FBRUQsYUFBUyxhQUFhLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUU7QUFDbEQsWUFBSSxJQUFJLElBQUksY0FBYyxFQUFFO0FBQ3hCLDBCQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDO1NBQ2xDO0tBQ0o7Ozs7Ozs7O0FBUUQsYUFBUyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFO0FBQ3ZDLHFCQUFhLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQztLQUNoRDs7QUFFRCxhQUFTLHFCQUFxQixDQUFDLElBQUksRUFBRTtBQUNqQyxlQUFPLGdCQUFnQixDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztLQUNqRDs7QUFFRCxhQUFTLGVBQWUsQ0FBQyxnQkFBZ0IsRUFBRTtBQUN2QyxZQUFJLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxxQkFBcUIsRUFBRSxjQUFjLENBQUMsQ0FBQzs7QUFFdkYsWUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNWLG1CQUFPLEdBQUcsVUFBVSxPQUFPLEVBQUU7QUFDekIsb0JBQUksT0FBTyxLQUFLLFNBQVMsRUFBRTtBQUN2QiwyQkFBTyxHQUFHLEVBQUUsQ0FBQztpQkFDaEI7QUFDRCx1QkFBTztBQUNILDBCQUFNLEVBQUUsa0JBQVk7QUFDaEIsK0JBQU8sS0FBSyxDQUFDLGdCQUFnQixFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztxQkFDdEQ7aUJBQ0osQ0FBQzthQUNMLENBQUM7O0FBRUYsMEJBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLE9BQU8sQ0FBQztTQUNwRTtBQUNELGVBQU8sT0FBTyxDQUFDO0tBQ2xCOzs7Ozs7OztBQVFELGFBQVMsc0JBQXNCLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRTtBQUMzQyxxQkFBYSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztLQUNwRDs7QUFFRCxhQUFTLHlCQUF5QixDQUFDLElBQUksRUFBRTtBQUNyQyxlQUFPLGdCQUFnQixDQUFDLElBQUksRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0tBQ3JEOztBQUVELGFBQVMsbUJBQW1CLENBQUMsZ0JBQWdCLEVBQUU7QUFDM0MsWUFBSSxPQUFPLEdBQUcsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMscUJBQXFCLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztBQUMzRixZQUFJLENBQUMsT0FBTyxFQUFFO0FBQ1YsbUJBQU8sR0FBRyxVQUFVLE9BQU8sRUFBRTtBQUN6QixvQkFBSSxRQUFRLFlBQUEsQ0FBQztBQUNiLG9CQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUU7QUFDdkIsMkJBQU8sR0FBRyxFQUFFLENBQUM7aUJBQ2hCO0FBQ0QsdUJBQU87QUFDSCwrQkFBVyxFQUFFLHVCQUFZOztBQUVyQiw0QkFBSSxDQUFDLFFBQVEsRUFBRTtBQUNYLG9DQUFRLEdBQUcsb0JBQW9CLENBQUMsT0FBTyxFQUFFLGdCQUFnQixDQUFDLHFCQUFxQixDQUFDLENBQUM7eUJBQ3BGOztBQUVELDRCQUFJLENBQUMsUUFBUSxFQUFFO0FBQ1gsb0NBQVEsR0FBRyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQ3ZELDZDQUFpQixDQUFDLElBQUksQ0FBQztBQUNuQixvQ0FBSSxFQUFFLGdCQUFnQixDQUFDLHFCQUFxQjtBQUM1Qyx1Q0FBTyxFQUFFLE9BQU87QUFDaEIsd0NBQVEsRUFBRSxRQUFROzZCQUNyQixDQUFDLENBQUM7eUJBQ047QUFDRCwrQkFBTyxRQUFRLENBQUM7cUJBQ25CO2lCQUNKLENBQUM7YUFDTCxDQUFDO0FBQ0YsOEJBQWtCLENBQUMsZ0JBQWdCLENBQUMscUJBQXFCLENBQUMsR0FBRyxPQUFPLENBQUM7U0FDeEU7O0FBRUQsZUFBTyxPQUFPLENBQUM7S0FDbEI7O0FBRUQsYUFBUyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRTs7QUFFNUMsWUFBSSxhQUFhLFlBQUEsQ0FBQztBQUNsQixZQUFNLFNBQVMsR0FBRyxnQkFBZ0IsQ0FBQyxxQkFBcUIsQ0FBQztBQUN6RCxZQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7O0FBRTNDLFlBQUksZUFBZSxFQUFFOztBQUVqQixnQkFBSSxTQUFTLEdBQUcsZUFBZSxDQUFDLFFBQVEsQ0FBQzs7QUFFekMsZ0JBQUksZUFBZSxDQUFDLFFBQVEsRUFBRTs7O0FBRTFCLDZCQUFhLEdBQUcsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEVBQUMsT0FBTyxFQUFQLE9BQU8sRUFBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3hELHlCQUFTLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQztBQUN4QiwyQkFBTyxFQUFQLE9BQU87QUFDUCwyQkFBTyxFQUFFLFFBQVE7QUFDakIsMEJBQU0sRUFBRSxhQUFhO2lCQUN4QixFQUFFLElBQUksQ0FBQyxDQUFDOztBQUVULHFCQUFLLElBQU0sSUFBSSxJQUFJLFNBQVMsRUFBRTtBQUMxQix3QkFBSSxhQUFhLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ3BDLHFDQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUN6QztpQkFDSjthQUVKLE1BQU07OztBQUVILHVCQUFPLFNBQVMsQ0FBQyxLQUFLLENBQUM7QUFDbkIsMkJBQU8sRUFBUCxPQUFPO0FBQ1AsMkJBQU8sRUFBRSxRQUFRO2lCQUNwQixFQUFFLElBQUksQ0FBQyxDQUFDO2FBRVo7U0FDSixNQUFNOztBQUVILHlCQUFhLEdBQUcsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEVBQUMsT0FBTyxFQUFQLE9BQU8sRUFBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQzNEOzs7QUFHRCxxQkFBYSxDQUFDLFlBQVksR0FBRyxZQUFZO0FBQUMsbUJBQU8sU0FBUyxDQUFDO1NBQUMsQ0FBQzs7QUFFN0QsZUFBTyxhQUFhLENBQUM7S0FDeEI7O0FBRUQsWUFBUSxHQUFHO0FBQ1AsY0FBTSxFQUFFLE1BQU07QUFDZCw0QkFBb0IsRUFBRSxvQkFBb0I7QUFDMUMsNEJBQW9CLEVBQUUsb0JBQW9CO0FBQzFDLGdDQUF3QixFQUFFLHdCQUF3QjtBQUNsRCwyQkFBbUIsRUFBRSxtQkFBbUI7QUFDeEMsaUNBQXlCLEVBQUUseUJBQXlCO0FBQ3BELDhCQUFzQixFQUFFLHNCQUFzQjtBQUM5Qyx1QkFBZSxFQUFFLGVBQWU7QUFDaEMsNkJBQXFCLEVBQUUscUJBQXFCO0FBQzVDLDBCQUFrQixFQUFFLGtCQUFrQjtLQUN6QyxDQUFDOztBQUVGLFdBQU8sUUFBUSxDQUFDO0NBRW5CLENBQUEsRUFBRSxBQUFDLENBQUM7O3FCQUVVLFlBQVk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQ3ZPckIsVUFBVTthQUFWLFVBQVU7OEJBQVYsVUFBVTs7O2lCQUFWLFVBQVU7O2VBQ0wsZ0JBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRTtBQUNwQixnQkFBSSxDQUFDLE1BQU0sRUFBRSxPQUFPOztBQUVwQixnQkFBSSxRQUFRLEdBQUcsTUFBTSxHQUFHLE1BQU0sQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0FBQ2hELGdCQUFJLFVBQVUsR0FBRyxNQUFNLEdBQUcsTUFBTSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7O0FBR3BELGlCQUFLLElBQU0sR0FBRyxJQUFJLE1BQU0sRUFBRTtBQUN0QixvQkFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxBQUFDLEVBQUUsU0FBUztBQUN0RSxvQkFBSSxVQUFVLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxTQUFTO0FBQ2xFLG9CQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBRTNCO1NBQ0o7OztXQWRDLFVBQVU7OztxQkFpQkQsVUFBVTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lDakJuQixVQUFVO2FBQVYsVUFBVTs4QkFBVixVQUFVOzs7aUJBQVYsVUFBVTs7ZUFDTCxnQkFBQyxNQUFNLEVBQUUsTUFBTSxFQUFFO0FBQ3BCLGdCQUFJLENBQUMsTUFBTSxFQUFFLE9BQU87O0FBRXBCLGdCQUFJLFFBQVEsR0FBRyxNQUFNLEdBQUcsTUFBTSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7QUFDaEQsZ0JBQUksVUFBVSxHQUFHLE1BQU0sR0FBRyxNQUFNLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQzs7QUFHcEQsaUJBQUssSUFBTSxHQUFHLElBQUksTUFBTSxFQUFFO0FBQ3RCLG9CQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEFBQUMsRUFBRSxTQUFTO0FBQ3RFLG9CQUFJLFVBQVUsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLFNBQVM7QUFDbEUsb0JBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7YUFFM0I7U0FDSjs7O1dBZEMsVUFBVTs7O3FCQWlCRCxVQUFVOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzBDQ3BCRyxpQ0FBaUM7Ozs7NkNBQ25DLHFDQUFxQzs7QUFFL0QsU0FBUyx5QkFBeUIsQ0FBQyxNQUFNLEVBQUU7O0FBRXZDLFVBQU0sR0FBRyxNQUFNLElBQUksRUFBRSxDQUFDOztBQUV0QixRQUFJLFFBQVEsWUFBQTtRQUNSLE1BQU0sWUFBQTtRQUNOLGFBQWEsWUFBQTtRQUNiLE9BQU8sWUFBQTtRQUNQLElBQUksWUFBQTtRQUNKLG1CQUFtQixZQUFBO1FBQ25CLFNBQVMsWUFBQTtRQUNULGlCQUFpQixZQUFBO1FBQ2pCLEtBQUssWUFBQSxDQUFDOztBQUVWLFFBQU0sZUFBZSxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUM7QUFDL0MsUUFBTSxpQkFBaUIsR0FBRyxNQUFNLENBQUMsaUJBQWlCLENBQUM7QUFDbkQsUUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUMzQixRQUFNLGNBQWMsR0FBRywyQkFBMkIsQ0FBQzs7QUFFbkQsYUFBUyxLQUFLLEdBQUc7QUFDYixjQUFNLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUN0Qzs7QUFFRCxhQUFTLFVBQVUsR0FBRztBQUNsQixZQUFJLEdBQUcsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2pDLHFCQUFhLEdBQUcsZUFBZSxDQUFDLGdCQUFnQixFQUFFLENBQUM7O0FBRW5ELGVBQU8sR0FBRyxLQUFLLENBQUM7QUFDaEIsaUJBQVMsR0FBRyxJQUFJLENBQUM7QUFDakIseUJBQWlCLEdBQUcsSUFBSSxDQUFDO0tBQzVCOztBQUVELGFBQVMsS0FBSyxHQUFHO0FBQ2IsWUFBSSxPQUFPLEVBQUUsT0FBTzs7QUFFcEIsY0FBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFdEIsZUFBTyxHQUFHLElBQUksQ0FBQztBQUNmLGFBQUssR0FBRyxDQUFDLENBQUM7O0FBRVYsNEJBQW9CLEVBQUUsQ0FBQztLQUMxQjs7QUFFRCxhQUFTLElBQUksR0FBRztBQUNaLFlBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTzs7QUFFckIsY0FBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFckIsb0JBQVksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQ2xDLGVBQU8sR0FBRyxLQUFLLENBQUM7QUFDaEIsaUJBQVMsR0FBRyxJQUFJLENBQUM7QUFDakIseUJBQWlCLEdBQUcsSUFBSSxDQUFDO0tBQzVCOztBQUVELGFBQVMsS0FBSyxHQUFHO0FBQ2IsWUFBSSxFQUFFLENBQUM7S0FDVjs7QUFFRCxhQUFTLG9CQUFvQixHQUFHO0FBQzVCLFlBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTzs7O0FBR3JCLFlBQU0sY0FBYyxHQUFHLHdCQUF3QixFQUFFLENBQUM7QUFDbEQsWUFBTSxRQUFRLEdBQUcsY0FBYyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQztBQUMvRCxZQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDMUksWUFBTSxRQUFRLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDO0FBQ3RFLFlBQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDOzs7OztBQUs5QyxZQUFNLE9BQU8sR0FBRyxvQkFBb0IsQ0FBQyxVQUFVLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDOzs7QUFHMUUsdUJBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQ3ZDOztBQUVELGFBQVMsb0JBQW9CLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxPQUFPLEVBQUU7QUFDL0QsWUFBSSxTQUFTLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUM7QUFDckQsWUFBSSxPQUFPLEdBQUcsNkNBQXFCLENBQUM7O0FBRXBDLGVBQU8sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0FBQ3pCLGVBQU8sQ0FBQyxJQUFJLEdBQUcsMkNBQVksOEJBQThCLENBQUM7O0FBRTFELGVBQU8sQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUM7QUFDMUMsZUFBTyxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQztBQUN6QyxlQUFPLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQzs7OztBQUk5QixlQUFPLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQyxLQUFLLENBQUM7QUFDdkMsZUFBTyxDQUFDLEtBQUssR0FBRyxLQUFLLEVBQUUsQ0FBQztBQUN4QixlQUFPLENBQUMsU0FBUyxHQUFHLGVBQWUsQ0FBQyxZQUFZLEVBQUUsQ0FBQztBQUNuRCxlQUFPLENBQUMsZUFBZSxHQUFHLGNBQWMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDO0FBQzFELGVBQU8sQ0FBQyxnQkFBZ0IsR0FBRyxjQUFjLENBQUMsRUFBRSxDQUFDO0FBQzdDLGVBQU8sQ0FBQyxHQUFHLEdBQUcsaUJBQWlCLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUM7QUFDcEcsZUFBTyxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzNFLGVBQU8sQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDL0YsZUFBTyxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQzs7QUFFbkUsZUFBTyxPQUFPLENBQUM7S0FDbEI7O0FBRUQsYUFBUyx3QkFBd0IsR0FBRztBQUNoQyxZQUFNLHdCQUF3QixHQUFHLGVBQWUsQ0FBQywyQkFBMkIsRUFBRSxDQUFDO0FBQy9FLFlBQU0sY0FBYyxHQUFHLHdCQUF3QixDQUFDLHdCQUF3QixFQUFFLENBQUM7QUFDM0UsZUFBTyxjQUFjLENBQUM7S0FDekI7O0FBRUQsYUFBUyxlQUFlLENBQUMsT0FBTyxFQUFFOztBQUU5QixZQUFJLGVBQWUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyxFQUFFOztBQUV2RSxrQkFBTSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ2hDLGdCQUFJLEVBQUUsQ0FBQztBQUNQLG1CQUFPO1NBQ1Y7O0FBRUQscUJBQWEsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDekM7O0FBRUQsYUFBUyxrQkFBa0IsQ0FBRSxDQUFDLEVBQUU7QUFDNUIsWUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPOztBQUVyQixZQUFNLE9BQU8sR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDO0FBQzFCLFlBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFO0FBQ2Isa0JBQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN4QyxtQkFBTztTQUNWOztBQUVELFlBQUksaUJBQWlCLFlBQUE7WUFDakIsU0FBUyxZQUFBO1lBQ1QsS0FBSyxZQUFBLENBQUM7Ozs7QUFJVixZQUFJLFNBQVMsS0FBSyxJQUFJLEVBQUU7QUFDcEIscUJBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQ3BDOztBQUVELFlBQUksQ0FBQyxpQkFBaUIsRUFBRTtBQUNwQiw2QkFBaUIsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO1NBQ3pDOzs7QUFHRCxpQkFBUyxHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxTQUFTLENBQUEsR0FBSSxJQUFJLENBQUM7QUFDdEQseUJBQWlCLEdBQUcsQUFBQyxPQUFPLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxRQUFRLEdBQUksaUJBQWlCLENBQUM7QUFDL0UsYUFBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFHLGlCQUFpQixHQUFHLFNBQVMsQ0FBRSxDQUFDOzs7QUFHckQsb0JBQVksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQ2xDLDJCQUFtQixHQUFHLFVBQVUsQ0FBQyxZQUFZO0FBQ3pDLCtCQUFtQixHQUFHLElBQUksQ0FBQztBQUMzQixnQ0FBb0IsRUFBRSxDQUFDO1NBQzFCLEVBQUUsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDO0tBQ3BCOztBQUVELGFBQVMsT0FBTyxHQUFHO0FBQ2YsZUFBTyxJQUFJLENBQUM7S0FDZjs7QUFFRCxZQUFRLEdBQUc7QUFDUCxrQkFBVSxFQUFFLFVBQVU7QUFDdEIsc0JBQWMsRUFBRSxjQUFjO0FBQzlCLGFBQUssRUFBRSxLQUFLO0FBQ1osMEJBQWtCLEVBQUUsa0JBQWtCO0FBQ3RDLGVBQU8sRUFBRSxPQUFPO0FBQ2hCLGFBQUssRUFBRSxLQUFLO0tBQ2YsQ0FBQzs7QUFFRixTQUFLLEVBQUUsQ0FBQzs7QUFFUixXQUFPLFFBQVEsQ0FBQztDQUNuQjs7QUFFRCx5QkFBeUIsQ0FBQyxxQkFBcUIsR0FBRywyQkFBMkIsQ0FBQztxQkFDL0QsTUFBTSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMseUJBQXlCLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7c0NDcExyRCw2QkFBNkI7Ozs7K0JBQy9CLG9CQUFvQjs7OzswQ0FFdkIsZ0NBQWdDOzs7Ozs7Ozs7QUFPbkQsU0FBUyx3QkFBd0IsQ0FBQyxNQUFNLEVBQUU7O0FBRXRDLFVBQU0sR0FBRyxNQUFNLElBQUksRUFBRSxDQUFDO0FBQ3RCLFFBQUksUUFBUSxZQUFBO1FBQ1IsSUFBSSxZQUFBO1FBQ0osTUFBTSxZQUFBLENBQUM7QUFDWCxRQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO0FBQ3ZDLFFBQU0sa0JBQWtCLEdBQUcsTUFBTSxDQUFDLGtCQUFrQixDQUFDO0FBQ3JELFFBQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7QUFDdkMsUUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUNqQyxRQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQ2pDLFFBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7O0FBRTNCLGFBQVMsS0FBSyxHQUFHO0FBQ2IsY0FBTSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDbkMsWUFBSSxHQUFHLEVBQUUsQ0FBQztLQUNiOztBQUVELGFBQVMsV0FBVyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRTtBQUN2RCxZQUFNLHdCQUF3QixHQUFHLGVBQWUsQ0FBQywyQkFBMkIsRUFBRSxDQUFDO0FBQy9FLFlBQU0sY0FBYyxHQUFHLHdCQUF3QixDQUFDLHdCQUF3QixFQUFFLENBQUM7O0FBRTNFLFlBQU0sUUFBUSxHQUFHLGNBQWMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUM7QUFDL0QsWUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzFJLFlBQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDOztBQUV2RCxZQUFJLEdBQUcsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDOzs7QUFHakMsWUFBSSxRQUFRLENBQUMsSUFBSSxLQUFLLFNBQVMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRTtBQUMvRCxtQkFBTztTQUNWOztBQUVELFlBQUksQ0FBQyxJQUFJLEVBQUU7QUFDUCx3QkFBWSxDQUFDLEtBQUssQ0FBQyx3Q0FBZ0IsNkJBQVUsZ0JBQWdCLEVBQUUsNkJBQVUsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO0FBQy9GLG1CQUFPO1NBQ1Y7OztBQUdELFlBQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztBQUM5RCxZQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQzNCLFlBQUksS0FBSyxZQUFBO1lBQ0wsV0FBVyxZQUFBO1lBQ1gsS0FBSyxZQUFBLENBQUM7QUFDVixZQUFJLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFDbkIsWUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1YsWUFBSSxPQUFPLFlBQUEsQ0FBQztBQUNaLFlBQUkscUJBQXFCLEdBQUcsSUFBSSxDQUFDOztBQUVqQyxZQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQ3RCLG1CQUFPO1NBQ1Y7OztBQUdELGFBQUssR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7QUFJbkIsWUFBSSxRQUFRLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRTs7QUFFNUIsdUJBQVcsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4RixnQkFBSSxLQUFLLENBQUMsc0JBQXNCLEdBQUksV0FBVyxHQUFJLFFBQVEsQ0FBQyxvQkFBb0IsR0FBRyxTQUFTLEFBQUMsQUFBQyxFQUFFO0FBQzVGLHVCQUFPO2FBQ1Y7U0FDSjs7Ozs7QUFLRCxtQkFBVyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7O0FBSTlJLFlBQUksS0FBSyxDQUFDLHNCQUFzQixJQUFJLFdBQVcsRUFBRTs7QUFFN0MsaUJBQUssR0FBRztBQUNKLHFCQUFLLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTO0FBQ2hDLG1CQUFHLEVBQUUsQUFBQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsU0FBUyxHQUFJLE9BQU8sQ0FBQyxRQUFRO2FBQ2pFLENBQUM7O0FBRUYscUJBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxlQUFlLENBQUMsYUFBYSxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDbEYsbUJBQU87U0FDVjs7O0FBR0QsZUFBTyxHQUFHLEVBQUUsQ0FBQztBQUNiLGVBQU8sQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLHNCQUFzQixDQUFDO0FBQ3pDLGVBQU8sQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLGlCQUFpQixDQUFDOztBQUVwQyxZQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUU7QUFDdkIsbUJBQU8sQ0FBQyxDQUFDLElBQUksVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9ELG1CQUFPLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQztTQUNwRDs7O0FBR0QsWUFBSSxXQUFXLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDaEQsWUFBSSxXQUFXLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLEtBQUssT0FBTyxDQUFDLENBQUMsRUFBRTtBQUM3QyxrQkFBTSxDQUFDLEtBQUssQ0FBQywrQkFBK0IsRUFBRSxXQUFXLENBQUMsQ0FBQyxHQUFHLFFBQVEsR0FBRyxXQUFXLENBQUMsQ0FBQyxHQUFHLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUEsQUFBQyxDQUFDLENBQUM7QUFDL0gsdUJBQVcsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDO1NBQzdDOztBQUVELGdCQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDOzs7QUFHdkIsWUFBSSxRQUFRLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRTtBQUM1QixnQkFBSSxJQUFJLEtBQUssT0FBTyxFQUFFO0FBQ2xCLHVCQUFPLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDeEMsdUJBQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQSxHQUFJLFNBQVMsQ0FBQztBQUM5QyxvQkFBSSxPQUFPLEdBQUcsY0FBYyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFO0FBQ3JELDRCQUFRLENBQUMsT0FBTyxDQUFDLHdDQUFPLHlCQUF5QixFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztpQkFDOUY7YUFDSjtBQUNELG1CQUFPO1NBQ1YsTUFDSTs7QUFFRCxnQkFBSSxRQUFRLENBQUMsb0JBQW9CLElBQUksUUFBUSxDQUFDLG9CQUFvQixHQUFHLENBQUMsRUFBRTs7QUFFcEUsdUJBQU8sR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN4QyxpQkFBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUM7OztBQUdkLHFDQUFxQixHQUFHLENBQUMsQ0FBQyxHQUFJLFFBQVEsQ0FBQyxvQkFBb0IsR0FBRyxTQUFTLENBQUMsR0FBSSxTQUFTLENBQUM7OztBQUd0Rix1QkFBTyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0Qix1QkFBTyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFBLEdBQUksU0FBUyxDQUFDO0FBQzlDLHVCQUFPLE9BQU8sR0FBRyxxQkFBcUIsRUFBRTs7QUFFcEMsd0JBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxPQUFPLEVBQUU7QUFDMUUsOEJBQU07cUJBQ1Q7O0FBRUQsNEJBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3RCLDJCQUFPLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RCLDJCQUFPLEdBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUEsR0FBSSxTQUFTLENBQUM7aUJBQ2xEO2FBQ0o7OztBQUdELGlCQUFLLEdBQUc7QUFDSixxQkFBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUztBQUNoQyxtQkFBRyxFQUFFLEFBQUMsSUFBSSxDQUFDLG1CQUFtQixHQUFHLFNBQVMsR0FBSSxPQUFPLENBQUMsUUFBUTthQUNqRSxDQUFDOztBQUVGLHFCQUFTLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxlQUFlLENBQUMsYUFBYSxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDeEU7O0FBRUQsZ0NBQXdCLENBQUMsb0JBQW9CLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ3ZFOztBQUVELGFBQVMsU0FBUyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFO0FBQzFDLFlBQUksSUFBSSxLQUFLLE9BQU8sSUFBSSxJQUFJLEtBQUssT0FBTyxFQUFFLE9BQU87QUFDakQsWUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JELFlBQUksQ0FBQyxRQUFRLElBQUssS0FBSyxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQUFBQyxFQUFFO0FBQy9DLGtCQUFNLENBQUMsS0FBSyxDQUFDLHFCQUFxQixHQUFHLEtBQUssQ0FBQyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDNUUsdUJBQVcsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNoRiw4QkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM5QztLQUNKOzs7QUFHRCxhQUFTLFlBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFO0FBQ2hDLFlBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNmLFlBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFVixhQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3RDLGdCQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRTtBQUMvQix1QkFBTyxNQUFNLENBQUM7YUFDakI7QUFDRCxrQkFBTSxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1NBQ2xDO0FBQ0QsZUFBTyxNQUFNLENBQUM7S0FDakI7O0FBRUQsYUFBUyxlQUFlLENBQUMsQ0FBQyxFQUFFLGVBQWUsRUFBRTtBQUN6QyxZQUFJLENBQUMsWUFBQSxDQUFDOzs7O0FBSU4sWUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRWpELFlBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbkMsWUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDOzs7QUFHOUMsWUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNqQyxZQUFNLElBQUksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ25DLFlBQUksSUFBSSxLQUFLLElBQUksRUFBRTtBQUNmLGdCQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xELGdCQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztBQUNqQixnQkFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDZixnQkFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUNwRjs7QUFFRCxZQUFNLElBQUksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDOzs7O0FBSW5DLFlBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDakMsWUFBSSxJQUFJLEVBQUU7QUFDTixnQkFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMvRCxnQkFBSSxHQUFHLElBQUksQ0FBQztTQUNmO0FBQ0QsWUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNqQyxtQkFBVyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxlQUFlLENBQUMsQ0FBQztBQUNwRCxZQUFJLElBQUksRUFBRTtBQUNOLGdCQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQy9ELGdCQUFJLEdBQUcsSUFBSSxDQUFDO1NBQ2Y7Ozs7O0FBS0QsWUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN2QyxZQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7QUFDakIsa0JBQU0sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLGtCQUFNLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQzs7QUFFNUIsZ0JBQUksS0FBSSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDakMsZ0JBQUksS0FBSSxLQUFLLElBQUksRUFBRTs7QUFFZixxQkFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzVDLHFCQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztBQUNqQixxQkFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDZixxQkFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7QUFDckIscUJBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFbEIsb0JBQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xELG9CQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztBQUNqQixvQkFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDZixvQkFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDO0FBQ3hDLG9CQUFJLENBQUMsd0JBQXdCLEdBQUcsQ0FBQyxDQUFDO0FBQ2xDLG9CQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDOztBQUUzQixvQkFBSSxNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksRUFBRTs7QUFFckIseUJBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFOzs7QUFHekMsNEJBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxBQUFDLENBQUM7cUJBQ3pFO2lCQUNKLE1BQU07O0FBRUgsd0JBQUksQ0FBQyx3QkFBd0IsR0FBRyxDQUFDLENBQUM7aUJBQ3JDO2FBQ0o7U0FDSjs7QUFFRCxZQUFJLENBQUMsS0FBSyxJQUFJLFFBQVEsQ0FBQztBQUN2QixZQUFJLENBQUMsS0FBSyxJQUFJLFFBQVEsQ0FBQztBQUN2QixZQUFJLENBQUMsS0FBSyxJQUFJLFFBQVEsQ0FBQzs7O0FBR3ZCLFlBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbkMsWUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQzlCLFlBQUksQ0FBQyxXQUFXLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQzs7O0FBRzlCLFlBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDakMsWUFBSSxJQUFJLEtBQUssSUFBSSxFQUFFO0FBQ2YsZ0JBQUksYUFBYSxHQUFHLFlBQVksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDL0MsZ0JBQUksYUFBYSxHQUFHLFlBQVksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7O0FBRS9DLGdCQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLGFBQWEsR0FBRyxhQUFhLEdBQUcsRUFBRSxDQUFDO1NBQ3ZEOzs7QUFHRCxTQUFDLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUNoQzs7QUFFRCxhQUFTLGlCQUFpQixDQUFDLENBQUMsRUFBRSxlQUFlLEVBQUU7OztBQUczQyxZQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRTtBQUNiLGtCQUFNLElBQUksS0FBSyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7U0FDdEQ7O0FBRUQsWUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRWpELFlBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbkMsWUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDOzs7QUFHOUMsWUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNqQyxZQUFJLElBQUksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2pDLFlBQUksSUFBSSxLQUFLLElBQUksRUFBRTtBQUNmLGdCQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xELGdCQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztBQUNqQixnQkFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDZixnQkFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUNwRjs7QUFFRCxZQUFJLElBQUksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2pDLG1CQUFXLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQ3BELFlBQUksSUFBSSxFQUFFO0FBQ04sZ0JBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDL0QsZ0JBQUksR0FBRyxJQUFJLENBQUM7U0FDZjtLQUNKOztBQUVELGFBQVMsT0FBTyxHQUFHO0FBQ2YsZUFBTyxJQUFJLENBQUM7S0FDZjs7QUFFRCxZQUFRLEdBQUc7QUFDUCx1QkFBZSxFQUFFLGVBQWU7QUFDaEMseUJBQWlCLEVBQUUsaUJBQWlCO0FBQ3BDLGVBQU8sRUFBRSxPQUFPO0tBQ25CLENBQUM7O0FBRUYsU0FBSyxFQUFFLENBQUM7QUFDUixXQUFPLFFBQVEsQ0FBQztDQUNuQjs7QUFFRCx3QkFBd0IsQ0FBQyxxQkFBcUIsR0FBRywwQkFBMEIsQ0FBQztxQkFDN0QsTUFBTSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsd0JBQXdCLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7K0JDdFVyRCxvQkFBb0I7Ozs7Ozs7OztBQU8zQyxTQUFTLHdCQUF3QixDQUFDLE1BQU0sRUFBRTtBQUN0QyxVQUFNLEdBQUcsTUFBTSxJQUFJLEVBQUUsQ0FBQztBQUN0QixRQUFNLFlBQVksR0FBRyxDQUFDLENBQUM7QUFDdkIsUUFBTSxZQUFZLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZCLFFBQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7QUFDbkMsUUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQzs7QUFFakMsUUFBSSxvQkFBb0IsR0FBRyxNQUFNLENBQUMsb0JBQW9CLENBQUM7QUFDdkQsUUFBSSxRQUFRLFlBQUE7UUFDUixNQUFNLFlBQUE7UUFDTixhQUFhLFlBQUE7UUFDYixjQUFjLFlBQUE7UUFDZCxpQkFBaUIsWUFBQTtRQUNqQixTQUFTLFlBQUE7UUFDVCxPQUFPLFlBQUEsQ0FBQzs7QUFFWixhQUFTLGFBQWEsQ0FBQyxPQUFPLEVBQUU7QUFDNUIsWUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDL0MsWUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUM7QUFDMUIsWUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUM7QUFDdkIsWUFBSSxDQUFDLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztBQUM1QixZQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDO0FBQ25DLFlBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUM7QUFDbkMsWUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQzs7QUFFbkMsZUFBTyxJQUFJLENBQUM7S0FDZjs7QUFFRCxhQUFTLGFBQWEsQ0FBQyxPQUFPLEVBQUU7OztBQUc1QixZQUFJLElBQUksR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQzs7O0FBRy9DLHFCQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7OztBQUdwQixZQUFJLElBQUksR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQzs7O0FBRzVDLHFCQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7OztBQUdwQixZQUFJLElBQUksR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQzs7O0FBRzVDLHFCQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7OztBQUdwQixxQkFBYSxDQUFDLElBQUksQ0FBQyxDQUFDOzs7QUFHcEIsWUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRTVDLGdCQUFRLGFBQWEsQ0FBQyxJQUFJO0FBQ3RCLGlCQUFLLFNBQVMsQ0FBQyxLQUFLOztBQUVoQiw2QkFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BCLHNCQUFNO0FBQUEsQUFDVixpQkFBSyxTQUFTLENBQUMsS0FBSzs7QUFFaEIsNkJBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNwQixzQkFBTTtBQUFBLEFBQ1Y7QUFDSSxzQkFBTTtBQUFBLFNBQ2I7OztBQUdELFlBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDOzs7QUFHNUMscUJBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7O0FBR3BCLFlBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDOzs7Ozs7QUFNNUMsWUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDaEQsWUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzs7O0FBR3RDLFlBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2hELFlBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7OztBQUd0QyxZQUFJLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNoRCxZQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7QUFHdEMsWUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDaEQsWUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7OztBQUdsRCxxQkFBYSxDQUFDLElBQUksQ0FBQyxDQUFDOzs7QUFHcEIsWUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7OztBQUc1QyxxQkFBYSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUVwQixZQUFJLGlCQUFpQixJQUFJLG9CQUFvQixFQUFFO0FBQzNDLGdCQUFJLFdBQVcsR0FBRyxvQkFBb0IsQ0FBQywyQ0FBMkMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ3RHLG1EQUF1QyxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztTQUM5RDtLQUNKOztBQUVELGFBQVMsYUFBYSxDQUFDLElBQUksRUFBRTs7QUFFekIsWUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRWhELFlBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDOztBQUVqQixZQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztBQUN2QixZQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO0FBQzNCLFlBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0FBQzNCLFlBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsS0FBSyxRQUFRLEdBQUcsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQyxDQUFDO0FBQzVHLFlBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO0FBQ2hCLFlBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO0FBQ2xCLFlBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ25CLFlBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDNUIsWUFBSSxDQUFDLE1BQU0sR0FBRyxDQUNWLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNQLFNBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNQLFNBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUNkLENBQUM7QUFDRixZQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN0QyxZQUFJLENBQUMsYUFBYSxHQUFHLE9BQU8sR0FBRyxDQUFDLENBQUM7O0FBRWpDLGVBQU8sSUFBSSxDQUFDO0tBQ2Y7O0FBRUQsYUFBUyxhQUFhLENBQUMsSUFBSSxFQUFFOztBQUV6QixZQUFJLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFFaEQsWUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDakIsWUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHO0FBQ1osV0FBRztBQUNILFdBQUcsQ0FBQzs7QUFFUixZQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztBQUN2QixZQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO0FBQzNCLFlBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO0FBQ3hCLFlBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ25CLFlBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsS0FBSyxRQUFRLEdBQUcsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQyxDQUFDO0FBQzVHLFlBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDNUIsWUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDZixZQUFJLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQztBQUN6QixZQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztBQUNsQixZQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztBQUNuQixZQUFJLENBQUMsTUFBTSxHQUFHLENBQ1YsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ1AsU0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ1AsU0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQ2QsQ0FBQztBQUNGLFlBQUksQ0FBQyxLQUFLLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQztBQUNsQyxZQUFJLENBQUMsTUFBTSxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUM7O0FBRXBDLGVBQU8sSUFBSSxDQUFDO0tBQ2Y7O0FBRUQsYUFBUyxhQUFhLENBQUMsSUFBSSxFQUFFOztBQUV6QixZQUFJLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFFaEQsWUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7O0FBRWpCLFlBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZCLFlBQUksQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLENBQUM7QUFDM0IsWUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDM0IsWUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxLQUFLLFFBQVEsR0FBRyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDLENBQUM7QUFDNUcsWUFBSSxDQUFDLFFBQVEsR0FBRyxhQUFhLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQztBQUM1QyxZQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQzs7QUFFckIsZUFBTyxJQUFJLENBQUM7S0FDZjs7QUFFRCxhQUFTLGFBQWEsQ0FBQyxJQUFJLEVBQUU7O0FBRXpCLFlBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUVoRCxZQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztBQUNyQixnQkFBUSxhQUFhLENBQUMsSUFBSTtBQUN0QixpQkFBSyxTQUFTLENBQUMsS0FBSztBQUNoQixvQkFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUM7QUFDM0Isc0JBQU07QUFBQSxBQUNWLGlCQUFLLFNBQVMsQ0FBQyxLQUFLO0FBQ2hCLG9CQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQztBQUMzQixzQkFBTTtBQUFBLEFBQ1Y7QUFDSSxvQkFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUM7QUFDM0Isc0JBQU07QUFBQSxTQUNiO0FBQ0QsWUFBSSxDQUFDLElBQUksR0FBRyxjQUFjLENBQUMsRUFBRSxDQUFDO0FBQzlCLFlBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUUxQixlQUFPLElBQUksQ0FBQztLQUNmOztBQUVELGFBQVMsYUFBYSxDQUFDLElBQUksRUFBRTs7QUFFekIsWUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRWhELFlBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDOztBQUVmLFlBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO0FBQ3RCLFlBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUV6QixlQUFPLElBQUksQ0FBQztLQUNmOztBQUVELGFBQVMsYUFBYSxDQUFDLElBQUksRUFBRTs7QUFFekIsWUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRWhELFlBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDOztBQUVmLFlBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLFlBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDOztBQUVsQixlQUFPLElBQUksQ0FBQztLQUNmOztBQUVELGFBQVMsYUFBYSxDQUFDLElBQUksRUFBRTs7QUFFekIsWUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRWhELFlBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO0FBQ3JCLFlBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDOztBQUVsQixZQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDdEQsV0FBRyxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDbEIsV0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7O0FBRWQsWUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRXZCLGVBQU8sSUFBSSxDQUFDO0tBQ2Y7O0FBRUQsYUFBUyxhQUFhLENBQUMsSUFBSSxFQUFFOztBQUV6QixZQUFJLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFFaEQsWUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDbEIsZ0JBQVEsYUFBYSxDQUFDLElBQUk7QUFDdEIsaUJBQUssU0FBUyxDQUFDLEtBQUssQ0FBQztBQUNyQixpQkFBSyxTQUFTLENBQUMsS0FBSztBQUNoQixvQkFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUMzQyxzQkFBTTtBQUFBLEFBQ1Y7QUFDSSxzQkFBTTtBQUFBLFNBQ2I7O0FBRUQsWUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztBQUN2QyxlQUFPLElBQUksQ0FBQztLQUNmOztBQUVELGFBQVMsaUJBQWlCLENBQUMsSUFBSSxFQUFFO0FBQzdCLFlBQUksS0FBSyxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxjQUFjLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDOztBQUVuRixnQkFBUSxLQUFLO0FBQ1QsaUJBQUssTUFBTTtBQUNQLHVCQUFPLDBCQUEwQixDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztBQUFBLEFBQ25ELGlCQUFLLE1BQU07QUFDUCx1QkFBTyx5QkFBeUIsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFBQSxBQUNsRDtBQUNJLHNCQUFNO0FBQ0Ysd0JBQUksRUFBRSw2QkFBVSwwQkFBMEI7QUFDMUMsMkJBQU8sRUFBRSw2QkFBVSw2QkFBNkI7QUFDaEQsd0JBQUksRUFBRTtBQUNGLDZCQUFLLEVBQUUsS0FBSztxQkFDZjtpQkFDSixDQUFDO0FBQUEsU0FDVDtLQUNKOztBQUVELGFBQVMsMEJBQTBCLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRTtBQUM3QyxZQUFJLElBQUksWUFBQSxDQUFDOztBQUVULFlBQUksaUJBQWlCLEVBQUU7QUFDbkIsZ0JBQUksR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDbEQsTUFBTTtBQUNILGdCQUFJLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ2xEOzs7QUFHRCxZQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNoRCxZQUFJLENBQUMsb0JBQW9CLEdBQUcsQ0FBQyxDQUFDOzs7QUFHOUIsWUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUM7QUFDdEIsWUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDbkIsWUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDOUIsWUFBSSxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDO0FBQ3BDLFlBQUksQ0FBQyxLQUFLLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQztBQUNsQyxZQUFJLENBQUMsZUFBZSxHQUFHLEVBQUUsQ0FBQztBQUMxQixZQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQztBQUN6QixZQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztBQUNuQixZQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztBQUNyQixZQUFJLENBQUMsY0FBYyxHQUFHLENBQ2xCLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJO0FBQzlDLFlBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQzlDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQzlDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQ2pELENBQUM7QUFDRixZQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQztBQUNwQixZQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztBQUMxQixZQUFJLENBQUMsTUFBTSxHQUFHLDZCQUE2QixFQUFFLENBQUM7QUFDOUMsWUFBSSxpQkFBaUIsRUFBRTs7QUFFbkIsZ0JBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDOzs7QUFHNUMsbUNBQXVCLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDOzs7QUFHckMsK0JBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7OztBQUcxQixzQ0FBMEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNwQzs7QUFFRCxlQUFPLElBQUksQ0FBQztLQUNmOztBQUVELGFBQVMsNkJBQTZCLEdBQUc7O0FBRXJDLFlBQUksSUFBSSxHQUFHLElBQUksQ0FBQztBQUNoQixZQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7OztBQUdwQixZQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7QUFDYixZQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7QUFDYixZQUFJLG9CQUFvQixHQUFHLENBQUMsQ0FBQztBQUM3QixZQUFJLGtCQUFrQixHQUFHLENBQUMsQ0FBQztBQUMzQixZQUFJLHFCQUFxQixHQUFHLENBQUMsQ0FBQzs7QUFFOUIsWUFBSSxLQUFLLEdBQUcsY0FBYyxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkUsWUFBSSxTQUFTLFlBQUE7WUFBRSxRQUFRLFlBQUEsQ0FBQzs7QUFFeEIsYUFBSyxJQUFJLEVBQUMsR0FBRyxDQUFDLEVBQUUsRUFBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBQyxFQUFFLEVBQUU7QUFDbkMscUJBQVMsR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQzs7QUFFeEMsb0JBQVEsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDOztBQUUvQixvQkFBUSxRQUFRO0FBQ1oscUJBQUssWUFBWTtBQUNiLHVCQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3BCLDhCQUFVLElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDbkMsMEJBQU07QUFBQSxBQUNWLHFCQUFLLFlBQVk7QUFDYix1QkFBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNwQiw4QkFBVSxJQUFJLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ25DLDBCQUFNO0FBQUEsQUFDVjtBQUNJLDBCQUFNO0FBQUEsYUFDYjtTQUNKOzs7QUFHRCxZQUFJLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQ2hCLGdDQUFvQixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQyxpQ0FBcUIsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEMsOEJBQWtCLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2xDOzs7QUFHRCxZQUFJLEdBQUcsSUFBSSxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRWxDLFlBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFVixZQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUEsSUFBSyxFQUFFLENBQUM7QUFDNUMsWUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFBLElBQUssRUFBRSxDQUFDO0FBQzVDLFlBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQSxJQUFLLENBQUMsQ0FBQztBQUMzQyxZQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBSSxVQUFVLEdBQUcsVUFBVSxBQUFDLENBQUM7QUFDdEMsWUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3RDLFNBQUMsSUFBSSxDQUFDLENBQUM7QUFDUCxZQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDZCxZQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxvQkFBb0IsQ0FBQztBQUNqQyxZQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxxQkFBcUIsQ0FBQztBQUNsQyxZQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxrQkFBa0IsQ0FBQztBQUMvQixZQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDakIsWUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7QUFDOUIsYUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDakMsZ0JBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUEsSUFBSyxDQUFDLENBQUM7QUFDMUMsZ0JBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxN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QUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQSxJQUFLLEVBQUUsQ0FBQztBQUM1QyxZQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUEsSUFBSyxFQUFFLENBQUM7QUFDNUMsWUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFBLElBQUssQ0FBQyxDQUFDO0FBQzNDLFlBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFJLFVBQVUsR0FBRyxVQUFVLEFBQUMsQ0FBQztBQUN0QyxZQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDdEMsU0FBQyxJQUFJLENBQUMsQ0FBQztBQUNQLFlBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMxQixTQUFDLElBQUksQ0FBQyxDQUFDOztBQUVQLFlBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUNqQixZQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsbUJBQW1CLENBQUMsTUFBTSxDQUFDO0FBQzVDLFlBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQSxJQUFLLENBQUMsQ0FBQztBQUNwQyxZQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBSSxPQUFPLEdBQUcsTUFBTSxBQUFDLENBQUM7QUFDL0IsWUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDOzs7QUFHZCxZQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDakIsWUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxH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QWdCLEdBQWhCLGdCQUFnQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsInZhciBiaWdJbnQ9ZnVuY3Rpb24odW5kZWZpbmVkKXtcInVzZSBzdHJpY3RcIjt2YXIgQkFTRT0xZTcsTE9HX0JBU0U9NyxNQVhfSU5UPTkwMDcxOTkyNTQ3NDA5OTIsTUFYX0lOVF9BUlI9c21hbGxUb0FycmF5KE1BWF9JTlQpLERFRkFVTFRfQUxQSEFCRVQ9XCIwMTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpcIjt2YXIgc3VwcG9ydHNOYXRpdmVCaWdJbnQ9dHlwZW9mIEJpZ0ludD09PVwiZnVuY3Rpb25cIjtmdW5jdGlvbiBJbnRlZ2VyKHYscmFkaXgsYWxwaGFiZXQsY2FzZVNlbnNpdGl2ZSl7aWYodHlwZW9mIHY9PT1cInVuZGVmaW5lZFwiKXJldHVybiBJbnRlZ2VyWzBdO2lmKHR5cGVvZiByYWRpeCE9PVwidW5kZWZpbmVkXCIpcmV0dXJuK3JhZGl4PT09MTAmJiFhbHBoYWJldD9wYXJzZVZhbHVlKHYpOnBhcnNlQmFzZSh2LHJhZGl4LGFscGhhYmV0LGNhc2VTZW5zaXRpdmUpO3JldHVybiBwYXJzZVZhbHVlKHYpfWZ1bmN0aW9uIEJpZ0ludGVnZXIodmFsdWUsc2lnbil7dGhpcy52YWx1ZT12YWx1ZTt0aGlzLnNpZ249c2lnbjt0aGlzLmlzU21hbGw9ZmFsc2V9QmlnSW50ZWdlci5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShJbnRlZ2VyLnByb3RvdHlwZSk7ZnVuY3Rpb24gU21hbGxJbnRlZ2VyKHZhbHVlKXt0aGlzLnZhbHVlPXZhbHVlO3RoaXMuc2lnbj12YWx1ZTwwO3RoaXMuaXNTbWFsbD10cnVlfVNtYWxsSW50ZWdlci5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShJbnRlZ2VyLnByb3RvdHlwZSk7ZnVuY3Rpb24gTmF0aXZlQmlnSW50KHZhbHVlKXt0aGlzLnZhbHVlPXZhbHVlfU5hdGl2ZUJpZ0ludC5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShJbnRlZ2VyLnByb3RvdHlwZSk7ZnVuY3Rpb24gaXNQcmVjaXNlKG4pe3JldHVybi1NQVhfSU5UPG4mJm48TUFYX0lOVH1mdW5jdGlvbiBzbWFsbFRvQXJyYXkobil7aWYobjwxZTcpcmV0dXJuW25dO2lmKG48MWUxNClyZXR1cm5bbiUxZTcsTWF0aC5mbG9vcihuLzFlNyldO3JldHVybltuJTFlNyxNYXRoLmZsb29yKG4vMWU3KSUxZTcsTWF0aC5mbG9vcihuLzFlMTQpXX1mdW5jdGlvbiBhcnJheVRvU21hbGwoYXJyKXt0cmltKGFycik7dmFyIGxlbmd0aD1hcnIubGVuZ3RoO2lmKGxlbmd0aDw0JiZjb21wYXJlQWJzKGFycixNQVhfSU5UX0FSUik8MCl7c3dpdGNoKGxlbmd0aCl7Y2FzZSAwOnJldHVybiAwO2Nhc2UgMTpyZXR1cm4gYXJyWzBdO2Nhc2UgMjpyZXR1cm4gYXJyWzBdK2FyclsxXSpCQVNFO2RlZmF1bHQ6cmV0dXJuIGFyclswXSsoYXJyWzFdK2FyclsyXSpCQVNFKSpCQVNFfX1yZXR1cm4gYXJyfWZ1bmN0aW9uIHRyaW0odil7dmFyIGk9di5sZW5ndGg7d2hpbGUodlstLWldPT09MCk7di5sZW5ndGg9aSsxfWZ1bmN0aW9uIGNyZWF0ZUFycmF5KGxlbmd0aCl7dmFyIHg9bmV3IEFycmF5KGxlbmd0aCk7dmFyIGk9LTE7d2hpbGUoKytpPGxlbmd0aCl7eFtpXT0wfXJldHVybiB4fWZ1bmN0aW9uIHRydW5jYXRlKG4pe2lmKG4+MClyZXR1cm4gTWF0aC5mbG9vcihuKTtyZXR1cm4gTWF0aC5jZWlsKG4pfWZ1bmN0aW9uIGFkZChhLGIpe3ZhciBsX2E9YS5sZW5ndGgsbF9iPWIubGVuZ3RoLHI9bmV3IEFycmF5KGxfYSksY2Fycnk9MCxiYXNlPUJBU0Usc3VtLGk7Zm9yKGk9MDtpPGxfYjtpKyspe3N1bT1hW2ldK2JbaV0rY2Fycnk7Y2Fycnk9c3VtPj1iYXNlPzE6MDtyW2ldPXN1bS1jYXJyeSpiYXNlfXdoaWxlKGk8bF9hKXtzdW09YVtpXStjYXJyeTtjYXJyeT1zdW09PT1iYXNlPzE6MDtyW2krK109c3VtLWNhcnJ5KmJhc2V9aWYoY2Fycnk+MClyLnB1c2goY2FycnkpO3JldHVybiByfWZ1bmN0aW9uIGFkZEFueShhLGIpe2lmKGEubGVuZ3RoPj1iLmxlbmd0aClyZXR1cm4gYWRkKGEsYik7cmV0dXJuIGFkZChiLGEpfWZ1bmN0aW9uIGFkZFNtYWxsKGEsY2Fycnkpe3ZhciBsPWEubGVuZ3RoLHI9bmV3IEFycmF5KGwpLGJhc2U9QkFTRSxzdW0saTtmb3IoaT0wO2k8bDtpKyspe3N1bT1hW2ldLWJhc2UrY2Fycnk7Y2Fycnk9TWF0aC5mbG9vcihzdW0vYmFzZSk7cltpXT1zdW0tY2FycnkqYmFzZTtjYXJyeSs9MX13aGlsZShjYXJyeT4wKXtyW2krK109Y2FycnklYmFzZTtjYXJyeT1NYXRoLmZsb29yKGNhcnJ5L2Jhc2UpfXJldHVybiByfUJpZ0ludGVnZXIucHJvdG90eXBlLmFkZD1mdW5jdGlvbih2KXt2YXIgbj1wYXJzZVZhbHVlKHYpO2lmKHRoaXMuc2lnbiE9PW4uc2lnbil7cmV0dXJuIHRoaXMuc3VidHJhY3Qobi5uZWdhdGUoKSl9dmFyIGE9dGhpcy52YWx1ZSxiPW4udmFsdWU7aWYobi5pc1NtYWxsKXtyZXR1cm4gbmV3IEJpZ0ludGVnZXIoYWRkU21hbGwoYSxNYXRoLmFicyhiKSksdGhpcy5zaWduKX1yZXR1cm4gbmV3IEJpZ0ludGVnZXIoYWRkQW55KGEsYiksdGhpcy5zaWduKX07QmlnSW50ZWdlci5wcm90b3R5cGUucGx1cz1CaWdJbnRlZ2VyLnByb3RvdHlwZS5hZGQ7U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5hZGQ9ZnVuY3Rpb24odil7dmFyIG49cGFyc2VWYWx1ZSh2KTt2YXIgYT10aGlzLnZhbHVlO2lmKGE8MCE9PW4uc2lnbil7cmV0dXJuIHRoaXMuc3VidHJhY3Qobi5uZWdhdGUoKSl9dmFyIGI9bi52YWx1ZTtpZihuLmlzU21hbGwpe2lmKGlzUHJlY2lzZShhK2IpKXJldHVybiBuZXcgU21hbGxJbnRlZ2VyKGErYik7Yj1zbWFsbFRvQXJyYXkoTWF0aC5hYnMoYikpfXJldHVybiBuZXcgQmlnSW50ZWdlcihhZGRTbWFsbChiLE1hdGguYWJzKGEpKSxhPDApfTtTbWFsbEludGVnZXIucHJvdG90eXBlLnBsdXM9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5hZGQ7TmF0aXZlQmlnSW50LnByb3RvdHlwZS5hZGQ9ZnVuY3Rpb24odil7cmV0dXJuIG5ldyBOYXRpdmVCaWdJbnQodGhpcy52YWx1ZStwYXJzZVZhbHVlKHYpLnZhbHVlKX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5wbHVzPU5hdGl2ZUJpZ0ludC5wcm90b3R5cGUuYWRkO2Z1bmN0aW9uIHN1YnRyYWN0KGEsYil7dmFyIGFfbD1hLmxlbmd0aCxiX2w9Yi5sZW5ndGgscj1uZXcgQXJyYXkoYV9sKSxib3Jyb3c9MCxiYXNlPUJBU0UsaSxkaWZmZXJlbmNlO2ZvcihpPTA7aTxiX2w7aSsrKXtkaWZmZXJlbmNlPWFbaV0tYm9ycm93LWJbaV07aWYoZGlmZmVyZW5jZTwwKXtkaWZmZXJlbmNlKz1iYXNlO2JvcnJvdz0xfWVsc2UgYm9ycm93PTA7cltpXT1kaWZmZXJlbmNlfWZvcihpPWJfbDtpPGFfbDtpKyspe2RpZmZlcmVuY2U9YVtpXS1ib3Jyb3c7aWYoZGlmZmVyZW5jZTwwKWRpZmZlcmVuY2UrPWJhc2U7ZWxzZXtyW2krK109ZGlmZmVyZW5jZTticmVha31yW2ldPWRpZmZlcmVuY2V9Zm9yKDtpPGFfbDtpKyspe3JbaV09YVtpXX10cmltKHIpO3JldHVybiByfWZ1bmN0aW9uIHN1YnRyYWN0QW55KGEsYixzaWduKXt2YXIgdmFsdWU7aWYoY29tcGFyZUFicyhhLGIpPj0wKXt2YWx1ZT1zdWJ0cmFjdChhLGIpfWVsc2V7dmFsdWU9c3VidHJhY3QoYixhKTtzaWduPSFzaWdufXZhbHVlPWFycmF5VG9TbWFsbCh2YWx1ZSk7aWYodHlwZW9mIHZhbHVlPT09XCJudW1iZXJcIil7aWYoc2lnbil2YWx1ZT0tdmFsdWU7cmV0dXJuIG5ldyBTbWFsbEludGVnZXIodmFsdWUpfXJldHVybiBuZXcgQmlnSW50ZWdlcih2YWx1ZSxzaWduKX1mdW5jdGlvbiBzdWJ0cmFjdFNtYWxsKGEsYixzaWduKXt2YXIgbD1hLmxlbmd0aCxyPW5ldyBBcnJheShsKSxjYXJyeT0tYixiYXNlPUJBU0UsaSxkaWZmZXJlbmNlO2ZvcihpPTA7aTxsO2krKyl7ZGlmZmVyZW5jZT1hW2ldK2NhcnJ5O2NhcnJ5PU1hdGguZmxvb3IoZGlmZmVyZW5jZS9iYXNlKTtkaWZmZXJlbmNlJT1iYXNlO3JbaV09ZGlmZmVyZW5jZTwwP2RpZmZlcmVuY2UrYmFzZTpkaWZmZXJlbmNlfXI9YXJyYXlUb1NtYWxsKHIpO2lmKHR5cGVvZiByPT09XCJudW1iZXJcIil7aWYoc2lnbilyPS1yO3JldHVybiBuZXcgU21hbGxJbnRlZ2VyKHIpfXJldHVybiBuZXcgQmlnSW50ZWdlcihyLHNpZ24pfUJpZ0ludGVnZXIucHJvdG90eXBlLnN1YnRyYWN0PWZ1bmN0aW9uKHYpe3ZhciBuPXBhcnNlVmFsdWUodik7aWYodGhpcy5zaWduIT09bi5zaWduKXtyZXR1cm4gdGhpcy5hZGQobi5uZWdhdGUoKSl9dmFyIGE9dGhpcy52YWx1ZSxiPW4udmFsdWU7aWYobi5pc1NtYWxsKXJldHVybiBzdWJ0cmFjdFNtYWxsKGEsTWF0aC5hYnMoYiksdGhpcy5zaWduKTtyZXR1cm4gc3VidHJhY3RBbnkoYSxiLHRoaXMuc2lnbil9O0JpZ0ludGVnZXIucHJvdG90eXBlLm1pbnVzPUJpZ0ludGVnZXIucHJvdG90eXBlLnN1YnRyYWN0O1NtYWxsSW50ZWdlci5wcm90b3R5cGUuc3VidHJhY3Q9ZnVuY3Rpb24odil7dmFyIG49cGFyc2VWYWx1ZSh2KTt2YXIgYT10aGlzLnZhbHVlO2lmKGE8MCE9PW4uc2lnbil7cmV0dXJuIHRoaXMuYWRkKG4ubmVnYXRlKCkpfXZhciBiPW4udmFsdWU7aWYobi5pc1NtYWxsKXtyZXR1cm4gbmV3IFNtYWxsSW50ZWdlcihhLWIpfXJldHVybiBzdWJ0cmFjdFNtYWxsKGIsTWF0aC5hYnMoYSksYT49MCl9O1NtYWxsSW50ZWdlci5wcm90b3R5cGUubWludXM9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5zdWJ0cmFjdDtOYXRpdmVCaWdJbnQucHJvdG90eXBlLnN1YnRyYWN0PWZ1bmN0aW9uKHYpe3JldHVybiBuZXcgTmF0aXZlQmlnSW50KHRoaXMudmFsdWUtcGFyc2VWYWx1ZSh2KS52YWx1ZSl9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUubWludXM9TmF0aXZlQmlnSW50LnByb3RvdHlwZS5zdWJ0cmFjdDtCaWdJbnRlZ2VyLnByb3RvdHlwZS5uZWdhdGU9ZnVuY3Rpb24oKXtyZXR1cm4gbmV3IEJpZ0ludGVnZXIodGhpcy52YWx1ZSwhdGhpcy5zaWduKX07U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5uZWdhdGU9ZnVuY3Rpb24oKXt2YXIgc2lnbj10aGlzLnNpZ247dmFyIHNtYWxsPW5ldyBTbWFsbEludGVnZXIoLXRoaXMudmFsdWUpO3NtYWxsLnNpZ249IXNpZ247cmV0dXJuIHNtYWxsfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLm5lZ2F0ZT1mdW5jdGlvbigpe3JldHVybiBuZXcgTmF0aXZlQmlnSW50KC10aGlzLnZhbHVlKX07QmlnSW50ZWdlci5wcm90b3R5cGUuYWJzPWZ1bmN0aW9uKCl7cmV0dXJuIG5ldyBCaWdJbnRlZ2VyKHRoaXMudmFsdWUsZmFsc2UpfTtTbWFsbEludGVnZXIucHJvdG90eXBlLmFicz1mdW5jdGlvbigpe3JldHVybiBuZXcgU21hbGxJbnRlZ2VyKE1hdGguYWJzKHRoaXMudmFsdWUpKX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5hYnM9ZnVuY3Rpb24oKXtyZXR1cm4gbmV3IE5hdGl2ZUJpZ0ludCh0aGlzLnZhbHVlPj0wP3RoaXMudmFsdWU6LXRoaXMudmFsdWUpfTtmdW5jdGlvbiBtdWx0aXBseUxvbmcoYSxiKXt2YXIgYV9sPWEubGVuZ3RoLGJfbD1iLmxlbmd0aCxsPWFfbCtiX2wscj1jcmVhdGVBcnJheShsKSxiYXNlPUJBU0UscHJvZHVjdCxjYXJyeSxpLGFfaSxiX2o7Zm9yKGk9MDtpPGFfbDsrK2kpe2FfaT1hW2ldO2Zvcih2YXIgaj0wO2o8Yl9sOysrail7Yl9qPWJbal07cHJvZHVjdD1hX2kqYl9qK3JbaStqXTtjYXJyeT1NYXRoLmZsb29yKHByb2R1Y3QvYmFzZSk7cltpK2pdPXByb2R1Y3QtY2FycnkqYmFzZTtyW2kraisxXSs9Y2Fycnl9fXRyaW0ocik7cmV0dXJuIHJ9ZnVuY3Rpb24gbXVsdGlwbHlTbWFsbChhLGIpe3ZhciBsPWEubGVuZ3RoLHI9bmV3IEFycmF5KGwpLGJhc2U9QkFTRSxjYXJyeT0wLHByb2R1Y3QsaTtmb3IoaT0wO2k8bDtpKyspe3Byb2R1Y3Q9YVtpXSpiK2NhcnJ5O2NhcnJ5PU1hdGguZmxvb3IocHJvZHVjdC9iYXNlKTtyW2ldPXByb2R1Y3QtY2FycnkqYmFzZX13aGlsZShjYXJyeT4wKXtyW2krK109Y2FycnklYmFzZTtjYXJyeT1NYXRoLmZsb29yKGNhcnJ5L2Jhc2UpfXJldHVybiByfWZ1bmN0aW9uIHNoaWZ0TGVmdCh4LG4pe3ZhciByPVtdO3doaWxlKG4tLSA+MClyLnB1c2goMCk7cmV0dXJuIHIuY29uY2F0KHgpfWZ1bmN0aW9uIG11bHRpcGx5S2FyYXRzdWJhKHgseSl7dmFyIG49TWF0aC5tYXgoeC5sZW5ndGgseS5sZW5ndGgpO2lmKG48PTMwKXJldHVybiBtdWx0aXBseUxvbmcoeCx5KTtuPU1hdGguY2VpbChuLzIpO3ZhciBiPXguc2xpY2UobiksYT14LnNsaWNlKDAsbiksZD15LnNsaWNlKG4pLGM9eS5zbGljZSgwLG4pO3ZhciBhYz1tdWx0aXBseUthcmF0c3ViYShhLGMpLGJkPW11bHRpcGx5S2FyYXRzdWJhKGIsZCksYWJjZD1tdWx0aXBseUthcmF0c3ViYShhZGRBbnkoYSxiKSxhZGRBbnkoYyxkKSk7dmFyIHByb2R1Y3Q9YWRkQW55KGFkZEFueShhYyxzaGlmdExlZnQoc3VidHJhY3Qoc3VidHJhY3QoYWJjZCxhYyksYmQpLG4pKSxzaGlmdExlZnQoYmQsMipuKSk7dHJpbShwcm9kdWN0KTtyZXR1cm4gcHJvZHVjdH1mdW5jdGlvbiB1c2VLYXJhdHN1YmEobDEsbDIpe3JldHVybi0uMDEyKmwxLS4wMTIqbDIrMTVlLTYqbDEqbDI+MH1CaWdJbnRlZ2VyLnByb3RvdHlwZS5tdWx0aXBseT1mdW5jdGlvbih2KXt2YXIgbj1wYXJzZVZhbHVlKHYpLGE9dGhpcy52YWx1ZSxiPW4udmFsdWUsc2lnbj10aGlzLnNpZ24hPT1uLnNpZ24sYWJzO2lmKG4uaXNTbWFsbCl7aWYoYj09PTApcmV0dXJuIEludGVnZXJbMF07aWYoYj09PTEpcmV0dXJuIHRoaXM7aWYoYj09PS0xKXJldHVybiB0aGlzLm5lZ2F0ZSgpO2Ficz1NYXRoLmFicyhiKTtpZihhYnM8QkFTRSl7cmV0dXJuIG5ldyBCaWdJbnRlZ2VyKG11bHRpcGx5U21hbGwoYSxhYnMpLHNpZ24pfWI9c21hbGxUb0FycmF5KGFicyl9aWYodXNlS2FyYXRzdWJhKGEubGVuZ3RoLGIubGVuZ3RoKSlyZXR1cm4gbmV3IEJpZ0ludGVnZXIobXVsdGlwbHlLYXJhdHN1YmEoYSxiKSxzaWduKTtyZXR1cm4gbmV3IEJpZ0ludGVnZXIobXVsdGlwbHlMb25nKGEsYiksc2lnbil9O0JpZ0ludGVnZXIucHJvdG90eXBlLnRpbWVzPUJpZ0ludGVnZXIucHJvdG90eXBlLm11bHRpcGx5O2Z1bmN0aW9uIG11bHRpcGx5U21hbGxBbmRBcnJheShhLGIsc2lnbil7aWYoYTxCQVNFKXtyZXR1cm4gbmV3IEJpZ0ludGVnZXIobXVsdGlwbHlTbWFsbChiLGEpLHNpZ24pfXJldHVybiBuZXcgQmlnSW50ZWdlcihtdWx0aXBseUxvbmcoYixzbWFsbFRvQXJyYXkoYSkpLHNpZ24pfVNtYWxsSW50ZWdlci5wcm90b3R5cGUuX211bHRpcGx5QnlTbWFsbD1mdW5jdGlvbihhKXtpZihpc1ByZWNpc2UoYS52YWx1ZSp0aGlzLnZhbHVlKSl7cmV0dXJuIG5ldyBTbWFsbEludGVnZXIoYS52YWx1ZSp0aGlzLnZhbHVlKX1yZXR1cm4gbXVsdGlwbHlTbWFsbEFuZEFycmF5KE1hdGguYWJzKGEudmFsdWUpLHNtYWxsVG9BcnJheShNYXRoLmFicyh0aGlzLnZhbHVlKSksdGhpcy5zaWduIT09YS5zaWduKX07QmlnSW50ZWdlci5wcm90b3R5cGUuX211bHRpcGx5QnlTbWFsbD1mdW5jdGlvbihhKXtpZihhLnZhbHVlPT09MClyZXR1cm4gSW50ZWdlclswXTtpZihhLnZhbHVlPT09MSlyZXR1cm4gdGhpcztpZihhLnZhbHVlPT09LTEpcmV0dXJuIHRoaXMubmVnYXRlKCk7cmV0dXJuIG11bHRpcGx5U21hbGxBbmRBcnJheShNYXRoLmFicyhhLnZhbHVlKSx0aGlzLnZhbHVlLHRoaXMuc2lnbiE9PWEuc2lnbil9O1NtYWxsSW50ZWdlci5wcm90b3R5cGUubXVsdGlwbHk9ZnVuY3Rpb24odil7cmV0dXJuIHBhcnNlVmFsdWUodikuX211bHRpcGx5QnlTbWFsbCh0aGlzKX07U21hbGxJbnRlZ2VyLnByb3RvdHlwZS50aW1lcz1TbWFsbEludGVnZXIucHJvdG90eXBlLm11bHRpcGx5O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUubXVsdGlwbHk9ZnVuY3Rpb24odil7cmV0dXJuIG5ldyBOYXRpdmVCaWdJbnQodGhpcy52YWx1ZSpwYXJzZVZhbHVlKHYpLnZhbHVlKX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS50aW1lcz1OYXRpdmVCaWdJbnQucHJvdG90eXBlLm11bHRpcGx5O2Z1bmN0aW9uIHNxdWFyZShhKXt2YXIgbD1hLmxlbmd0aCxyPWNyZWF0ZUFycmF5KGwrbCksYmFzZT1CQVNFLHByb2R1Y3QsY2FycnksaSxhX2ksYV9qO2ZvcihpPTA7aTxsO2krKyl7YV9pPWFbaV07Y2Fycnk9MC1hX2kqYV9pO2Zvcih2YXIgaj1pO2o8bDtqKyspe2Ffaj1hW2pdO3Byb2R1Y3Q9MiooYV9pKmFfaikrcltpK2pdK2NhcnJ5O2NhcnJ5PU1hdGguZmxvb3IocHJvZHVjdC9iYXNlKTtyW2kral09cHJvZHVjdC1jYXJyeSpiYXNlfXJbaStsXT1jYXJyeX10cmltKHIpO3JldHVybiByfUJpZ0ludGVnZXIucHJvdG90eXBlLnNxdWFyZT1mdW5jdGlvbigpe3JldHVybiBuZXcgQmlnSW50ZWdlcihzcXVhcmUodGhpcy52YWx1ZSksZmFsc2UpfTtTbWFsbEludGVnZXIucHJvdG90eXBlLnNxdWFyZT1mdW5jdGlvbigpe3ZhciB2YWx1ZT10aGlzLnZhbHVlKnRoaXMudmFsdWU7aWYoaXNQcmVjaXNlKHZhbHVlKSlyZXR1cm4gbmV3IFNtYWxsSW50ZWdlcih2YWx1ZSk7cmV0dXJuIG5ldyBCaWdJbnRlZ2VyKHNxdWFyZShzbWFsbFRvQXJyYXkoTWF0aC5hYnModGhpcy52YWx1ZSkpKSxmYWxzZSl9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUuc3F1YXJlPWZ1bmN0aW9uKHYpe3JldHVybiBuZXcgTmF0aXZlQmlnSW50KHRoaXMudmFsdWUqdGhpcy52YWx1ZSl9O2Z1bmN0aW9uIGRpdk1vZDEoYSxiKXt2YXIgYV9sPWEubGVuZ3RoLGJfbD1iLmxlbmd0aCxiYXNlPUJBU0UscmVzdWx0PWNyZWF0ZUFycmF5KGIubGVuZ3RoKSxkaXZpc29yTW9zdFNpZ25pZmljYW50RGlnaXQ9YltiX2wtMV0sbGFtYmRhPU1hdGguY2VpbChiYXNlLygyKmRpdmlzb3JNb3N0U2lnbmlmaWNhbnREaWdpdCkpLHJlbWFpbmRlcj1tdWx0aXBseVNtYWxsKGEsbGFtYmRhKSxkaXZpc29yPW11bHRpcGx5U21hbGwoYixsYW1iZGEpLHF1b3RpZW50RGlnaXQsc2hpZnQsY2FycnksYm9ycm93LGksbCxxO2lmKHJlbWFpbmRlci5sZW5ndGg8PWFfbClyZW1haW5kZXIucHVzaCgwKTtkaXZpc29yLnB1c2goMCk7ZGl2aXNvck1vc3RTaWduaWZpY2FudERpZ2l0PWRpdmlzb3JbYl9sLTFdO2ZvcihzaGlmdD1hX2wtYl9sO3NoaWZ0Pj0wO3NoaWZ0LS0pe3F1b3RpZW50RGlnaXQ9YmFzZS0xO2lmKHJlbWFpbmRlcltzaGlmdCtiX2xdIT09ZGl2aXNvck1vc3RTaWduaWZpY2FudERpZ2l0KXtxdW90aWVudERpZ2l0PU1hdGguZmxvb3IoKHJlbWFpbmRlcltzaGlmdCtiX2xdKmJhc2UrcmVtYWluZGVyW3NoaWZ0K2JfbC0xXSkvZGl2aXNvck1vc3RTaWduaWZpY2FudERpZ2l0KX1jYXJyeT0wO2JvcnJvdz0wO2w9ZGl2aXNvci5sZW5ndGg7Zm9yKGk9MDtpPGw7aSsrKXtjYXJyeSs9cXVvdGllbnREaWdpdCpkaXZpc29yW2ldO3E9TWF0aC5mbG9vcihjYXJyeS9iYXNlKTtib3Jyb3crPXJlbWFpbmRlcltzaGlmdCtpXS0oY2FycnktcSpiYXNlKTtjYXJyeT1xO2lmKGJvcnJvdzwwKXtyZW1haW5kZXJbc2hpZnQraV09Ym9ycm93K2Jhc2U7Ym9ycm93PS0xfWVsc2V7cmVtYWluZGVyW3NoaWZ0K2ldPWJvcnJvdztib3Jyb3c9MH19d2hpbGUoYm9ycm93IT09MCl7cXVvdGllbnREaWdpdC09MTtjYXJyeT0wO2ZvcihpPTA7aTxsO2krKyl7Y2FycnkrPXJlbWFpbmRlcltzaGlmdCtpXS1iYXNlK2Rpdmlzb3JbaV07aWYoY2Fycnk8MCl7cmVtYWluZGVyW3NoaWZ0K2ldPWNhcnJ5K2Jhc2U7Y2Fycnk9MH1lbHNle3JlbWFpbmRlcltzaGlmdCtpXT1jYXJyeTtjYXJyeT0xfX1ib3Jyb3crPWNhcnJ5fXJlc3VsdFtzaGlmdF09cXVvdGllbnREaWdpdH1yZW1haW5kZXI9ZGl2TW9kU21hbGwocmVtYWluZGVyLGxhbWJkYSlbMF07cmV0dXJuW2FycmF5VG9TbWFsbChyZXN1bHQpLGFycmF5VG9TbWFsbChyZW1haW5kZXIpXX1mdW5jdGlvbiBkaXZNb2QyKGEsYil7dmFyIGFfbD1hLmxlbmd0aCxiX2w9Yi5sZW5ndGgscmVzdWx0PVtdLHBhcnQ9W10sYmFzZT1CQVNFLGd1ZXNzLHhsZW4saGlnaHgsaGlnaHksY2hlY2s7d2hpbGUoYV9sKXtwYXJ0LnVuc2hpZnQoYVstLWFfbF0pO3RyaW0ocGFydCk7aWYoY29tcGFyZUFicyhwYXJ0LGIpPDApe3Jlc3VsdC5wdXNoKDApO2NvbnRpbnVlfXhsZW49cGFydC5sZW5ndGg7aGlnaHg9cGFydFt4bGVuLTFdKmJhc2UrcGFydFt4bGVuLTJdO2hpZ2h5PWJbYl9sLTFdKmJhc2UrYltiX2wtMl07aWYoeGxlbj5iX2wpe2hpZ2h4PShoaWdoeCsxKSpiYXNlfWd1ZXNzPU1hdGguY2VpbChoaWdoeC9oaWdoeSk7ZG97Y2hlY2s9bXVsdGlwbHlTbWFsbChiLGd1ZXNzKTtpZihjb21wYXJlQWJzKGNoZWNrLHBhcnQpPD0wKWJyZWFrO2d1ZXNzLS19d2hpbGUoZ3Vlc3MpO3Jlc3VsdC5wdXNoKGd1ZXNzKTtwYXJ0PXN1YnRyYWN0KHBhcnQsY2hlY2spfXJlc3VsdC5yZXZlcnNlKCk7cmV0dXJuW2FycmF5VG9TbWFsbChyZXN1bHQpLGFycmF5VG9TbWFsbChwYXJ0KV19ZnVuY3Rpb24gZGl2TW9kU21hbGwodmFsdWUsbGFtYmRhKXt2YXIgbGVuZ3RoPXZhbHVlLmxlbmd0aCxxdW90aWVudD1jcmVhdGVBcnJheShsZW5ndGgpLGJhc2U9QkFTRSxpLHEscmVtYWluZGVyLGRpdmlzb3I7cmVtYWluZGVyPTA7Zm9yKGk9bGVuZ3RoLTE7aT49MDstLWkpe2Rpdmlzb3I9cmVtYWluZGVyKmJhc2UrdmFsdWVbaV07cT10cnVuY2F0ZShkaXZpc29yL2xhbWJkYSk7cmVtYWluZGVyPWRpdmlzb3ItcSpsYW1iZGE7cXVvdGllbnRbaV09cXwwfXJldHVybltxdW90aWVudCxyZW1haW5kZXJ8MF19ZnVuY3Rpb24gZGl2TW9kQW55KHNlbGYsdil7dmFyIHZhbHVlLG49cGFyc2VWYWx1ZSh2KTtpZihzdXBwb3J0c05hdGl2ZUJpZ0ludCl7cmV0dXJuW25ldyBOYXRpdmVCaWdJbnQoc2VsZi52YWx1ZS9uLnZhbHVlKSxuZXcgTmF0aXZlQmlnSW50KHNlbGYudmFsdWUlbi52YWx1ZSldfXZhciBhPXNlbGYudmFsdWUsYj1uLnZhbHVlO3ZhciBxdW90aWVudDtpZihiPT09MCl0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZGl2aWRlIGJ5IHplcm9cIik7aWYoc2VsZi5pc1NtYWxsKXtpZihuLmlzU21hbGwpe3JldHVybltuZXcgU21hbGxJbnRlZ2VyKHRydW5jYXRlKGEvYikpLG5ldyBTbWFsbEludGVnZXIoYSViKV19cmV0dXJuW0ludGVnZXJbMF0sc2VsZl19aWYobi5pc1NtYWxsKXtpZihiPT09MSlyZXR1cm5bc2VsZixJbnRlZ2VyWzBdXTtpZihiPT0tMSlyZXR1cm5bc2VsZi5uZWdhdGUoKSxJbnRlZ2VyWzBdXTt2YXIgYWJzPU1hdGguYWJzKGIpO2lmKGFiczxCQVNFKXt2YWx1ZT1kaXZNb2RTbWFsbChhLGFicyk7cXVvdGllbnQ9YXJyYXlUb1NtYWxsKHZhbHVlWzBdKTt2YXIgcmVtYWluZGVyPXZhbHVlWzFdO2lmKHNlbGYuc2lnbilyZW1haW5kZXI9LXJlbWFpbmRlcjtpZih0eXBlb2YgcXVvdGllbnQ9PT1cIm51bWJlclwiKXtpZihzZWxmLnNpZ24hPT1uLnNpZ24pcXVvdGllbnQ9LXF1b3RpZW50O3JldHVybltuZXcgU21hbGxJbnRlZ2VyKHF1b3RpZW50KSxuZXcgU21hbGxJbnRlZ2VyKHJlbWFpbmRlcildfXJldHVybltuZXcgQmlnSW50ZWdlcihxdW90aWVudCxzZWxmLnNpZ24hPT1uLnNpZ24pLG5ldyBTbWFsbEludGVnZXIocmVtYWluZGVyKV19Yj1zbWFsbFRvQXJyYXkoYWJzKX12YXIgY29tcGFyaXNvbj1jb21wYXJlQWJzKGEsYik7aWYoY29tcGFyaXNvbj09PS0xKXJldHVybltJbnRlZ2VyWzBdLHNlbGZdO2lmKGNvbXBhcmlzb249PT0wKXJldHVybltJbnRlZ2VyW3NlbGYuc2lnbj09PW4uc2lnbj8xOi0xXSxJbnRlZ2VyWzBdXTtpZihhLmxlbmd0aCtiLmxlbmd0aDw9MjAwKXZhbHVlPWRpdk1vZDEoYSxiKTtlbHNlIHZhbHVlPWRpdk1vZDIoYSxiKTtxdW90aWVudD12YWx1ZVswXTt2YXIgcVNpZ249c2VsZi5zaWduIT09bi5zaWduLG1vZD12YWx1ZVsxXSxtU2lnbj1zZWxmLnNpZ247aWYodHlwZW9mIHF1b3RpZW50PT09XCJudW1iZXJcIil7aWYocVNpZ24pcXVvdGllbnQ9LXF1b3RpZW50O3F1b3RpZW50PW5ldyBTbWFsbEludGVnZXIocXVvdGllbnQpfWVsc2UgcXVvdGllbnQ9bmV3IEJpZ0ludGVnZXIocXVvdGllbnQscVNpZ24pO2lmKHR5cGVvZiBtb2Q9PT1cIm51bWJlclwiKXtpZihtU2lnbiltb2Q9LW1vZDttb2Q9bmV3IFNtYWxsSW50ZWdlcihtb2QpfWVsc2UgbW9kPW5ldyBCaWdJbnRlZ2VyKG1vZCxtU2lnbik7cmV0dXJuW3F1b3RpZW50LG1vZF19QmlnSW50ZWdlci5wcm90b3R5cGUuZGl2bW9kPWZ1bmN0aW9uKHYpe3ZhciByZXN1bHQ9ZGl2TW9kQW55KHRoaXMsdik7cmV0dXJue3F1b3RpZW50OnJlc3VsdFswXSxyZW1haW5kZXI6cmVzdWx0WzFdfX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5kaXZtb2Q9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5kaXZtb2Q9QmlnSW50ZWdlci5wcm90b3R5cGUuZGl2bW9kO0JpZ0ludGVnZXIucHJvdG90eXBlLmRpdmlkZT1mdW5jdGlvbih2KXtyZXR1cm4gZGl2TW9kQW55KHRoaXMsdilbMF19O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUub3Zlcj1OYXRpdmVCaWdJbnQucHJvdG90eXBlLmRpdmlkZT1mdW5jdGlvbih2KXtyZXR1cm4gbmV3IE5hdGl2ZUJpZ0ludCh0aGlzLnZhbHVlL3BhcnNlVmFsdWUodikudmFsdWUpfTtTbWFsbEludGVnZXIucHJvdG90eXBlLm92ZXI9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5kaXZpZGU9QmlnSW50ZWdlci5wcm90b3R5cGUub3Zlcj1CaWdJbnRlZ2VyLnByb3RvdHlwZS5kaXZpZGU7QmlnSW50ZWdlci5wcm90b3R5cGUubW9kPWZ1bmN0aW9uKHYpe3JldHVybiBkaXZNb2RBbnkodGhpcyx2KVsxXX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5tb2Q9TmF0aXZlQmlnSW50LnByb3RvdHlwZS5yZW1haW5kZXI9ZnVuY3Rpb24odil7cmV0dXJuIG5ldyBOYXRpdmVCaWdJbnQodGhpcy52YWx1ZSVwYXJzZVZhbHVlKHYpLnZhbHVlKX07U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5yZW1haW5kZXI9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5tb2Q9QmlnSW50ZWdlci5wcm90b3R5cGUucmVtYWluZGVyPUJpZ0ludGVnZXIucHJvdG90eXBlLm1vZDtCaWdJbnRlZ2VyLnByb3RvdHlwZS5wb3c9ZnVuY3Rpb24odil7dmFyIG49cGFyc2VWYWx1ZSh2KSxhPXRoaXMudmFsdWUsYj1uLnZhbHVlLHZhbHVlLHgseTtpZihiPT09MClyZXR1cm4gSW50ZWdlclsxXTtpZihhPT09MClyZXR1cm4gSW50ZWdlclswXTtpZihhPT09MSlyZXR1cm4gSW50ZWdlclsxXTtpZihhPT09LTEpcmV0dXJuIG4uaXNFdmVuKCk/SW50ZWdlclsxXTpJbnRlZ2VyWy0xXTtpZihuLnNpZ24pe3JldHVybiBJbnRlZ2VyWzBdfWlmKCFuLmlzU21hbGwpdGhyb3cgbmV3IEVycm9yKFwiVGhlIGV4cG9uZW50IFwiK24udG9TdHJpbmcoKStcIiBpcyB0b28gbGFyZ2UuXCIpO2lmKHRoaXMuaXNTbWFsbCl7aWYoaXNQcmVjaXNlKHZhbHVlPU1hdGgucG93KGEsYikpKXJldHVybiBuZXcgU21hbGxJbnRlZ2VyKHRydW5jYXRlKHZhbHVlKSl9eD10aGlzO3k9SW50ZWdlclsxXTt3aGlsZSh0cnVlKXtpZihiJjE9PT0xKXt5PXkudGltZXMoeCk7LS1ifWlmKGI9PT0wKWJyZWFrO2IvPTI7eD14LnNxdWFyZSgpfXJldHVybiB5fTtTbWFsbEludGVnZXIucHJvdG90eXBlLnBvdz1CaWdJbnRlZ2VyLnByb3RvdHlwZS5wb3c7TmF0aXZlQmlnSW50LnByb3RvdHlwZS5wb3c9ZnVuY3Rpb24odil7dmFyIG49cGFyc2VWYWx1ZSh2KTt2YXIgYT10aGlzLnZhbHVlLGI9bi52YWx1ZTt2YXIgXzA9QmlnSW50KDApLF8xPUJpZ0ludCgxKSxfMj1CaWdJbnQoMik7aWYoYj09PV8wKXJldHVybiBJbnRlZ2VyWzFdO2lmKGE9PT1fMClyZXR1cm4gSW50ZWdlclswXTtpZihhPT09XzEpcmV0dXJuIEludGVnZXJbMV07aWYoYT09PUJpZ0ludCgtMSkpcmV0dXJuIG4uaXNFdmVuKCk/SW50ZWdlclsxXTpJbnRlZ2VyWy0xXTtpZihuLmlzTmVnYXRpdmUoKSlyZXR1cm4gbmV3IE5hdGl2ZUJpZ0ludChfMCk7dmFyIHg9dGhpczt2YXIgeT1JbnRlZ2VyWzFdO3doaWxlKHRydWUpe2lmKChiJl8xKT09PV8xKXt5PXkudGltZXMoeCk7LS1ifWlmKGI9PT1fMClicmVhaztiLz1fMjt4PXguc3F1YXJlKCl9cmV0dXJuIHl9O0JpZ0ludGVnZXIucHJvdG90eXBlLm1vZFBvdz1mdW5jdGlvbihleHAsbW9kKXtleHA9cGFyc2VWYWx1ZShleHApO21vZD1wYXJzZVZhbHVlKG1vZCk7aWYobW9kLmlzWmVybygpKXRocm93IG5ldyBFcnJvcihcIkNhbm5vdCB0YWtlIG1vZFBvdyB3aXRoIG1vZHVsdXMgMFwiKTt2YXIgcj1JbnRlZ2VyWzFdLGJhc2U9dGhpcy5tb2QobW9kKTt3aGlsZShleHAuaXNQb3NpdGl2ZSgpKXtpZihiYXNlLmlzWmVybygpKXJldHVybiBJbnRlZ2VyWzBdO2lmKGV4cC5pc09kZCgpKXI9ci5tdWx0aXBseShiYXNlKS5tb2QobW9kKTtleHA9ZXhwLmRpdmlkZSgyKTtiYXNlPWJhc2Uuc3F1YXJlKCkubW9kKG1vZCl9cmV0dXJuIHJ9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUubW9kUG93PVNtYWxsSW50ZWdlci5wcm90b3R5cGUubW9kUG93PUJpZ0ludGVnZXIucHJvdG90eXBlLm1vZFBvdztmdW5jdGlvbiBjb21wYXJlQWJzKGEsYil7aWYoYS5sZW5ndGghPT1iLmxlbmd0aCl7cmV0dXJuIGEubGVuZ3RoPmIubGVuZ3RoPzE6LTF9Zm9yKHZhciBpPWEubGVuZ3RoLTE7aT49MDtpLS0pe2lmKGFbaV0hPT1iW2ldKXJldHVybiBhW2ldPmJbaV0/MTotMX1yZXR1cm4gMH1CaWdJbnRlZ2VyLnByb3RvdHlwZS5jb21wYXJlQWJzPWZ1bmN0aW9uKHYpe3ZhciBuPXBhcnNlVmFsdWUodiksYT10aGlzLnZhbHVlLGI9bi52YWx1ZTtpZihuLmlzU21hbGwpcmV0dXJuIDE7cmV0dXJuIGNvbXBhcmVBYnMoYSxiKX07U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5jb21wYXJlQWJzPWZ1bmN0aW9uKHYpe3ZhciBuPXBhcnNlVmFsdWUodiksYT1NYXRoLmFicyh0aGlzLnZhbHVlKSxiPW4udmFsdWU7aWYobi5pc1NtYWxsKXtiPU1hdGguYWJzKGIpO3JldHVybiBhPT09Yj8wOmE+Yj8xOi0xfXJldHVybi0xfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmNvbXBhcmVBYnM9ZnVuY3Rpb24odil7dmFyIGE9dGhpcy52YWx1ZTt2YXIgYj1wYXJzZVZhbHVlKHYpLnZhbHVlO2E9YT49MD9hOi1hO2I9Yj49MD9iOi1iO3JldHVybiBhPT09Yj8wOmE+Yj8xOi0xfTtCaWdJbnRlZ2VyLnByb3RvdHlwZS5jb21wYXJlPWZ1bmN0aW9uKHYpe2lmKHY9PT1JbmZpbml0eSl7cmV0dXJuLTF9aWYodj09PS1JbmZpbml0eSl7cmV0dXJuIDF9dmFyIG49cGFyc2VWYWx1ZSh2KSxhPXRoaXMudmFsdWUsYj1uLnZhbHVlO2lmKHRoaXMuc2lnbiE9PW4uc2lnbil7cmV0dXJuIG4uc2lnbj8xOi0xfWlmKG4uaXNTbWFsbCl7cmV0dXJuIHRoaXMuc2lnbj8tMToxfXJldHVybiBjb21wYXJlQWJzKGEsYikqKHRoaXMuc2lnbj8tMToxKX07QmlnSW50ZWdlci5wcm90b3R5cGUuY29tcGFyZVRvPUJpZ0ludGVnZXIucHJvdG90eXBlLmNvbXBhcmU7U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5jb21wYXJlPWZ1bmN0aW9uKHYpe2lmKHY9PT1JbmZpbml0eSl7cmV0dXJuLTF9aWYodj09PS1JbmZpbml0eSl7cmV0dXJuIDF9dmFyIG49cGFyc2VWYWx1ZSh2KSxhPXRoaXMudmFsdWUsYj1uLnZhbHVlO2lmKG4uaXNTbWFsbCl7cmV0dXJuIGE9PWI/MDphPmI/MTotMX1pZihhPDAhPT1uLnNpZ24pe3JldHVybiBhPDA/LTE6MX1yZXR1cm4gYTwwPzE6LTF9O1NtYWxsSW50ZWdlci5wcm90b3R5cGUuY29tcGFyZVRvPVNtYWxsSW50ZWdlci5wcm90b3R5cGUuY29tcGFyZTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmNvbXBhcmU9ZnVuY3Rpb24odil7aWYodj09PUluZmluaXR5KXtyZXR1cm4tMX1pZih2PT09LUluZmluaXR5KXtyZXR1cm4gMX12YXIgYT10aGlzLnZhbHVlO3ZhciBiPXBhcnNlVmFsdWUodikudmFsdWU7cmV0dXJuIGE9PT1iPzA6YT5iPzE6LTF9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUuY29tcGFyZVRvPU5hdGl2ZUJpZ0ludC5wcm90b3R5cGUuY29tcGFyZTtCaWdJbnRlZ2VyLnByb3RvdHlwZS5lcXVhbHM9ZnVuY3Rpb24odil7cmV0dXJuIHRoaXMuY29tcGFyZSh2KT09PTB9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUuZXE9TmF0aXZlQmlnSW50LnByb3RvdHlwZS5lcXVhbHM9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5lcT1TbWFsbEludGVnZXIucHJvdG90eXBlLmVxdWFscz1CaWdJbnRlZ2VyLnByb3RvdHlwZS5lcT1CaWdJbnRlZ2VyLnByb3RvdHlwZS5lcXVhbHM7QmlnSW50ZWdlci5wcm90b3R5cGUubm90RXF1YWxzPWZ1bmN0aW9uKHYpe3JldHVybiB0aGlzLmNvbXBhcmUodikhPT0wfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLm5lcT1OYXRpdmVCaWdJbnQucHJvdG90eXBlLm5vdEVxdWFscz1TbWFsbEludGVnZXIucHJvdG90eXBlLm5lcT1TbWFsbEludGVnZXIucHJvdG90eXBlLm5vdEVxdWFscz1CaWdJbnRlZ2VyLnByb3RvdHlwZS5uZXE9QmlnSW50ZWdlci5wcm90b3R5cGUubm90RXF1YWxzO0JpZ0ludGVnZXIucHJvdG90eXBlLmdyZWF0ZXI9ZnVuY3Rpb24odil7cmV0dXJuIHRoaXMuY29tcGFyZSh2KT4wfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmd0PU5hdGl2ZUJpZ0ludC5wcm90b3R5cGUuZ3JlYXRlcj1TbWFsbEludGVnZXIucHJvdG90eXBlLmd0PVNtYWxsSW50ZWdlci5wcm90b3R5cGUuZ3JlYXRlcj1CaWdJbnRlZ2VyLnByb3RvdHlwZS5ndD1CaWdJbnRlZ2VyLnByb3RvdHlwZS5ncmVhdGVyO0JpZ0ludGVnZXIucHJvdG90eXBlLmxlc3Nlcj1mdW5jdGlvbih2KXtyZXR1cm4gdGhpcy5jb21wYXJlKHYpPDB9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUubHQ9TmF0aXZlQmlnSW50LnByb3RvdHlwZS5sZXNzZXI9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5sdD1TbWFsbEludGVnZXIucHJvdG90eXBlLmxlc3Nlcj1CaWdJbnRlZ2VyLnByb3RvdHlwZS5sdD1CaWdJbnRlZ2VyLnByb3RvdHlwZS5sZXNzZXI7QmlnSW50ZWdlci5wcm90b3R5cGUuZ3JlYXRlck9yRXF1YWxzPWZ1bmN0aW9uKHYpe3JldHVybiB0aGlzLmNvbXBhcmUodik+PTB9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUuZ2VxPU5hdGl2ZUJpZ0ludC5wcm90b3R5cGUuZ3JlYXRlck9yRXF1YWxzPVNtYWxsSW50ZWdlci5wcm90b3R5cGUuZ2VxPVNtYWxsSW50ZWdlci5wcm90b3R5cGUuZ3JlYXRlck9yRXF1YWxzPUJpZ0ludGVnZXIucHJvdG90eXBlLmdlcT1CaWdJbnRlZ2VyLnByb3RvdHlwZS5ncmVhdGVyT3JFcXVhbHM7QmlnSW50ZWdlci5wcm90b3R5cGUubGVzc2VyT3JFcXVhbHM9ZnVuY3Rpb24odil7cmV0dXJuIHRoaXMuY29tcGFyZSh2KTw9MH07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5sZXE9TmF0aXZlQmlnSW50LnByb3RvdHlwZS5sZXNzZXJPckVxdWFscz1TbWFsbEludGVnZXIucHJvdG90eXBlLmxlcT1TbWFsbEludGVnZXIucHJvdG90eXBlLmxlc3Nlck9yRXF1YWxzPUJpZ0ludGVnZXIucHJvdG90eXBlLmxlcT1CaWdJbnRlZ2VyLnByb3RvdHlwZS5sZXNzZXJPckVxdWFscztCaWdJbnRlZ2VyLnByb3RvdHlwZS5pc0V2ZW49ZnVuY3Rpb24oKXtyZXR1cm4odGhpcy52YWx1ZVswXSYxKT09PTB9O1NtYWxsSW50ZWdlci5wcm90b3R5cGUuaXNFdmVuPWZ1bmN0aW9uKCl7cmV0dXJuKHRoaXMudmFsdWUmMSk9PT0wfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmlzRXZlbj1mdW5jdGlvbigpe3JldHVybih0aGlzLnZhbHVlJkJpZ0ludCgxKSk9PT1CaWdJbnQoMCl9O0JpZ0ludGVnZXIucHJvdG90eXBlLmlzT2RkPWZ1bmN0aW9uKCl7cmV0dXJuKHRoaXMudmFsdWVbMF0mMSk9PT0xfTtTbWFsbEludGVnZXIucHJvdG90eXBlLmlzT2RkPWZ1bmN0aW9uKCl7cmV0dXJuKHRoaXMudmFsdWUmMSk9PT0xfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmlzT2RkPWZ1bmN0aW9uKCl7cmV0dXJuKHRoaXMudmFsdWUmQmlnSW50KDEpKT09PUJpZ0ludCgxKX07QmlnSW50ZWdlci5wcm90b3R5cGUuaXNQb3NpdGl2ZT1mdW5jdGlvbigpe3JldHVybiF0aGlzLnNpZ259O1NtYWxsSW50ZWdlci5wcm90b3R5cGUuaXNQb3NpdGl2ZT1mdW5jdGlvbigpe3JldHVybiB0aGlzLnZhbHVlPjB9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUuaXNQb3NpdGl2ZT1TbWFsbEludGVnZXIucHJvdG90eXBlLmlzUG9zaXRpdmU7QmlnSW50ZWdlci5wcm90b3R5cGUuaXNOZWdhdGl2ZT1mdW5jdGlvbigpe3JldHVybiB0aGlzLnNpZ259O1NtYWxsSW50ZWdlci5wcm90b3R5cGUuaXNOZWdhdGl2ZT1mdW5jdGlvbigpe3JldHVybiB0aGlzLnZhbHVlPDB9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUuaXNOZWdhdGl2ZT1TbWFsbEludGVnZXIucHJvdG90eXBlLmlzTmVnYXRpdmU7QmlnSW50ZWdlci5wcm90b3R5cGUuaXNVbml0PWZ1bmN0aW9uKCl7cmV0dXJuIGZhbHNlfTtTbWFsbEludGVnZXIucHJvdG90eXBlLmlzVW5pdD1mdW5jdGlvbigpe3JldHVybiBNYXRoLmFicyh0aGlzLnZhbHVlKT09PTF9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUuaXNVbml0PWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuYWJzKCkudmFsdWU9PT1CaWdJbnQoMSl9O0JpZ0ludGVnZXIucHJvdG90eXBlLmlzWmVybz1mdW5jdGlvbigpe3JldHVybiBmYWxzZX07U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5pc1plcm89ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy52YWx1ZT09PTB9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUuaXNaZXJvPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudmFsdWU9PT1CaWdJbnQoMCl9O0JpZ0ludGVnZXIucHJvdG90eXBlLmlzRGl2aXNpYmxlQnk9ZnVuY3Rpb24odil7dmFyIG49cGFyc2VWYWx1ZSh2KTtpZihuLmlzWmVybygpKXJldHVybiBmYWxzZTtpZihuLmlzVW5pdCgpKXJldHVybiB0cnVlO2lmKG4uY29tcGFyZUFicygyKT09PTApcmV0dXJuIHRoaXMuaXNFdmVuKCk7cmV0dXJuIHRoaXMubW9kKG4pLmlzWmVybygpfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmlzRGl2aXNpYmxlQnk9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5pc0RpdmlzaWJsZUJ5PUJpZ0ludGVnZXIucHJvdG90eXBlLmlzRGl2aXNpYmxlQnk7ZnVuY3Rpb24gaXNCYXNpY1ByaW1lKHYpe3ZhciBuPXYuYWJzKCk7aWYobi5pc1VuaXQoKSlyZXR1cm4gZmFsc2U7aWYobi5lcXVhbHMoMil8fG4uZXF1YWxzKDMpfHxuLmVxdWFscyg1KSlyZXR1cm4gdHJ1ZTtpZihuLmlzRXZlbigpfHxuLmlzRGl2aXNpYmxlQnkoMyl8fG4uaXNEaXZpc2libGVCeSg1KSlyZXR1cm4gZmFsc2U7aWYobi5sZXNzZXIoNDkpKXJldHVybiB0cnVlfWZ1bmN0aW9uIG1pbGxlclJhYmluVGVzdChuLGEpe3ZhciBuUHJldj1uLnByZXYoKSxiPW5QcmV2LHI9MCxkLHQsaSx4O3doaWxlKGIuaXNFdmVuKCkpYj1iLmRpdmlkZSgyKSxyKys7bmV4dDpmb3IoaT0wO2k8YS5sZW5ndGg7aSsrKXtpZihuLmxlc3NlcihhW2ldKSljb250aW51ZTt4PWJpZ0ludChhW2ldKS5tb2RQb3coYixuKTtpZih4LmlzVW5pdCgpfHx4LmVxdWFscyhuUHJldikpY29udGludWU7Zm9yKGQ9ci0xO2QhPTA7ZC0tKXt4PXguc3F1YXJlKCkubW9kKG4pO2lmKHguaXNVbml0KCkpcmV0dXJuIGZhbHNlO2lmKHguZXF1YWxzKG5QcmV2KSljb250aW51ZSBuZXh0fXJldHVybiBmYWxzZX1yZXR1cm4gdHJ1ZX1CaWdJbnRlZ2VyLnByb3RvdHlwZS5pc1ByaW1lPWZ1bmN0aW9uKHN0cmljdCl7dmFyIGlzUHJpbWU9aXNCYXNpY1ByaW1lKHRoaXMpO2lmKGlzUHJpbWUhPT11bmRlZmluZWQpcmV0dXJuIGlzUHJpbWU7dmFyIG49dGhpcy5hYnMoKTt2YXIgYml0cz1uLmJpdExlbmd0aCgpO2lmKGJpdHM8PTY0KXJldHVybiBtaWxsZXJSYWJpblRlc3QobixbMiwzLDUsNywxMSwxMywxNywxOSwyMywyOSwzMSwzN10pO3ZhciBsb2dOPU1hdGgubG9nKDIpKmJpdHMudG9KU051bWJlcigpO3ZhciB0PU1hdGguY2VpbChzdHJpY3Q9PT10cnVlPzIqTWF0aC5wb3cobG9nTiwyKTpsb2dOKTtmb3IodmFyIGE9W10saT0wO2k8dDtpKyspe2EucHVzaChiaWdJbnQoaSsyKSl9cmV0dXJuIG1pbGxlclJhYmluVGVzdChuLGEpfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmlzUHJpbWU9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5pc1ByaW1lPUJpZ0ludGVnZXIucHJvdG90eXBlLmlzUHJpbWU7QmlnSW50ZWdlci5wcm90b3R5cGUuaXNQcm9iYWJsZVByaW1lPWZ1bmN0aW9uKGl0ZXJhdGlvbnMpe3ZhciBpc1ByaW1lPWlzQmFzaWNQcmltZSh0aGlzKTtpZihpc1ByaW1lIT09dW5kZWZpbmVkKXJldHVybiBpc1ByaW1lO3ZhciBuPXRoaXMuYWJzKCk7dmFyIHQ9aXRlcmF0aW9ucz09PXVuZGVmaW5lZD81Oml0ZXJhdGlvbnM7Zm9yKHZhciBhPVtdLGk9MDtpPHQ7aSsrKXthLnB1c2goYmlnSW50LnJhbmRCZXR3ZWVuKDIsbi5taW51cygyKSkpfXJldHVybiBtaWxsZXJSYWJpblRlc3QobixhKX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5pc1Byb2JhYmxlUHJpbWU9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5pc1Byb2JhYmxlUHJpbWU9QmlnSW50ZWdlci5wcm90b3R5cGUuaXNQcm9iYWJsZVByaW1lO0JpZ0ludGVnZXIucHJvdG90eXBlLm1vZEludj1mdW5jdGlvbihuKXt2YXIgdD1iaWdJbnQuemVybyxuZXdUPWJpZ0ludC5vbmUscj1wYXJzZVZhbHVlKG4pLG5ld1I9dGhpcy5hYnMoKSxxLGxhc3RULGxhc3RSO3doaWxlKCFuZXdSLmlzWmVybygpKXtxPXIuZGl2aWRlKG5ld1IpO2xhc3RUPXQ7bGFzdFI9cjt0PW5ld1Q7cj1uZXdSO25ld1Q9bGFzdFQuc3VidHJhY3QocS5tdWx0aXBseShuZXdUKSk7bmV3Uj1sYXN0Ui5zdWJ0cmFjdChxLm11bHRpcGx5KG5ld1IpKX1pZighci5pc1VuaXQoKSl0aHJvdyBuZXcgRXJyb3IodGhpcy50b1N0cmluZygpK1wiIGFuZCBcIituLnRvU3RyaW5nKCkrXCIgYXJlIG5vdCBjby1wcmltZVwiKTtpZih0LmNvbXBhcmUoMCk9PT0tMSl7dD10LmFkZChuKX1pZih0aGlzLmlzTmVnYXRpdmUoKSl7cmV0dXJuIHQubmVnYXRlKCl9cmV0dXJuIHR9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUubW9kSW52PVNtYWxsSW50ZWdlci5wcm90b3R5cGUubW9kSW52PUJpZ0ludGVnZXIucHJvdG90eXBlLm1vZEludjtCaWdJbnRlZ2VyLnByb3RvdHlwZS5uZXh0PWZ1bmN0aW9uKCl7dmFyIHZhbHVlPXRoaXMudmFsdWU7aWYodGhpcy5zaWduKXtyZXR1cm4gc3VidHJhY3RTbWFsbCh2YWx1ZSwxLHRoaXMuc2lnbil9cmV0dXJuIG5ldyBCaWdJbnRlZ2VyKGFkZFNtYWxsKHZhbHVlLDEpLHRoaXMuc2lnbil9O1NtYWxsSW50ZWdlci5wcm90b3R5cGUubmV4dD1mdW5jdGlvbigpe3ZhciB2YWx1ZT10aGlzLnZhbHVlO2lmKHZhbHVlKzE8TUFYX0lOVClyZXR1cm4gbmV3IFNtYWxsSW50ZWdlcih2YWx1ZSsxKTtyZXR1cm4gbmV3IEJpZ0ludGVnZXIoTUFYX0lOVF9BUlIsZmFsc2UpfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLm5leHQ9ZnVuY3Rpb24oKXtyZXR1cm4gbmV3IE5hdGl2ZUJpZ0ludCh0aGlzLnZhbHVlK0JpZ0ludCgxKSl9O0JpZ0ludGVnZXIucHJvdG90eXBlLnByZXY9ZnVuY3Rpb24oKXt2YXIgdmFsdWU9dGhpcy52YWx1ZTtpZih0aGlzLnNpZ24pe3JldHVybiBuZXcgQmlnSW50ZWdlcihhZGRTbWFsbCh2YWx1ZSwxKSx0cnVlKX1yZXR1cm4gc3VidHJhY3RTbWFsbCh2YWx1ZSwxLHRoaXMuc2lnbil9O1NtYWxsSW50ZWdlci5wcm90b3R5cGUucHJldj1mdW5jdGlvbigpe3ZhciB2YWx1ZT10aGlzLnZhbHVlO2lmKHZhbHVlLTE+LU1BWF9JTlQpcmV0dXJuIG5ldyBTbWFsbEludGVnZXIodmFsdWUtMSk7cmV0dXJuIG5ldyBCaWdJbnRlZ2VyKE1BWF9JTlRfQVJSLHRydWUpfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLnByZXY9ZnVuY3Rpb24oKXtyZXR1cm4gbmV3IE5hdGl2ZUJpZ0ludCh0aGlzLnZhbHVlLUJpZ0ludCgxKSl9O3ZhciBwb3dlcnNPZlR3bz1bMV07d2hpbGUoMipwb3dlcnNPZlR3b1twb3dlcnNPZlR3by5sZW5ndGgtMV08PUJBU0UpcG93ZXJzT2ZUd28ucHVzaCgyKnBvd2Vyc09mVHdvW3Bvd2Vyc09mVHdvLmxlbmd0aC0xXSk7dmFyIHBvd2VyczJMZW5ndGg9cG93ZXJzT2ZUd28ubGVuZ3RoLGhpZ2hlc3RQb3dlcjI9cG93ZXJzT2ZUd29bcG93ZXJzMkxlbmd0aC0xXTtmdW5jdGlvbiBzaGlmdF9pc1NtYWxsKG4pe3JldHVybiBNYXRoLmFicyhuKTw9QkFTRX1CaWdJbnRlZ2VyLnByb3RvdHlwZS5zaGlmdExlZnQ9ZnVuY3Rpb24odil7dmFyIG49cGFyc2VWYWx1ZSh2KS50b0pTTnVtYmVyKCk7aWYoIXNoaWZ0X2lzU21hbGwobikpe3Rocm93IG5ldyBFcnJvcihTdHJpbmcobikrXCIgaXMgdG9vIGxhcmdlIGZvciBzaGlmdGluZy5cIil9aWYobjwwKXJldHVybiB0aGlzLnNoaWZ0UmlnaHQoLW4pO3ZhciByZXN1bHQ9dGhpcztpZihyZXN1bHQuaXNaZXJvKCkpcmV0dXJuIHJlc3VsdDt3aGlsZShuPj1wb3dlcnMyTGVuZ3RoKXtyZXN1bHQ9cmVzdWx0Lm11bHRpcGx5KGhpZ2hlc3RQb3dlcjIpO24tPXBvd2VyczJMZW5ndGgtMX1yZXR1cm4gcmVzdWx0Lm11bHRpcGx5KHBvd2Vyc09mVHdvW25dKX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5zaGlmdExlZnQ9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5zaGlmdExlZnQ9QmlnSW50ZWdlci5wcm90b3R5cGUuc2hpZnRMZWZ0O0JpZ0ludGVnZXIucHJvdG90eXBlLnNoaWZ0UmlnaHQ9ZnVuY3Rpb24odil7dmFyIHJlbVF1bzt2YXIgbj1wYXJzZVZhbHVlKHYpLnRvSlNOdW1iZXIoKTtpZighc2hpZnRfaXNTbWFsbChuKSl7dGhyb3cgbmV3IEVycm9yKFN0cmluZyhuKStcIiBpcyB0b28gbGFyZ2UgZm9yIHNoaWZ0aW5nLlwiKX1pZihuPDApcmV0dXJuIHRoaXMuc2hpZnRMZWZ0KC1uKTt2YXIgcmVzdWx0PXRoaXM7d2hpbGUobj49cG93ZXJzMkxlbmd0aCl7aWYocmVzdWx0LmlzWmVybygpfHxyZXN1bHQuaXNOZWdhdGl2ZSgpJiZyZXN1bHQuaXNVbml0KCkpcmV0dXJuIHJlc3VsdDtyZW1RdW89ZGl2TW9kQW55KHJlc3VsdCxoaWdoZXN0UG93ZXIyKTtyZXN1bHQ9cmVtUXVvWzFdLmlzTmVnYXRpdmUoKT9yZW1RdW9bMF0ucHJldigpOnJlbVF1b1swXTtuLT1wb3dlcnMyTGVuZ3RoLTF9cmVtUXVvPWRpdk1vZEFueShyZXN1bHQscG93ZXJzT2ZUd29bbl0pO3JldHVybiByZW1RdW9bMV0uaXNOZWdhdGl2ZSgpP3JlbVF1b1swXS5wcmV2KCk6cmVtUXVvWzBdfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLnNoaWZ0UmlnaHQ9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5zaGlmdFJpZ2h0PUJpZ0ludGVnZXIucHJvdG90eXBlLnNoaWZ0UmlnaHQ7ZnVuY3Rpb24gYml0d2lzZSh4LHksZm4pe3k9cGFyc2VWYWx1ZSh5KTt2YXIgeFNpZ249eC5pc05lZ2F0aXZlKCkseVNpZ249eS5pc05lZ2F0aXZlKCk7dmFyIHhSZW09eFNpZ24/eC5ub3QoKTp4LHlSZW09eVNpZ24/eS5ub3QoKTp5O3ZhciB4RGlnaXQ9MCx5RGlnaXQ9MDt2YXIgeERpdk1vZD1udWxsLHlEaXZNb2Q9bnVsbDt2YXIgcmVzdWx0PVtdO3doaWxlKCF4UmVtLmlzWmVybygpfHwheVJlbS5pc1plcm8oKSl7eERpdk1vZD1kaXZNb2RBbnkoeFJlbSxoaWdoZXN0UG93ZXIyKTt4RGlnaXQ9eERpdk1vZFsxXS50b0pTTnVtYmVyKCk7aWYoeFNpZ24pe3hEaWdpdD1oaWdoZXN0UG93ZXIyLTEteERpZ2l0fXlEaXZNb2Q9ZGl2TW9kQW55KHlSZW0saGlnaGVzdFBvd2VyMik7eURpZ2l0PXlEaXZNb2RbMV0udG9KU051bWJlcigpO2lmKHlTaWduKXt5RGlnaXQ9aGlnaGVzdFBvd2VyMi0xLXlEaWdpdH14UmVtPXhEaXZNb2RbMF07eVJlbT15RGl2TW9kWzBdO3Jlc3VsdC5wdXNoKGZuKHhEaWdpdCx5RGlnaXQpKX12YXIgc3VtPWZuKHhTaWduPzE6MCx5U2lnbj8xOjApIT09MD9iaWdJbnQoLTEpOmJpZ0ludCgwKTtmb3IodmFyIGk9cmVzdWx0Lmxlbmd0aC0xO2k+PTA7aS09MSl7c3VtPXN1bS5tdWx0aXBseShoaWdoZXN0UG93ZXIyKS5hZGQoYmlnSW50KHJlc3VsdFtpXSkpfXJldHVybiBzdW19QmlnSW50ZWdlci5wcm90b3R5cGUubm90PWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMubmVnYXRlKCkucHJldigpfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLm5vdD1TbWFsbEludGVnZXIucHJvdG90eXBlLm5vdD1CaWdJbnRlZ2VyLnByb3RvdHlwZS5ub3Q7QmlnSW50ZWdlci5wcm90b3R5cGUuYW5kPWZ1bmN0aW9uKG4pe3JldHVybiBiaXR3aXNlKHRoaXMsbixmdW5jdGlvbihhLGIpe3JldHVybiBhJmJ9KX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5hbmQ9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5hbmQ9QmlnSW50ZWdlci5wcm90b3R5cGUuYW5kO0JpZ0ludGVnZXIucHJvdG90eXBlLm9yPWZ1bmN0aW9uKG4pe3JldHVybiBiaXR3aXNlKHRoaXMsbixmdW5jdGlvbihhLGIpe3JldHVybiBhfGJ9KX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5vcj1TbWFsbEludGVnZXIucHJvdG90eXBlLm9yPUJpZ0ludGVnZXIucHJvdG90eXBlLm9yO0JpZ0ludGVnZXIucHJvdG90eXBlLnhvcj1mdW5jdGlvbihuKXtyZXR1cm4gYml0d2lzZSh0aGlzLG4sZnVuY3Rpb24oYSxiKXtyZXR1cm4gYV5ifSl9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUueG9yPVNtYWxsSW50ZWdlci5wcm90b3R5cGUueG9yPUJpZ0ludGVnZXIucHJvdG90eXBlLnhvcjt2YXIgTE9CTUFTS19JPTE8PDMwLExPQk1BU0tfQkk9KEJBU0UmLUJBU0UpKihCQVNFJi1CQVNFKXxMT0JNQVNLX0k7ZnVuY3Rpb24gcm91Z2hMT0Iobil7dmFyIHY9bi52YWx1ZSx4PXR5cGVvZiB2PT09XCJudW1iZXJcIj92fExPQk1BU0tfSTp0eXBlb2Ygdj09PVwiYmlnaW50XCI/dnxCaWdJbnQoTE9CTUFTS19JKTp2WzBdK3ZbMV0qQkFTRXxMT0JNQVNLX0JJO3JldHVybiB4Ji14fWZ1bmN0aW9uIGludGVnZXJMb2dhcml0aG0odmFsdWUsYmFzZSl7aWYoYmFzZS5jb21wYXJlVG8odmFsdWUpPD0wKXt2YXIgdG1wPWludGVnZXJMb2dhcml0aG0odmFsdWUsYmFzZS5zcXVhcmUoYmFzZSkpO3ZhciBwPXRtcC5wO3ZhciBlPXRtcC5lO3ZhciB0PXAubXVsdGlwbHkoYmFzZSk7cmV0dXJuIHQuY29tcGFyZVRvKHZhbHVlKTw9MD97cDp0LGU6ZSoyKzF9OntwOnAsZTplKjJ9fXJldHVybntwOmJpZ0ludCgxKSxlOjB9fUJpZ0ludGVnZXIucHJvdG90eXBlLmJpdExlbmd0aD1mdW5jdGlvbigpe3ZhciBuPXRoaXM7aWYobi5jb21wYXJlVG8oYmlnSW50KDApKTwwKXtuPW4ubmVnYXRlKCkuc3VidHJhY3QoYmlnSW50KDEpKX1pZihuLmNvbXBhcmVUbyhiaWdJbnQoMCkpPT09MCl7cmV0dXJuIGJpZ0ludCgwKX1yZXR1cm4gYmlnSW50KGludGVnZXJMb2dhcml0aG0obixiaWdJbnQoMikpLmUpLmFkZChiaWdJbnQoMSkpfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmJpdExlbmd0aD1TbWFsbEludGVnZXIucHJvdG90eXBlLmJpdExlbmd0aD1CaWdJbnRlZ2VyLnByb3RvdHlwZS5iaXRMZW5ndGg7ZnVuY3Rpb24gbWF4KGEsYil7YT1wYXJzZVZhbHVlKGEpO2I9cGFyc2VWYWx1ZShiKTtyZXR1cm4gYS5ncmVhdGVyKGIpP2E6Yn1mdW5jdGlvbiBtaW4oYSxiKXthPXBhcnNlVmFsdWUoYSk7Yj1wYXJzZVZhbHVlKGIpO3JldHVybiBhLmxlc3NlcihiKT9hOmJ9ZnVuY3Rpb24gZ2NkKGEsYil7YT1wYXJzZVZhbHVlKGEpLmFicygpO2I9cGFyc2VWYWx1ZShiKS5hYnMoKTtpZihhLmVxdWFscyhiKSlyZXR1cm4gYTtpZihhLmlzWmVybygpKXJldHVybiBiO2lmKGIuaXNaZXJvKCkpcmV0dXJuIGE7dmFyIGM9SW50ZWdlclsxXSxkLHQ7d2hpbGUoYS5pc0V2ZW4oKSYmYi5pc0V2ZW4oKSl7ZD1taW4ocm91Z2hMT0IoYSkscm91Z2hMT0IoYikpO2E9YS5kaXZpZGUoZCk7Yj1iLmRpdmlkZShkKTtjPWMubXVsdGlwbHkoZCl9d2hpbGUoYS5pc0V2ZW4oKSl7YT1hLmRpdmlkZShyb3VnaExPQihhKSl9ZG97d2hpbGUoYi5pc0V2ZW4oKSl7Yj1iLmRpdmlkZShyb3VnaExPQihiKSl9aWYoYS5ncmVhdGVyKGIpKXt0PWI7Yj1hO2E9dH1iPWIuc3VidHJhY3QoYSl9d2hpbGUoIWIuaXNaZXJvKCkpO3JldHVybiBjLmlzVW5pdCgpP2E6YS5tdWx0aXBseShjKX1mdW5jdGlvbiBsY20oYSxiKXthPXBhcnNlVmFsdWUoYSkuYWJzKCk7Yj1wYXJzZVZhbHVlKGIpLmFicygpO3JldHVybiBhLmRpdmlkZShnY2QoYSxiKSkubXVsdGlwbHkoYil9ZnVuY3Rpb24gcmFuZEJldHdlZW4oYSxiKXthPXBhcnNlVmFsdWUoYSk7Yj1wYXJzZVZhbHVlKGIpO3ZhciBsb3c9bWluKGEsYiksaGlnaD1tYXgoYSxiKTt2YXIgcmFuZ2U9aGlnaC5zdWJ0cmFjdChsb3cpLmFkZCgxKTtpZihyYW5nZS5pc1NtYWxsKXJldHVybiBsb3cuYWRkKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSpyYW5nZSkpO3ZhciBkaWdpdHM9dG9CYXNlKHJhbmdlLEJBU0UpLnZhbHVlO3ZhciByZXN1bHQ9W10scmVzdHJpY3RlZD10cnVlO2Zvcih2YXIgaT0wO2k8ZGlnaXRzLmxlbmd0aDtpKyspe3ZhciB0b3A9cmVzdHJpY3RlZD9kaWdpdHNbaV06QkFTRTt2YXIgZGlnaXQ9dHJ1bmNhdGUoTWF0aC5yYW5kb20oKSp0b3ApO3Jlc3VsdC5wdXNoKGRpZ2l0KTtpZihkaWdpdDx0b3ApcmVzdHJpY3RlZD1mYWxzZX1yZXR1cm4gbG93LmFkZChJbnRlZ2VyLmZyb21BcnJheShyZXN1bHQsQkFTRSxmYWxzZSkpfXZhciBwYXJzZUJhc2U9ZnVuY3Rpb24odGV4dCxiYXNlLGFscGhhYmV0LGNhc2VTZW5zaXRpdmUpe2FscGhhYmV0PWFscGhhYmV0fHxERUZBVUxUX0FMUEhBQkVUO3RleHQ9U3RyaW5nKHRleHQpO2lmKCFjYXNlU2Vuc2l0aXZlKXt0ZXh0PXRleHQudG9Mb3dlckNhc2UoKTthbHBoYWJldD1hbHBoYWJldC50b0xvd2VyQ2FzZSgpfXZhciBsZW5ndGg9dGV4dC5sZW5ndGg7dmFyIGk7dmFyIGFic0Jhc2U9TWF0aC5hYnMoYmFzZSk7dmFyIGFscGhhYmV0VmFsdWVzPXt9O2ZvcihpPTA7aTxhbHBoYWJldC5sZW5ndGg7aSsrKXthbHBoYWJldFZhbHVlc1thbHBoYWJldFtpXV09aX1mb3IoaT0wO2k8bGVuZ3RoO2krKyl7dmFyIGM9dGV4dFtpXTtpZihjPT09XCItXCIpY29udGludWU7aWYoYyBpbiBhbHBoYWJldFZhbHVlcyl7aWYoYWxwaGFiZXRWYWx1ZXNbY10+PWFic0Jhc2Upe2lmKGM9PT1cIjFcIiYmYWJzQmFzZT09PTEpY29udGludWU7dGhyb3cgbmV3IEVycm9yKGMrXCIgaXMgbm90IGEgdmFsaWQgZGlnaXQgaW4gYmFzZSBcIitiYXNlK1wiLlwiKX19fWJhc2U9cGFyc2VWYWx1ZShiYXNlKTt2YXIgZGlnaXRzPVtdO3ZhciBpc05lZ2F0aXZlPXRleHRbMF09PT1cIi1cIjtmb3IoaT1pc05lZ2F0aXZlPzE6MDtpPHRleHQubGVuZ3RoO2krKyl7dmFyIGM9dGV4dFtpXTtpZihjIGluIGFscGhhYmV0VmFsdWVzKWRpZ2l0cy5wdXNoKHBhcnNlVmFsdWUoYWxwaGFiZXRWYWx1ZXNbY10pKTtlbHNlIGlmKGM9PT1cIjxcIil7dmFyIHN0YXJ0PWk7ZG97aSsrfXdoaWxlKHRleHRbaV0hPT1cIj5cIiYmaTx0ZXh0Lmxlbmd0aCk7ZGlnaXRzLnB1c2gocGFyc2VWYWx1ZSh0ZXh0LnNsaWNlKHN0YXJ0KzEsaSkpKX1lbHNlIHRocm93IG5ldyBFcnJvcihjK1wiIGlzIG5vdCBhIHZhbGlkIGNoYXJhY3RlclwiKX1yZXR1cm4gcGFyc2VCYXNlRnJvbUFycmF5KGRpZ2l0cyxiYXNlLGlzTmVnYXRpdmUpfTtmdW5jdGlvbiBwYXJzZUJhc2VGcm9tQXJyYXkoZGlnaXRzLGJhc2UsaXNOZWdhdGl2ZSl7dmFyIHZhbD1JbnRlZ2VyWzBdLHBvdz1JbnRlZ2VyWzFdLGk7Zm9yKGk9ZGlnaXRzLmxlbmd0aC0xO2k+PTA7aS0tKXt2YWw9dmFsLmFkZChkaWdpdHNbaV0udGltZXMocG93KSk7cG93PXBvdy50aW1lcyhiYXNlKX1yZXR1cm4gaXNOZWdhdGl2ZT92YWwubmVnYXRlKCk6dmFsfWZ1bmN0aW9uIHN0cmluZ2lmeShkaWdpdCxhbHBoYWJldCl7YWxwaGFiZXQ9YWxwaGFiZXR8fERFRkFVTFRfQUxQSEFCRVQ7aWYoZGlnaXQ8YWxwaGFiZXQubGVuZ3RoKXtyZXR1cm4gYWxwaGFiZXRbZGlnaXRdfXJldHVyblwiPFwiK2RpZ2l0K1wiPlwifWZ1bmN0aW9uIHRvQmFzZShuLGJhc2Upe2Jhc2U9YmlnSW50KGJhc2UpO2lmKGJhc2UuaXNaZXJvKCkpe2lmKG4uaXNaZXJvKCkpcmV0dXJue3ZhbHVlOlswXSxpc05lZ2F0aXZlOmZhbHNlfTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgY29udmVydCBub256ZXJvIG51bWJlcnMgdG8gYmFzZSAwLlwiKX1pZihiYXNlLmVxdWFscygtMSkpe2lmKG4uaXNaZXJvKCkpcmV0dXJue3ZhbHVlOlswXSxpc05lZ2F0aXZlOmZhbHNlfTtpZihuLmlzTmVnYXRpdmUoKSlyZXR1cm57dmFsdWU6W10uY29uY2F0LmFwcGx5KFtdLEFycmF5LmFwcGx5KG51bGwsQXJyYXkoLW4udG9KU051bWJlcigpKSkubWFwKEFycmF5LnByb3RvdHlwZS52YWx1ZU9mLFsxLDBdKSksaXNOZWdhdGl2ZTpmYWxzZX07dmFyIGFycj1BcnJheS5hcHBseShudWxsLEFycmF5KG4udG9KU051bWJlcigpLTEpKS5tYXAoQXJyYXkucHJvdG90eXBlLnZhbHVlT2YsWzAsMV0pO2Fyci51bnNoaWZ0KFsxXSk7cmV0dXJue3ZhbHVlOltdLmNvbmNhdC5hcHBseShbXSxhcnIpLGlzTmVnYXRpdmU6ZmFsc2V9fXZhciBuZWc9ZmFsc2U7aWYobi5pc05lZ2F0aXZlKCkmJmJhc2UuaXNQb3NpdGl2ZSgpKXtuZWc9dHJ1ZTtuPW4uYWJzKCl9aWYoYmFzZS5pc1VuaXQoKSl7aWYobi5pc1plcm8oKSlyZXR1cm57dmFsdWU6WzBdLGlzTmVnYXRpdmU6ZmFsc2V9O3JldHVybnt2YWx1ZTpBcnJheS5hcHBseShudWxsLEFycmF5KG4udG9KU051bWJlcigpKSkubWFwKE51bWJlci5wcm90b3R5cGUudmFsdWVPZiwxKSxpc05lZ2F0aXZlOm5lZ319dmFyIG91dD1bXTt2YXIgbGVmdD1uLGRpdm1vZDt3aGlsZShsZWZ0LmlzTmVnYXRpdmUoKXx8bGVmdC5jb21wYXJlQWJzKGJhc2UpPj0wKXtkaXZtb2Q9bGVmdC5kaXZtb2QoYmFzZSk7bGVmdD1kaXZtb2QucXVvdGllbnQ7dmFyIGRpZ2l0PWRpdm1vZC5yZW1haW5kZXI7aWYoZGlnaXQuaXNOZWdhdGl2ZSgpKXtkaWdpdD1iYXNlLm1pbnVzKGRpZ2l0KS5hYnMoKTtsZWZ0PWxlZnQubmV4dCgpfW91dC5wdXNoKGRpZ2l0LnRvSlNOdW1iZXIoKSl9b3V0LnB1c2gobGVmdC50b0pTTnVtYmVyKCkpO3JldHVybnt2YWx1ZTpvdXQucmV2ZXJzZSgpLGlzTmVnYXRpdmU6bmVnfX1mdW5jdGlvbiB0b0Jhc2VTdHJpbmcobixiYXNlLGFscGhhYmV0KXt2YXIgYXJyPXRvQmFzZShuLGJhc2UpO3JldHVybihhcnIuaXNOZWdhdGl2ZT9cIi1cIjpcIlwiKSthcnIudmFsdWUubWFwKGZ1bmN0aW9uKHgpe3JldHVybiBzdHJpbmdpZnkoeCxhbHBoYWJldCl9KS5qb2luKFwiXCIpfUJpZ0ludGVnZXIucHJvdG90eXBlLnRvQXJyYXk9ZnVuY3Rpb24ocmFkaXgpe3JldHVybiB0b0Jhc2UodGhpcyxyYWRpeCl9O1NtYWxsSW50ZWdlci5wcm90b3R5cGUudG9BcnJheT1mdW5jdGlvbihyYWRpeCl7cmV0dXJuIHRvQmFzZSh0aGlzLHJhZGl4KX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS50b0FycmF5PWZ1bmN0aW9uKHJhZGl4KXtyZXR1cm4gdG9CYXNlKHRoaXMscmFkaXgpfTtCaWdJbnRlZ2VyLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbihyYWRpeCxhbHBoYWJldCl7aWYocmFkaXg9PT11bmRlZmluZWQpcmFkaXg9MTA7aWYocmFkaXghPT0xMClyZXR1cm4gdG9CYXNlU3RyaW5nKHRoaXMscmFkaXgsYWxwaGFiZXQpO3ZhciB2PXRoaXMudmFsdWUsbD12Lmxlbmd0aCxzdHI9U3RyaW5nKHZbLS1sXSksemVyb3M9XCIwMDAwMDAwXCIsZGlnaXQ7d2hpbGUoLS1sPj0wKXtkaWdpdD1TdHJpbmcodltsXSk7c3RyKz16ZXJvcy5zbGljZShkaWdpdC5sZW5ndGgpK2RpZ2l0fXZhciBzaWduPXRoaXMuc2lnbj9cIi1cIjpcIlwiO3JldHVybiBzaWduK3N0cn07U21hbGxJbnRlZ2VyLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbihyYWRpeCxhbHBoYWJldCl7aWYocmFkaXg9PT11bmRlZmluZWQpcmFkaXg9MTA7aWYocmFkaXghPTEwKXJldHVybiB0b0Jhc2VTdHJpbmcodGhpcyxyYWRpeCxhbHBoYWJldCk7cmV0dXJuIFN0cmluZyh0aGlzLnZhbHVlKX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS50b1N0cmluZz1TbWFsbEludGVnZXIucHJvdG90eXBlLnRvU3RyaW5nO05hdGl2ZUJpZ0ludC5wcm90b3R5cGUudG9KU09OPUJpZ0ludGVnZXIucHJvdG90eXBlLnRvSlNPTj1TbWFsbEludGVnZXIucHJvdG90eXBlLnRvSlNPTj1mdW5jdGlvbigpe3JldHVybiB0aGlzLnRvU3RyaW5nKCl9O0JpZ0ludGVnZXIucHJvdG90eXBlLnZhbHVlT2Y9ZnVuY3Rpb24oKXtyZXR1cm4gcGFyc2VJbnQodGhpcy50b1N0cmluZygpLDEwKX07QmlnSW50ZWdlci5wcm90b3R5cGUudG9KU051bWJlcj1CaWdJbnRlZ2VyLnByb3RvdHlwZS52YWx1ZU9mO1NtYWxsSW50ZWdlci5wcm90b3R5cGUudmFsdWVPZj1mdW5jdGlvbigpe3JldHVybiB0aGlzLnZhbHVlfTtTbWFsbEludGVnZXIucHJvdG90eXBlLnRvSlNOdW1iZXI9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS52YWx1ZU9mO05hdGl2ZUJpZ0ludC5wcm90b3R5cGUudmFsdWVPZj1OYXRpdmVCaWdJbnQucHJvdG90eXBlLnRvSlNOdW1iZXI9ZnVuY3Rpb24oKXtyZXR1cm4gcGFyc2VJbnQodGhpcy50b1N0cmluZygpLDEwKX07ZnVuY3Rpb24gcGFyc2VTdHJpbmdWYWx1ZSh2KXtpZihpc1ByZWNpc2UoK3YpKXt2YXIgeD0rdjtpZih4PT09dHJ1bmNhdGUoeCkpcmV0dXJuIHN1cHBvcnRzTmF0aXZlQmlnSW50P25ldyBOYXRpdmVCaWdJbnQoQmlnSW50KHgpKTpuZXcgU21hbGxJbnRlZ2VyKHgpO3Rocm93IG5ldyBFcnJvcihcIkludmFsaWQgaW50ZWdlcjogXCIrdil9dmFyIHNpZ249dlswXT09PVwiLVwiO2lmKHNpZ24pdj12LnNsaWNlKDEpO3ZhciBzcGxpdD12LnNwbGl0KC9lL2kpO2lmKHNwbGl0Lmxlbmd0aD4yKXRocm93IG5ldyBFcnJvcihcIkludmFsaWQgaW50ZWdlcjogXCIrc3BsaXQuam9pbihcImVcIikpO2lmKHNwbGl0Lmxlbmd0aD09PTIpe3ZhciBleHA9c3BsaXRbMV07aWYoZXhwWzBdPT09XCIrXCIpZXhwPWV4cC5zbGljZSgxKTtleHA9K2V4cDtpZihleHAhPT10cnVuY2F0ZShleHApfHwhaXNQcmVjaXNlKGV4cCkpdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBpbnRlZ2VyOiBcIitleHArXCIgaXMgbm90IGEgdmFsaWQgZXhwb25lbnQuXCIpO3ZhciB0ZXh0PXNwbGl0WzBdO3ZhciBkZWNpbWFsUGxhY2U9dGV4dC5pbmRleE9mKFwiLlwiKTtpZihkZWNpbWFsUGxhY2U+PTApe2V4cC09dGV4dC5sZW5ndGgtZGVjaW1hbFBsYWNlLTE7dGV4dD10ZXh0LnNsaWNlKDAsZGVjaW1hbFBsYWNlKSt0ZXh0LnNsaWNlKGRlY2ltYWxQbGFjZSsxKX1pZihleHA8MCl0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgaW5jbHVkZSBuZWdhdGl2ZSBleHBvbmVudCBwYXJ0IGZvciBpbnRlZ2Vyc1wiKTt0ZXh0Kz1uZXcgQXJyYXkoZXhwKzEpLmpvaW4oXCIwXCIpO3Y9dGV4dH12YXIgaXNWYWxpZD0vXihbMC05XVswLTldKikkLy50ZXN0KHYpO2lmKCFpc1ZhbGlkKXRocm93IG5ldyBFcnJvcihcIkludmFsaWQgaW50ZWdlcjogXCIrdik7aWYoc3VwcG9ydHNOYXRpdmVCaWdJbnQpe3JldHVybiBuZXcgTmF0aXZlQmlnSW50KEJpZ0ludChzaWduP1wiLVwiK3Y6dikpfXZhciByPVtdLG1heD12Lmxlbmd0aCxsPUxPR19CQVNFLG1pbj1tYXgtbDt3aGlsZShtYXg+MCl7ci5wdXNoKCt2LnNsaWNlKG1pbixtYXgpKTttaW4tPWw7aWYobWluPDApbWluPTA7bWF4LT1sfXRyaW0ocik7cmV0dXJuIG5ldyBCaWdJbnRlZ2VyKHIsc2lnbil9ZnVuY3Rpb24gcGFyc2VOdW1iZXJWYWx1ZSh2KXtpZihzdXBwb3J0c05hdGl2ZUJpZ0ludCl7cmV0dXJuIG5ldyBOYXRpdmVCaWdJbnQoQmlnSW50KHYpKX1pZihpc1ByZWNpc2Uodikpe2lmKHYhPT10cnVuY2F0ZSh2KSl0aHJvdyBuZXcgRXJyb3IoditcIiBpcyBub3QgYW4gaW50ZWdlci5cIik7cmV0dXJuIG5ldyBTbWFsbEludGVnZXIodil9cmV0dXJuIHBhcnNlU3RyaW5nVmFsdWUodi50b1N0cmluZygpKX1mdW5jdGlvbiBwYXJzZVZhbHVlKHYpe2lmKHR5cGVvZiB2PT09XCJudW1iZXJcIil7cmV0dXJuIHBhcnNlTnVtYmVyVmFsdWUodil9aWYodHlwZW9mIHY9PT1cInN0cmluZ1wiKXtyZXR1cm4gcGFyc2VTdHJpbmdWYWx1ZSh2KX1pZih0eXBlb2Ygdj09PVwiYmlnaW50XCIpe3JldHVybiBuZXcgTmF0aXZlQmlnSW50KHYpfXJldHVybiB2fWZvcih2YXIgaT0wO2k8MWUzO2krKyl7SW50ZWdlcltpXT1wYXJzZVZhbHVlKGkpO2lmKGk+MClJbnRlZ2VyWy1pXT1wYXJzZVZhbHVlKC1pKX1JbnRlZ2VyLm9uZT1JbnRlZ2VyWzFdO0ludGVnZXIuemVybz1JbnRlZ2VyWzBdO0ludGVnZXIubWludXNPbmU9SW50ZWdlclstMV07SW50ZWdlci5tYXg9bWF4O0ludGVnZXIubWluPW1pbjtJbnRlZ2VyLmdjZD1nY2Q7SW50ZWdlci5sY209bGNtO0ludGVnZXIuaXNJbnN0YW5jZT1mdW5jdGlvbih4KXtyZXR1cm4geCBpbnN0YW5jZW9mIEJpZ0ludGVnZXJ8fHggaW5zdGFuY2VvZiBTbWFsbEludGVnZXJ8fHggaW5zdGFuY2VvZiBOYXRpdmVCaWdJbnR9O0ludGVnZXIucmFuZEJldHdlZW49cmFuZEJldHdlZW47SW50ZWdlci5mcm9tQXJyYXk9ZnVuY3Rpb24oZGlnaXRzLGJhc2UsaXNOZWdhdGl2ZSl7cmV0dXJuIHBhcnNlQmFzZUZyb21BcnJheShkaWdpdHMubWFwKHBhcnNlVmFsdWUpLHBhcnNlVmFsdWUoYmFzZXx8MTApLGlzTmVnYXRpdmUpfTtyZXR1cm4gSW50ZWdlcn0oKTtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlLmhhc093blByb3BlcnR5KFwiZXhwb3J0c1wiKSl7bW9kdWxlLmV4cG9ydHM9YmlnSW50fWlmKHR5cGVvZiBkZWZpbmU9PT1cImZ1bmN0aW9uXCImJmRlZmluZS5hbWQpe2RlZmluZShcImJpZy1pbnRlZ2VyXCIsW10sZnVuY3Rpb24oKXtyZXR1cm4gYmlnSW50fSl9IiwiLyoqXG4gKiBUaGUgY29weXJpZ2h0IGluIHRoaXMgc29mdHdhcmUgaXMgYmVpbmcgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIEJTRCBMaWNlbnNlLFxuICogaW5jbHVkZWQgYmVsb3cuIFRoaXMgc29mdHdhcmUgbWF5IGJlIHN1YmplY3QgdG8gb3RoZXIgdGhpcmQgcGFydHkgYW5kIGNvbnRyaWJ1dG9yXG4gKiByaWdodHMsIGluY2x1ZGluZyBwYXRlbnQgcmlnaHRzLCBhbmQgbm8gc3VjaCByaWdodHMgYXJlIGdyYW50ZWQgdW5kZXIgdGhpcyBsaWNlbnNlLlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMywgRGFzaCBJbmR1c3RyeSBGb3J1bS5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbiAqIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICogIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICogIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yXG4gKiAgb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbiAqICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgRGFzaCBJbmR1c3RyeSBGb3J1bSBub3IgdGhlIG5hbWVzIG9mIGl0c1xuICogIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmVcbiAqICB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbiAqXG4gKiAgVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBBUyBJUyBBTkQgQU5ZXG4gKiAgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuICogIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC5cbiAqICBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULFxuICogIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVRcbiAqICBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SXG4gKiAgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksXG4gKiAgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKVxuICogIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFXG4gKiAgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKi9cbi8qKlxuICogQG1vZHVsZSBGYWN0b3J5TWFrZXJcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3QgRmFjdG9yeU1ha2VyID0gKGZ1bmN0aW9uICgpIHtcblxuICAgIGxldCBpbnN0YW5jZTtcbiAgICBsZXQgc2luZ2xldG9uQ29udGV4dHMgPSBbXTtcbiAgICBjb25zdCBzaW5nbGV0b25GYWN0b3JpZXMgPSB7fTtcbiAgICBjb25zdCBjbGFzc0ZhY3RvcmllcyA9IHt9O1xuXG4gICAgZnVuY3Rpb24gZXh0ZW5kKG5hbWUsIGNoaWxkSW5zdGFuY2UsIG92ZXJyaWRlLCBjb250ZXh0KSB7XG4gICAgICAgIGlmICghY29udGV4dFtuYW1lXSAmJiBjaGlsZEluc3RhbmNlKSB7XG4gICAgICAgICAgICBjb250ZXh0W25hbWVdID0ge1xuICAgICAgICAgICAgICAgIGluc3RhbmNlOiBjaGlsZEluc3RhbmNlLFxuICAgICAgICAgICAgICAgIG92ZXJyaWRlOiBvdmVycmlkZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVzZSB0aGlzIG1ldGhvZCBmcm9tIHlvdXIgZXh0ZW5kZWQgb2JqZWN0LiAgdGhpcy5mYWN0b3J5IGlzIGluamVjdGVkIGludG8geW91ciBvYmplY3QuXG4gICAgICogdGhpcy5mYWN0b3J5LmdldFNpbmdsZXRvbkluc3RhbmNlKHRoaXMuY29udGV4dCwgJ1ZpZGVvTW9kZWwnKVxuICAgICAqIHdpbGwgcmV0dXJuIHRoZSB2aWRlbyBtb2RlbCBmb3IgdXNlIGluIHRoZSBleHRlbmRlZCBvYmplY3QuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dCAtIGluamVjdGVkIGludG8gZXh0ZW5kZWQgb2JqZWN0IGFzIHRoaXMuY29udGV4dFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjbGFzc05hbWUgLSBzdHJpbmcgbmFtZSBmb3VuZCBpbiBhbGwgZGFzaC5qcyBvYmplY3RzXG4gICAgICogd2l0aCBuYW1lIF9fZGFzaGpzX2ZhY3RvcnlfbmFtZSBXaWxsIGJlIGF0IHRoZSBib3R0b20uIFdpbGwgYmUgdGhlIHNhbWUgYXMgdGhlIG9iamVjdCdzIG5hbWUuXG4gICAgICogQHJldHVybnMgeyp9IENvbnRleHQgYXdhcmUgaW5zdGFuY2Ugb2Ygc3BlY2lmaWVkIHNpbmdsZXRvbiBuYW1lLlxuICAgICAqIEBtZW1iZXJvZiBtb2R1bGU6RmFjdG9yeU1ha2VyXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2V0U2luZ2xldG9uSW5zdGFuY2UoY29udGV4dCwgY2xhc3NOYW1lKSB7XG4gICAgICAgIGZvciAoY29uc3QgaSBpbiBzaW5nbGV0b25Db250ZXh0cykge1xuICAgICAgICAgICAgY29uc3Qgb2JqID0gc2luZ2xldG9uQ29udGV4dHNbaV07XG4gICAgICAgICAgICBpZiAob2JqLmNvbnRleHQgPT09IGNvbnRleHQgJiYgb2JqLm5hbWUgPT09IGNsYXNzTmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBvYmouaW5zdGFuY2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXNlIHRoaXMgbWV0aG9kIHRvIGFkZCBhbiBzaW5nbGV0b24gaW5zdGFuY2UgdG8gdGhlIHN5c3RlbS4gIFVzZWZ1bCBmb3IgdW5pdCB0ZXN0aW5nIHRvIG1vY2sgb2JqZWN0cyBldGMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjbGFzc05hbWVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaW5zdGFuY2VcbiAgICAgKiBAbWVtYmVyb2YgbW9kdWxlOkZhY3RvcnlNYWtlclxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNldFNpbmdsZXRvbkluc3RhbmNlKGNvbnRleHQsIGNsYXNzTmFtZSwgaW5zdGFuY2UpIHtcbiAgICAgICAgZm9yIChjb25zdCBpIGluIHNpbmdsZXRvbkNvbnRleHRzKSB7XG4gICAgICAgICAgICBjb25zdCBvYmogPSBzaW5nbGV0b25Db250ZXh0c1tpXTtcbiAgICAgICAgICAgIGlmIChvYmouY29udGV4dCA9PT0gY29udGV4dCAmJiBvYmoubmFtZSA9PT0gY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICAgICAgc2luZ2xldG9uQ29udGV4dHNbaV0uaW5zdGFuY2UgPSBpbnN0YW5jZTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc2luZ2xldG9uQ29udGV4dHMucHVzaCh7XG4gICAgICAgICAgICBuYW1lOiBjbGFzc05hbWUsXG4gICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0LFxuICAgICAgICAgICAgaW5zdGFuY2U6IGluc3RhbmNlXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVzZSB0aGlzIG1ldGhvZCB0byByZW1vdmUgYWxsIHNpbmdsZXRvbiBpbnN0YW5jZXMgYXNzb2NpYXRlZCB3aXRoIGEgcGFydGljdWxhciBjb250ZXh0LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRcbiAgICAgKiBAbWVtYmVyb2YgbW9kdWxlOkZhY3RvcnlNYWtlclxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGRlbGV0ZVNpbmdsZXRvbkluc3RhbmNlcyhjb250ZXh0KSB7XG4gICAgICAgIHNpbmdsZXRvbkNvbnRleHRzID0gc2luZ2xldG9uQ29udGV4dHMuZmlsdGVyKHggPT4geC5jb250ZXh0ICE9PSBjb250ZXh0KTtcbiAgICB9XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvLyBGYWN0b3JpZXMgc3RvcmFnZSBNYW5hZ2VtZW50XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICBmdW5jdGlvbiBnZXRGYWN0b3J5QnlOYW1lKG5hbWUsIGZhY3Rvcmllc0FycmF5KSB7XG4gICAgICAgIHJldHVybiBmYWN0b3JpZXNBcnJheVtuYW1lXTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVGYWN0b3J5KG5hbWUsIGZhY3RvcnksIGZhY3Rvcmllc0FycmF5KSB7XG4gICAgICAgIGlmIChuYW1lIGluIGZhY3Rvcmllc0FycmF5KSB7XG4gICAgICAgICAgICBmYWN0b3JpZXNBcnJheVtuYW1lXSA9IGZhY3Rvcnk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvLyBDbGFzcyBGYWN0b3JpZXMgTWFuYWdlbWVudFxuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgZnVuY3Rpb24gdXBkYXRlQ2xhc3NGYWN0b3J5KG5hbWUsIGZhY3RvcnkpIHtcbiAgICAgICAgdXBkYXRlRmFjdG9yeShuYW1lLCBmYWN0b3J5LCBjbGFzc0ZhY3Rvcmllcyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0Q2xhc3NGYWN0b3J5QnlOYW1lKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGdldEZhY3RvcnlCeU5hbWUobmFtZSwgY2xhc3NGYWN0b3JpZXMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldENsYXNzRmFjdG9yeShjbGFzc0NvbnN0cnVjdG9yKSB7XG4gICAgICAgIGxldCBmYWN0b3J5ID0gZ2V0RmFjdG9yeUJ5TmFtZShjbGFzc0NvbnN0cnVjdG9yLl9fZGFzaGpzX2ZhY3RvcnlfbmFtZSwgY2xhc3NGYWN0b3JpZXMpO1xuXG4gICAgICAgIGlmICghZmFjdG9yeSkge1xuICAgICAgICAgICAgZmFjdG9yeSA9IGZ1bmN0aW9uIChjb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbnRleHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0ID0ge307XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lcmdlKGNsYXNzQ29uc3RydWN0b3IsIGNvbnRleHQsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY2xhc3NGYWN0b3JpZXNbY2xhc3NDb25zdHJ1Y3Rvci5fX2Rhc2hqc19mYWN0b3J5X25hbWVdID0gZmFjdG9yeTsgLy8gc3RvcmUgZmFjdG9yeVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWN0b3J5O1xuICAgIH1cblxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgIC8vIFNpbmdsZXRvbiBGYWN0b3J5IE1BYW5nZW1lbnRcblxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZVNpbmdsZXRvbkZhY3RvcnkobmFtZSwgZmFjdG9yeSkge1xuICAgICAgICB1cGRhdGVGYWN0b3J5KG5hbWUsIGZhY3RvcnksIHNpbmdsZXRvbkZhY3Rvcmllcyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0U2luZ2xldG9uRmFjdG9yeUJ5TmFtZShuYW1lKSB7XG4gICAgICAgIHJldHVybiBnZXRGYWN0b3J5QnlOYW1lKG5hbWUsIHNpbmdsZXRvbkZhY3Rvcmllcyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0U2luZ2xldG9uRmFjdG9yeShjbGFzc0NvbnN0cnVjdG9yKSB7XG4gICAgICAgIGxldCBmYWN0b3J5ID0gZ2V0RmFjdG9yeUJ5TmFtZShjbGFzc0NvbnN0cnVjdG9yLl9fZGFzaGpzX2ZhY3RvcnlfbmFtZSwgc2luZ2xldG9uRmFjdG9yaWVzKTtcbiAgICAgICAgaWYgKCFmYWN0b3J5KSB7XG4gICAgICAgICAgICBmYWN0b3J5ID0gZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICBsZXQgaW5zdGFuY2U7XG4gICAgICAgICAgICAgICAgaWYgKGNvbnRleHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0ID0ge307XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGdldEluc3RhbmNlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIGFuIGluc3RhbmNlIHlldCBjaGVjayBmb3Igb25lIG9uIHRoZSBjb250ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWluc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UgPSBnZXRTaW5nbGV0b25JbnN0YW5jZShjb250ZXh0LCBjbGFzc0NvbnN0cnVjdG9yLl9fZGFzaGpzX2ZhY3RvcnlfbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSdzIG5vIGluc3RhbmNlIG9uIHRoZSBjb250ZXh0IHRoZW4gY3JlYXRlIG9uZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpbnN0YW5jZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlID0gbWVyZ2UoY2xhc3NDb25zdHJ1Y3RvciwgY29udGV4dCwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaW5nbGV0b25Db250ZXh0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY2xhc3NDb25zdHJ1Y3Rvci5fX2Rhc2hqc19mYWN0b3J5X25hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlOiBpbnN0YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBzaW5nbGV0b25GYWN0b3JpZXNbY2xhc3NDb25zdHJ1Y3Rvci5fX2Rhc2hqc19mYWN0b3J5X25hbWVdID0gZmFjdG9yeTsgLy8gc3RvcmUgZmFjdG9yeVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhY3Rvcnk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWVyZ2UoY2xhc3NDb25zdHJ1Y3RvciwgY29udGV4dCwgYXJncykge1xuXG4gICAgICAgIGxldCBjbGFzc0luc3RhbmNlO1xuICAgICAgICBjb25zdCBjbGFzc05hbWUgPSBjbGFzc0NvbnN0cnVjdG9yLl9fZGFzaGpzX2ZhY3RvcnlfbmFtZTtcbiAgICAgICAgY29uc3QgZXh0ZW5zaW9uT2JqZWN0ID0gY29udGV4dFtjbGFzc05hbWVdO1xuXG4gICAgICAgIGlmIChleHRlbnNpb25PYmplY3QpIHtcblxuICAgICAgICAgICAgbGV0IGV4dGVuc2lvbiA9IGV4dGVuc2lvbk9iamVjdC5pbnN0YW5jZTtcblxuICAgICAgICAgICAgaWYgKGV4dGVuc2lvbk9iamVjdC5vdmVycmlkZSkgeyAvL092ZXJyaWRlIHB1YmxpYyBtZXRob2RzIGluIHBhcmVudCBidXQga2VlcCBwYXJlbnQuXG5cbiAgICAgICAgICAgICAgICBjbGFzc0luc3RhbmNlID0gY2xhc3NDb25zdHJ1Y3Rvci5hcHBseSh7Y29udGV4dH0sIGFyZ3MpO1xuICAgICAgICAgICAgICAgIGV4dGVuc2lvbiA9IGV4dGVuc2lvbi5hcHBseSh7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgIGZhY3Rvcnk6IGluc3RhbmNlLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IGNsYXNzSW5zdGFuY2VcbiAgICAgICAgICAgICAgICB9LCBhcmdzKTtcblxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgcHJvcCBpbiBleHRlbnNpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNsYXNzSW5zdGFuY2UuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzSW5zdGFuY2VbcHJvcF0gPSBleHRlbnNpb25bcHJvcF07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7IC8vcmVwbGFjZSBwYXJlbnQgb2JqZWN0IGNvbXBsZXRlbHkgd2l0aCBuZXcgb2JqZWN0LiBTYW1lIGFzIGRpam9uLlxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGV4dGVuc2lvbi5hcHBseSh7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgIGZhY3Rvcnk6IGluc3RhbmNlXG4gICAgICAgICAgICAgICAgfSwgYXJncyk7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIENyZWF0ZSBuZXcgaW5zdGFuY2Ugb2YgdGhlIGNsYXNzXG4gICAgICAgICAgICBjbGFzc0luc3RhbmNlID0gY2xhc3NDb25zdHJ1Y3Rvci5hcHBseSh7Y29udGV4dH0sIGFyZ3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIGdldENsYXNzTmFtZSBmdW5jdGlvbiB0byBjbGFzcyBpbnN0YW5jZSBwcm90b3R5cGUgKHVzZWQgYnkgRGVidWcpXG4gICAgICAgIGNsYXNzSW5zdGFuY2UuZ2V0Q2xhc3NOYW1lID0gZnVuY3Rpb24gKCkge3JldHVybiBjbGFzc05hbWU7fTtcblxuICAgICAgICByZXR1cm4gY2xhc3NJbnN0YW5jZTtcbiAgICB9XG5cbiAgICBpbnN0YW5jZSA9IHtcbiAgICAgICAgZXh0ZW5kOiBleHRlbmQsXG4gICAgICAgIGdldFNpbmdsZXRvbkluc3RhbmNlOiBnZXRTaW5nbGV0b25JbnN0YW5jZSxcbiAgICAgICAgc2V0U2luZ2xldG9uSW5zdGFuY2U6IHNldFNpbmdsZXRvbkluc3RhbmNlLFxuICAgICAgICBkZWxldGVTaW5nbGV0b25JbnN0YW5jZXM6IGRlbGV0ZVNpbmdsZXRvbkluc3RhbmNlcyxcbiAgICAgICAgZ2V0U2luZ2xldG9uRmFjdG9yeTogZ2V0U2luZ2xldG9uRmFjdG9yeSxcbiAgICAgICAgZ2V0U2luZ2xldG9uRmFjdG9yeUJ5TmFtZTogZ2V0U2luZ2xldG9uRmFjdG9yeUJ5TmFtZSxcbiAgICAgICAgdXBkYXRlU2luZ2xldG9uRmFjdG9yeTogdXBkYXRlU2luZ2xldG9uRmFjdG9yeSxcbiAgICAgICAgZ2V0Q2xhc3NGYWN0b3J5OiBnZXRDbGFzc0ZhY3RvcnksXG4gICAgICAgIGdldENsYXNzRmFjdG9yeUJ5TmFtZTogZ2V0Q2xhc3NGYWN0b3J5QnlOYW1lLFxuICAgICAgICB1cGRhdGVDbGFzc0ZhY3Rvcnk6IHVwZGF0ZUNsYXNzRmFjdG9yeVxuICAgIH07XG5cbiAgICByZXR1cm4gaW5zdGFuY2U7XG5cbn0oKSk7XG5cbmV4cG9ydCBkZWZhdWx0IEZhY3RvcnlNYWtlcjtcbiIsIi8qKlxuICogVGhlIGNvcHlyaWdodCBpbiB0aGlzIHNvZnR3YXJlIGlzIGJlaW5nIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSBCU0QgTGljZW5zZSxcbiAqIGluY2x1ZGVkIGJlbG93LiBUaGlzIHNvZnR3YXJlIG1heSBiZSBzdWJqZWN0IHRvIG90aGVyIHRoaXJkIHBhcnR5IGFuZCBjb250cmlidXRvclxuICogcmlnaHRzLCBpbmNsdWRpbmcgcGF0ZW50IHJpZ2h0cywgYW5kIG5vIHN1Y2ggcmlnaHRzIGFyZSBncmFudGVkIHVuZGVyIHRoaXMgbGljZW5zZS5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMsIERhc2ggSW5kdXN0cnkgRm9ydW0uXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG4gKiBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAqICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAqICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vclxuICogIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4gKiAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIERhc2ggSW5kdXN0cnkgRm9ydW0gbm9yIHRoZSBuYW1lcyBvZiBpdHNcbiAqICBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlXG4gKiAgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gKlxuICogIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgQVMgSVMgQU5EIEFOWVxuICogIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbiAqICBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuXG4gKiAgSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCxcbiAqICBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUXG4gKiAgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLCBEQVRBLCBPUlxuICogIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLFxuICogIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSlcbiAqICBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRVxuICogIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG4vKipcbiAqIEBjbGFzc1xuICogQGlnbm9yZVxuICovXG5jbGFzcyBFcnJvcnNCYXNlIHtcbiAgICBleHRlbmQgKGVycm9ycywgY29uZmlnKSB7XG4gICAgICAgIGlmICghZXJyb3JzKSByZXR1cm47XG5cbiAgICAgICAgbGV0IG92ZXJyaWRlID0gY29uZmlnID8gY29uZmlnLm92ZXJyaWRlIDogZmFsc2U7XG4gICAgICAgIGxldCBwdWJsaWNPbmx5ID0gY29uZmlnID8gY29uZmlnLnB1YmxpY09ubHkgOiBmYWxzZTtcblxuXG4gICAgICAgIGZvciAoY29uc3QgZXJyIGluIGVycm9ycykge1xuICAgICAgICAgICAgaWYgKCFlcnJvcnMuaGFzT3duUHJvcGVydHkoZXJyKSB8fCAodGhpc1tlcnJdICYmICFvdmVycmlkZSkpIGNvbnRpbnVlO1xuICAgICAgICAgICAgaWYgKHB1YmxpY09ubHkgJiYgZXJyb3JzW2Vycl0uaW5kZXhPZigncHVibGljXycpID09PSAtMSkgY29udGludWU7XG4gICAgICAgICAgICB0aGlzW2Vycl0gPSBlcnJvcnNbZXJyXTtcblxuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBFcnJvcnNCYXNlOyIsIi8qKlxuICogVGhlIGNvcHlyaWdodCBpbiB0aGlzIHNvZnR3YXJlIGlzIGJlaW5nIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSBCU0QgTGljZW5zZSxcbiAqIGluY2x1ZGVkIGJlbG93LiBUaGlzIHNvZnR3YXJlIG1heSBiZSBzdWJqZWN0IHRvIG90aGVyIHRoaXJkIHBhcnR5IGFuZCBjb250cmlidXRvclxuICogcmlnaHRzLCBpbmNsdWRpbmcgcGF0ZW50IHJpZ2h0cywgYW5kIG5vIHN1Y2ggcmlnaHRzIGFyZSBncmFudGVkIHVuZGVyIHRoaXMgbGljZW5zZS5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMsIERhc2ggSW5kdXN0cnkgRm9ydW0uXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG4gKiBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAqICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAqICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vclxuICogIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4gKiAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIERhc2ggSW5kdXN0cnkgRm9ydW0gbm9yIHRoZSBuYW1lcyBvZiBpdHNcbiAqICBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlXG4gKiAgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gKlxuICogIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgQVMgSVMgQU5EIEFOWVxuICogIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbiAqICBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuXG4gKiAgSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCxcbiAqICBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUXG4gKiAgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLCBEQVRBLCBPUlxuICogIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLFxuICogIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSlcbiAqICBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRVxuICogIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG4vKipcbiAqIEBjbGFzc1xuICogQGlnbm9yZVxuICovXG5jbGFzcyBFdmVudHNCYXNlIHtcbiAgICBleHRlbmQgKGV2ZW50cywgY29uZmlnKSB7XG4gICAgICAgIGlmICghZXZlbnRzKSByZXR1cm47XG5cbiAgICAgICAgbGV0IG92ZXJyaWRlID0gY29uZmlnID8gY29uZmlnLm92ZXJyaWRlIDogZmFsc2U7XG4gICAgICAgIGxldCBwdWJsaWNPbmx5ID0gY29uZmlnID8gY29uZmlnLnB1YmxpY09ubHkgOiBmYWxzZTtcblxuXG4gICAgICAgIGZvciAoY29uc3QgZXZ0IGluIGV2ZW50cykge1xuICAgICAgICAgICAgaWYgKCFldmVudHMuaGFzT3duUHJvcGVydHkoZXZ0KSB8fCAodGhpc1tldnRdICYmICFvdmVycmlkZSkpIGNvbnRpbnVlO1xuICAgICAgICAgICAgaWYgKHB1YmxpY09ubHkgJiYgZXZlbnRzW2V2dF0uaW5kZXhPZigncHVibGljXycpID09PSAtMSkgY29udGludWU7XG4gICAgICAgICAgICB0aGlzW2V2dF0gPSBldmVudHNbZXZ0XTtcblxuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBFdmVudHNCYXNlOyIsIi8qKlxuICogVGhlIGNvcHlyaWdodCBpbiB0aGlzIHNvZnR3YXJlIGlzIGJlaW5nIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSBCU0QgTGljZW5zZSxcbiAqIGluY2x1ZGVkIGJlbG93LiBUaGlzIHNvZnR3YXJlIG1heSBiZSBzdWJqZWN0IHRvIG90aGVyIHRoaXJkIHBhcnR5IGFuZCBjb250cmlidXRvclxuICogcmlnaHRzLCBpbmNsdWRpbmcgcGF0ZW50IHJpZ2h0cywgYW5kIG5vIHN1Y2ggcmlnaHRzIGFyZSBncmFudGVkIHVuZGVyIHRoaXMgbGljZW5zZS5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMsIERhc2ggSW5kdXN0cnkgRm9ydW0uXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG4gKiBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAqICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAqICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vclxuICogIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4gKiAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIERhc2ggSW5kdXN0cnkgRm9ydW0gbm9yIHRoZSBuYW1lcyBvZiBpdHNcbiAqICBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlXG4gKiAgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gKlxuICogIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgQVMgSVMgQU5EIEFOWVxuICogIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbiAqICBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuXG4gKiAgSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCxcbiAqICBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUXG4gKiAgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLCBEQVRBLCBPUlxuICogIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLFxuICogIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSlcbiAqICBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRVxuICogIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG5cbmltcG9ydCBGcmFnbWVudFJlcXVlc3QgZnJvbSAnLi4vc3RyZWFtaW5nL3ZvL0ZyYWdtZW50UmVxdWVzdCc7XG5pbXBvcnQge0hUVFBSZXF1ZXN0fSBmcm9tICcuLi9zdHJlYW1pbmcvdm8vbWV0cmljcy9IVFRQUmVxdWVzdCc7XG5cbmZ1bmN0aW9uIE1zc0ZyYWdtZW50SW5mb0NvbnRyb2xsZXIoY29uZmlnKSB7XG5cbiAgICBjb25maWcgPSBjb25maWcgfHwge307XG5cbiAgICBsZXQgaW5zdGFuY2UsXG4gICAgICAgIGxvZ2dlcixcbiAgICAgICAgZnJhZ21lbnRNb2RlbCxcbiAgICAgICAgc3RhcnRlZCxcbiAgICAgICAgdHlwZSxcbiAgICAgICAgbG9hZEZyYWdtZW50VGltZW91dCxcbiAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICBzdGFydEZyYWdtZW50VGltZSxcbiAgICAgICAgaW5kZXg7XG5cbiAgICBjb25zdCBzdHJlYW1Qcm9jZXNzb3IgPSBjb25maWcuc3RyZWFtUHJvY2Vzc29yO1xuICAgIGNvbnN0IGJhc2VVUkxDb250cm9sbGVyID0gY29uZmlnLmJhc2VVUkxDb250cm9sbGVyO1xuICAgIGNvbnN0IGRlYnVnID0gY29uZmlnLmRlYnVnO1xuICAgIGNvbnN0IGNvbnRyb2xsZXJUeXBlID0gJ01zc0ZyYWdtZW50SW5mb0NvbnRyb2xsZXInO1xuXG4gICAgZnVuY3Rpb24gc2V0dXAoKSB7XG4gICAgICAgIGxvZ2dlciA9IGRlYnVnLmdldExvZ2dlcihpbnN0YW5jZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcbiAgICAgICAgdHlwZSA9IHN0cmVhbVByb2Nlc3Nvci5nZXRUeXBlKCk7XG4gICAgICAgIGZyYWdtZW50TW9kZWwgPSBzdHJlYW1Qcm9jZXNzb3IuZ2V0RnJhZ21lbnRNb2RlbCgpO1xuXG4gICAgICAgIHN0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgc3RhcnRUaW1lID0gbnVsbDtcbiAgICAgICAgc3RhcnRGcmFnbWVudFRpbWUgPSBudWxsO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0YXJ0KCkge1xuICAgICAgICBpZiAoc3RhcnRlZCkgcmV0dXJuO1xuXG4gICAgICAgIGxvZ2dlci5kZWJ1ZygnU3RhcnQnKTtcblxuICAgICAgICBzdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgaW5kZXggPSAwO1xuXG4gICAgICAgIGxvYWROZXh0RnJhZ21lbnRJbmZvKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3RvcCgpIHtcbiAgICAgICAgaWYgKCFzdGFydGVkKSByZXR1cm47XG5cbiAgICAgICAgbG9nZ2VyLmRlYnVnKCdTdG9wJyk7XG5cbiAgICAgICAgY2xlYXJUaW1lb3V0KGxvYWRGcmFnbWVudFRpbWVvdXQpO1xuICAgICAgICBzdGFydGVkID0gZmFsc2U7XG4gICAgICAgIHN0YXJ0VGltZSA9IG51bGw7XG4gICAgICAgIHN0YXJ0RnJhZ21lbnRUaW1lID0gbnVsbDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICAgICAgc3RvcCgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxvYWROZXh0RnJhZ21lbnRJbmZvKCkge1xuICAgICAgICBpZiAoIXN0YXJ0ZWQpIHJldHVybjtcblxuICAgICAgICAvLyBHZXQgbGFzdCBzZWdtZW50IGZyb20gU2VnbWVudFRpbWVsaW5lXG4gICAgICAgIGNvbnN0IHJlcHJlc2VudGF0aW9uID0gZ2V0Q3VycmVudFJlcHJlc2VudGF0aW9uKCk7XG4gICAgICAgIGNvbnN0IG1hbmlmZXN0ID0gcmVwcmVzZW50YXRpb24uYWRhcHRhdGlvbi5wZXJpb2QubXBkLm1hbmlmZXN0O1xuICAgICAgICBjb25zdCBhZGFwdGF0aW9uID0gbWFuaWZlc3QuUGVyaW9kX2FzQXJyYXlbcmVwcmVzZW50YXRpb24uYWRhcHRhdGlvbi5wZXJpb2QuaW5kZXhdLkFkYXB0YXRpb25TZXRfYXNBcnJheVtyZXByZXNlbnRhdGlvbi5hZGFwdGF0aW9uLmluZGV4XTtcbiAgICAgICAgY29uc3Qgc2VnbWVudHMgPSBhZGFwdGF0aW9uLlNlZ21lbnRUZW1wbGF0ZS5TZWdtZW50VGltZWxpbmUuU19hc0FycmF5O1xuICAgICAgICBjb25zdCBzZWdtZW50ID0gc2VnbWVudHNbc2VnbWVudHMubGVuZ3RoIC0gMV07XG5cbiAgICAgICAgLy8gbG9nZ2VyLmRlYnVnKCdMYXN0IGZyYWdtZW50IHRpbWU6ICcgKyAoc2VnbWVudC50IC8gYWRhcHRhdGlvbi5TZWdtZW50VGVtcGxhdGUudGltZXNjYWxlKSk7XG5cbiAgICAgICAgLy8gR2VuZXJhdGUgc2VnbWVudCByZXF1ZXN0XG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSBnZXRSZXF1ZXN0Rm9yU2VnbWVudChhZGFwdGF0aW9uLCByZXByZXNlbnRhdGlvbiwgc2VnbWVudCk7XG5cbiAgICAgICAgLy8gU2VuZCBzZWdtZW50IHJlcXVlc3RcbiAgICAgICAgcmVxdWVzdEZyYWdtZW50LmNhbGwodGhpcywgcmVxdWVzdCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0UmVxdWVzdEZvclNlZ21lbnQoYWRhcHRhdGlvbiwgcmVwcmVzZW50YXRpb24sIHNlZ21lbnQpIHtcbiAgICAgICAgbGV0IHRpbWVzY2FsZSA9IGFkYXB0YXRpb24uU2VnbWVudFRlbXBsYXRlLnRpbWVzY2FsZTtcbiAgICAgICAgbGV0IHJlcXVlc3QgPSBuZXcgRnJhZ21lbnRSZXF1ZXN0KCk7XG5cbiAgICAgICAgcmVxdWVzdC5tZWRpYVR5cGUgPSB0eXBlO1xuICAgICAgICByZXF1ZXN0LnR5cGUgPSBIVFRQUmVxdWVzdC5NU1NfRlJBR01FTlRfSU5GT19TRUdNRU5UX1RZUEU7XG4gICAgICAgIC8vIHJlcXVlc3QucmFuZ2UgPSBzZWdtZW50Lm1lZGlhUmFuZ2U7XG4gICAgICAgIHJlcXVlc3Quc3RhcnRUaW1lID0gc2VnbWVudC50IC8gdGltZXNjYWxlO1xuICAgICAgICByZXF1ZXN0LmR1cmF0aW9uID0gc2VnbWVudC5kIC8gdGltZXNjYWxlO1xuICAgICAgICByZXF1ZXN0LnRpbWVzY2FsZSA9IHRpbWVzY2FsZTtcbiAgICAgICAgLy8gcmVxdWVzdC5hdmFpbGFiaWxpdHlTdGFydFRpbWUgPSBzZWdtZW50LmF2YWlsYWJpbGl0eVN0YXJ0VGltZTtcbiAgICAgICAgLy8gcmVxdWVzdC5hdmFpbGFiaWxpdHlFbmRUaW1lID0gc2VnbWVudC5hdmFpbGFiaWxpdHlFbmRUaW1lO1xuICAgICAgICAvLyByZXF1ZXN0LndhbGxTdGFydFRpbWUgPSBzZWdtZW50LndhbGxTdGFydFRpbWU7XG4gICAgICAgIHJlcXVlc3QucXVhbGl0eSA9IHJlcHJlc2VudGF0aW9uLmluZGV4O1xuICAgICAgICByZXF1ZXN0LmluZGV4ID0gaW5kZXgrKztcbiAgICAgICAgcmVxdWVzdC5tZWRpYUluZm8gPSBzdHJlYW1Qcm9jZXNzb3IuZ2V0TWVkaWFJbmZvKCk7XG4gICAgICAgIHJlcXVlc3QuYWRhcHRhdGlvbkluZGV4ID0gcmVwcmVzZW50YXRpb24uYWRhcHRhdGlvbi5pbmRleDtcbiAgICAgICAgcmVxdWVzdC5yZXByZXNlbnRhdGlvbklkID0gcmVwcmVzZW50YXRpb24uaWQ7XG4gICAgICAgIHJlcXVlc3QudXJsID0gYmFzZVVSTENvbnRyb2xsZXIucmVzb2x2ZShyZXByZXNlbnRhdGlvbi5wYXRoKS51cmwgKyBhZGFwdGF0aW9uLlNlZ21lbnRUZW1wbGF0ZS5tZWRpYTtcbiAgICAgICAgcmVxdWVzdC51cmwgPSByZXF1ZXN0LnVybC5yZXBsYWNlKCckQmFuZHdpZHRoJCcsIHJlcHJlc2VudGF0aW9uLmJhbmR3aWR0aCk7XG4gICAgICAgIHJlcXVlc3QudXJsID0gcmVxdWVzdC51cmwucmVwbGFjZSgnJFRpbWUkJywgc2VnbWVudC50TWFuaWZlc3QgPyBzZWdtZW50LnRNYW5pZmVzdCA6IHNlZ21lbnQudCk7XG4gICAgICAgIHJlcXVlc3QudXJsID0gcmVxdWVzdC51cmwucmVwbGFjZSgnL0ZyYWdtZW50cygnLCAnL0ZyYWdtZW50SW5mbygnKTtcblxuICAgICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRDdXJyZW50UmVwcmVzZW50YXRpb24oKSB7XG4gICAgICAgIGNvbnN0IHJlcHJlc2VudGF0aW9uQ29udHJvbGxlciA9IHN0cmVhbVByb2Nlc3Nvci5nZXRSZXByZXNlbnRhdGlvbkNvbnRyb2xsZXIoKTtcbiAgICAgICAgY29uc3QgcmVwcmVzZW50YXRpb24gPSByZXByZXNlbnRhdGlvbkNvbnRyb2xsZXIuZ2V0Q3VycmVudFJlcHJlc2VudGF0aW9uKCk7XG4gICAgICAgIHJldHVybiByZXByZXNlbnRhdGlvbjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXF1ZXN0RnJhZ21lbnQocmVxdWVzdCkge1xuICAgICAgICAvLyBsb2dnZXIuZGVidWcoJ0xvYWQgRnJhZ21lbnRJbmZvIGZvciB0aW1lOiAnICsgcmVxdWVzdC5zdGFydFRpbWUpO1xuICAgICAgICBpZiAoc3RyZWFtUHJvY2Vzc29yLmdldEZyYWdtZW50TW9kZWwoKS5pc0ZyYWdtZW50TG9hZGVkT3JQZW5kaW5nKHJlcXVlc3QpKSB7XG4gICAgICAgICAgICAvLyBXZSBtYXkgaGF2ZSByZWFjaGVkIGVuZCBvZiB0aW1lbGluZSBpbiBjYXNlIG9mIHN0YXJ0LW92ZXIgc3RyZWFtc1xuICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKCdFbmQgb2YgdGltZWxpbmUnKTtcbiAgICAgICAgICAgIHN0b3AoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGZyYWdtZW50TW9kZWwuZXhlY3V0ZVJlcXVlc3QocmVxdWVzdCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZnJhZ21lbnRJbmZvTG9hZGVkIChlKSB7XG4gICAgICAgIGlmICghc3RhcnRlZCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSBlLnJlcXVlc3Q7XG4gICAgICAgIGlmICghZS5yZXNwb25zZSkge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdMb2FkIGVycm9yJywgcmVxdWVzdC51cmwpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGRlbHRhRnJhZ21lbnRUaW1lLFxuICAgICAgICAgICAgZGVsdGFUaW1lLFxuICAgICAgICAgICAgZGVsYXk7XG5cbiAgICAgICAgLy8gbG9nZ2VyLmRlYnVnKCdGcmFnbWVudEluZm8gbG9hZGVkOiAnLCByZXF1ZXN0LnVybCk7XG5cbiAgICAgICAgaWYgKHN0YXJ0VGltZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgc3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXN0YXJ0RnJhZ21lbnRUaW1lKSB7XG4gICAgICAgICAgICBzdGFydEZyYWdtZW50VGltZSA9IHJlcXVlc3Quc3RhcnRUaW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGV0ZXJtaW5lIGRlbGF5IGJlZm9yZSByZXF1ZXN0aW5nIG5leHQgRnJhZ21lbnRJbmZvXG4gICAgICAgIGRlbHRhVGltZSA9IChuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHN0YXJ0VGltZSkgLyAxMDAwO1xuICAgICAgICBkZWx0YUZyYWdtZW50VGltZSA9IChyZXF1ZXN0LnN0YXJ0VGltZSArIHJlcXVlc3QuZHVyYXRpb24pIC0gc3RhcnRGcmFnbWVudFRpbWU7XG4gICAgICAgIGRlbGF5ID0gTWF0aC5tYXgoMCwgKGRlbHRhRnJhZ21lbnRUaW1lIC0gZGVsdGFUaW1lKSk7XG5cbiAgICAgICAgLy8gU2V0IHRpbWVvdXQgZm9yIHJlcXVlc3RpbmcgbmV4dCBGcmFnbWVudEluZm9cbiAgICAgICAgY2xlYXJUaW1lb3V0KGxvYWRGcmFnbWVudFRpbWVvdXQpO1xuICAgICAgICBsb2FkRnJhZ21lbnRUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsb2FkRnJhZ21lbnRUaW1lb3V0ID0gbnVsbDtcbiAgICAgICAgICAgIGxvYWROZXh0RnJhZ21lbnRJbmZvKCk7XG4gICAgICAgIH0sIGRlbGF5ICogMTAwMCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0VHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIHR5cGU7XG4gICAgfVxuXG4gICAgaW5zdGFuY2UgPSB7XG4gICAgICAgIGluaXRpYWxpemU6IGluaXRpYWxpemUsXG4gICAgICAgIGNvbnRyb2xsZXJUeXBlOiBjb250cm9sbGVyVHlwZSxcbiAgICAgICAgc3RhcnQ6IHN0YXJ0LFxuICAgICAgICBmcmFnbWVudEluZm9Mb2FkZWQ6IGZyYWdtZW50SW5mb0xvYWRlZCxcbiAgICAgICAgZ2V0VHlwZTogZ2V0VHlwZSxcbiAgICAgICAgcmVzZXQ6IHJlc2V0XG4gICAgfTtcblxuICAgIHNldHVwKCk7XG5cbiAgICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbk1zc0ZyYWdtZW50SW5mb0NvbnRyb2xsZXIuX19kYXNoanNfZmFjdG9yeV9uYW1lID0gJ01zc0ZyYWdtZW50SW5mb0NvbnRyb2xsZXInO1xuZXhwb3J0IGRlZmF1bHQgZGFzaGpzLkZhY3RvcnlNYWtlci5nZXRDbGFzc0ZhY3RvcnkoTXNzRnJhZ21lbnRJbmZvQ29udHJvbGxlcik7IC8qIGpzaGludCBpZ25vcmU6bGluZSAqL1xuIiwiLyoqXG4gKiBUaGUgY29weXJpZ2h0IGluIHRoaXMgc29mdHdhcmUgaXMgYmVpbmcgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIEJTRCBMaWNlbnNlLFxuICogaW5jbHVkZWQgYmVsb3cuIFRoaXMgc29mdHdhcmUgbWF5IGJlIHN1YmplY3QgdG8gb3RoZXIgdGhpcmQgcGFydHkgYW5kIGNvbnRyaWJ1dG9yXG4gKiByaWdodHMsIGluY2x1ZGluZyBwYXRlbnQgcmlnaHRzLCBhbmQgbm8gc3VjaCByaWdodHMgYXJlIGdyYW50ZWQgdW5kZXIgdGhpcyBsaWNlbnNlLlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMywgRGFzaCBJbmR1c3RyeSBGb3J1bS5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbiAqIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICogIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICogIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yXG4gKiAgb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbiAqICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgRGFzaCBJbmR1c3RyeSBGb3J1bSBub3IgdGhlIG5hbWVzIG9mIGl0c1xuICogIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmVcbiAqICB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbiAqXG4gKiAgVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBBUyBJUyBBTkQgQU5ZXG4gKiAgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuICogIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC5cbiAqICBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULFxuICogIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVRcbiAqICBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SXG4gKiAgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksXG4gKiAgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKVxuICogIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFXG4gKiAgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKi9cbmltcG9ydCBEYXNoSlNFcnJvciBmcm9tICcuLi9zdHJlYW1pbmcvdm8vRGFzaEpTRXJyb3InO1xuaW1wb3J0IE1zc0Vycm9ycyBmcm9tICcuL2Vycm9ycy9Nc3NFcnJvcnMnO1xuXG5pbXBvcnQgRXZlbnRzIGZyb20gJy4uL3N0cmVhbWluZy9NZWRpYVBsYXllckV2ZW50cyc7XG5cbi8qKlxuICogQG1vZHVsZSBNc3NGcmFnbWVudE1vb2ZQcm9jZXNzb3JcbiAqIEBpZ25vcmVcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgb2JqZWN0XG4gKi9cbmZ1bmN0aW9uIE1zc0ZyYWdtZW50TW9vZlByb2Nlc3Nvcihjb25maWcpIHtcblxuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcbiAgICBsZXQgaW5zdGFuY2UsXG4gICAgICAgIHR5cGUsXG4gICAgICAgIGxvZ2dlcjtcbiAgICBjb25zdCBkYXNoTWV0cmljcyA9IGNvbmZpZy5kYXNoTWV0cmljcztcbiAgICBjb25zdCBwbGF5YmFja0NvbnRyb2xsZXIgPSBjb25maWcucGxheWJhY2tDb250cm9sbGVyO1xuICAgIGNvbnN0IGVycm9ySGFuZGxlciA9IGNvbmZpZy5lcnJIYW5kbGVyO1xuICAgIGNvbnN0IGV2ZW50QnVzID0gY29uZmlnLmV2ZW50QnVzO1xuICAgIGNvbnN0IElTT0JveGVyID0gY29uZmlnLklTT0JveGVyO1xuICAgIGNvbnN0IGRlYnVnID0gY29uZmlnLmRlYnVnO1xuXG4gICAgZnVuY3Rpb24gc2V0dXAoKSB7XG4gICAgICAgIGxvZ2dlciA9IGRlYnVnLmdldExvZ2dlcihpbnN0YW5jZSk7XG4gICAgICAgIHR5cGUgPSAnJztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwcm9jZXNzVGZyZihyZXF1ZXN0LCB0ZnJmLCB0ZmR0LCBzdHJlYW1Qcm9jZXNzb3IpIHtcbiAgICAgICAgY29uc3QgcmVwcmVzZW50YXRpb25Db250cm9sbGVyID0gc3RyZWFtUHJvY2Vzc29yLmdldFJlcHJlc2VudGF0aW9uQ29udHJvbGxlcigpO1xuICAgICAgICBjb25zdCByZXByZXNlbnRhdGlvbiA9IHJlcHJlc2VudGF0aW9uQ29udHJvbGxlci5nZXRDdXJyZW50UmVwcmVzZW50YXRpb24oKTtcblxuICAgICAgICBjb25zdCBtYW5pZmVzdCA9IHJlcHJlc2VudGF0aW9uLmFkYXB0YXRpb24ucGVyaW9kLm1wZC5tYW5pZmVzdDtcbiAgICAgICAgY29uc3QgYWRhcHRhdGlvbiA9IG1hbmlmZXN0LlBlcmlvZF9hc0FycmF5W3JlcHJlc2VudGF0aW9uLmFkYXB0YXRpb24ucGVyaW9kLmluZGV4XS5BZGFwdGF0aW9uU2V0X2FzQXJyYXlbcmVwcmVzZW50YXRpb24uYWRhcHRhdGlvbi5pbmRleF07XG4gICAgICAgIGNvbnN0IHRpbWVzY2FsZSA9IGFkYXB0YXRpb24uU2VnbWVudFRlbXBsYXRlLnRpbWVzY2FsZTtcblxuICAgICAgICB0eXBlID0gc3RyZWFtUHJvY2Vzc29yLmdldFR5cGUoKTtcblxuICAgICAgICAvLyBQcm9jZXNzIHRmcmYgb25seSBmb3IgbGl2ZSBzdHJlYW1zIG9yIHN0YXJ0LW92ZXIgc3RhdGljIHN0cmVhbXMgKHRpbWVTaGlmdEJ1ZmZlckRlcHRoID4gMClcbiAgICAgICAgaWYgKG1hbmlmZXN0LnR5cGUgIT09ICdkeW5hbWljJyAmJiAhbWFuaWZlc3QudGltZVNoaWZ0QnVmZmVyRGVwdGgpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGZyZikge1xuICAgICAgICAgICAgZXJyb3JIYW5kbGVyLmVycm9yKG5ldyBEYXNoSlNFcnJvcihNc3NFcnJvcnMuTVNTX05PX1RGUkZfQ09ERSwgTXNzRXJyb3JzLk1TU19OT19URlJGX01FU1NBR0UpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdldCBhZGFwdGF0aW9uJ3Mgc2VnbWVudCB0aW1lbGluZSAoYWx3YXlzIGEgU2VnbWVudFRpbWVsaW5lIGluIFNtb290aCBTdHJlYW1pbmcgdXNlIGNhc2UpXG4gICAgICAgIGNvbnN0IHNlZ21lbnRzID0gYWRhcHRhdGlvbi5TZWdtZW50VGVtcGxhdGUuU2VnbWVudFRpbWVsaW5lLlM7XG4gICAgICAgIGNvbnN0IGVudHJpZXMgPSB0ZnJmLmVudHJ5O1xuICAgICAgICBsZXQgZW50cnksXG4gICAgICAgICAgICBzZWdtZW50VGltZSxcbiAgICAgICAgICAgIHJhbmdlO1xuICAgICAgICBsZXQgc2VnbWVudCA9IG51bGw7XG4gICAgICAgIGxldCB0ID0gMDtcbiAgICAgICAgbGV0IGVuZFRpbWU7XG4gICAgICAgIGxldCBhdmFpbGFiaWxpdHlTdGFydFRpbWUgPSBudWxsO1xuXG4gICAgICAgIGlmIChlbnRyaWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ29uc2lkZXIgb25seSBmaXJzdCB0ZnJmIGVudHJ5ICh0byBhdm9pZCBwcmUtY29uZGl0aW9uIGZhaWx1cmUgb24gZnJhZ21lbnQgaW5mbyByZXF1ZXN0cylcbiAgICAgICAgZW50cnkgPSBlbnRyaWVzWzBdO1xuXG4gICAgICAgIC8vIEluIGNhc2Ugb2Ygc3RhcnQtb3ZlciBzdHJlYW1zLCBjaGVjayBpZiB3ZSBoYXZlIHJlYWNoZWQgZW5kIG9mIG9yaWdpbmFsIG1hbmlmZXN0IGR1cmF0aW9uIChzZXQgaW4gdGltZVNoaWZ0QnVmZmVyRGVwdGgpXG4gICAgICAgIC8vID0+IHRoZW4gZG8gbm90IHVwZGF0ZSBhbnltb3JlIHRpbWVsaW5lXG4gICAgICAgIGlmIChtYW5pZmVzdC50eXBlID09PSAnc3RhdGljJykge1xuICAgICAgICAgICAgLy8gR2V0IGZpcnN0IHNlZ21lbnQgdGltZVxuICAgICAgICAgICAgc2VnbWVudFRpbWUgPSBzZWdtZW50c1swXS50TWFuaWZlc3QgPyBwYXJzZUZsb2F0KHNlZ21lbnRzWzBdLnRNYW5pZmVzdCkgOiBzZWdtZW50c1swXS50O1xuICAgICAgICAgICAgaWYgKGVudHJ5LmZyYWdtZW50X2Fic29sdXRlX3RpbWUgPiAoc2VnbWVudFRpbWUgKyAobWFuaWZlc3QudGltZVNoaWZ0QnVmZmVyRGVwdGggKiB0aW1lc2NhbGUpKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGxvZ2dlci5kZWJ1ZygnZW50cnkgLSB0ID0gJywgKGVudHJ5LmZyYWdtZW50X2Fic29sdXRlX3RpbWUgLyB0aW1lc2NhbGUpKTtcblxuICAgICAgICAvLyBHZXQgbGFzdCBzZWdtZW50IHRpbWVcbiAgICAgICAgc2VnbWVudFRpbWUgPSBzZWdtZW50c1tzZWdtZW50cy5sZW5ndGggLSAxXS50TWFuaWZlc3QgPyBwYXJzZUZsb2F0KHNlZ21lbnRzW3NlZ21lbnRzLmxlbmd0aCAtIDFdLnRNYW5pZmVzdCkgOiBzZWdtZW50c1tzZWdtZW50cy5sZW5ndGggLSAxXS50O1xuICAgICAgICAvLyBsb2dnZXIuZGVidWcoJ0xhc3Qgc2VnbWVudCAtIHQgPSAnLCAoc2VnbWVudFRpbWUgLyB0aW1lc2NhbGUpKTtcblxuICAgICAgICAvLyBDaGVjayBpZiB3ZSBoYXZlIHRvIGFwcGVuZCBuZXcgc2VnbWVudCB0byB0aW1lbGluZVxuICAgICAgICBpZiAoZW50cnkuZnJhZ21lbnRfYWJzb2x1dGVfdGltZSA8PSBzZWdtZW50VGltZSkge1xuICAgICAgICAgICAgLy8gVXBkYXRlIERWUiB3aW5kb3cgcmFuZ2UgPT4gc2V0IHJhbmdlIGVuZCB0byBlbmQgdGltZSBvZiBjdXJyZW50IHNlZ21lbnRcbiAgICAgICAgICAgIHJhbmdlID0ge1xuICAgICAgICAgICAgICAgIHN0YXJ0OiBzZWdtZW50c1swXS50IC8gdGltZXNjYWxlLFxuICAgICAgICAgICAgICAgIGVuZDogKHRmZHQuYmFzZU1lZGlhRGVjb2RlVGltZSAvIHRpbWVzY2FsZSkgKyByZXF1ZXN0LmR1cmF0aW9uXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB1cGRhdGVEVlIocmVxdWVzdC5tZWRpYVR5cGUsIHJhbmdlLCBzdHJlYW1Qcm9jZXNzb3IuZ2V0U3RyZWFtSW5mbygpLm1hbmlmZXN0SW5mbyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBsb2dnZXIuZGVidWcoJ0FkZCBuZXcgc2VnbWVudCAtIHQgPSAnLCAoZW50cnkuZnJhZ21lbnRfYWJzb2x1dGVfdGltZSAvIHRpbWVzY2FsZSkpO1xuICAgICAgICBzZWdtZW50ID0ge307XG4gICAgICAgIHNlZ21lbnQudCA9IGVudHJ5LmZyYWdtZW50X2Fic29sdXRlX3RpbWU7XG4gICAgICAgIHNlZ21lbnQuZCA9IGVudHJ5LmZyYWdtZW50X2R1cmF0aW9uO1xuICAgICAgICAvLyBJZiB0aW1lc3RhbXBzIHN0YXJ0cyBhdCAwIHJlbGF0aXZlIHRvIDFzdCBzZWdtZW50IChkeW5hbWljIHRvIHN0YXRpYykgdGhlbiB1cGRhdGUgc2VnbWVudCB0aW1lXG4gICAgICAgIGlmIChzZWdtZW50c1swXS50TWFuaWZlc3QpIHtcbiAgICAgICAgICAgIHNlZ21lbnQudCAtPSBwYXJzZUZsb2F0KHNlZ21lbnRzWzBdLnRNYW5pZmVzdCkgLSBzZWdtZW50c1swXS50O1xuICAgICAgICAgICAgc2VnbWVudC50TWFuaWZlc3QgPSBlbnRyeS5mcmFnbWVudF9hYnNvbHV0ZV90aW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUGF0Y2ggcHJldmlvdXMgc2VnbWVudCBkdXJhdGlvblxuICAgICAgICBsZXQgbGFzdFNlZ21lbnQgPSBzZWdtZW50c1tzZWdtZW50cy5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKGxhc3RTZWdtZW50LnQgKyBsYXN0U2VnbWVudC5kICE9PSBzZWdtZW50LnQpIHtcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnUGF0Y2ggc2VnbWVudCBkdXJhdGlvbiAtIHQgPSAnLCBsYXN0U2VnbWVudC50ICsgJywgZCA9ICcgKyBsYXN0U2VnbWVudC5kICsgJyA9PiAnICsgKHNlZ21lbnQudCAtIGxhc3RTZWdtZW50LnQpKTtcbiAgICAgICAgICAgIGxhc3RTZWdtZW50LmQgPSBzZWdtZW50LnQgLSBsYXN0U2VnbWVudC50O1xuICAgICAgICB9XG5cbiAgICAgICAgc2VnbWVudHMucHVzaChzZWdtZW50KTtcblxuICAgICAgICAvLyBJbiBjYXNlIG9mIHN0YXRpYyBzdGFydC1vdmVyIHN0cmVhbXMsIHVwZGF0ZSBjb250ZW50IGR1cmF0aW9uXG4gICAgICAgIGlmIChtYW5pZmVzdC50eXBlID09PSAnc3RhdGljJykge1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICd2aWRlbycpIHtcbiAgICAgICAgICAgICAgICBzZWdtZW50ID0gc2VnbWVudHNbc2VnbWVudHMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgZW5kVGltZSA9IChzZWdtZW50LnQgKyBzZWdtZW50LmQpIC8gdGltZXNjYWxlO1xuICAgICAgICAgICAgICAgIGlmIChlbmRUaW1lID4gcmVwcmVzZW50YXRpb24uYWRhcHRhdGlvbi5wZXJpb2QuZHVyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRCdXMudHJpZ2dlcihFdmVudHMuTUFOSUZFU1RfVkFMSURJVFlfQ0hBTkdFRCwgeyBzZW5kZXI6IHRoaXMsIG5ld0R1cmF0aW9uOiBlbmRUaW1lIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIEluIGNhc2Ugb2YgbGl2ZSBzdHJlYW1zLCB1cGRhdGUgc2VnbWVudCB0aW1lbGluZSBhY2NvcmRpbmcgdG8gRFZSIHdpbmRvd1xuICAgICAgICAgICAgaWYgKG1hbmlmZXN0LnRpbWVTaGlmdEJ1ZmZlckRlcHRoICYmIG1hbmlmZXN0LnRpbWVTaGlmdEJ1ZmZlckRlcHRoID4gMCkge1xuICAgICAgICAgICAgICAgIC8vIEdldCB0aW1lc3RhbXAgb2YgdGhlIGxhc3Qgc2VnbWVudFxuICAgICAgICAgICAgICAgIHNlZ21lbnQgPSBzZWdtZW50c1tzZWdtZW50cy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICB0ID0gc2VnbWVudC50O1xuXG4gICAgICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIHRoZSBzZWdtZW50cycgYXZhaWxhYmlsaXR5IHN0YXJ0IHRpbWVcbiAgICAgICAgICAgICAgICBhdmFpbGFiaWxpdHlTdGFydFRpbWUgPSAodCAtIChtYW5pZmVzdC50aW1lU2hpZnRCdWZmZXJEZXB0aCAqIHRpbWVzY2FsZSkpIC8gdGltZXNjYWxlO1xuXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHNlZ21lbnRzIHByaW9yIHRvIGF2YWlsYWJpbGl0eSBzdGFydCB0aW1lXG4gICAgICAgICAgICAgICAgc2VnbWVudCA9IHNlZ21lbnRzWzBdO1xuICAgICAgICAgICAgICAgIGVuZFRpbWUgPSAoc2VnbWVudC50ICsgc2VnbWVudC5kKSAvIHRpbWVzY2FsZTtcbiAgICAgICAgICAgICAgICB3aGlsZSAoZW5kVGltZSA8IGF2YWlsYWJpbGl0eVN0YXJ0VGltZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiBub3QgY3VycmVudGx5IHBsYXlpbmcgdGhlIHNlZ21lbnQgdG8gYmUgcmVtb3ZlZFxuICAgICAgICAgICAgICAgICAgICBpZiAoIXBsYXliYWNrQ29udHJvbGxlci5pc1BhdXNlZCgpICYmIHBsYXliYWNrQ29udHJvbGxlci5nZXRUaW1lKCkgPCBlbmRUaW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBsb2dnZXIuZGVidWcoJ1JlbW92ZSBzZWdtZW50ICAtIHQgPSAnICsgKHNlZ21lbnQudCAvIHRpbWVzY2FsZSkpO1xuICAgICAgICAgICAgICAgICAgICBzZWdtZW50cy5zcGxpY2UoMCwgMSk7XG4gICAgICAgICAgICAgICAgICAgIHNlZ21lbnQgPSBzZWdtZW50c1swXTtcbiAgICAgICAgICAgICAgICAgICAgZW5kVGltZSA9ICAoc2VnbWVudC50ICsgc2VnbWVudC5kKSAvIHRpbWVzY2FsZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFVwZGF0ZSBEVlIgd2luZG93IHJhbmdlID0+IHNldCByYW5nZSBlbmQgdG8gZW5kIHRpbWUgb2YgY3VycmVudCBzZWdtZW50XG4gICAgICAgICAgICByYW5nZSA9IHtcbiAgICAgICAgICAgICAgICBzdGFydDogc2VnbWVudHNbMF0udCAvIHRpbWVzY2FsZSxcbiAgICAgICAgICAgICAgICBlbmQ6ICh0ZmR0LmJhc2VNZWRpYURlY29kZVRpbWUgLyB0aW1lc2NhbGUpICsgcmVxdWVzdC5kdXJhdGlvblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdXBkYXRlRFZSKHR5cGUsIHJhbmdlLCBzdHJlYW1Qcm9jZXNzb3IuZ2V0U3RyZWFtSW5mbygpLm1hbmlmZXN0SW5mbyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXByZXNlbnRhdGlvbkNvbnRyb2xsZXIudXBkYXRlUmVwcmVzZW50YXRpb24ocmVwcmVzZW50YXRpb24sIHRydWUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZURWUih0eXBlLCByYW5nZSwgbWFuaWZlc3RJbmZvKSB7XG4gICAgICAgIGlmICh0eXBlICE9PSAndmlkZW8nICYmIHR5cGUgIT09ICdhdWRpbycpIHJldHVybjtcbiAgICAgICAgY29uc3QgZHZySW5mb3MgPSBkYXNoTWV0cmljcy5nZXRDdXJyZW50RFZSSW5mbyh0eXBlKTtcbiAgICAgICAgaWYgKCFkdnJJbmZvcyB8fCAocmFuZ2UuZW5kID4gZHZySW5mb3MucmFuZ2UuZW5kKSkge1xuICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKCdVcGRhdGUgRFZSIHJhbmdlOiBbJyArIHJhbmdlLnN0YXJ0ICsgJyAtICcgKyByYW5nZS5lbmQgKyAnXScpO1xuICAgICAgICAgICAgZGFzaE1ldHJpY3MuYWRkRFZSSW5mbyh0eXBlLCBwbGF5YmFja0NvbnRyb2xsZXIuZ2V0VGltZSgpLCBtYW5pZmVzdEluZm8sIHJhbmdlKTtcbiAgICAgICAgICAgIHBsYXliYWNrQ29udHJvbGxlci51cGRhdGVDdXJyZW50VGltZSh0eXBlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgb2Zmc2V0IG9mIHRoZSAxc3QgYnl0ZSBvZiBhIGNoaWxkIGJveCB3aXRoaW4gYSBjb250YWluZXIgYm94XG4gICAgZnVuY3Rpb24gZ2V0Qm94T2Zmc2V0KHBhcmVudCwgdHlwZSkge1xuICAgICAgICBsZXQgb2Zmc2V0ID0gODtcbiAgICAgICAgbGV0IGkgPSAwO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBwYXJlbnQuYm94ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChwYXJlbnQuYm94ZXNbaV0udHlwZSA9PT0gdHlwZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBvZmZzZXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvZmZzZXQgKz0gcGFyZW50LmJveGVzW2ldLnNpemU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9mZnNldDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjb252ZXJ0RnJhZ21lbnQoZSwgc3RyZWFtUHJvY2Vzc29yKSB7XG4gICAgICAgIGxldCBpO1xuXG4gICAgICAgIC8vIGUucmVxdWVzdCBjb250YWlucyByZXF1ZXN0IGRlc2NyaXB0aW9uIG9iamVjdFxuICAgICAgICAvLyBlLnJlc3BvbnNlIGNvbnRhaW5zIGZyYWdtZW50IGJ5dGVzXG4gICAgICAgIGNvbnN0IGlzb0ZpbGUgPSBJU09Cb3hlci5wYXJzZUJ1ZmZlcihlLnJlc3BvbnNlKTtcbiAgICAgICAgLy8gVXBkYXRlIHRyYWNrX0lkIGluIHRmaGQgYm94XG4gICAgICAgIGNvbnN0IHRmaGQgPSBpc29GaWxlLmZldGNoKCd0ZmhkJyk7XG4gICAgICAgIHRmaGQudHJhY2tfSUQgPSBlLnJlcXVlc3QubWVkaWFJbmZvLmluZGV4ICsgMTtcblxuICAgICAgICAvLyBBZGQgdGZkdCBib3hcbiAgICAgICAgbGV0IHRmZHQgPSBpc29GaWxlLmZldGNoKCd0ZmR0Jyk7XG4gICAgICAgIGNvbnN0IHRyYWYgPSBpc29GaWxlLmZldGNoKCd0cmFmJyk7XG4gICAgICAgIGlmICh0ZmR0ID09PSBudWxsKSB7XG4gICAgICAgICAgICB0ZmR0ID0gSVNPQm94ZXIuY3JlYXRlRnVsbEJveCgndGZkdCcsIHRyYWYsIHRmaGQpO1xuICAgICAgICAgICAgdGZkdC52ZXJzaW9uID0gMTtcbiAgICAgICAgICAgIHRmZHQuZmxhZ3MgPSAwO1xuICAgICAgICAgICAgdGZkdC5iYXNlTWVkaWFEZWNvZGVUaW1lID0gTWF0aC5mbG9vcihlLnJlcXVlc3Quc3RhcnRUaW1lICogZS5yZXF1ZXN0LnRpbWVzY2FsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0cnVuID0gaXNvRmlsZS5mZXRjaCgndHJ1bicpO1xuXG4gICAgICAgIC8vIFByb2Nlc3MgdGZ4ZCBib3hlc1xuICAgICAgICAvLyBUaGlzIGJveCBwcm92aWRlIGFic29sdXRlIHRpbWVzdGFtcCBidXQgd2UgdGFrZSB0aGUgc2VnbWVudCBzdGFydCB0aW1lIGZvciB0ZmR0XG4gICAgICAgIGxldCB0ZnhkID0gaXNvRmlsZS5mZXRjaCgndGZ4ZCcpO1xuICAgICAgICBpZiAodGZ4ZCkge1xuICAgICAgICAgICAgdGZ4ZC5fcGFyZW50LmJveGVzLnNwbGljZSh0ZnhkLl9wYXJlbnQuYm94ZXMuaW5kZXhPZih0ZnhkKSwgMSk7XG4gICAgICAgICAgICB0ZnhkID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdGZyZiA9IGlzb0ZpbGUuZmV0Y2goJ3RmcmYnKTtcbiAgICAgICAgcHJvY2Vzc1RmcmYoZS5yZXF1ZXN0LCB0ZnJmLCB0ZmR0LCBzdHJlYW1Qcm9jZXNzb3IpO1xuICAgICAgICBpZiAodGZyZikge1xuICAgICAgICAgICAgdGZyZi5fcGFyZW50LmJveGVzLnNwbGljZSh0ZnJmLl9wYXJlbnQuYm94ZXMuaW5kZXhPZih0ZnJmKSwgMSk7XG4gICAgICAgICAgICB0ZnJmID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHByb3RlY3RlZCBjb250ZW50IGluIFBJRkYxLjEgZm9ybWF0IChzZXBpZmYgYm94ID0gU2FtcGxlIEVuY3J5cHRpb24gUElGRilcbiAgICAgICAgLy8gPT4gY29udmVydCBzZXBpZmYgYm94IGl0IGludG8gYSBzZW5jIGJveFxuICAgICAgICAvLyA9PiBjcmVhdGUgc2FpbyBhbmQgc2FpeiBib3hlcyAoaWYgbm90IGFscmVhZHkgcHJlc2VudClcbiAgICAgICAgY29uc3Qgc2VwaWZmID0gaXNvRmlsZS5mZXRjaCgnc2VwaWZmJyk7XG4gICAgICAgIGlmIChzZXBpZmYgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHNlcGlmZi50eXBlID0gJ3NlbmMnO1xuICAgICAgICAgICAgc2VwaWZmLnVzZXJ0eXBlID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICBsZXQgc2FpbyA9IGlzb0ZpbGUuZmV0Y2goJ3NhaW8nKTtcbiAgICAgICAgICAgIGlmIChzYWlvID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIFNhbXBsZSBBdXhpbGlhcnkgSW5mb3JtYXRpb24gT2Zmc2V0cyBCb3ggYm94IChzYWlvKVxuICAgICAgICAgICAgICAgIHNhaW8gPSBJU09Cb3hlci5jcmVhdGVGdWxsQm94KCdzYWlvJywgdHJhZik7XG4gICAgICAgICAgICAgICAgc2Fpby52ZXJzaW9uID0gMDtcbiAgICAgICAgICAgICAgICBzYWlvLmZsYWdzID0gMDtcbiAgICAgICAgICAgICAgICBzYWlvLmVudHJ5X2NvdW50ID0gMTtcbiAgICAgICAgICAgICAgICBzYWlvLm9mZnNldCA9IFswXTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHNhaXogPSBJU09Cb3hlci5jcmVhdGVGdWxsQm94KCdzYWl6JywgdHJhZik7XG4gICAgICAgICAgICAgICAgc2Fpei52ZXJzaW9uID0gMDtcbiAgICAgICAgICAgICAgICBzYWl6LmZsYWdzID0gMDtcbiAgICAgICAgICAgICAgICBzYWl6LnNhbXBsZV9jb3VudCA9IHNlcGlmZi5zYW1wbGVfY291bnQ7XG4gICAgICAgICAgICAgICAgc2Fpei5kZWZhdWx0X3NhbXBsZV9pbmZvX3NpemUgPSAwO1xuICAgICAgICAgICAgICAgIHNhaXouc2FtcGxlX2luZm9fc2l6ZSA9IFtdO1xuXG4gICAgICAgICAgICAgICAgaWYgKHNlcGlmZi5mbGFncyAmIDB4MDIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU3ViLXNhbXBsZSBlbmNyeXB0aW9uID0+IHNldCBzYW1wbGVfaW5mb19zaXplIGZvciBlYWNoIHNhbXBsZVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgc2VwaWZmLnNhbXBsZV9jb3VudDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAxMCA9IDggKEluaXRpYWxpemF0aW9uVmVjdG9yIGZpZWxkIHNpemUpICsgMiAoc3Vic2FtcGxlX2NvdW50IGZpZWxkIHNpemUpXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyA2ID0gMiAoQnl0ZXNPZkNsZWFyRGF0YSBmaWVsZCBzaXplKSArIDQgKEJ5dGVzT2ZFbmNyeXB0ZWREYXRhIGZpZWxkIHNpemUpXG4gICAgICAgICAgICAgICAgICAgICAgICBzYWl6LnNhbXBsZV9pbmZvX3NpemVbaV0gPSAxMCArICg2ICogc2VwaWZmLmVudHJ5W2ldLk51bWJlck9mRW50cmllcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBObyBzdWItc2FtcGxlIGVuY3J5cHRpb24gPT4gc2V0IGRlZmF1bHQgc2FtcGxlX2luZm9fc2l6ZSA9IEluaXRpYWxpemF0aW9uVmVjdG9yIGZpZWxkIHNpemUgKDgpXG4gICAgICAgICAgICAgICAgICAgIHNhaXouZGVmYXVsdF9zYW1wbGVfaW5mb19zaXplID0gODtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0ZmhkLmZsYWdzICY9IDB4RkZGRkZFOyAvLyBzZXQgdGZoZC5iYXNlLWRhdGEtb2Zmc2V0LXByZXNlbnQgdG8gZmFsc2VcbiAgICAgICAgdGZoZC5mbGFncyB8PSAweDAyMDAwMDsgLy8gc2V0IHRmaGQuZGVmYXVsdC1iYXNlLWlzLW1vb2YgdG8gdHJ1ZVxuICAgICAgICB0cnVuLmZsYWdzIHw9IDB4MDAwMDAxOyAvLyBzZXQgdHJ1bi5kYXRhLW9mZnNldC1wcmVzZW50IHRvIHRydWVcblxuICAgICAgICAvLyBVcGRhdGUgdHJ1bi5kYXRhX29mZnNldCBmaWVsZCB0aGF0IGNvcnJlc3BvbmRzIHRvIGZpcnN0IGRhdGEgYnl0ZSAoaW5zaWRlIG1kYXQgYm94KVxuICAgICAgICBjb25zdCBtb29mID0gaXNvRmlsZS5mZXRjaCgnbW9vZicpO1xuICAgICAgICBsZXQgbGVuZ3RoID0gbW9vZi5nZXRMZW5ndGgoKTtcbiAgICAgICAgdHJ1bi5kYXRhX29mZnNldCA9IGxlbmd0aCArIDg7XG5cbiAgICAgICAgLy8gVXBkYXRlIHNhaW8gYm94IG9mZnNldCBmaWVsZCBhY2NvcmRpbmcgdG8gbmV3IHNlbmMgYm94IG9mZnNldFxuICAgICAgICBsZXQgc2FpbyA9IGlzb0ZpbGUuZmV0Y2goJ3NhaW8nKTtcbiAgICAgICAgaWYgKHNhaW8gIT09IG51bGwpIHtcbiAgICAgICAgICAgIGxldCB0cmFmUG9zSW5Nb29mID0gZ2V0Qm94T2Zmc2V0KG1vb2YsICd0cmFmJyk7XG4gICAgICAgICAgICBsZXQgc2VuY1Bvc0luVHJhZiA9IGdldEJveE9mZnNldCh0cmFmLCAnc2VuYycpO1xuICAgICAgICAgICAgLy8gU2V0IG9mZnNldCBmcm9tIGJlZ2luIGZyYWdtZW50IHRvIHRoZSBmaXJzdCBJViBmaWVsZCBpbiBzZW5jIGJveFxuICAgICAgICAgICAgc2Fpby5vZmZzZXRbMF0gPSB0cmFmUG9zSW5Nb29mICsgc2VuY1Bvc0luVHJhZiArIDE2OyAvLyAxNiA9IGJveCBoZWFkZXIgKDEyKSArIHNhbXBsZV9jb3VudCBmaWVsZCBzaXplICg0KVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gV3JpdGUgdHJhbnNmb3JtZWQvcHJvY2Vzc2VkIGZyYWdtZW50IGludG8gcmVxdWVzdCByZXBvbnNlIGRhdGFcbiAgICAgICAgZS5yZXNwb25zZSA9IGlzb0ZpbGUud3JpdGUoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVTZWdtZW50TGlzdChlLCBzdHJlYW1Qcm9jZXNzb3IpIHtcbiAgICAgICAgLy8gZS5yZXF1ZXN0IGNvbnRhaW5zIHJlcXVlc3QgZGVzY3JpcHRpb24gb2JqZWN0XG4gICAgICAgIC8vIGUucmVzcG9uc2UgY29udGFpbnMgZnJhZ21lbnQgYnl0ZXNcbiAgICAgICAgaWYgKCFlLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2UucmVzcG9uc2UgcGFyYW1ldGVyIGlzIG1pc3NpbmcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlzb0ZpbGUgPSBJU09Cb3hlci5wYXJzZUJ1ZmZlcihlLnJlc3BvbnNlKTtcbiAgICAgICAgLy8gVXBkYXRlIHRyYWNrX0lkIGluIHRmaGQgYm94XG4gICAgICAgIGNvbnN0IHRmaGQgPSBpc29GaWxlLmZldGNoKCd0ZmhkJyk7XG4gICAgICAgIHRmaGQudHJhY2tfSUQgPSBlLnJlcXVlc3QubWVkaWFJbmZvLmluZGV4ICsgMTtcblxuICAgICAgICAvLyBBZGQgdGZkdCBib3hcbiAgICAgICAgbGV0IHRmZHQgPSBpc29GaWxlLmZldGNoKCd0ZmR0Jyk7XG4gICAgICAgIGxldCB0cmFmID0gaXNvRmlsZS5mZXRjaCgndHJhZicpO1xuICAgICAgICBpZiAodGZkdCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGZkdCA9IElTT0JveGVyLmNyZWF0ZUZ1bGxCb3goJ3RmZHQnLCB0cmFmLCB0ZmhkKTtcbiAgICAgICAgICAgIHRmZHQudmVyc2lvbiA9IDE7XG4gICAgICAgICAgICB0ZmR0LmZsYWdzID0gMDtcbiAgICAgICAgICAgIHRmZHQuYmFzZU1lZGlhRGVjb2RlVGltZSA9IE1hdGguZmxvb3IoZS5yZXF1ZXN0LnN0YXJ0VGltZSAqIGUucmVxdWVzdC50aW1lc2NhbGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHRmcmYgPSBpc29GaWxlLmZldGNoKCd0ZnJmJyk7XG4gICAgICAgIHByb2Nlc3NUZnJmKGUucmVxdWVzdCwgdGZyZiwgdGZkdCwgc3RyZWFtUHJvY2Vzc29yKTtcbiAgICAgICAgaWYgKHRmcmYpIHtcbiAgICAgICAgICAgIHRmcmYuX3BhcmVudC5ib3hlcy5zcGxpY2UodGZyZi5fcGFyZW50LmJveGVzLmluZGV4T2YodGZyZiksIDEpO1xuICAgICAgICAgICAgdGZyZiA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRUeXBlKCkge1xuICAgICAgICByZXR1cm4gdHlwZTtcbiAgICB9XG5cbiAgICBpbnN0YW5jZSA9IHtcbiAgICAgICAgY29udmVydEZyYWdtZW50OiBjb252ZXJ0RnJhZ21lbnQsXG4gICAgICAgIHVwZGF0ZVNlZ21lbnRMaXN0OiB1cGRhdGVTZWdtZW50TGlzdCxcbiAgICAgICAgZ2V0VHlwZTogZ2V0VHlwZVxuICAgIH07XG5cbiAgICBzZXR1cCgpO1xuICAgIHJldHVybiBpbnN0YW5jZTtcbn1cblxuTXNzRnJhZ21lbnRNb29mUHJvY2Vzc29yLl9fZGFzaGpzX2ZhY3RvcnlfbmFtZSA9ICdNc3NGcmFnbWVudE1vb2ZQcm9jZXNzb3InO1xuZXhwb3J0IGRlZmF1bHQgZGFzaGpzLkZhY3RvcnlNYWtlci5nZXRDbGFzc0ZhY3RvcnkoTXNzRnJhZ21lbnRNb29mUHJvY2Vzc29yKTsgLyoganNoaW50IGlnbm9yZTpsaW5lICovXG4iLCIvKipcbiAqIFRoZSBjb3B5cmlnaHQgaW4gdGhpcyBzb2Z0d2FyZSBpcyBiZWluZyBtYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgQlNEIExpY2Vuc2UsXG4gKiBpbmNsdWRlZCBiZWxvdy4gVGhpcyBzb2Z0d2FyZSBtYXkgYmUgc3ViamVjdCB0byBvdGhlciB0aGlyZCBwYXJ0eSBhbmQgY29udHJpYnV0b3JcbiAqIHJpZ2h0cywgaW5jbHVkaW5nIHBhdGVudCByaWdodHMsIGFuZCBubyBzdWNoIHJpZ2h0cyBhcmUgZ3JhbnRlZCB1bmRlciB0aGlzIGxpY2Vuc2UuXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDEzLCBEYXNoIEluZHVzdHJ5IEZvcnVtLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuICogYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuICogICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gKiAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gKiAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBhbmQvb3JcbiAqICBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuICogICogTmVpdGhlciB0aGUgbmFtZSBvZiBEYXNoIEluZHVzdHJ5IEZvcnVtIG5vciB0aGUgbmFtZXMgb2YgaXRzXG4gKiAgY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0cyBkZXJpdmVkIGZyb20gdGhpcyBzb2Z0d2FyZVxuICogIHdpdGhvdXQgc3BlY2lmaWMgcHJpb3Igd3JpdHRlbiBwZXJtaXNzaW9uLlxuICpcbiAqICBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIEFTIElTIEFORCBBTllcbiAqICBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG4gKiAgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELlxuICogIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsXG4gKiAgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIChJTkNMVURJTkcsIEJVVFxuICogIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1JcbiAqICBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTlkgVEhFT1JZIE9GIExJQUJJTElUWSxcbiAqICBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpXG4gKiAgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEVcbiAqICBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cbiAqL1xuIGltcG9ydCBNc3NFcnJvcnMgZnJvbSAnLi9lcnJvcnMvTXNzRXJyb3JzJztcblxuLyoqXG4gKiBAbW9kdWxlIE1zc0ZyYWdtZW50TW9vdlByb2Nlc3NvclxuICogQGlnbm9yZVxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBvYmplY3RcbiAqL1xuZnVuY3Rpb24gTXNzRnJhZ21lbnRNb292UHJvY2Vzc29yKGNvbmZpZykge1xuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcbiAgICBjb25zdCBOQUxVVFlQRV9TUFMgPSA3O1xuICAgIGNvbnN0IE5BTFVUWVBFX1BQUyA9IDg7XG4gICAgY29uc3QgY29uc3RhbnRzID0gY29uZmlnLmNvbnN0YW50cztcbiAgICBjb25zdCBJU09Cb3hlciA9IGNvbmZpZy5JU09Cb3hlcjtcblxuICAgIGxldCBwcm90ZWN0aW9uQ29udHJvbGxlciA9IGNvbmZpZy5wcm90ZWN0aW9uQ29udHJvbGxlcjtcbiAgICBsZXQgaW5zdGFuY2UsXG4gICAgICAgIHBlcmlvZCxcbiAgICAgICAgYWRhcHRhdGlvblNldCxcbiAgICAgICAgcmVwcmVzZW50YXRpb24sXG4gICAgICAgIGNvbnRlbnRQcm90ZWN0aW9uLFxuICAgICAgICB0aW1lc2NhbGUsXG4gICAgICAgIHRyYWNrSWQ7XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVGdHlwQm94KGlzb0ZpbGUpIHtcbiAgICAgICAgbGV0IGZ0eXAgPSBJU09Cb3hlci5jcmVhdGVCb3goJ2Z0eXAnLCBpc29GaWxlKTtcbiAgICAgICAgZnR5cC5tYWpvcl9icmFuZCA9ICdpc282JztcbiAgICAgICAgZnR5cC5taW5vcl92ZXJzaW9uID0gMTsgLy8gaXMgYW4gaW5mb3JtYXRpdmUgaW50ZWdlciBmb3IgdGhlIG1pbm9yIHZlcnNpb24gb2YgdGhlIG1ham9yIGJyYW5kXG4gICAgICAgIGZ0eXAuY29tcGF0aWJsZV9icmFuZHMgPSBbXTsgLy9pcyBhIGxpc3QsIHRvIHRoZSBlbmQgb2YgdGhlIGJveCwgb2YgYnJhbmRzIGlzb20sIGlzbzYgYW5kIG1zZGhcbiAgICAgICAgZnR5cC5jb21wYXRpYmxlX2JyYW5kc1swXSA9ICdpc29tJzsgLy8gPT4gZGVjaW1hbCBBU0NJSSB2YWx1ZSBmb3IgaXNvbVxuICAgICAgICBmdHlwLmNvbXBhdGlibGVfYnJhbmRzWzFdID0gJ2lzbzYnOyAvLyA9PiBkZWNpbWFsIEFTQ0lJIHZhbHVlIGZvciBpc282XG4gICAgICAgIGZ0eXAuY29tcGF0aWJsZV9icmFuZHNbMl0gPSAnbXNkaCc7IC8vID0+IGRlY2ltYWwgQVNDSUkgdmFsdWUgZm9yIG1zZGhcblxuICAgICAgICByZXR1cm4gZnR5cDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVNb292Qm94KGlzb0ZpbGUpIHtcblxuICAgICAgICAvLyBtb292IGJveFxuICAgICAgICBsZXQgbW9vdiA9IElTT0JveGVyLmNyZWF0ZUJveCgnbW9vdicsIGlzb0ZpbGUpO1xuXG4gICAgICAgIC8vIG1vb3YvbXZoZFxuICAgICAgICBjcmVhdGVNdmhkQm94KG1vb3YpO1xuXG4gICAgICAgIC8vIG1vb3YvdHJha1xuICAgICAgICBsZXQgdHJhayA9IElTT0JveGVyLmNyZWF0ZUJveCgndHJhaycsIG1vb3YpO1xuXG4gICAgICAgIC8vIG1vb3YvdHJhay90a2hkXG4gICAgICAgIGNyZWF0ZVRraGRCb3godHJhayk7XG5cbiAgICAgICAgLy8gbW9vdi90cmFrL21kaWFcbiAgICAgICAgbGV0IG1kaWEgPSBJU09Cb3hlci5jcmVhdGVCb3goJ21kaWEnLCB0cmFrKTtcblxuICAgICAgICAvLyBtb292L3RyYWsvbWRpYS9tZGhkXG4gICAgICAgIGNyZWF0ZU1kaGRCb3gobWRpYSk7XG5cbiAgICAgICAgLy8gbW9vdi90cmFrL21kaWEvaGRsclxuICAgICAgICBjcmVhdGVIZGxyQm94KG1kaWEpO1xuXG4gICAgICAgIC8vIG1vb3YvdHJhay9tZGlhL21pbmZcbiAgICAgICAgbGV0IG1pbmYgPSBJU09Cb3hlci5jcmVhdGVCb3goJ21pbmYnLCBtZGlhKTtcblxuICAgICAgICBzd2l0Y2ggKGFkYXB0YXRpb25TZXQudHlwZSkge1xuICAgICAgICAgICAgY2FzZSBjb25zdGFudHMuVklERU86XG4gICAgICAgICAgICAgICAgLy8gbW9vdi90cmFrL21kaWEvbWluZi92bWhkXG4gICAgICAgICAgICAgICAgY3JlYXRlVm1oZEJveChtaW5mKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgY29uc3RhbnRzLkFVRElPOlxuICAgICAgICAgICAgICAgIC8vIG1vb3YvdHJhay9tZGlhL21pbmYvc21oZFxuICAgICAgICAgICAgICAgIGNyZWF0ZVNtaGRCb3gobWluZik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbW9vdi90cmFrL21kaWEvbWluZi9kaW5mXG4gICAgICAgIGxldCBkaW5mID0gSVNPQm94ZXIuY3JlYXRlQm94KCdkaW5mJywgbWluZik7XG5cbiAgICAgICAgLy8gbW9vdi90cmFrL21kaWEvbWluZi9kaW5mL2RyZWZcbiAgICAgICAgY3JlYXRlRHJlZkJveChkaW5mKTtcblxuICAgICAgICAvLyBtb292L3RyYWsvbWRpYS9taW5mL3N0YmxcbiAgICAgICAgbGV0IHN0YmwgPSBJU09Cb3hlci5jcmVhdGVCb3goJ3N0YmwnLCBtaW5mKTtcblxuICAgICAgICAvLyBDcmVhdGUgZW1wdHkgc3R0cywgc3RzYywgc3RjbyBhbmQgc3RzeiBib3hlc1xuICAgICAgICAvLyBVc2UgZGF0YSBmaWVsZCBhcyBmb3IgY29kZW0taXNvYm94ZXIgdW5rbm93biBib3hlcyBmb3Igc2V0dGluZyBmaWVsZHMgdmFsdWVcblxuICAgICAgICAvLyBtb292L3RyYWsvbWRpYS9taW5mL3N0Ymwvc3R0c1xuICAgICAgICBsZXQgc3R0cyA9IElTT0JveGVyLmNyZWF0ZUZ1bGxCb3goJ3N0dHMnLCBzdGJsKTtcbiAgICAgICAgc3R0cy5fZGF0YSA9IFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXTsgLy8gdmVyc2lvbiA9IDAsIGZsYWdzID0gMCwgZW50cnlfY291bnQgPSAwXG5cbiAgICAgICAgLy8gbW9vdi90cmFrL21kaWEvbWluZi9zdGJsL3N0c2NcbiAgICAgICAgbGV0IHN0c2MgPSBJU09Cb3hlci5jcmVhdGVGdWxsQm94KCdzdHNjJywgc3RibCk7XG4gICAgICAgIHN0c2MuX2RhdGEgPSBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF07IC8vIHZlcnNpb24gPSAwLCBmbGFncyA9IDAsIGVudHJ5X2NvdW50ID0gMFxuXG4gICAgICAgIC8vIG1vb3YvdHJhay9tZGlhL21pbmYvc3RibC9zdGNvXG4gICAgICAgIGxldCBzdGNvID0gSVNPQm94ZXIuY3JlYXRlRnVsbEJveCgnc3RjbycsIHN0YmwpO1xuICAgICAgICBzdGNvLl9kYXRhID0gWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdOyAvLyB2ZXJzaW9uID0gMCwgZmxhZ3MgPSAwLCBlbnRyeV9jb3VudCA9IDBcblxuICAgICAgICAvLyBtb292L3RyYWsvbWRpYS9taW5mL3N0Ymwvc3RzelxuICAgICAgICBsZXQgc3RzeiA9IElTT0JveGVyLmNyZWF0ZUZ1bGxCb3goJ3N0c3onLCBzdGJsKTtcbiAgICAgICAgc3Rzei5fZGF0YSA9IFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXTsgLy8gdmVyc2lvbiA9IDAsIGZsYWdzID0gMCwgc2FtcGxlX3NpemUgPSAwLCBzYW1wbGVfY291bnQgPSAwXG5cbiAgICAgICAgLy8gbW9vdi90cmFrL21kaWEvbWluZi9zdGJsL3N0c2RcbiAgICAgICAgY3JlYXRlU3RzZEJveChzdGJsKTtcblxuICAgICAgICAvLyBtb292L212ZXhcbiAgICAgICAgbGV0IG12ZXggPSBJU09Cb3hlci5jcmVhdGVCb3goJ212ZXgnLCBtb292KTtcblxuICAgICAgICAvLyBtb292L212ZXgvdHJleFxuICAgICAgICBjcmVhdGVUcmV4Qm94KG12ZXgpO1xuXG4gICAgICAgIGlmIChjb250ZW50UHJvdGVjdGlvbiAmJiBwcm90ZWN0aW9uQ29udHJvbGxlcikge1xuICAgICAgICAgICAgbGV0IHN1cHBvcnRlZEtTID0gcHJvdGVjdGlvbkNvbnRyb2xsZXIuZ2V0U3VwcG9ydGVkS2V5U3lzdGVtc0Zyb21Db250ZW50UHJvdGVjdGlvbihjb250ZW50UHJvdGVjdGlvbik7XG4gICAgICAgICAgICBjcmVhdGVQcm90ZWN0aW9uU3lzdGVtU3BlY2lmaWNIZWFkZXJCb3gobW9vdiwgc3VwcG9ydGVkS1MpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlTXZoZEJveChtb292KSB7XG5cbiAgICAgICAgbGV0IG12aGQgPSBJU09Cb3hlci5jcmVhdGVGdWxsQm94KCdtdmhkJywgbW9vdik7XG5cbiAgICAgICAgbXZoZC52ZXJzaW9uID0gMTsgLy8gdmVyc2lvbiA9IDEgIGluIG9yZGVyIHRvIGhhdmUgNjRiaXRzIGR1cmF0aW9uIHZhbHVlXG5cbiAgICAgICAgbXZoZC5jcmVhdGlvbl90aW1lID0gMDsgLy8gdGhlIGNyZWF0aW9uIHRpbWUgb2YgdGhlIHByZXNlbnRhdGlvbiA9PiBpZ25vcmUgKHNldCB0byAwKVxuICAgICAgICBtdmhkLm1vZGlmaWNhdGlvbl90aW1lID0gMDsgLy8gdGhlIG1vc3QgcmVjZW50IHRpbWUgdGhlIHByZXNlbnRhdGlvbiB3YXMgbW9kaWZpZWQgPT4gaWdub3JlIChzZXQgdG8gMClcbiAgICAgICAgbXZoZC50aW1lc2NhbGUgPSB0aW1lc2NhbGU7IC8vIHRoZSB0aW1lLXNjYWxlIGZvciB0aGUgZW50aXJlIHByZXNlbnRhdGlvbiA9PiAxMDAwMDAwMCBmb3IgTVNTXG4gICAgICAgIG12aGQuZHVyYXRpb24gPSBwZXJpb2QuZHVyYXRpb24gPT09IEluZmluaXR5ID8gMHhGRkZGRkZGRkZGRkZGRkZGIDogTWF0aC5yb3VuZChwZXJpb2QuZHVyYXRpb24gKiB0aW1lc2NhbGUpOyAvLyB0aGUgbGVuZ3RoIG9mIHRoZSBwcmVzZW50YXRpb24gKGluIHRoZSBpbmRpY2F0ZWQgdGltZXNjYWxlKSA9PiAgdGFrZSBkdXJhdGlvbiBvZiBwZXJpb2RcbiAgICAgICAgbXZoZC5yYXRlID0gMS4wOyAvLyAxNi4xNiBudW1iZXIsICcxLjAnID0gbm9ybWFsIHBsYXliYWNrXG4gICAgICAgIG12aGQudm9sdW1lID0gMS4wOyAvLyA4LjggbnVtYmVyLCAnMS4wJyA9IGZ1bGwgdm9sdW1lXG4gICAgICAgIG12aGQucmVzZXJ2ZWQxID0gMDtcbiAgICAgICAgbXZoZC5yZXNlcnZlZDIgPSBbMHgwLCAweDBdO1xuICAgICAgICBtdmhkLm1hdHJpeCA9IFtcbiAgICAgICAgICAgIDEsIDAsIDAsIC8vIHByb3ZpZGVzIGEgdHJhbnNmb3JtYXRpb24gbWF0cml4IGZvciB0aGUgdmlkZW87XG4gICAgICAgICAgICAwLCAxLCAwLCAvLyAodSx2LHcpIGFyZSByZXN0cmljdGVkIGhlcmUgdG8gKDAsMCwxKVxuICAgICAgICAgICAgMCwgMCwgMTYzODRcbiAgICAgICAgXTtcbiAgICAgICAgbXZoZC5wcmVfZGVmaW5lZCA9IFswLCAwLCAwLCAwLCAwLCAwXTtcbiAgICAgICAgbXZoZC5uZXh0X3RyYWNrX0lEID0gdHJhY2tJZCArIDE7IC8vIGluZGljYXRlcyBhIHZhbHVlIHRvIHVzZSBmb3IgdGhlIHRyYWNrIElEIG9mIHRoZSBuZXh0IHRyYWNrIHRvIGJlIGFkZGVkIHRvIHRoaXMgcHJlc2VudGF0aW9uXG5cbiAgICAgICAgcmV0dXJuIG12aGQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlVGtoZEJveCh0cmFrKSB7XG5cbiAgICAgICAgbGV0IHRraGQgPSBJU09Cb3hlci5jcmVhdGVGdWxsQm94KCd0a2hkJywgdHJhayk7XG5cbiAgICAgICAgdGtoZC52ZXJzaW9uID0gMTsgLy8gdmVyc2lvbiA9IDEgIGluIG9yZGVyIHRvIGhhdmUgNjRiaXRzIGR1cmF0aW9uIHZhbHVlXG4gICAgICAgIHRraGQuZmxhZ3MgPSAweDEgfCAvLyBUcmFja19lbmFibGVkICgweDAwMDAwMSk6IEluZGljYXRlcyB0aGF0IHRoZSB0cmFjayBpcyBlbmFibGVkXG4gICAgICAgICAgICAweDIgfCAvLyBUcmFja19pbl9tb3ZpZSAoMHgwMDAwMDIpOiAgSW5kaWNhdGVzIHRoYXQgdGhlIHRyYWNrIGlzIHVzZWQgaW4gdGhlIHByZXNlbnRhdGlvblxuICAgICAgICAgICAgMHg0OyAvLyBUcmFja19pbl9wcmV2aWV3ICgweDAwMDAwNCk6ICBJbmRpY2F0ZXMgdGhhdCB0aGUgdHJhY2sgaXMgdXNlZCB3aGVuIHByZXZpZXdpbmcgdGhlIHByZXNlbnRhdGlvblxuXG4gICAgICAgIHRraGQuY3JlYXRpb25fdGltZSA9IDA7IC8vIHRoZSBjcmVhdGlvbiB0aW1lIG9mIHRoZSBwcmVzZW50YXRpb24gPT4gaWdub3JlIChzZXQgdG8gMClcbiAgICAgICAgdGtoZC5tb2RpZmljYXRpb25fdGltZSA9IDA7IC8vIHRoZSBtb3N0IHJlY2VudCB0aW1lIHRoZSBwcmVzZW50YXRpb24gd2FzIG1vZGlmaWVkID0+IGlnbm9yZSAoc2V0IHRvIDApXG4gICAgICAgIHRraGQudHJhY2tfSUQgPSB0cmFja0lkOyAvLyB1bmlxdWVseSBpZGVudGlmaWVzIHRoaXMgdHJhY2sgb3ZlciB0aGUgZW50aXJlIGxpZmUtdGltZSBvZiB0aGlzIHByZXNlbnRhdGlvblxuICAgICAgICB0a2hkLnJlc2VydmVkMSA9IDA7XG4gICAgICAgIHRraGQuZHVyYXRpb24gPSBwZXJpb2QuZHVyYXRpb24gPT09IEluZmluaXR5ID8gMHhGRkZGRkZGRkZGRkZGRkZGIDogTWF0aC5yb3VuZChwZXJpb2QuZHVyYXRpb24gKiB0aW1lc2NhbGUpOyAvLyB0aGUgZHVyYXRpb24gb2YgdGhpcyB0cmFjayAoaW4gdGhlIHRpbWVzY2FsZSBpbmRpY2F0ZWQgaW4gdGhlIE1vdmllIEhlYWRlciBCb3gpID0+ICB0YWtlIGR1cmF0aW9uIG9mIHBlcmlvZFxuICAgICAgICB0a2hkLnJlc2VydmVkMiA9IFsweDAsIDB4MF07XG4gICAgICAgIHRraGQubGF5ZXIgPSAwOyAvLyBzcGVjaWZpZXMgdGhlIGZyb250LXRvLWJhY2sgb3JkZXJpbmcgb2YgdmlkZW8gdHJhY2tzOyB0cmFja3Mgd2l0aCBsb3dlciBudW1iZXJzIGFyZSBjbG9zZXIgdG8gdGhlIHZpZXdlciA9PiAwIHNpbmNlIG9ubHkgb25lIHZpZGVvIHRyYWNrXG4gICAgICAgIHRraGQuYWx0ZXJuYXRlX2dyb3VwID0gMDsgLy8gc3BlY2lmaWVzIGEgZ3JvdXAgb3IgY29sbGVjdGlvbiBvZiB0cmFja3MgPT4gaWdub3JlXG4gICAgICAgIHRraGQudm9sdW1lID0gMS4wOyAvLyAnMS4wJyA9IGZ1bGwgdm9sdW1lXG4gICAgICAgIHRraGQucmVzZXJ2ZWQzID0gMDtcbiAgICAgICAgdGtoZC5tYXRyaXggPSBbXG4gICAgICAgICAgICAxLCAwLCAwLCAvLyBwcm92aWRlcyBhIHRyYW5zZm9ybWF0aW9uIG1hdHJpeCBmb3IgdGhlIHZpZGVvO1xuICAgICAgICAgICAgMCwgMSwgMCwgLy8gKHUsdix3KSBhcmUgcmVzdHJpY3RlZCBoZXJlIHRvICgwLDAsMSlcbiAgICAgICAgICAgIDAsIDAsIDE2Mzg0XG4gICAgICAgIF07XG4gICAgICAgIHRraGQud2lkdGggPSByZXByZXNlbnRhdGlvbi53aWR0aDsgLy8gdmlzdWFsIHByZXNlbnRhdGlvbiB3aWR0aFxuICAgICAgICB0a2hkLmhlaWdodCA9IHJlcHJlc2VudGF0aW9uLmhlaWdodDsgLy8gdmlzdWFsIHByZXNlbnRhdGlvbiBoZWlnaHRcblxuICAgICAgICByZXR1cm4gdGtoZDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVNZGhkQm94KG1kaWEpIHtcblxuICAgICAgICBsZXQgbWRoZCA9IElTT0JveGVyLmNyZWF0ZUZ1bGxCb3goJ21kaGQnLCBtZGlhKTtcblxuICAgICAgICBtZGhkLnZlcnNpb24gPSAxOyAvLyB2ZXJzaW9uID0gMSAgaW4gb3JkZXIgdG8gaGF2ZSA2NGJpdHMgZHVyYXRpb24gdmFsdWVcblxuICAgICAgICBtZGhkLmNyZWF0aW9uX3RpbWUgPSAwOyAvLyB0aGUgY3JlYXRpb24gdGltZSBvZiB0aGUgcHJlc2VudGF0aW9uID0+IGlnbm9yZSAoc2V0IHRvIDApXG4gICAgICAgIG1kaGQubW9kaWZpY2F0aW9uX3RpbWUgPSAwOyAvLyB0aGUgbW9zdCByZWNlbnQgdGltZSB0aGUgcHJlc2VudGF0aW9uIHdhcyBtb2RpZmllZCA9PiBpZ25vcmUgKHNldCB0byAwKVxuICAgICAgICBtZGhkLnRpbWVzY2FsZSA9IHRpbWVzY2FsZTsgLy8gdGhlIHRpbWUtc2NhbGUgZm9yIHRoZSBlbnRpcmUgcHJlc2VudGF0aW9uXG4gICAgICAgIG1kaGQuZHVyYXRpb24gPSBwZXJpb2QuZHVyYXRpb24gPT09IEluZmluaXR5ID8gMHhGRkZGRkZGRkZGRkZGRkZGIDogTWF0aC5yb3VuZChwZXJpb2QuZHVyYXRpb24gKiB0aW1lc2NhbGUpOyAvLyB0aGUgZHVyYXRpb24gb2YgdGhpcyBtZWRpYSAoaW4gdGhlIHNjYWxlIG9mIHRoZSB0aW1lc2NhbGUpLiBJZiB0aGUgZHVyYXRpb24gY2Fubm90IGJlIGRldGVybWluZWQgdGhlbiBkdXJhdGlvbiBpcyBzZXQgdG8gYWxsIDFzLlxuICAgICAgICBtZGhkLmxhbmd1YWdlID0gYWRhcHRhdGlvblNldC5sYW5nIHx8ICd1bmQnOyAvLyBkZWNsYXJlcyB0aGUgbGFuZ3VhZ2UgY29kZSBmb3IgdGhpcyBtZWRpYVxuICAgICAgICBtZGhkLnByZV9kZWZpbmVkID0gMDtcblxuICAgICAgICByZXR1cm4gbWRoZDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVIZGxyQm94KG1kaWEpIHtcblxuICAgICAgICBsZXQgaGRsciA9IElTT0JveGVyLmNyZWF0ZUZ1bGxCb3goJ2hkbHInLCBtZGlhKTtcblxuICAgICAgICBoZGxyLnByZV9kZWZpbmVkID0gMDtcbiAgICAgICAgc3dpdGNoIChhZGFwdGF0aW9uU2V0LnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgY29uc3RhbnRzLlZJREVPOlxuICAgICAgICAgICAgICAgIGhkbHIuaGFuZGxlcl90eXBlID0gJ3ZpZGUnO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBjb25zdGFudHMuQVVESU86XG4gICAgICAgICAgICAgICAgaGRsci5oYW5kbGVyX3R5cGUgPSAnc291bic7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGhkbHIuaGFuZGxlcl90eXBlID0gJ21ldGEnO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGhkbHIubmFtZSA9IHJlcHJlc2VudGF0aW9uLmlkO1xuICAgICAgICBoZGxyLnJlc2VydmVkID0gWzAsIDAsIDBdO1xuXG4gICAgICAgIHJldHVybiBoZGxyO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZVZtaGRCb3gobWluZikge1xuXG4gICAgICAgIGxldCB2bWhkID0gSVNPQm94ZXIuY3JlYXRlRnVsbEJveCgndm1oZCcsIG1pbmYpO1xuXG4gICAgICAgIHZtaGQuZmxhZ3MgPSAxO1xuXG4gICAgICAgIHZtaGQuZ3JhcGhpY3Ntb2RlID0gMDsgLy8gc3BlY2lmaWVzIGEgY29tcG9zaXRpb24gbW9kZSBmb3IgdGhpcyB2aWRlbyB0cmFjaywgZnJvbSB0aGUgZm9sbG93aW5nIGVudW1lcmF0ZWQgc2V0LCB3aGljaCBtYXkgYmUgZXh0ZW5kZWQgYnkgZGVyaXZlZCBzcGVjaWZpY2F0aW9uczogY29weSA9IDAgY29weSBvdmVyIHRoZSBleGlzdGluZyBpbWFnZVxuICAgICAgICB2bWhkLm9wY29sb3IgPSBbMCwgMCwgMF07IC8vIGlzIGEgc2V0IG9mIDMgY29sb3VyIHZhbHVlcyAocmVkLCBncmVlbiwgYmx1ZSkgYXZhaWxhYmxlIGZvciB1c2UgYnkgZ3JhcGhpY3MgbW9kZXNcblxuICAgICAgICByZXR1cm4gdm1oZDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVTbWhkQm94KG1pbmYpIHtcblxuICAgICAgICBsZXQgc21oZCA9IElTT0JveGVyLmNyZWF0ZUZ1bGxCb3goJ3NtaGQnLCBtaW5mKTtcblxuICAgICAgICBzbWhkLmZsYWdzID0gMTtcblxuICAgICAgICBzbWhkLmJhbGFuY2UgPSAwOyAvLyBpcyBhIGZpeGVkLXBvaW50IDguOCBudW1iZXIgdGhhdCBwbGFjZXMgbW9ubyBhdWRpbyB0cmFja3MgaW4gYSBzdGVyZW8gc3BhY2U7IDAgaXMgY2VudHJlICh0aGUgbm9ybWFsIHZhbHVlKTsgZnVsbCBsZWZ0IGlzIC0xLjAgYW5kIGZ1bGwgcmlnaHQgaXMgMS4wLlxuICAgICAgICBzbWhkLnJlc2VydmVkID0gMDtcblxuICAgICAgICByZXR1cm4gc21oZDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVEcmVmQm94KGRpbmYpIHtcblxuICAgICAgICBsZXQgZHJlZiA9IElTT0JveGVyLmNyZWF0ZUZ1bGxCb3goJ2RyZWYnLCBkaW5mKTtcblxuICAgICAgICBkcmVmLmVudHJ5X2NvdW50ID0gMTtcbiAgICAgICAgZHJlZi5lbnRyaWVzID0gW107XG5cbiAgICAgICAgbGV0IHVybCA9IElTT0JveGVyLmNyZWF0ZUZ1bGxCb3goJ3VybCAnLCBkcmVmLCBmYWxzZSk7XG4gICAgICAgIHVybC5sb2NhdGlvbiA9ICcnO1xuICAgICAgICB1cmwuZmxhZ3MgPSAxO1xuXG4gICAgICAgIGRyZWYuZW50cmllcy5wdXNoKHVybCk7XG5cbiAgICAgICAgcmV0dXJuIGRyZWY7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlU3RzZEJveChzdGJsKSB7XG5cbiAgICAgICAgbGV0IHN0c2QgPSBJU09Cb3hlci5jcmVhdGVGdWxsQm94KCdzdHNkJywgc3RibCk7XG5cbiAgICAgICAgc3RzZC5lbnRyaWVzID0gW107XG4gICAgICAgIHN3aXRjaCAoYWRhcHRhdGlvblNldC50eXBlKSB7XG4gICAgICAgICAgICBjYXNlIGNvbnN0YW50cy5WSURFTzpcbiAgICAgICAgICAgIGNhc2UgY29uc3RhbnRzLkFVRElPOlxuICAgICAgICAgICAgICAgIHN0c2QuZW50cmllcy5wdXNoKGNyZWF0ZVNhbXBsZUVudHJ5KHN0c2QpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBzdHNkLmVudHJ5X2NvdW50ID0gc3RzZC5lbnRyaWVzLmxlbmd0aDsgLy8gaXMgYW4gaW50ZWdlciB0aGF0IGNvdW50cyB0aGUgYWN0dWFsIGVudHJpZXNcbiAgICAgICAgcmV0dXJuIHN0c2Q7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlU2FtcGxlRW50cnkoc3RzZCkge1xuICAgICAgICBsZXQgY29kZWMgPSByZXByZXNlbnRhdGlvbi5jb2RlY3Muc3Vic3RyaW5nKDAsIHJlcHJlc2VudGF0aW9uLmNvZGVjcy5pbmRleE9mKCcuJykpO1xuXG4gICAgICAgIHN3aXRjaCAoY29kZWMpIHtcbiAgICAgICAgICAgIGNhc2UgJ2F2YzEnOlxuICAgICAgICAgICAgICAgIHJldHVybiBjcmVhdGVBVkNWaXN1YWxTYW1wbGVFbnRyeShzdHNkLCBjb2RlYyk7XG4gICAgICAgICAgICBjYXNlICdtcDRhJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlTVA0QXVkaW9TYW1wbGVFbnRyeShzdHNkLCBjb2RlYyk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IHtcbiAgICAgICAgICAgICAgICAgICAgY29kZTogTXNzRXJyb3JzLk1TU19VTlNVUFBPUlRFRF9DT0RFQ19DT0RFLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBNc3NFcnJvcnMuTVNTX1VOU1VQUE9SVEVEX0NPREVDX01FU1NBR0UsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVjOiBjb2RlY1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZUFWQ1Zpc3VhbFNhbXBsZUVudHJ5KHN0c2QsIGNvZGVjKSB7XG4gICAgICAgIGxldCBhdmMxO1xuXG4gICAgICAgIGlmIChjb250ZW50UHJvdGVjdGlvbikge1xuICAgICAgICAgICAgYXZjMSA9IElTT0JveGVyLmNyZWF0ZUJveCgnZW5jdicsIHN0c2QsIGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF2YzEgPSBJU09Cb3hlci5jcmVhdGVCb3goJ2F2YzEnLCBzdHNkLCBmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTYW1wbGVFbnRyeSBmaWVsZHNcbiAgICAgICAgYXZjMS5yZXNlcnZlZDEgPSBbMHgwLCAweDAsIDB4MCwgMHgwLCAweDAsIDB4MF07XG4gICAgICAgIGF2YzEuZGF0YV9yZWZlcmVuY2VfaW5kZXggPSAxO1xuXG4gICAgICAgIC8vIFZpc3VhbFNhbXBsZUVudHJ5IGZpZWxkc1xuICAgICAgICBhdmMxLnByZV9kZWZpbmVkMSA9IDA7XG4gICAgICAgIGF2YzEucmVzZXJ2ZWQyID0gMDtcbiAgICAgICAgYXZjMS5wcmVfZGVmaW5lZDIgPSBbMCwgMCwgMF07XG4gICAgICAgIGF2YzEuaGVpZ2h0ID0gcmVwcmVzZW50YXRpb24uaGVpZ2h0O1xuICAgICAgICBhdmMxLndpZHRoID0gcmVwcmVzZW50YXRpb24ud2lkdGg7XG4gICAgICAgIGF2YzEuaG9yaXpyZXNvbHV0aW9uID0gNzI7IC8vIDcyIGRwaVxuICAgICAgICBhdmMxLnZlcnRyZXNvbHV0aW9uID0gNzI7IC8vIDcyIGRwaVxuICAgICAgICBhdmMxLnJlc2VydmVkMyA9IDA7XG4gICAgICAgIGF2YzEuZnJhbWVfY291bnQgPSAxOyAvLyAxIGNvbXByZXNzZWQgdmlkZW8gZnJhbWUgcGVyIHNhbXBsZVxuICAgICAgICBhdmMxLmNvbXByZXNzb3JuYW1lID0gW1xuICAgICAgICAgICAgMHgwQSwgMHg0MSwgMHg1NiwgMHg0MywgMHgyMCwgMHg0MywgMHg2RiwgMHg2NCwgLy8gPSAnQVZDIENvZGluZyc7XG4gICAgICAgICAgICAweDY5LCAweDZFLCAweDY3LCAweDAwLCAweDAwLCAweDAwLCAweDAwLCAweDAwLFxuICAgICAgICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMCxcbiAgICAgICAgICAgIDB4MDAsIDB4MDAsIDB4MDAsIDB4MDAsIDB4MDAsIDB4MDAsIDB4MDAsIDB4MDBcbiAgICAgICAgXTtcbiAgICAgICAgYXZjMS5kZXB0aCA9IDB4MDAxODsgLy8gMHgwMDE4IOKAkyBpbWFnZXMgYXJlIGluIGNvbG91ciB3aXRoIG5vIGFscGhhLlxuICAgICAgICBhdmMxLnByZV9kZWZpbmVkMyA9IDY1NTM1O1xuICAgICAgICBhdmMxLmNvbmZpZyA9IGNyZWF0ZUFWQzFDb25maWd1cmF0aW9uUmVjb3JkKCk7XG4gICAgICAgIGlmIChjb250ZW50UHJvdGVjdGlvbikge1xuICAgICAgICAgICAgLy8gQ3JlYXRlIGFuZCBhZGQgUHJvdGVjdGlvbiBTY2hlbWUgSW5mbyBCb3hcbiAgICAgICAgICAgIGxldCBzaW5mID0gSVNPQm94ZXIuY3JlYXRlQm94KCdzaW5mJywgYXZjMSk7XG5cbiAgICAgICAgICAgIC8vIENyZWF0ZSBhbmQgYWRkIE9yaWdpbmFsIEZvcm1hdCBCb3ggPT4gaW5kaWNhdGUgY29kZWMgdHlwZSBvZiB0aGUgZW5jcnlwdGVkIGNvbnRlbnRcbiAgICAgICAgICAgIGNyZWF0ZU9yaWdpbmFsRm9ybWF0Qm94KHNpbmYsIGNvZGVjKTtcblxuICAgICAgICAgICAgLy8gQ3JlYXRlIGFuZCBhZGQgU2NoZW1lIFR5cGUgYm94XG4gICAgICAgICAgICBjcmVhdGVTY2hlbWVUeXBlQm94KHNpbmYpO1xuXG4gICAgICAgICAgICAvLyBDcmVhdGUgYW5kIGFkZCBTY2hlbWUgSW5mb3JtYXRpb24gQm94XG4gICAgICAgICAgICBjcmVhdGVTY2hlbWVJbmZvcm1hdGlvbkJveChzaW5mKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhdmMxO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZUFWQzFDb25maWd1cmF0aW9uUmVjb3JkKCkge1xuXG4gICAgICAgIGxldCBhdmNDID0gbnVsbDtcbiAgICAgICAgbGV0IGF2Y0NMZW5ndGggPSAxNTsgLy8gbGVuZ3RoID0gMTUgYnkgZGVmYXVsdCAoMCBTUFMgYW5kIDAgUFBTKVxuXG4gICAgICAgIC8vIEZpcnN0IGdldCBhbGwgU1BTIGFuZCBQUFMgZnJvbSBjb2RlY1ByaXZhdGVEYXRhXG4gICAgICAgIGxldCBzcHMgPSBbXTtcbiAgICAgICAgbGV0IHBwcyA9IFtdO1xuICAgICAgICBsZXQgQVZDUHJvZmlsZUluZGljYXRpb24gPSAwO1xuICAgICAgICBsZXQgQVZDTGV2ZWxJbmRpY2F0aW9uID0gMDtcbiAgICAgICAgbGV0IHByb2ZpbGVfY29tcGF0aWJpbGl0eSA9IDA7XG5cbiAgICAgICAgbGV0IG5hbHVzID0gcmVwcmVzZW50YXRpb24uY29kZWNQcml2YXRlRGF0YS5zcGxpdCgnMDAwMDAwMDEnKS5zbGljZSgxKTtcbiAgICAgICAgbGV0IG5hbHVCeXRlcywgbmFsdVR5cGU7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuYWx1cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbmFsdUJ5dGVzID0gaGV4U3RyaW5ndG9CdWZmZXIobmFsdXNbaV0pO1xuXG4gICAgICAgICAgICBuYWx1VHlwZSA9IG5hbHVCeXRlc1swXSAmIDB4MUY7XG5cbiAgICAgICAgICAgIHN3aXRjaCAobmFsdVR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIE5BTFVUWVBFX1NQUzpcbiAgICAgICAgICAgICAgICAgICAgc3BzLnB1c2gobmFsdUJ5dGVzKTtcbiAgICAgICAgICAgICAgICAgICAgYXZjQ0xlbmd0aCArPSBuYWx1Qnl0ZXMubGVuZ3RoICsgMjsgLy8gMiA9IHNlcXVlbmNlUGFyYW1ldGVyU2V0TGVuZ3RoIGZpZWxkIGxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIE5BTFVUWVBFX1BQUzpcbiAgICAgICAgICAgICAgICAgICAgcHBzLnB1c2gobmFsdUJ5dGVzKTtcbiAgICAgICAgICAgICAgICAgICAgYXZjQ0xlbmd0aCArPSBuYWx1Qnl0ZXMubGVuZ3RoICsgMjsgLy8gMiA9IHBpY3R1cmVQYXJhbWV0ZXJTZXRMZW5ndGggZmllbGQgbGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2V0IHByb2ZpbGUgYW5kIGxldmVsIGZyb20gU1BTXG4gICAgICAgIGlmIChzcHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgQVZDUHJvZmlsZUluZGljYXRpb24gPSBzcHNbMF1bMV07XG4gICAgICAgICAgICBwcm9maWxlX2NvbXBhdGliaWxpdHkgPSBzcHNbMF1bMl07XG4gICAgICAgICAgICBBVkNMZXZlbEluZGljYXRpb24gPSBzcHNbMF1bM107XG4gICAgICAgIH1cblxuICAgICAgICAvLyBHZW5lcmF0ZSBhdmNDIGJ1ZmZlclxuICAgICAgICBhdmNDID0gbmV3IFVpbnQ4QXJyYXkoYXZjQ0xlbmd0aCk7XG5cbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICAvLyBsZW5ndGhcbiAgICAgICAgYXZjQ1tpKytdID0gKGF2Y0NMZW5ndGggJiAweEZGMDAwMDAwKSA+PiAyNDtcbiAgICAgICAgYXZjQ1tpKytdID0gKGF2Y0NMZW5ndGggJiAweDAwRkYwMDAwKSA+PiAxNjtcbiAgICAgICAgYXZjQ1tpKytdID0gKGF2Y0NMZW5ndGggJiAweDAwMDBGRjAwKSA+PiA4O1xuICAgICAgICBhdmNDW2krK10gPSAoYXZjQ0xlbmd0aCAmIDB4MDAwMDAwRkYpO1xuICAgICAgICBhdmNDLnNldChbMHg2MSwgMHg3NiwgMHg2MywgMHg0M10sIGkpOyAvLyB0eXBlID0gJ2F2Y0MnXG4gICAgICAgIGkgKz0gNDtcbiAgICAgICAgYXZjQ1tpKytdID0gMTsgLy8gY29uZmlndXJhdGlvblZlcnNpb24gPSAxXG4gICAgICAgIGF2Y0NbaSsrXSA9IEFWQ1Byb2ZpbGVJbmRpY2F0aW9uO1xuICAgICAgICBhdmNDW2krK10gPSBwcm9maWxlX2NvbXBhdGliaWxpdHk7XG4gICAgICAgIGF2Y0NbaSsrXSA9IEFWQ0xldmVsSW5kaWNhdGlvbjtcbiAgICAgICAgYXZjQ1tpKytdID0gMHhGRjsgLy8gJzExMTExJyArIGxlbmd0aFNpemVNaW51c09uZSA9IDNcbiAgICAgICAgYXZjQ1tpKytdID0gMHhFMCB8IHNwcy5sZW5ndGg7IC8vICcxMTEnICsgbnVtT2ZTZXF1ZW5jZVBhcmFtZXRlclNldHNcbiAgICAgICAgZm9yIChsZXQgbiA9IDA7IG4gPCBzcHMubGVuZ3RoOyBuKyspIHtcbiAgICAgICAgICAgIGF2Y0NbaSsrXSA9IChzcHNbbl0ubGVuZ3RoICYgMHhGRjAwKSA+PiA4O1xuICAgICAgICAgICAgYXZjQ1tpKytdID0gKHNwc1tuXS5sZW5ndGggJiAweDAwRkYpO1xuICAgICAgICAgICAgYXZjQy5zZXQoc3BzW25dLCBpKTtcbiAgICAgICAgICAgIGkgKz0gc3BzW25dLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBhdmNDW2krK10gPSBwcHMubGVuZ3RoOyAvLyBudW1PZlBpY3R1cmVQYXJhbWV0ZXJTZXRzXG4gICAgICAgIGZvciAobGV0IG4gPSAwOyBuIDwgcHBzLmxlbmd0aDsgbisrKSB7XG4gICAgICAgICAgICBhdmNDW2krK10gPSAocHBzW25dLmxlbmd0aCAmIDB4RkYwMCkgPj4gODtcbiAgICAgICAgICAgIGF2Y0NbaSsrXSA9IChwcHNbbl0ubGVuZ3RoICYgMHgwMEZGKTtcbiAgICAgICAgICAgIGF2Y0Muc2V0KHBwc1tuXSwgaSk7XG4gICAgICAgICAgICBpICs9IHBwc1tuXS5sZW5ndGg7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXZjQztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVNUDRBdWRpb1NhbXBsZUVudHJ5KHN0c2QsIGNvZGVjKSB7XG4gICAgICAgIGxldCBtcDRhO1xuXG4gICAgICAgIGlmIChjb250ZW50UHJvdGVjdGlvbikge1xuICAgICAgICAgICAgbXA0YSA9IElTT0JveGVyLmNyZWF0ZUJveCgnZW5jYScsIHN0c2QsIGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1wNGEgPSBJU09Cb3hlci5jcmVhdGVCb3goJ21wNGEnLCBzdHNkLCBmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTYW1wbGVFbnRyeSBmaWVsZHNcbiAgICAgICAgbXA0YS5yZXNlcnZlZDEgPSBbMHgwLCAweDAsIDB4MCwgMHgwLCAweDAsIDB4MF07XG4gICAgICAgIG1wNGEuZGF0YV9yZWZlcmVuY2VfaW5kZXggPSAxO1xuXG4gICAgICAgIC8vIEF1ZGlvU2FtcGxlRW50cnkgZmllbGRzXG4gICAgICAgIG1wNGEucmVzZXJ2ZWQyID0gWzB4MCwgMHgwXTtcbiAgICAgICAgbXA0YS5jaGFubmVsY291bnQgPSByZXByZXNlbnRhdGlvbi5hdWRpb0NoYW5uZWxzO1xuICAgICAgICBtcDRhLnNhbXBsZXNpemUgPSAxNjtcbiAgICAgICAgbXA0YS5wcmVfZGVmaW5lZCA9IDA7XG4gICAgICAgIG1wNGEucmVzZXJ2ZWRfMyA9IDA7XG4gICAgICAgIG1wNGEuc2FtcGxlcmF0ZSA9IHJlcHJlc2VudGF0aW9uLmF1ZGlvU2FtcGxpbmdSYXRlIDw8IDE2O1xuXG4gICAgICAgIG1wNGEuZXNkcyA9IGNyZWF0ZU1QRUc0QUFDRVNEZXNjcmlwdG9yKCk7XG5cbiAgICAgICAgaWYgKGNvbnRlbnRQcm90ZWN0aW9uKSB7XG4gICAgICAgICAgICAvLyBDcmVhdGUgYW5kIGFkZCBQcm90ZWN0aW9uIFNjaGVtZSBJbmZvIEJveFxuICAgICAgICAgICAgbGV0IHNpbmYgPSBJU09Cb3hlci5jcmVhdGVCb3goJ3NpbmYnLCBtcDRhKTtcblxuICAgICAgICAgICAgLy8gQ3JlYXRlIGFuZCBhZGQgT3JpZ2luYWwgRm9ybWF0IEJveCA9PiBpbmRpY2F0ZSBjb2RlYyB0eXBlIG9mIHRoZSBlbmNyeXB0ZWQgY29udGVudFxuICAgICAgICAgICAgY3JlYXRlT3JpZ2luYWxGb3JtYXRCb3goc2luZiwgY29kZWMpO1xuXG4gICAgICAgICAgICAvLyBDcmVhdGUgYW5kIGFkZCBTY2hlbWUgVHlwZSBib3hcbiAgICAgICAgICAgIGNyZWF0ZVNjaGVtZVR5cGVCb3goc2luZik7XG5cbiAgICAgICAgICAgIC8vIENyZWF0ZSBhbmQgYWRkIFNjaGVtZSBJbmZvcm1hdGlvbiBCb3hcbiAgICAgICAgICAgIGNyZWF0ZVNjaGVtZUluZm9ybWF0aW9uQm94KHNpbmYpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1wNGE7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlTVBFRzRBQUNFU0Rlc2NyaXB0b3IoKSB7XG5cbiAgICAgICAgLy8gQXVkaW9TcGVjaWZpY0NvbmZpZyAoc2VlIElTTy9JRUMgMTQ0OTYtMywgc3VicGFydCAxKSA9PiBjb3JyZXNwb25kcyB0byBoZXggYnl0ZXMgY29udGFpbmVkIGluICdjb2RlY1ByaXZhdGVEYXRhJyBmaWVsZFxuICAgICAgICBsZXQgYXVkaW9TcGVjaWZpY0NvbmZpZyA9IGhleFN0cmluZ3RvQnVmZmVyKHJlcHJlc2VudGF0aW9uLmNvZGVjUHJpdmF0ZURhdGEpO1xuXG4gICAgICAgIC8vIEVTRFMgbGVuZ3RoID0gZXNkcyBib3ggaGVhZGVyIGxlbmd0aCAoPSAxMikgK1xuICAgICAgICAvLyAgICAgICAgICAgICAgIEVTX0Rlc2NyaXB0b3IgaGVhZGVyIGxlbmd0aCAoPSA1KSArXG4gICAgICAgIC8vICAgICAgICAgICAgICAgRGVjb2RlckNvbmZpZ0Rlc2NyaXB0b3IgaGVhZGVyIGxlbmd0aCAoPSAxNSkgK1xuICAgICAgICAvLyAgICAgICAgICAgICAgIGRlY29kZXJTcGVjaWZpY0luZm8gaGVhZGVyIGxlbmd0aCAoPSAyKSArXG4gICAgICAgIC8vICAgICAgICAgICAgICAgQXVkaW9TcGVjaWZpY0NvbmZpZyBsZW5ndGggKD0gY29kZWNQcml2YXRlRGF0YSBsZW5ndGgpXG4gICAgICAgIGxldCBlc2RzTGVuZ3RoID0gMzQgKyBhdWRpb1NwZWNpZmljQ29uZmlnLmxlbmd0aDtcbiAgICAgICAgbGV0IGVzZHMgPSBuZXcgVWludDhBcnJheShlc2RzTGVuZ3RoKTtcblxuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIC8vIGVzZHMgYm94XG4gICAgICAgIGVzZHNbaSsrXSA9IChlc2RzTGVuZ3RoICYgMHhGRjAwMDAwMCkgPj4gMjQ7IC8vIGVzZHMgYm94IGxlbmd0aFxuICAgICAgICBlc2RzW2krK10gPSAoZXNkc0xlbmd0aCAmIDB4MDBGRjAwMDApID4+IDE2OyAvLyAnJ1xuICAgICAgICBlc2RzW2krK10gPSAoZXNkc0xlbmd0aCAmIDB4MDAwMEZGMDApID4+IDg7IC8vICcnXG4gICAgICAgIGVzZHNbaSsrXSA9IChlc2RzTGVuZ3RoICYgMHgwMDAwMDBGRik7IC8vICcnXG4gICAgICAgIGVzZHMuc2V0KFsweDY1LCAweDczLCAweDY0LCAweDczXSwgaSk7IC8vIHR5cGUgPSAnZXNkcydcbiAgICAgICAgaSArPSA0O1xuICAgICAgICBlc2RzLnNldChbMCwgMCwgMCwgMF0sIGkpOyAvLyB2ZXJzaW9uID0gMCwgZmxhZ3MgPSAwXG4gICAgICAgIGkgKz0gNDtcbiAgICAgICAgLy8gRVNfRGVzY3JpcHRvciAoc2VlIElTTy9JRUMgMTQ0OTYtMSAoU3lzdGVtcykpXG4gICAgICAgIGVzZHNbaSsrXSA9IDB4MDM7IC8vIHRhZyA9IDB4MDMgKEVTX0Rlc2NyVGFnKVxuICAgICAgICBlc2RzW2krK10gPSAyMCArIGF1ZGlvU3BlY2lmaWNDb25maWcubGVuZ3RoOyAvLyBzaXplXG4gICAgICAgIGVzZHNbaSsrXSA9ICh0cmFja0lkICYgMHhGRjAwKSA+PiA4OyAvLyBFU19JRCA9IHRyYWNrX2lkXG4gICAgICAgIGVzZHNbaSsrXSA9ICh0cmFja0lkICYgMHgwMEZGKTsgLy8gJydcbiAgICAgICAgZXNkc1tpKytdID0gMDsgLy8gZmxhZ3MgYW5kIHN0cmVhbVByaW9yaXR5XG5cbiAgICAgICAgLy8gRGVjb2RlckNvbmZpZ0Rlc2NyaXB0b3IgKHNlZSBJU08vSUVDIDE0NDk2LTEgKFN5c3RlbXMpKVxuICAgICAgICBlc2RzW2krK10gPSAweDA0OyAvLyB0YWcgPSAweDA0IChEZWNvZGVyQ29uZmlnRGVzY3JUYWcpXG4gICAgICAgIGVzZHNbaSsrXSA9IDE1ICsgYXVkaW9TcGVjaWZpY0NvbmZpZy5sZW5ndGg7IC8vIHNpemVcbiAgICAgICAgZXNkc1tpKytdID0gMHg0MDsgLy8gb2JqZWN0VHlwZUluZGljYXRpb24gPSAweDQwIChNUEVHLTQgQUFDKVxuICAgICAgICBlc2RzW2ldID0gMHgwNSA8PCAyOyAvLyBzdHJlYW1UeXBlID0gMHgwNSAoQXVkaW9zdHJlYW0pXG4gICAgICAgIGVzZHNbaV0gfD0gMCA8PCAxOyAvLyB1cFN0cmVhbSA9IDBcbiAgICAgICAgZXNkc1tpKytdIHw9IDE7IC8vIHJlc2VydmVkID0gMVxuICAgICAgICBlc2RzW2krK10gPSAweEZGOyAvLyBidWZmZXJzaXplREIgPSB1bmRlZmluZWRcbiAgICAgICAgZXNkc1tpKytdID0gMHhGRjsgLy8gJydcbiAgICAgICAgZXNkc1tpKytdID0gMHhGRjsgLy8gJydcbiAgICAgICAgZXNkc1tpKytdID0gKHJlcHJlc2VudGF0aW9uLmJhbmR3aWR0aCAmIDB4RkYwMDAwMDApID4+IDI0OyAvLyBtYXhCaXRyYXRlXG4gICAgICAgIGVzZHNbaSsrXSA9IChyZXByZXNlbnRhdGlvbi5iYW5kd2lkdGggJiAweDAwRkYwMDAwKSA+PiAxNjsgLy8gJydcbiAgICAgICAgZXNkc1tpKytdID0gKHJlcHJlc2VudGF0aW9uLmJhbmR3aWR0aCAmIDB4MDAwMEZGMDApID4+IDg7IC8vICcnXG4gICAgICAgIGVzZHNbaSsrXSA9IChyZXByZXNlbnRhdGlvbi5iYW5kd2lkdGggJiAweDAwMDAwMEZGKTsgLy8gJydcbiAgICAgICAgZXNkc1tpKytdID0gKHJlcHJlc2VudGF0aW9uLmJhbmR3aWR0aCAmIDB4RkYwMDAwMDApID4+IDI0OyAvLyBhdmdiaXRyYXRlXG4gICAgICAgIGVzZHNbaSsrXSA9IChyZXByZXNlbnRhdGlvbi5iYW5kd2lkdGggJiAweDAwRkYwMDAwKSA+PiAxNjsgLy8gJydcbiAgICAgICAgZXNkc1tpKytdID0gKHJlcHJlc2VudGF0aW9uLmJhbmR3aWR0aCAmIDB4MDAwMEZGMDApID4+IDg7IC8vICcnXG4gICAgICAgIGVzZHNbaSsrXSA9IChyZXByZXNlbnRhdGlvbi5iYW5kd2lkdGggJiAweDAwMDAwMEZGKTsgLy8gJydcblxuICAgICAgICAvLyBEZWNvZGVyU3BlY2lmaWNJbmZvIChzZWUgSVNPL0lFQyAxNDQ5Ni0xIChTeXN0ZW1zKSlcbiAgICAgICAgZXNkc1tpKytdID0gMHgwNTsgLy8gdGFnID0gMHgwNSAoRGVjU3BlY2lmaWNJbmZvVGFnKVxuICAgICAgICBlc2RzW2krK10gPSBhdWRpb1NwZWNpZmljQ29uZmlnLmxlbmd0aDsgLy8gc2l6ZVxuICAgICAgICBlc2RzLnNldChhdWRpb1NwZWNpZmljQ29uZmlnLCBpKTsgLy8gQXVkaW9TcGVjaWZpY0NvbmZpZyBieXRlc1xuXG4gICAgICAgIHJldHVybiBlc2RzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZU9yaWdpbmFsRm9ybWF0Qm94KHNpbmYsIGNvZGVjKSB7XG4gICAgICAgIGxldCBmcm1hID0gSVNPQm94ZXIuY3JlYXRlQm94KCdmcm1hJywgc2luZik7XG4gICAgICAgIGZybWEuZGF0YV9mb3JtYXQgPSBzdHJpbmdUb0NoYXJDb2RlKGNvZGVjKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVTY2hlbWVUeXBlQm94KHNpbmYpIHtcbiAgICAgICAgbGV0IHNjaG0gPSBJU09Cb3hlci5jcmVhdGVGdWxsQm94KCdzY2htJywgc2luZik7XG5cbiAgICAgICAgc2NobS5mbGFncyA9IDA7XG4gICAgICAgIHNjaG0udmVyc2lvbiA9IDA7XG4gICAgICAgIHNjaG0uc2NoZW1lX3R5cGUgPSAweDYzNjU2RTYzOyAvLyAnY2VuYycgPT4gY29tbW9uIGVuY3J5cHRpb25cbiAgICAgICAgc2NobS5zY2hlbWVfdmVyc2lvbiA9IDB4MDAwMTAwMDA7IC8vIHZlcnNpb24gc2V0IHRvIDB4MDAwMTAwMDAgKE1ham9yIHZlcnNpb24gMSwgTWlub3IgdmVyc2lvbiAwKVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZVNjaGVtZUluZm9ybWF0aW9uQm94KHNpbmYpIHtcbiAgICAgICAgbGV0IHNjaGkgPSBJU09Cb3hlci5jcmVhdGVCb3goJ3NjaGknLCBzaW5mKTtcblxuICAgICAgICAvLyBDcmVhdGUgYW5kIGFkZCBUcmFjayBFbmNyeXB0aW9uIEJveFxuICAgICAgICBjcmVhdGVUcmFja0VuY3J5cHRpb25Cb3goc2NoaSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlUHJvdGVjdGlvblN5c3RlbVNwZWNpZmljSGVhZGVyQm94KG1vb3YsIGtleVN5c3RlbXMpIHtcbiAgICAgICAgbGV0IHBzc2hfYnl0ZXMsXG4gICAgICAgICAgICBwc3NoLFxuICAgICAgICAgICAgaSxcbiAgICAgICAgICAgIHBhcnNlZEJ1ZmZlcjtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwga2V5U3lzdGVtcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgcHNzaF9ieXRlcyA9IGtleVN5c3RlbXNbaV0uaW5pdERhdGE7XG4gICAgICAgICAgICBpZiAocHNzaF9ieXRlcykge1xuICAgICAgICAgICAgICAgIHBhcnNlZEJ1ZmZlciA9IElTT0JveGVyLnBhcnNlQnVmZmVyKHBzc2hfYnl0ZXMpO1xuICAgICAgICAgICAgICAgIHBzc2ggPSBwYXJzZWRCdWZmZXIuZmV0Y2goJ3Bzc2gnKTtcbiAgICAgICAgICAgICAgICBpZiAocHNzaCkge1xuICAgICAgICAgICAgICAgICAgICBJU09Cb3hlci5VdGlscy5hcHBlbmRCb3gobW9vdiwgcHNzaCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlVHJhY2tFbmNyeXB0aW9uQm94KHNjaGkpIHtcbiAgICAgICAgbGV0IHRlbmMgPSBJU09Cb3hlci5jcmVhdGVGdWxsQm94KCd0ZW5jJywgc2NoaSk7XG5cbiAgICAgICAgdGVuYy5mbGFncyA9IDA7XG4gICAgICAgIHRlbmMudmVyc2lvbiA9IDA7XG5cbiAgICAgICAgdGVuYy5kZWZhdWx0X0lzRW5jcnlwdGVkID0gMHgxO1xuICAgICAgICB0ZW5jLmRlZmF1bHRfSVZfc2l6ZSA9IDg7XG4gICAgICAgIHRlbmMuZGVmYXVsdF9LSUQgPSAoY29udGVudFByb3RlY3Rpb24gJiYgKGNvbnRlbnRQcm90ZWN0aW9uLmxlbmd0aCkgPiAwICYmIGNvbnRlbnRQcm90ZWN0aW9uWzBdWydjZW5jOmRlZmF1bHRfS0lEJ10pID9cbiAgICAgICAgICAgIGNvbnRlbnRQcm90ZWN0aW9uWzBdWydjZW5jOmRlZmF1bHRfS0lEJ10gOiBbMHgwLCAweDAsIDB4MCwgMHgwLCAweDAsIDB4MCwgMHgwLCAweDAsIDB4MCwgMHgwLCAweDAsIDB4MCwgMHgwLCAweDAsIDB4MCwgMHgwXTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVUcmV4Qm94KG1vb3YpIHtcbiAgICAgICAgbGV0IHRyZXggPSBJU09Cb3hlci5jcmVhdGVGdWxsQm94KCd0cmV4JywgbW9vdik7XG5cbiAgICAgICAgdHJleC50cmFja19JRCA9IHRyYWNrSWQ7XG4gICAgICAgIHRyZXguZGVmYXVsdF9zYW1wbGVfZGVzY3JpcHRpb25faW5kZXggPSAxO1xuICAgICAgICB0cmV4LmRlZmF1bHRfc2FtcGxlX2R1cmF0aW9uID0gMDtcbiAgICAgICAgdHJleC5kZWZhdWx0X3NhbXBsZV9zaXplID0gMDtcbiAgICAgICAgdHJleC5kZWZhdWx0X3NhbXBsZV9mbGFncyA9IDA7XG5cbiAgICAgICAgcmV0dXJuIHRyZXg7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGV4U3RyaW5ndG9CdWZmZXIoc3RyKSB7XG4gICAgICAgIGxldCBidWYgPSBuZXcgVWludDhBcnJheShzdHIubGVuZ3RoIC8gMik7XG4gICAgICAgIGxldCBpO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBzdHIubGVuZ3RoIC8gMjsgaSArPSAxKSB7XG4gICAgICAgICAgICBidWZbaV0gPSBwYXJzZUludCgnJyArIHN0cltpICogMl0gKyBzdHJbaSAqIDIgKyAxXSwgMTYpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBidWY7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3RyaW5nVG9DaGFyQ29kZShzdHIpIHtcbiAgICAgICAgbGV0IGNvZGUgPSAwO1xuICAgICAgICBsZXQgaTtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBjb2RlIHw9IHN0ci5jaGFyQ29kZUF0KGkpIDw8ICgoc3RyLmxlbmd0aCAtIGkgLSAxKSAqIDgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb2RlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdlbmVyYXRlTW9vdihyZXApIHtcbiAgICAgICAgaWYgKCFyZXAgfHwgIXJlcC5hZGFwdGF0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgaXNvRmlsZSxcbiAgICAgICAgICAgIGFycmF5QnVmZmVyO1xuXG4gICAgICAgIHJlcHJlc2VudGF0aW9uID0gcmVwO1xuICAgICAgICBhZGFwdGF0aW9uU2V0ID0gcmVwcmVzZW50YXRpb24uYWRhcHRhdGlvbjtcblxuICAgICAgICBwZXJpb2QgPSBhZGFwdGF0aW9uU2V0LnBlcmlvZDtcbiAgICAgICAgdHJhY2tJZCA9IGFkYXB0YXRpb25TZXQuaW5kZXggKyAxO1xuICAgICAgICBjb250ZW50UHJvdGVjdGlvbiA9IHBlcmlvZC5tcGQubWFuaWZlc3QuUGVyaW9kX2FzQXJyYXlbcGVyaW9kLmluZGV4XS5BZGFwdGF0aW9uU2V0X2FzQXJyYXlbYWRhcHRhdGlvblNldC5pbmRleF0uQ29udGVudFByb3RlY3Rpb247XG5cbiAgICAgICAgdGltZXNjYWxlID0gcGVyaW9kLm1wZC5tYW5pZmVzdC5QZXJpb2RfYXNBcnJheVtwZXJpb2QuaW5kZXhdLkFkYXB0YXRpb25TZXRfYXNBcnJheVthZGFwdGF0aW9uU2V0LmluZGV4XS5TZWdtZW50VGVtcGxhdGUudGltZXNjYWxlO1xuXG4gICAgICAgIGlzb0ZpbGUgPSBJU09Cb3hlci5jcmVhdGVGaWxlKCk7XG4gICAgICAgIGNyZWF0ZUZ0eXBCb3goaXNvRmlsZSk7XG4gICAgICAgIGNyZWF0ZU1vb3ZCb3goaXNvRmlsZSk7XG5cbiAgICAgICAgYXJyYXlCdWZmZXIgPSBpc29GaWxlLndyaXRlKCk7XG5cbiAgICAgICAgcmV0dXJuIGFycmF5QnVmZmVyO1xuICAgIH1cblxuICAgIGluc3RhbmNlID0ge1xuICAgICAgICBnZW5lcmF0ZU1vb3Y6IGdlbmVyYXRlTW9vdlxuICAgIH07XG5cbiAgICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbk1zc0ZyYWdtZW50TW9vdlByb2Nlc3Nvci5fX2Rhc2hqc19mYWN0b3J5X25hbWUgPSAnTXNzRnJhZ21lbnRNb292UHJvY2Vzc29yJztcbmV4cG9ydCBkZWZhdWx0IGRhc2hqcy5GYWN0b3J5TWFrZXIuZ2V0Q2xhc3NGYWN0b3J5KE1zc0ZyYWdtZW50TW9vdlByb2Nlc3Nvcik7IC8qIGpzaGludCBpZ25vcmU6bGluZSAqL1xuIiwiLyoqXG4gKiBUaGUgY29weXJpZ2h0IGluIHRoaXMgc29mdHdhcmUgaXMgYmVpbmcgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIEJTRCBMaWNlbnNlLFxuICogaW5jbHVkZWQgYmVsb3cuIFRoaXMgc29mdHdhcmUgbWF5IGJlIHN1YmplY3QgdG8gb3RoZXIgdGhpcmQgcGFydHkgYW5kIGNvbnRyaWJ1dG9yXG4gKiByaWdodHMsIGluY2x1ZGluZyBwYXRlbnQgcmlnaHRzLCBhbmQgbm8gc3VjaCByaWdodHMgYXJlIGdyYW50ZWQgdW5kZXIgdGhpcyBsaWNlbnNlLlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMywgRGFzaCBJbmR1c3RyeSBGb3J1bS5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbiAqIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICogIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICogIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yXG4gKiAgb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbiAqICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgRGFzaCBJbmR1c3RyeSBGb3J1bSBub3IgdGhlIG5hbWVzIG9mIGl0c1xuICogIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmVcbiAqICB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbiAqXG4gKiAgVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBBUyBJUyBBTkQgQU5ZXG4gKiAgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuICogIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC5cbiAqICBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULFxuICogIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVRcbiAqICBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SXG4gKiAgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksXG4gKiAgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKVxuICogIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFXG4gKiAgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKi9cblxuaW1wb3J0IE1zc0ZyYWdtZW50TW9vZlByb2Nlc3NvciBmcm9tICcuL01zc0ZyYWdtZW50TW9vZlByb2Nlc3Nvcic7XG5pbXBvcnQgTXNzRnJhZ21lbnRNb292UHJvY2Vzc29yIGZyb20gJy4vTXNzRnJhZ21lbnRNb292UHJvY2Vzc29yJztcbmltcG9ydCB7SFRUUFJlcXVlc3R9IGZyb20gJy4uL3N0cmVhbWluZy92by9tZXRyaWNzL0hUVFBSZXF1ZXN0JztcblxuXG4vLyBBZGQgc3BlY2lmaWMgYm94IHByb2Nlc3NvcnMgbm90IHByb3ZpZGVkIGJ5IGNvZGVtLWlzb2JveGVyIGxpYnJhcnlcblxuZnVuY3Rpb24gYXJyYXlFcXVhbChhcnIxLCBhcnIyKSB7XG4gICAgcmV0dXJuIChhcnIxLmxlbmd0aCA9PT0gYXJyMi5sZW5ndGgpICYmIGFycjEuZXZlcnkoZnVuY3Rpb24gKGVsZW1lbnQsIGluZGV4KSB7XG4gICAgICAgIHJldHVybiBlbGVtZW50ID09PSBhcnIyW2luZGV4XTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gc2Fpb1Byb2Nlc3NvcigpIHtcbiAgICB0aGlzLl9wcm9jRnVsbEJveCgpO1xuICAgIGlmICh0aGlzLmZsYWdzICYgMSkge1xuICAgICAgICB0aGlzLl9wcm9jRmllbGQoJ2F1eF9pbmZvX3R5cGUnLCAndWludCcsIDMyKTtcbiAgICAgICAgdGhpcy5fcHJvY0ZpZWxkKCdhdXhfaW5mb190eXBlX3BhcmFtZXRlcicsICd1aW50JywgMzIpO1xuICAgIH1cbiAgICB0aGlzLl9wcm9jRmllbGQoJ2VudHJ5X2NvdW50JywgJ3VpbnQnLCAzMik7XG4gICAgdGhpcy5fcHJvY0ZpZWxkQXJyYXkoJ29mZnNldCcsIHRoaXMuZW50cnlfY291bnQsICd1aW50JywgKHRoaXMudmVyc2lvbiA9PT0gMSkgPyA2NCA6IDMyKTtcbn1cblxuZnVuY3Rpb24gc2FpelByb2Nlc3NvcigpIHtcbiAgICB0aGlzLl9wcm9jRnVsbEJveCgpO1xuICAgIGlmICh0aGlzLmZsYWdzICYgMSkge1xuICAgICAgICB0aGlzLl9wcm9jRmllbGQoJ2F1eF9pbmZvX3R5cGUnLCAndWludCcsIDMyKTtcbiAgICAgICAgdGhpcy5fcHJvY0ZpZWxkKCdhdXhfaW5mb190eXBlX3BhcmFtZXRlcicsICd1aW50JywgMzIpO1xuICAgIH1cbiAgICB0aGlzLl9wcm9jRmllbGQoJ2RlZmF1bHRfc2FtcGxlX2luZm9fc2l6ZScsICd1aW50JywgOCk7XG4gICAgdGhpcy5fcHJvY0ZpZWxkKCdzYW1wbGVfY291bnQnLCAndWludCcsIDMyKTtcbiAgICBpZiAodGhpcy5kZWZhdWx0X3NhbXBsZV9pbmZvX3NpemUgPT09IDApIHtcbiAgICAgICAgdGhpcy5fcHJvY0ZpZWxkQXJyYXkoJ3NhbXBsZV9pbmZvX3NpemUnLCB0aGlzLnNhbXBsZV9jb3VudCwgJ3VpbnQnLCA4KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHNlbmNQcm9jZXNzb3IoKSB7XG4gICAgdGhpcy5fcHJvY0Z1bGxCb3goKTtcbiAgICB0aGlzLl9wcm9jRmllbGQoJ3NhbXBsZV9jb3VudCcsICd1aW50JywgMzIpO1xuICAgIGlmICh0aGlzLmZsYWdzICYgMSkge1xuICAgICAgICB0aGlzLl9wcm9jRmllbGQoJ0lWX3NpemUnLCAndWludCcsIDgpO1xuICAgIH1cbiAgICB0aGlzLl9wcm9jRW50cmllcygnZW50cnknLCB0aGlzLnNhbXBsZV9jb3VudCwgZnVuY3Rpb24gKGVudHJ5KSB7XG4gICAgICAgIHRoaXMuX3Byb2NFbnRyeUZpZWxkKGVudHJ5LCAnSW5pdGlhbGl6YXRpb25WZWN0b3InLCAnZGF0YScsIDgpO1xuICAgICAgICBpZiAodGhpcy5mbGFncyAmIDIpIHtcbiAgICAgICAgICAgIHRoaXMuX3Byb2NFbnRyeUZpZWxkKGVudHJ5LCAnTnVtYmVyT2ZFbnRyaWVzJywgJ3VpbnQnLCAxNik7XG4gICAgICAgICAgICB0aGlzLl9wcm9jU3ViRW50cmllcyhlbnRyeSwgJ2NsZWFyQW5kQ3J5cHRlZERhdGEnLCBlbnRyeS5OdW1iZXJPZkVudHJpZXMsIGZ1bmN0aW9uIChjbGVhckFuZENyeXB0ZWREYXRhKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJvY0VudHJ5RmllbGQoY2xlYXJBbmRDcnlwdGVkRGF0YSwgJ0J5dGVzT2ZDbGVhckRhdGEnLCAndWludCcsIDE2KTtcbiAgICAgICAgICAgICAgICB0aGlzLl9wcm9jRW50cnlGaWVsZChjbGVhckFuZENyeXB0ZWREYXRhLCAnQnl0ZXNPZkVuY3J5cHRlZERhdGEnLCAndWludCcsIDMyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHV1aWRQcm9jZXNzb3IoKSB7XG4gICAgbGV0IHRmeGRVc2VyVHlwZSA9IFsweDZELCAweDFELCAweDlCLCAweDA1LCAweDQyLCAweEQ1LCAweDQ0LCAweEU2LCAweDgwLCAweEUyLCAweDE0LCAweDFELCAweEFGLCAweEY3LCAweDU3LCAweEIyXTtcbiAgICBsZXQgdGZyZlVzZXJUeXBlID0gWzB4RDQsIDB4ODAsIDB4N0UsIDB4RjIsIDB4Q0EsIDB4MzksIDB4NDYsIDB4OTUsIDB4OEUsIDB4NTQsIDB4MjYsIDB4Q0IsIDB4OUUsIDB4NDYsIDB4QTcsIDB4OUZdO1xuICAgIGxldCBzZXBpZmZVc2VyVHlwZSA9IFsweEEyLCAweDM5LCAweDRGLCAweDUyLCAweDVBLCAweDlCLCAweDRmLCAweDE0LCAweEEyLCAweDQ0LCAweDZDLCAweDQyLCAweDdDLCAweDY0LCAweDhELCAweEY0XTtcblxuICAgIGlmIChhcnJheUVxdWFsKHRoaXMudXNlcnR5cGUsIHRmeGRVc2VyVHlwZSkpIHtcbiAgICAgICAgdGhpcy5fcHJvY0Z1bGxCb3goKTtcbiAgICAgICAgaWYgKHRoaXMuX3BhcnNpbmcpIHtcbiAgICAgICAgICAgIHRoaXMudHlwZSA9ICd0ZnhkJztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9wcm9jRmllbGQoJ2ZyYWdtZW50X2Fic29sdXRlX3RpbWUnLCAndWludCcsICh0aGlzLnZlcnNpb24gPT09IDEpID8gNjQgOiAzMik7XG4gICAgICAgIHRoaXMuX3Byb2NGaWVsZCgnZnJhZ21lbnRfZHVyYXRpb24nLCAndWludCcsICh0aGlzLnZlcnNpb24gPT09IDEpID8gNjQgOiAzMik7XG4gICAgfVxuXG4gICAgaWYgKGFycmF5RXF1YWwodGhpcy51c2VydHlwZSwgdGZyZlVzZXJUeXBlKSkge1xuICAgICAgICB0aGlzLl9wcm9jRnVsbEJveCgpO1xuICAgICAgICBpZiAodGhpcy5fcGFyc2luZykge1xuICAgICAgICAgICAgdGhpcy50eXBlID0gJ3RmcmYnO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3Byb2NGaWVsZCgnZnJhZ21lbnRfY291bnQnLCAndWludCcsIDgpO1xuICAgICAgICB0aGlzLl9wcm9jRW50cmllcygnZW50cnknLCB0aGlzLmZyYWdtZW50X2NvdW50LCBmdW5jdGlvbiAoZW50cnkpIHtcbiAgICAgICAgICAgIHRoaXMuX3Byb2NFbnRyeUZpZWxkKGVudHJ5LCAnZnJhZ21lbnRfYWJzb2x1dGVfdGltZScsICd1aW50JywgKHRoaXMudmVyc2lvbiA9PT0gMSkgPyA2NCA6IDMyKTtcbiAgICAgICAgICAgIHRoaXMuX3Byb2NFbnRyeUZpZWxkKGVudHJ5LCAnZnJhZ21lbnRfZHVyYXRpb24nLCAndWludCcsICh0aGlzLnZlcnNpb24gPT09IDEpID8gNjQgOiAzMik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChhcnJheUVxdWFsKHRoaXMudXNlcnR5cGUsIHNlcGlmZlVzZXJUeXBlKSkge1xuICAgICAgICBpZiAodGhpcy5fcGFyc2luZykge1xuICAgICAgICAgICAgdGhpcy50eXBlID0gJ3NlcGlmZic7XG4gICAgICAgIH1cbiAgICAgICAgc2VuY1Byb2Nlc3Nvci5jYWxsKHRoaXMpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gTXNzRnJhZ21lbnRQcm9jZXNzb3IoY29uZmlnKSB7XG5cbiAgICBjb25maWcgPSBjb25maWcgfHwge307XG4gICAgY29uc3QgY29udGV4dCA9IHRoaXMuY29udGV4dDtcbiAgICBjb25zdCBkYXNoTWV0cmljcyA9IGNvbmZpZy5kYXNoTWV0cmljcztcbiAgICBjb25zdCBwbGF5YmFja0NvbnRyb2xsZXIgPSBjb25maWcucGxheWJhY2tDb250cm9sbGVyO1xuICAgIGNvbnN0IGV2ZW50QnVzID0gY29uZmlnLmV2ZW50QnVzO1xuICAgIGNvbnN0IHByb3RlY3Rpb25Db250cm9sbGVyID0gY29uZmlnLnByb3RlY3Rpb25Db250cm9sbGVyO1xuICAgIGNvbnN0IElTT0JveGVyID0gY29uZmlnLklTT0JveGVyO1xuICAgIGNvbnN0IGRlYnVnID0gY29uZmlnLmRlYnVnO1xuICAgIGxldCBtc3NGcmFnbWVudE1vb3ZQcm9jZXNzb3IsXG4gICAgICAgIG1zc0ZyYWdtZW50TW9vZlByb2Nlc3NvcixcbiAgICAgICAgaW5zdGFuY2U7XG5cbiAgICBmdW5jdGlvbiBzZXR1cCgpIHtcbiAgICAgICAgSVNPQm94ZXIuYWRkQm94UHJvY2Vzc29yKCd1dWlkJywgdXVpZFByb2Nlc3Nvcik7XG4gICAgICAgIElTT0JveGVyLmFkZEJveFByb2Nlc3Nvcignc2FpbycsIHNhaW9Qcm9jZXNzb3IpO1xuICAgICAgICBJU09Cb3hlci5hZGRCb3hQcm9jZXNzb3IoJ3NhaXonLCBzYWl6UHJvY2Vzc29yKTtcbiAgICAgICAgSVNPQm94ZXIuYWRkQm94UHJvY2Vzc29yKCdzZW5jJywgc2VuY1Byb2Nlc3Nvcik7XG5cbiAgICAgICAgbXNzRnJhZ21lbnRNb292UHJvY2Vzc29yID0gTXNzRnJhZ21lbnRNb292UHJvY2Vzc29yKGNvbnRleHQpLmNyZWF0ZSh7XG4gICAgICAgICAgICBwcm90ZWN0aW9uQ29udHJvbGxlcjogcHJvdGVjdGlvbkNvbnRyb2xsZXIsXG4gICAgICAgICAgICBjb25zdGFudHM6IGNvbmZpZy5jb25zdGFudHMsXG4gICAgICAgICAgICBJU09Cb3hlcjogSVNPQm94ZXJ9KTtcblxuICAgICAgICBtc3NGcmFnbWVudE1vb2ZQcm9jZXNzb3IgPSBNc3NGcmFnbWVudE1vb2ZQcm9jZXNzb3IoY29udGV4dCkuY3JlYXRlKHtcbiAgICAgICAgICAgIGRhc2hNZXRyaWNzOiBkYXNoTWV0cmljcyxcbiAgICAgICAgICAgIHBsYXliYWNrQ29udHJvbGxlcjogcGxheWJhY2tDb250cm9sbGVyLFxuICAgICAgICAgICAgSVNPQm94ZXI6IElTT0JveGVyLFxuICAgICAgICAgICAgZXZlbnRCdXM6IGV2ZW50QnVzLFxuICAgICAgICAgICAgZGVidWc6IGRlYnVnLFxuICAgICAgICAgICAgZXJySGFuZGxlcjogY29uZmlnLmVyckhhbmRsZXJcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2VuZXJhdGVNb292KHJlcCkge1xuICAgICAgICByZXR1cm4gbXNzRnJhZ21lbnRNb292UHJvY2Vzc29yLmdlbmVyYXRlTW9vdihyZXApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHByb2Nlc3NGcmFnbWVudChlLCBzdHJlYW1Qcm9jZXNzb3IpIHtcbiAgICAgICAgaWYgKCFlIHx8ICFlLnJlcXVlc3QgfHwgIWUucmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignZSBwYXJhbWV0ZXIgaXMgbWlzc2luZyBvciBtYWxmb3JtZWQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlLnJlcXVlc3QudHlwZSA9PT0gJ01lZGlhU2VnbWVudCcpIHtcbiAgICAgICAgICAgIC8vIE1lZGlhU2VnbWVudCA9PiBjb252ZXJ0IHRvIFNtb290aCBTdHJlYW1pbmcgbW9vZiBmb3JtYXRcbiAgICAgICAgICAgIG1zc0ZyYWdtZW50TW9vZlByb2Nlc3Nvci5jb252ZXJ0RnJhZ21lbnQoZSwgc3RyZWFtUHJvY2Vzc29yKTtcblxuICAgICAgICB9IGVsc2UgaWYgKGUucmVxdWVzdC50eXBlID09PSBIVFRQUmVxdWVzdC5NU1NfRlJBR01FTlRfSU5GT19TRUdNRU5UX1RZUEUpIHtcbiAgICAgICAgICAgIC8vIEZyYWdtZW50SW5mbyAobGl2ZSkgPT4gdXBkYXRlIHNlZ21lbnRzIGxpc3RcbiAgICAgICAgICAgIG1zc0ZyYWdtZW50TW9vZlByb2Nlc3Nvci51cGRhdGVTZWdtZW50TGlzdChlLCBzdHJlYW1Qcm9jZXNzb3IpO1xuXG4gICAgICAgICAgICAvLyBTdG9wIGV2ZW50IHByb3BhZ2F0aW9uIChGcmFnbWVudEluZm8gbXVzdCBub3QgYmUgYWRkZWQgdG8gYnVmZmVyKVxuICAgICAgICAgICAgZS5zZW5kZXIgPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW5zdGFuY2UgPSB7XG4gICAgICAgIGdlbmVyYXRlTW9vdjogZ2VuZXJhdGVNb292LFxuICAgICAgICBwcm9jZXNzRnJhZ21lbnQ6IHByb2Nlc3NGcmFnbWVudFxuICAgIH07XG5cbiAgICBzZXR1cCgpO1xuXG4gICAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG5Nc3NGcmFnbWVudFByb2Nlc3Nvci5fX2Rhc2hqc19mYWN0b3J5X25hbWUgPSAnTXNzRnJhZ21lbnRQcm9jZXNzb3InO1xuZXhwb3J0IGRlZmF1bHQgZGFzaGpzLkZhY3RvcnlNYWtlci5nZXRDbGFzc0ZhY3RvcnkoTXNzRnJhZ21lbnRQcm9jZXNzb3IpOyAvKiBqc2hpbnQgaWdub3JlOmxpbmUgKi9cbiIsIi8qKlxuICogVGhlIGNvcHlyaWdodCBpbiB0aGlzIHNvZnR3YXJlIGlzIGJlaW5nIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSBCU0QgTGljZW5zZSxcbiAqIGluY2x1ZGVkIGJlbG93LiBUaGlzIHNvZnR3YXJlIG1heSBiZSBzdWJqZWN0IHRvIG90aGVyIHRoaXJkIHBhcnR5IGFuZCBjb250cmlidXRvclxuICogcmlnaHRzLCBpbmNsdWRpbmcgcGF0ZW50IHJpZ2h0cywgYW5kIG5vIHN1Y2ggcmlnaHRzIGFyZSBncmFudGVkIHVuZGVyIHRoaXMgbGljZW5zZS5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMsIERhc2ggSW5kdXN0cnkgRm9ydW0uXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG4gKiBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAqICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAqICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vclxuICogIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4gKiAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIERhc2ggSW5kdXN0cnkgRm9ydW0gbm9yIHRoZSBuYW1lcyBvZiBpdHNcbiAqICBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlXG4gKiAgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gKlxuICogIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgQVMgSVMgQU5EIEFOWVxuICogIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbiAqICBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuXG4gKiAgSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCxcbiAqICBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUXG4gKiAgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLCBEQVRBLCBPUlxuICogIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLFxuICogIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSlcbiAqICBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRVxuICogIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG5cbmltcG9ydCBEYXRhQ2h1bmsgZnJvbSAnLi4vc3RyZWFtaW5nL3ZvL0RhdGFDaHVuayc7XG5pbXBvcnQgRnJhZ21lbnRSZXF1ZXN0IGZyb20gJy4uL3N0cmVhbWluZy92by9GcmFnbWVudFJlcXVlc3QnO1xuaW1wb3J0IE1zc0ZyYWdtZW50SW5mb0NvbnRyb2xsZXIgZnJvbSAnLi9Nc3NGcmFnbWVudEluZm9Db250cm9sbGVyJztcbmltcG9ydCBNc3NGcmFnbWVudFByb2Nlc3NvciBmcm9tICcuL01zc0ZyYWdtZW50UHJvY2Vzc29yJztcbmltcG9ydCBNc3NQYXJzZXIgZnJvbSAnLi9wYXJzZXIvTXNzUGFyc2VyJztcbmltcG9ydCBNc3NFcnJvcnMgZnJvbSAnLi9lcnJvcnMvTXNzRXJyb3JzJztcbmltcG9ydCBEYXNoSlNFcnJvciBmcm9tICcuLi9zdHJlYW1pbmcvdm8vRGFzaEpTRXJyb3InO1xuaW1wb3J0IEluaXRDYWNoZSBmcm9tICcuLi9zdHJlYW1pbmcvdXRpbHMvSW5pdENhY2hlJztcbmltcG9ydCB7SFRUUFJlcXVlc3R9IGZyb20gJy4uL3N0cmVhbWluZy92by9tZXRyaWNzL0hUVFBSZXF1ZXN0JztcblxuZnVuY3Rpb24gTXNzSGFuZGxlcihjb25maWcpIHtcblxuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcbiAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5jb250ZXh0O1xuICAgIGNvbnN0IGV2ZW50QnVzID0gY29uZmlnLmV2ZW50QnVzO1xuICAgIGNvbnN0IGV2ZW50cyA9IGNvbmZpZy5ldmVudHM7XG4gICAgY29uc3QgY29uc3RhbnRzID0gY29uZmlnLmNvbnN0YW50cztcbiAgICBjb25zdCBpbml0U2VnbWVudFR5cGUgPSBjb25maWcuaW5pdFNlZ21lbnRUeXBlO1xuICAgIGNvbnN0IGRhc2hNZXRyaWNzID0gY29uZmlnLmRhc2hNZXRyaWNzO1xuICAgIGNvbnN0IHBsYXliYWNrQ29udHJvbGxlciA9IGNvbmZpZy5wbGF5YmFja0NvbnRyb2xsZXI7XG4gICAgY29uc3Qgc3RyZWFtQ29udHJvbGxlciA9IGNvbmZpZy5zdHJlYW1Db250cm9sbGVyO1xuICAgIGNvbnN0IHByb3RlY3Rpb25Db250cm9sbGVyID0gY29uZmlnLnByb3RlY3Rpb25Db250cm9sbGVyO1xuICAgIGNvbnN0IG1zc0ZyYWdtZW50UHJvY2Vzc29yID0gTXNzRnJhZ21lbnRQcm9jZXNzb3IoY29udGV4dCkuY3JlYXRlKHtcbiAgICAgICAgZGFzaE1ldHJpY3M6IGRhc2hNZXRyaWNzLFxuICAgICAgICBwbGF5YmFja0NvbnRyb2xsZXI6IHBsYXliYWNrQ29udHJvbGxlcixcbiAgICAgICAgcHJvdGVjdGlvbkNvbnRyb2xsZXI6IHByb3RlY3Rpb25Db250cm9sbGVyLFxuICAgICAgICBzdHJlYW1Db250cm9sbGVyOiBzdHJlYW1Db250cm9sbGVyLFxuICAgICAgICBldmVudEJ1czogZXZlbnRCdXMsXG4gICAgICAgIGNvbnN0YW50czogY29uc3RhbnRzLFxuICAgICAgICBJU09Cb3hlcjogY29uZmlnLklTT0JveGVyLFxuICAgICAgICBkZWJ1ZzogY29uZmlnLmRlYnVnLFxuICAgICAgICBlcnJIYW5kbGVyOiBjb25maWcuZXJySGFuZGxlclxuICAgIH0pO1xuICAgIGxldCBtc3NQYXJzZXIsXG4gICAgICAgIGZyYWdtZW50SW5mb0NvbnRyb2xsZXJzLFxuICAgICAgICBpbml0Q2FjaGUsXG4gICAgICAgIGluc3RhbmNlO1xuXG4gICAgZnVuY3Rpb24gc2V0dXAoKSB7XG4gICAgICAgIGZyYWdtZW50SW5mb0NvbnRyb2xsZXJzID0gW107XG4gICAgICAgIGluaXRDYWNoZSA9IEluaXRDYWNoZShjb250ZXh0KS5nZXRJbnN0YW5jZSgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFN0cmVhbVByb2Nlc3Nvcih0eXBlKSB7XG4gICAgICAgIHJldHVybiBzdHJlYW1Db250cm9sbGVyLmdldEFjdGl2ZVN0cmVhbVByb2Nlc3NvcnMoKS5maWx0ZXIocHJvY2Vzc29yID0+IHtcbiAgICAgICAgICAgIHJldHVybiBwcm9jZXNzb3IuZ2V0VHlwZSgpID09PSB0eXBlO1xuICAgICAgICB9KVswXTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRGcmFnbWVudEluZm9Db250cm9sbGVyKHR5cGUpIHtcbiAgICAgICAgcmV0dXJuIGZyYWdtZW50SW5mb0NvbnRyb2xsZXJzLmZpbHRlcihjb250cm9sbGVyID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoY29udHJvbGxlci5nZXRUeXBlKCkgPT09IHR5cGUpO1xuICAgICAgICB9KVswXTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVEYXRhQ2h1bmsocmVxdWVzdCwgc3RyZWFtSWQsIGVuZEZyYWdtZW50KSB7XG4gICAgICAgIGNvbnN0IGNodW5rID0gbmV3IERhdGFDaHVuaygpO1xuXG4gICAgICAgIGNodW5rLnN0cmVhbUlkID0gc3RyZWFtSWQ7XG4gICAgICAgIGNodW5rLm1lZGlhSW5mbyA9IHJlcXVlc3QubWVkaWFJbmZvO1xuICAgICAgICBjaHVuay5zZWdtZW50VHlwZSA9IHJlcXVlc3QudHlwZTtcbiAgICAgICAgY2h1bmsuc3RhcnQgPSByZXF1ZXN0LnN0YXJ0VGltZTtcbiAgICAgICAgY2h1bmsuZHVyYXRpb24gPSByZXF1ZXN0LmR1cmF0aW9uO1xuICAgICAgICBjaHVuay5lbmQgPSBjaHVuay5zdGFydCArIGNodW5rLmR1cmF0aW9uO1xuICAgICAgICBjaHVuay5pbmRleCA9IHJlcXVlc3QuaW5kZXg7XG4gICAgICAgIGNodW5rLnF1YWxpdHkgPSByZXF1ZXN0LnF1YWxpdHk7XG4gICAgICAgIGNodW5rLnJlcHJlc2VudGF0aW9uSWQgPSByZXF1ZXN0LnJlcHJlc2VudGF0aW9uSWQ7XG4gICAgICAgIGNodW5rLmVuZEZyYWdtZW50ID0gZW5kRnJhZ21lbnQ7XG5cbiAgICAgICAgcmV0dXJuIGNodW5rO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0YXJ0RnJhZ21lbnRJbmZvQ29udHJvbGxlcnMoKSB7XG5cbiAgICAgICAgLy8gQ3JlYXRlIE1zc0ZyYWdtZW50SW5mb0NvbnRyb2xsZXJzIGZvciBlYWNoIFN0cmVhbVByb2Nlc3NvciBvZiBhY3RpdmUgc3RyZWFtIChvbmx5IGZvciBhdWRpbywgdmlkZW8gb3IgZnJhZ21lbnRlZFRleHQpXG4gICAgICAgIGxldCBwcm9jZXNzb3JzID0gc3RyZWFtQ29udHJvbGxlci5nZXRBY3RpdmVTdHJlYW1Qcm9jZXNzb3JzKCk7XG4gICAgICAgIHByb2Nlc3NvcnMuZm9yRWFjaChmdW5jdGlvbiAocHJvY2Vzc29yKSB7XG4gICAgICAgICAgICBpZiAocHJvY2Vzc29yLmdldFR5cGUoKSA9PT0gY29uc3RhbnRzLlZJREVPIHx8XG4gICAgICAgICAgICAgICAgcHJvY2Vzc29yLmdldFR5cGUoKSA9PT0gY29uc3RhbnRzLkFVRElPIHx8XG4gICAgICAgICAgICAgICAgcHJvY2Vzc29yLmdldFR5cGUoKSA9PT0gY29uc3RhbnRzLkZSQUdNRU5URURfVEVYVCkge1xuXG4gICAgICAgICAgICAgICAgbGV0IGZyYWdtZW50SW5mb0NvbnRyb2xsZXIgPSBnZXRGcmFnbWVudEluZm9Db250cm9sbGVyKHByb2Nlc3Nvci5nZXRUeXBlKCkpO1xuICAgICAgICAgICAgICAgIGlmICghZnJhZ21lbnRJbmZvQ29udHJvbGxlcikge1xuICAgICAgICAgICAgICAgICAgICBmcmFnbWVudEluZm9Db250cm9sbGVyID0gTXNzRnJhZ21lbnRJbmZvQ29udHJvbGxlcihjb250ZXh0KS5jcmVhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RyZWFtUHJvY2Vzc29yOiBwcm9jZXNzb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlVVJMQ29udHJvbGxlcjogY29uZmlnLmJhc2VVUkxDb250cm9sbGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVidWc6IGNvbmZpZy5kZWJ1Z1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgZnJhZ21lbnRJbmZvQ29udHJvbGxlci5pbml0aWFsaXplKCk7XG4gICAgICAgICAgICAgICAgICAgIGZyYWdtZW50SW5mb0NvbnRyb2xsZXJzLnB1c2goZnJhZ21lbnRJbmZvQ29udHJvbGxlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZyYWdtZW50SW5mb0NvbnRyb2xsZXIuc3RhcnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3RvcEZyYWdtZW50SW5mb0NvbnRyb2xsZXJzKCkge1xuICAgICAgICBmcmFnbWVudEluZm9Db250cm9sbGVycy5mb3JFYWNoKGMgPT4ge1xuICAgICAgICAgICAgYy5yZXNldCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgZnJhZ21lbnRJbmZvQ29udHJvbGxlcnMgPSBbXTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbkluaXRGcmFnbWVudE5lZWRlZChlKSB7XG4gICAgICAgIGxldCBzdHJlYW1Qcm9jZXNzb3IgPSBnZXRTdHJlYW1Qcm9jZXNzb3IoZS5tZWRpYVR5cGUpO1xuICAgICAgICBpZiAoIXN0cmVhbVByb2Nlc3NvcikgcmV0dXJuO1xuXG4gICAgICAgIC8vIENyZWF0ZSBpbml0IHNlZ21lbnQgcmVxdWVzdFxuICAgICAgICBsZXQgcmVwcmVzZW50YXRpb25Db250cm9sbGVyID0gc3RyZWFtUHJvY2Vzc29yLmdldFJlcHJlc2VudGF0aW9uQ29udHJvbGxlcigpO1xuICAgICAgICBsZXQgcmVwcmVzZW50YXRpb24gPSByZXByZXNlbnRhdGlvbkNvbnRyb2xsZXIuZ2V0Q3VycmVudFJlcHJlc2VudGF0aW9uKCk7XG4gICAgICAgIGxldCBtZWRpYUluZm8gPSBzdHJlYW1Qcm9jZXNzb3IuZ2V0TWVkaWFJbmZvKCk7XG5cbiAgICAgICAgbGV0IHJlcXVlc3QgPSBuZXcgRnJhZ21lbnRSZXF1ZXN0KCk7XG4gICAgICAgIHJlcXVlc3QubWVkaWFUeXBlID0gcmVwcmVzZW50YXRpb24uYWRhcHRhdGlvbi50eXBlO1xuICAgICAgICByZXF1ZXN0LnR5cGUgPSBpbml0U2VnbWVudFR5cGU7XG4gICAgICAgIHJlcXVlc3QucmFuZ2UgPSByZXByZXNlbnRhdGlvbi5yYW5nZTtcbiAgICAgICAgcmVxdWVzdC5xdWFsaXR5ID0gcmVwcmVzZW50YXRpb24uaW5kZXg7XG4gICAgICAgIHJlcXVlc3QubWVkaWFJbmZvID0gbWVkaWFJbmZvO1xuICAgICAgICByZXF1ZXN0LnJlcHJlc2VudGF0aW9uSWQgPSByZXByZXNlbnRhdGlvbi5pZDtcblxuICAgICAgICBjb25zdCBjaHVuayA9IGNyZWF0ZURhdGFDaHVuayhyZXF1ZXN0LCBtZWRpYUluZm8uc3RyZWFtSW5mby5pZCwgZS50eXBlICE9PSBldmVudHMuRlJBR01FTlRfTE9BRElOR19QUk9HUkVTUyk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEdlbmVyYXRlIGluaXQgc2VnbWVudCAobW9vdilcbiAgICAgICAgICAgIGNodW5rLmJ5dGVzID0gbXNzRnJhZ21lbnRQcm9jZXNzb3IuZ2VuZXJhdGVNb292KHJlcHJlc2VudGF0aW9uKTtcblxuICAgICAgICAgICAgLy8gTm90aWZ5IGluaXQgc2VnbWVudCBoYXMgYmVlbiBsb2FkZWRcbiAgICAgICAgICAgIGV2ZW50QnVzLnRyaWdnZXIoZXZlbnRzLklOSVRfRlJBR01FTlRfTE9BREVELFxuICAgICAgICAgICAgICAgIHsgY2h1bms6IGNodW5rIH0sXG4gICAgICAgICAgICAgICAgeyBzdHJlYW1JZDogbWVkaWFJbmZvLnN0cmVhbUluZm8uaWQsIG1lZGlhVHlwZTogcmVwcmVzZW50YXRpb24uYWRhcHRhdGlvbi50eXBlIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbmZpZy5lcnJIYW5kbGVyLmVycm9yKG5ldyBEYXNoSlNFcnJvcihlLmNvZGUsIGUubWVzc2FnZSwgZS5kYXRhKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGFuZ2UgdGhlIHNlbmRlciB2YWx1ZSB0byBzdG9wIGV2ZW50IHRvIGJlIHByb3BhZ2F0ZWRcbiAgICAgICAgZS5zZW5kZXIgPSBudWxsO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uU2VnbWVudE1lZGlhTG9hZGVkKGUpIHtcbiAgICAgICAgaWYgKGUuZXJyb3IpICByZXR1cm47XG5cbiAgICAgICAgbGV0IHN0cmVhbVByb2Nlc3NvciA9IGdldFN0cmVhbVByb2Nlc3NvcihlLnJlcXVlc3QubWVkaWFUeXBlKTtcbiAgICAgICAgaWYgKCFzdHJlYW1Qcm9jZXNzb3IpIHJldHVybjtcblxuICAgICAgICAvLyBQcm9jZXNzIG1vb2YgdG8gdHJhbnNjb2RlIGl0IGZyb20gTVNTIHRvIERBU0ggKG9yIHRvIHVwZGF0ZSBzZWdtZW50IHRpbWVsaW5lIGZvciBTZWdtZW50SW5mbyBmcmFnbWVudHMpXG4gICAgICAgIG1zc0ZyYWdtZW50UHJvY2Vzc29yLnByb2Nlc3NGcmFnbWVudChlLCBzdHJlYW1Qcm9jZXNzb3IpO1xuXG4gICAgICAgIGlmIChlLnJlcXVlc3QudHlwZSA9PT0gSFRUUFJlcXVlc3QuTVNTX0ZSQUdNRU5UX0lORk9fU0VHTUVOVF9UWVBFKSB7XG4gICAgICAgICAgICAvLyBJZiBGcmFnbWVudEluZm8gbG9hZGVkLCB0aGVuIG5vdGlmeSBjb3JyZXNwb25kaW5nIE1zc0ZyYWdtZW50SW5mb0NvbnRyb2xsZXJcbiAgICAgICAgICAgIGxldCBmcmFnbWVudEluZm9Db250cm9sbGVyID0gZ2V0RnJhZ21lbnRJbmZvQ29udHJvbGxlcihlLnJlcXVlc3QubWVkaWFUeXBlKTtcbiAgICAgICAgICAgIGlmIChmcmFnbWVudEluZm9Db250cm9sbGVyKSB7XG4gICAgICAgICAgICAgICAgZnJhZ21lbnRJbmZvQ29udHJvbGxlci5mcmFnbWVudEluZm9Mb2FkZWQoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTdGFydCBNc3NGcmFnbWVudEluZm9Db250cm9sbGVycyBpbiBjYXNlIG9mIHN0YXJ0LW92ZXIgc3RyZWFtc1xuICAgICAgICBsZXQgbWFuaWZlc3RJbmZvID0gZS5yZXF1ZXN0Lm1lZGlhSW5mby5zdHJlYW1JbmZvLm1hbmlmZXN0SW5mbztcbiAgICAgICAgaWYgKCFtYW5pZmVzdEluZm8uaXNEeW5hbWljICYmIG1hbmlmZXN0SW5mby5EVlJXaW5kb3dTaXplICE9PSBJbmZpbml0eSkge1xuICAgICAgICAgICAgc3RhcnRGcmFnbWVudEluZm9Db250cm9sbGVycygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25QbGF5YmFja1BhdXNlZCgpIHtcbiAgICAgICAgaWYgKHBsYXliYWNrQ29udHJvbGxlci5nZXRJc0R5bmFtaWMoKSAmJiBwbGF5YmFja0NvbnRyb2xsZXIuZ2V0VGltZSgpICE9PSAwKSB7XG4gICAgICAgICAgICBzdGFydEZyYWdtZW50SW5mb0NvbnRyb2xsZXJzKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvblBsYXliYWNrU2Vla0Fza2VkKCkge1xuICAgICAgICBpZiAocGxheWJhY2tDb250cm9sbGVyLmdldElzRHluYW1pYygpICYmIHBsYXliYWNrQ29udHJvbGxlci5nZXRUaW1lKCkgIT09IDApIHtcbiAgICAgICAgICAgIHN0YXJ0RnJhZ21lbnRJbmZvQ29udHJvbGxlcnMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uVFRNTFByZVByb2Nlc3ModHRtbFN1YnRpdGxlcykge1xuICAgICAgICBpZiAoIXR0bWxTdWJ0aXRsZXMgfHwgIXR0bWxTdWJ0aXRsZXMuZGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdHRtbFN1YnRpdGxlcy5kYXRhID0gdHRtbFN1YnRpdGxlcy5kYXRhLnJlcGxhY2UoL2h0dHA6XFwvXFwvd3d3LnczLm9yZ1xcLzIwMDZcXC8xMFxcL3R0YWYxL2dpLCAnaHR0cDovL3d3dy53My5vcmcvbnMvdHRtbCcpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlZ2lzdGVyRXZlbnRzKCkge1xuICAgICAgICBldmVudEJ1cy5vbihldmVudHMuSU5JVF9GUkFHTUVOVF9ORUVERUQsIG9uSW5pdEZyYWdtZW50TmVlZGVkLCBpbnN0YW5jZSwgeyBwcmlvcml0eTogZGFzaGpzLkZhY3RvcnlNYWtlci5nZXRTaW5nbGV0b25GYWN0b3J5QnlOYW1lKGV2ZW50QnVzLmdldENsYXNzTmFtZSgpKS5FVkVOVF9QUklPUklUWV9ISUdIIH0pOyAvKiBqc2hpbnQgaWdub3JlOmxpbmUgKi9cbiAgICAgICAgZXZlbnRCdXMub24oZXZlbnRzLlBMQVlCQUNLX1BBVVNFRCwgb25QbGF5YmFja1BhdXNlZCwgaW5zdGFuY2UsIHsgcHJpb3JpdHk6IGRhc2hqcy5GYWN0b3J5TWFrZXIuZ2V0U2luZ2xldG9uRmFjdG9yeUJ5TmFtZShldmVudEJ1cy5nZXRDbGFzc05hbWUoKSkuRVZFTlRfUFJJT1JJVFlfSElHSCB9KTsgLyoganNoaW50IGlnbm9yZTpsaW5lICovXG4gICAgICAgIGV2ZW50QnVzLm9uKGV2ZW50cy5QTEFZQkFDS19TRUVLX0FTS0VELCBvblBsYXliYWNrU2Vla0Fza2VkLCBpbnN0YW5jZSwgeyBwcmlvcml0eTogZGFzaGpzLkZhY3RvcnlNYWtlci5nZXRTaW5nbGV0b25GYWN0b3J5QnlOYW1lKGV2ZW50QnVzLmdldENsYXNzTmFtZSgpKS5FVkVOVF9QUklPUklUWV9ISUdIIH0pOyAvKiBqc2hpbnQgaWdub3JlOmxpbmUgKi9cbiAgICAgICAgZXZlbnRCdXMub24oZXZlbnRzLkZSQUdNRU5UX0xPQURJTkdfQ09NUExFVEVELCBvblNlZ21lbnRNZWRpYUxvYWRlZCwgaW5zdGFuY2UsIHsgcHJpb3JpdHk6IGRhc2hqcy5GYWN0b3J5TWFrZXIuZ2V0U2luZ2xldG9uRmFjdG9yeUJ5TmFtZShldmVudEJ1cy5nZXRDbGFzc05hbWUoKSkuRVZFTlRfUFJJT1JJVFlfSElHSCB9KTsgLyoganNoaW50IGlnbm9yZTpsaW5lICovXG4gICAgICAgIGV2ZW50QnVzLm9uKGV2ZW50cy5UVE1MX1RPX1BBUlNFLCBvblRUTUxQcmVQcm9jZXNzLCBpbnN0YW5jZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgICAgIGlmIChtc3NQYXJzZXIpIHtcbiAgICAgICAgICAgIG1zc1BhcnNlci5yZXNldCgpO1xuICAgICAgICAgICAgbXNzUGFyc2VyID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgZXZlbnRCdXMub2ZmKGV2ZW50cy5JTklUX0ZSQUdNRU5UX05FRURFRCwgb25Jbml0RnJhZ21lbnROZWVkZWQsIHRoaXMpO1xuICAgICAgICBldmVudEJ1cy5vZmYoZXZlbnRzLlBMQVlCQUNLX1BBVVNFRCwgb25QbGF5YmFja1BhdXNlZCwgdGhpcyk7XG4gICAgICAgIGV2ZW50QnVzLm9mZihldmVudHMuUExBWUJBQ0tfU0VFS19BU0tFRCwgb25QbGF5YmFja1NlZWtBc2tlZCwgdGhpcyk7XG4gICAgICAgIGV2ZW50QnVzLm9mZihldmVudHMuRlJBR01FTlRfTE9BRElOR19DT01QTEVURUQsIG9uU2VnbWVudE1lZGlhTG9hZGVkLCB0aGlzKTtcbiAgICAgICAgZXZlbnRCdXMub2ZmKGV2ZW50cy5UVE1MX1RPX1BBUlNFLCBvblRUTUxQcmVQcm9jZXNzLCB0aGlzKTtcblxuICAgICAgICAvLyBSZXNldCBGcmFnbWVudEluZm9Db250cm9sbGVyc1xuICAgICAgICBzdG9wRnJhZ21lbnRJbmZvQ29udHJvbGxlcnMoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVNc3NQYXJzZXIoKSB7XG4gICAgICAgIG1zc1BhcnNlciA9IE1zc1BhcnNlcihjb250ZXh0KS5jcmVhdGUoY29uZmlnKTtcbiAgICAgICAgcmV0dXJuIG1zc1BhcnNlcjtcbiAgICB9XG5cbiAgICBpbnN0YW5jZSA9IHtcbiAgICAgICAgcmVzZXQ6IHJlc2V0LFxuICAgICAgICBjcmVhdGVNc3NQYXJzZXI6IGNyZWF0ZU1zc1BhcnNlcixcbiAgICAgICAgcmVnaXN0ZXJFdmVudHM6IHJlZ2lzdGVyRXZlbnRzXG4gICAgfTtcblxuICAgIHNldHVwKCk7XG5cbiAgICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbk1zc0hhbmRsZXIuX19kYXNoanNfZmFjdG9yeV9uYW1lID0gJ01zc0hhbmRsZXInO1xuY29uc3QgZmFjdG9yeSA9IGRhc2hqcy5GYWN0b3J5TWFrZXIuZ2V0Q2xhc3NGYWN0b3J5KE1zc0hhbmRsZXIpOyAvKiBqc2hpbnQgaWdub3JlOmxpbmUgKi9cbmZhY3RvcnkuZXJyb3JzID0gTXNzRXJyb3JzO1xuZGFzaGpzLkZhY3RvcnlNYWtlci51cGRhdGVDbGFzc0ZhY3RvcnkoTXNzSGFuZGxlci5fX2Rhc2hqc19mYWN0b3J5X25hbWUsIGZhY3RvcnkpOyAvKiBqc2hpbnQgaWdub3JlOmxpbmUgKi9cbmV4cG9ydCBkZWZhdWx0IGZhY3Rvcnk7IC8qIGpzaGludCBpZ25vcmU6bGluZSAqL1xuIiwiLyoqXG4gKiBUaGUgY29weXJpZ2h0IGluIHRoaXMgc29mdHdhcmUgaXMgYmVpbmcgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIEJTRCBMaWNlbnNlLFxuICogaW5jbHVkZWQgYmVsb3cuIFRoaXMgc29mdHdhcmUgbWF5IGJlIHN1YmplY3QgdG8gb3RoZXIgdGhpcmQgcGFydHkgYW5kIGNvbnRyaWJ1dG9yXG4gKiByaWdodHMsIGluY2x1ZGluZyBwYXRlbnQgcmlnaHRzLCBhbmQgbm8gc3VjaCByaWdodHMgYXJlIGdyYW50ZWQgdW5kZXIgdGhpcyBsaWNlbnNlLlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMywgRGFzaCBJbmR1c3RyeSBGb3J1bS5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbiAqIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICogIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICogIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yXG4gKiAgb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbiAqICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgRGFzaCBJbmR1c3RyeSBGb3J1bSBub3IgdGhlIG5hbWVzIG9mIGl0c1xuICogIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmVcbiAqICB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbiAqXG4gKiAgVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBBUyBJUyBBTkQgQU5ZXG4gKiAgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuICogIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC5cbiAqICBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULFxuICogIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVRcbiAqICBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SXG4gKiAgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksXG4gKiAgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKVxuICogIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFXG4gKiAgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKi9cbmltcG9ydCBFcnJvcnNCYXNlIGZyb20gJy4uLy4uL2NvcmUvZXJyb3JzL0Vycm9yc0Jhc2UnO1xuLyoqXG4gKiBAY2xhc3NcbiAqXG4gKi9cbmNsYXNzIE1zc0Vycm9ycyBleHRlbmRzIEVycm9yc0Jhc2Uge1xuXHRjb25zdHJ1Y3RvciAoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBFcnJvciBjb2RlIHJldHVybmVkIHdoZW4gbm8gdGZyZiBib3ggaXMgZGV0ZWN0ZWQgaW4gTVNTIGxpdmUgc3RyZWFtXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLk1TU19OT19URlJGX0NPREUgPSAyMDA7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEVycm9yIGNvZGUgcmV0dXJuZWQgd2hlbiBvbmUgb2YgdGhlIGNvZGVjcyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdCBpcyBub3Qgc3VwcG9ydGVkXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLk1TU19VTlNVUFBPUlRFRF9DT0RFQ19DT0RFID0gMjAxO1xuXG4gICAgICAgIHRoaXMuTVNTX05PX1RGUkZfTUVTU0FHRSA9ICdNaXNzaW5nIHRmcmYgaW4gbGl2ZSBtZWRpYSBzZWdtZW50JztcbiAgICAgICAgdGhpcy5NU1NfVU5TVVBQT1JURURfQ09ERUNfTUVTU0FHRSA9ICdVbnN1cHBvcnRlZCBjb2RlYyc7XG4gICAgfVxufVxuXG5sZXQgbXNzRXJyb3JzID0gbmV3IE1zc0Vycm9ycygpO1xuZXhwb3J0IGRlZmF1bHQgbXNzRXJyb3JzOyIsIi8qKlxuICogVGhlIGNvcHlyaWdodCBpbiB0aGlzIHNvZnR3YXJlIGlzIGJlaW5nIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSBCU0QgTGljZW5zZSxcbiAqIGluY2x1ZGVkIGJlbG93LiBUaGlzIHNvZnR3YXJlIG1heSBiZSBzdWJqZWN0IHRvIG90aGVyIHRoaXJkIHBhcnR5IGFuZCBjb250cmlidXRvclxuICogcmlnaHRzLCBpbmNsdWRpbmcgcGF0ZW50IHJpZ2h0cywgYW5kIG5vIHN1Y2ggcmlnaHRzIGFyZSBncmFudGVkIHVuZGVyIHRoaXMgbGljZW5zZS5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMsIERhc2ggSW5kdXN0cnkgRm9ydW0uXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG4gKiBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAqICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAqICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vclxuICogIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4gKiAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIERhc2ggSW5kdXN0cnkgRm9ydW0gbm9yIHRoZSBuYW1lcyBvZiBpdHNcbiAqICBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlXG4gKiAgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gKlxuICogIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgQVMgSVMgQU5EIEFOWVxuICogIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbiAqICBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuXG4gKiAgSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCxcbiAqICBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUXG4gKiAgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLCBEQVRBLCBPUlxuICogIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLFxuICogIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSlcbiAqICBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRVxuICogIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG5cbmltcG9ydCBNc3NIYW5kbGVyIGZyb20gJy4vTXNzSGFuZGxlcic7XG5cbi8vIFNob3ZlIGJvdGggb2YgdGhlc2UgaW50byB0aGUgZ2xvYmFsIHNjb3BlXG52YXIgY29udGV4dCA9ICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cpIHx8IGdsb2JhbDtcblxudmFyIGRhc2hqcyA9IGNvbnRleHQuZGFzaGpzO1xuaWYgKCFkYXNoanMpIHtcbiAgICBkYXNoanMgPSBjb250ZXh0LmRhc2hqcyA9IHt9O1xufVxuXG5kYXNoanMuTXNzSGFuZGxlciA9IE1zc0hhbmRsZXI7XG5cbmV4cG9ydCBkZWZhdWx0IGRhc2hqcztcbmV4cG9ydCB7IE1zc0hhbmRsZXIgfTtcbiIsIi8qKlxuICogVGhlIGNvcHlyaWdodCBpbiB0aGlzIHNvZnR3YXJlIGlzIGJlaW5nIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSBCU0QgTGljZW5zZSxcbiAqIGluY2x1ZGVkIGJlbG93LiBUaGlzIHNvZnR3YXJlIG1heSBiZSBzdWJqZWN0IHRvIG90aGVyIHRoaXJkIHBhcnR5IGFuZCBjb250cmlidXRvclxuICogcmlnaHRzLCBpbmNsdWRpbmcgcGF0ZW50IHJpZ2h0cywgYW5kIG5vIHN1Y2ggcmlnaHRzIGFyZSBncmFudGVkIHVuZGVyIHRoaXMgbGljZW5zZS5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMsIERhc2ggSW5kdXN0cnkgRm9ydW0uXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG4gKiBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAqICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAqICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vclxuICogIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4gKiAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIERhc2ggSW5kdXN0cnkgRm9ydW0gbm9yIHRoZSBuYW1lcyBvZiBpdHNcbiAqICBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlXG4gKiAgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gKlxuICogIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgQVMgSVMgQU5EIEFOWVxuICogIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbiAqICBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuXG4gKiAgSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCxcbiAqICBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUXG4gKiAgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLCBEQVRBLCBPUlxuICogIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLFxuICogIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSlcbiAqICBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRVxuICogIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG5cbi8qKlxuICogQG1vZHVsZSBNc3NQYXJzZXJcbiAqIEBpZ25vcmVcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgb2JqZWN0XG4gKi9cblxuaW1wb3J0IEJpZ0ludCBmcm9tICcuLi8uLi8uLi9leHRlcm5hbHMvQmlnSW50ZWdlcic7XG5cbmZ1bmN0aW9uIE1zc1BhcnNlcihjb25maWcpIHtcbiAgICBjb25maWcgPSBjb25maWcgfHwge307XG4gICAgY29uc3QgQkFTRTY0ID0gY29uZmlnLkJBU0U2NDtcbiAgICBjb25zdCBkZWJ1ZyA9IGNvbmZpZy5kZWJ1ZztcbiAgICBjb25zdCBjb25zdGFudHMgPSBjb25maWcuY29uc3RhbnRzO1xuICAgIGNvbnN0IG1hbmlmZXN0TW9kZWwgPSBjb25maWcubWFuaWZlc3RNb2RlbDtcbiAgICBjb25zdCBtZWRpYVBsYXllck1vZGVsID0gY29uZmlnLm1lZGlhUGxheWVyTW9kZWw7XG4gICAgY29uc3Qgc2V0dGluZ3MgPSBjb25maWcuc2V0dGluZ3M7XG5cbiAgICBjb25zdCBERUZBVUxUX1RJTUVfU0NBTEUgPSAxMDAwMDAwMC4wO1xuICAgIGNvbnN0IFNVUFBPUlRFRF9DT0RFQ1MgPSBbJ0FBQycsICdBQUNMJywgJ0FWQzEnLCAnSDI2NCcsICdUVE1MJywgJ0RGWFAnXTtcbiAgICAvLyBNUEVHLURBU0ggUm9sZSBhbmQgYWNjZXNzaWJpbGl0eSBtYXBwaW5nIGZvciB0ZXh0IHRyYWNrcyBhY2NvcmRpbmcgdG8gRVRTSSBUUyAxMDMgMjg1IHYxLjEuMSAoc2VjdGlvbiA3LjEuMilcbiAgICBjb25zdCBST0xFID0ge1xuICAgICAgICAnQ0FQVCc6ICdtYWluJyxcbiAgICAgICAgJ1NVQlQnOiAnYWx0ZXJuYXRlJyxcbiAgICAgICAgJ0RFU0MnOiAnbWFpbidcbiAgICB9O1xuICAgIGNvbnN0IEFDQ0VTU0lCSUxJVFkgPSB7XG4gICAgICAgICdERVNDJzogJzInXG4gICAgfTtcbiAgICBjb25zdCBzYW1wbGluZ0ZyZXF1ZW5jeUluZGV4ID0ge1xuICAgICAgICA5NjAwMDogMHgwLFxuICAgICAgICA4ODIwMDogMHgxLFxuICAgICAgICA2NDAwMDogMHgyLFxuICAgICAgICA0ODAwMDogMHgzLFxuICAgICAgICA0NDEwMDogMHg0LFxuICAgICAgICAzMjAwMDogMHg1LFxuICAgICAgICAyNDAwMDogMHg2LFxuICAgICAgICAyMjA1MDogMHg3LFxuICAgICAgICAxNjAwMDogMHg4LFxuICAgICAgICAxMjAwMDogMHg5LFxuICAgICAgICAxMTAyNTogMHhBLFxuICAgICAgICA4MDAwOiAweEIsXG4gICAgICAgIDczNTA6IDB4Q1xuICAgIH07XG4gICAgY29uc3QgbWltZVR5cGVNYXAgPSB7XG4gICAgICAgICd2aWRlbyc6ICd2aWRlby9tcDQnLFxuICAgICAgICAnYXVkaW8nOiAnYXVkaW8vbXA0JyxcbiAgICAgICAgJ3RleHQnOiAnYXBwbGljYXRpb24vbXA0J1xuICAgIH07XG5cbiAgICBsZXQgaW5zdGFuY2UsXG4gICAgICAgIGxvZ2dlcixcbiAgICAgICAgaW5pdGlhbEJ1ZmZlclNldHRpbmdzO1xuXG5cbiAgICBmdW5jdGlvbiBzZXR1cCgpIHtcbiAgICAgICAgbG9nZ2VyID0gZGVidWcuZ2V0TG9nZ2VyKGluc3RhbmNlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRBdHRyaWJ1dGVBc0Jvb2xlYW4obm9kZSwgYXR0ck5hbWUpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBub2RlLmdldEF0dHJpYnV0ZShhdHRyTmFtZSk7XG4gICAgICAgIGlmICghdmFsdWUpIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHZhbHVlLnRvTG93ZXJDYXNlKCkgPT09ICd0cnVlJztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYXBQZXJpb2Qoc21vb3RoU3RyZWFtaW5nTWVkaWEsIHRpbWVzY2FsZSkge1xuICAgICAgICBjb25zdCBwZXJpb2QgPSB7fTtcbiAgICAgICAgbGV0IHN0cmVhbXMsXG4gICAgICAgICAgICBhZGFwdGF0aW9uO1xuXG4gICAgICAgIC8vIEZvciBlYWNoIFN0cmVhbUluZGV4IG5vZGUsIGNyZWF0ZSBhbiBBZGFwdGF0aW9uU2V0IGVsZW1lbnRcbiAgICAgICAgcGVyaW9kLkFkYXB0YXRpb25TZXRfYXNBcnJheSA9IFtdO1xuICAgICAgICBzdHJlYW1zID0gc21vb3RoU3RyZWFtaW5nTWVkaWEuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ1N0cmVhbUluZGV4Jyk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyZWFtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYWRhcHRhdGlvbiA9IG1hcEFkYXB0YXRpb25TZXQoc3RyZWFtc1tpXSwgdGltZXNjYWxlKTtcbiAgICAgICAgICAgIGlmIChhZGFwdGF0aW9uICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcGVyaW9kLkFkYXB0YXRpb25TZXRfYXNBcnJheS5wdXNoKGFkYXB0YXRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBlcmlvZC5BZGFwdGF0aW9uU2V0X2FzQXJyYXkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcGVyaW9kLkFkYXB0YXRpb25TZXQgPSAocGVyaW9kLkFkYXB0YXRpb25TZXRfYXNBcnJheS5sZW5ndGggPiAxKSA/IHBlcmlvZC5BZGFwdGF0aW9uU2V0X2FzQXJyYXkgOiBwZXJpb2QuQWRhcHRhdGlvblNldF9hc0FycmF5WzBdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBlcmlvZDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYXBBZGFwdGF0aW9uU2V0KHN0cmVhbUluZGV4LCB0aW1lc2NhbGUpIHtcbiAgICAgICAgY29uc3QgYWRhcHRhdGlvblNldCA9IHt9O1xuICAgICAgICBjb25zdCByZXByZXNlbnRhdGlvbnMgPSBbXTtcbiAgICAgICAgbGV0IHNlZ21lbnRUZW1wbGF0ZTtcbiAgICAgICAgbGV0IHF1YWxpdHlMZXZlbHMsXG4gICAgICAgICAgICByZXByZXNlbnRhdGlvbixcbiAgICAgICAgICAgIHNlZ21lbnRzLFxuICAgICAgICAgICAgaSxcbiAgICAgICAgICAgIGluZGV4O1xuXG4gICAgICAgIGNvbnN0IG5hbWUgPSBzdHJlYW1JbmRleC5nZXRBdHRyaWJ1dGUoJ05hbWUnKTtcbiAgICAgICAgY29uc3QgdHlwZSA9IHN0cmVhbUluZGV4LmdldEF0dHJpYnV0ZSgnVHlwZScpO1xuICAgICAgICBjb25zdCBsYW5nID0gc3RyZWFtSW5kZXguZ2V0QXR0cmlidXRlKCdMYW5ndWFnZScpO1xuICAgICAgICBjb25zdCBmYWxsQmFja0lkID0gbGFuZyA/IHR5cGUgKyAnXycgKyBsYW5nIDogdHlwZTtcblxuICAgICAgICBhZGFwdGF0aW9uU2V0LmlkID0gbmFtZSB8fCBmYWxsQmFja0lkO1xuICAgICAgICBhZGFwdGF0aW9uU2V0LmNvbnRlbnRUeXBlID0gdHlwZTtcbiAgICAgICAgYWRhcHRhdGlvblNldC5sYW5nID0gbGFuZyB8fCAndW5kJztcbiAgICAgICAgYWRhcHRhdGlvblNldC5taW1lVHlwZSA9IG1pbWVUeXBlTWFwW3R5cGVdO1xuICAgICAgICBhZGFwdGF0aW9uU2V0LnN1YlR5cGUgPSBzdHJlYW1JbmRleC5nZXRBdHRyaWJ1dGUoJ1N1YnR5cGUnKTtcbiAgICAgICAgYWRhcHRhdGlvblNldC5tYXhXaWR0aCA9IHN0cmVhbUluZGV4LmdldEF0dHJpYnV0ZSgnTWF4V2lkdGgnKTtcbiAgICAgICAgYWRhcHRhdGlvblNldC5tYXhIZWlnaHQgPSBzdHJlYW1JbmRleC5nZXRBdHRyaWJ1dGUoJ01heEhlaWdodCcpO1xuXG4gICAgICAgIC8vIE1hcCB0ZXh0IHRyYWNrcyBzdWJUeXBlcyB0byBNUEVHLURBU0ggQWRhcHRhdGlvblNldCByb2xlIGFuZCBhY2Nlc3NpYmlsaXR5IChzZWUgRVRTSSBUUyAxMDMgMjg1IHYxLjEuMSwgc2VjdGlvbiA3LjEuMilcbiAgICAgICAgaWYgKGFkYXB0YXRpb25TZXQuc3ViVHlwZSkge1xuICAgICAgICAgICAgaWYgKFJPTEVbYWRhcHRhdGlvblNldC5zdWJUeXBlXSkge1xuICAgICAgICAgICAgICAgIGxldCByb2xlID0ge1xuICAgICAgICAgICAgICAgICAgICBzY2hlbWVJZFVyaTogJ3VybjptcGVnOmRhc2g6cm9sZToyMDExJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFJPTEVbYWRhcHRhdGlvblNldC5zdWJUeXBlXVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYWRhcHRhdGlvblNldC5Sb2xlID0gcm9sZTtcbiAgICAgICAgICAgICAgICBhZGFwdGF0aW9uU2V0LlJvbGVfYXNBcnJheSA9IFtyb2xlXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChBQ0NFU1NJQklMSVRZW2FkYXB0YXRpb25TZXQuc3ViVHlwZV0pIHtcbiAgICAgICAgICAgICAgICBsZXQgYWNjZXNzaWJpbGl0eSA9IHtcbiAgICAgICAgICAgICAgICAgICAgc2NoZW1lSWRVcmk6ICd1cm46dHZhOm1ldGFkYXRhOmNzOkF1ZGlvUHVycG9zZUNTOjIwMDcnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogQUNDRVNTSUJJTElUWVthZGFwdGF0aW9uU2V0LnN1YlR5cGVdXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBhZGFwdGF0aW9uU2V0LkFjY2Vzc2liaWxpdHkgPSBhY2Nlc3NpYmlsaXR5O1xuICAgICAgICAgICAgICAgIGFkYXB0YXRpb25TZXQuQWNjZXNzaWJpbGl0eV9hc0FycmF5ID0gW2FjY2Vzc2liaWxpdHldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ3JlYXRlIGEgU2VnbWVudFRlbXBsYXRlIHdpdGggYSBTZWdtZW50VGltZWxpbmVcbiAgICAgICAgc2VnbWVudFRlbXBsYXRlID0gbWFwU2VnbWVudFRlbXBsYXRlKHN0cmVhbUluZGV4LCB0aW1lc2NhbGUpO1xuXG4gICAgICAgIHF1YWxpdHlMZXZlbHMgPSBzdHJlYW1JbmRleC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnUXVhbGl0eUxldmVsJyk7XG4gICAgICAgIC8vIEZvciBlYWNoIFF1YWxpdHlMZXZlbCBub2RlLCBjcmVhdGUgYSBSZXByZXNlbnRhdGlvbiBlbGVtZW50XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBxdWFsaXR5TGV2ZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAvLyBQcm9wYWdhdGUgQmFzZVVSTCBhbmQgbWltZVR5cGVcbiAgICAgICAgICAgIHF1YWxpdHlMZXZlbHNbaV0uQmFzZVVSTCA9IGFkYXB0YXRpb25TZXQuQmFzZVVSTDtcbiAgICAgICAgICAgIHF1YWxpdHlMZXZlbHNbaV0ubWltZVR5cGUgPSBhZGFwdGF0aW9uU2V0Lm1pbWVUeXBlO1xuXG4gICAgICAgICAgICAvLyBTZXQgcXVhbGl0eSBsZXZlbCBpZFxuICAgICAgICAgICAgaW5kZXggPSBxdWFsaXR5TGV2ZWxzW2ldLmdldEF0dHJpYnV0ZSgnSW5kZXgnKTtcbiAgICAgICAgICAgIHF1YWxpdHlMZXZlbHNbaV0uSWQgPSBhZGFwdGF0aW9uU2V0LmlkICsgKChpbmRleCAhPT0gbnVsbCkgPyAoJ18nICsgaW5kZXgpIDogJycpO1xuXG4gICAgICAgICAgICAvLyBNYXAgUmVwcmVzZW50YXRpb24gdG8gUXVhbGl0eUxldmVsXG4gICAgICAgICAgICByZXByZXNlbnRhdGlvbiA9IG1hcFJlcHJlc2VudGF0aW9uKHF1YWxpdHlMZXZlbHNbaV0sIHN0cmVhbUluZGV4KTtcblxuICAgICAgICAgICAgaWYgKHJlcHJlc2VudGF0aW9uICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gQ29weSBTZWdtZW50VGVtcGxhdGUgaW50byBSZXByZXNlbnRhdGlvblxuICAgICAgICAgICAgICAgIHJlcHJlc2VudGF0aW9uLlNlZ21lbnRUZW1wbGF0ZSA9IHNlZ21lbnRUZW1wbGF0ZTtcblxuICAgICAgICAgICAgICAgIHJlcHJlc2VudGF0aW9ucy5wdXNoKHJlcHJlc2VudGF0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZXByZXNlbnRhdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGFkYXB0YXRpb25TZXQuUmVwcmVzZW50YXRpb24gPSAocmVwcmVzZW50YXRpb25zLmxlbmd0aCA+IDEpID8gcmVwcmVzZW50YXRpb25zIDogcmVwcmVzZW50YXRpb25zWzBdO1xuICAgICAgICBhZGFwdGF0aW9uU2V0LlJlcHJlc2VudGF0aW9uX2FzQXJyYXkgPSByZXByZXNlbnRhdGlvbnM7XG5cbiAgICAgICAgLy8gU2V0IFNlZ21lbnRUZW1wbGF0ZVxuICAgICAgICBhZGFwdGF0aW9uU2V0LlNlZ21lbnRUZW1wbGF0ZSA9IHNlZ21lbnRUZW1wbGF0ZTtcblxuICAgICAgICBzZWdtZW50cyA9IHNlZ21lbnRUZW1wbGF0ZS5TZWdtZW50VGltZWxpbmUuU19hc0FycmF5O1xuXG4gICAgICAgIHJldHVybiBhZGFwdGF0aW9uU2V0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1hcFJlcHJlc2VudGF0aW9uKHF1YWxpdHlMZXZlbCwgc3RyZWFtSW5kZXgpIHtcbiAgICAgICAgY29uc3QgcmVwcmVzZW50YXRpb24gPSB7fTtcbiAgICAgICAgY29uc3QgdHlwZSA9IHN0cmVhbUluZGV4LmdldEF0dHJpYnV0ZSgnVHlwZScpO1xuICAgICAgICBsZXQgZm91ckNDVmFsdWUgPSBudWxsO1xuICAgICAgICBsZXQgd2lkdGggPSBudWxsO1xuICAgICAgICBsZXQgaGVpZ2h0ID0gbnVsbDtcblxuICAgICAgICByZXByZXNlbnRhdGlvbi5pZCA9IHF1YWxpdHlMZXZlbC5JZDtcbiAgICAgICAgcmVwcmVzZW50YXRpb24uYmFuZHdpZHRoID0gcGFyc2VJbnQocXVhbGl0eUxldmVsLmdldEF0dHJpYnV0ZSgnQml0cmF0ZScpLCAxMCk7XG4gICAgICAgIHJlcHJlc2VudGF0aW9uLm1pbWVUeXBlID0gcXVhbGl0eUxldmVsLm1pbWVUeXBlO1xuXG4gICAgICAgIHdpZHRoID0gcGFyc2VJbnQocXVhbGl0eUxldmVsLmdldEF0dHJpYnV0ZSgnTWF4V2lkdGgnKSwgMTApO1xuICAgICAgICBoZWlnaHQgPSBwYXJzZUludChxdWFsaXR5TGV2ZWwuZ2V0QXR0cmlidXRlKCdNYXhIZWlnaHQnKSwgMTApO1xuICAgICAgICBpZiAoIWlzTmFOKHdpZHRoKSkgcmVwcmVzZW50YXRpb24ud2lkdGggPSB3aWR0aDtcbiAgICAgICAgaWYgKCFpc05hTihoZWlnaHQpKSByZXByZXNlbnRhdGlvbi5oZWlnaHQgPSBoZWlnaHQ7XG5cblxuICAgICAgICBmb3VyQ0NWYWx1ZSA9IHF1YWxpdHlMZXZlbC5nZXRBdHRyaWJ1dGUoJ0ZvdXJDQycpO1xuXG4gICAgICAgIC8vIElmIEZvdXJDQyBub3QgZGVmaW5lZCBhdCBRdWFsaXR5TGV2ZWwgbGV2ZWwsIHRoZW4gZ2V0IGl0IGZyb20gU3RyZWFtSW5kZXggbGV2ZWxcbiAgICAgICAgaWYgKGZvdXJDQ1ZhbHVlID09PSBudWxsIHx8IGZvdXJDQ1ZhbHVlID09PSAnJykge1xuICAgICAgICAgICAgZm91ckNDVmFsdWUgPSBzdHJlYW1JbmRleC5nZXRBdHRyaWJ1dGUoJ0ZvdXJDQycpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgc3RpbGwgbm90IGRlZmluZWQgKG9wdGlvbm5hbCBmb3IgYXVkaW8gc3RyZWFtLCBzZWUgaHR0cHM6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9mZjcyODExNiUyOHY9dnMuOTUlMjkuYXNweCksXG4gICAgICAgIC8vIHRoZW4gd2UgY29uc2lkZXIgdGhlIHN0cmVhbSBpcyBhbiBhdWRpbyBBQUMgc3RyZWFtXG4gICAgICAgIGlmIChmb3VyQ0NWYWx1ZSA9PT0gbnVsbCB8fCBmb3VyQ0NWYWx1ZSA9PT0gJycpIHtcbiAgICAgICAgICAgIGlmICh0eXBlID09PSBjb25zdGFudHMuQVVESU8pIHtcbiAgICAgICAgICAgICAgICBmb3VyQ0NWYWx1ZSA9ICdBQUMnO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSBjb25zdGFudHMuVklERU8pIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoJ0ZvdXJDQyBpcyBub3QgZGVmaW5lZCB3aGVyZWFzIGl0IGlzIHJlcXVpcmVkIGZvciBhIFF1YWxpdHlMZXZlbCBlbGVtZW50IGZvciBhIFN0cmVhbUluZGV4IG9mIHR5cGUgXCJ2aWRlb1wiJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayBpZiBjb2RlYyBpcyBzdXBwb3J0ZWRcbiAgICAgICAgaWYgKFNVUFBPUlRFRF9DT0RFQ1MuaW5kZXhPZihmb3VyQ0NWYWx1ZS50b1VwcGVyQ2FzZSgpKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIC8vIERvIG5vdCBzZW5kIHdhcm5pbmdcbiAgICAgICAgICAgIGxvZ2dlci53YXJuKCdDb2RlYyBub3Qgc3VwcG9ydGVkOiAnICsgZm91ckNDVmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBHZXQgY29kZWNzIHZhbHVlIGFjY29yZGluZyB0byBGb3VyQ0MgZmllbGRcbiAgICAgICAgaWYgKGZvdXJDQ1ZhbHVlID09PSAnSDI2NCcgfHwgZm91ckNDVmFsdWUgPT09ICdBVkMxJykge1xuICAgICAgICAgICAgcmVwcmVzZW50YXRpb24uY29kZWNzID0gZ2V0SDI2NENvZGVjKHF1YWxpdHlMZXZlbCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZm91ckNDVmFsdWUuaW5kZXhPZignQUFDJykgPj0gMCkge1xuICAgICAgICAgICAgcmVwcmVzZW50YXRpb24uY29kZWNzID0gZ2V0QUFDQ29kZWMocXVhbGl0eUxldmVsLCBmb3VyQ0NWYWx1ZSk7XG4gICAgICAgICAgICByZXByZXNlbnRhdGlvbi5hdWRpb1NhbXBsaW5nUmF0ZSA9IHBhcnNlSW50KHF1YWxpdHlMZXZlbC5nZXRBdHRyaWJ1dGUoJ1NhbXBsaW5nUmF0ZScpLCAxMCk7XG4gICAgICAgICAgICByZXByZXNlbnRhdGlvbi5hdWRpb0NoYW5uZWxzID0gcGFyc2VJbnQocXVhbGl0eUxldmVsLmdldEF0dHJpYnV0ZSgnQ2hhbm5lbHMnKSwgMTApO1xuICAgICAgICB9IGVsc2UgaWYgKGZvdXJDQ1ZhbHVlLmluZGV4T2YoJ1RUTUwnKSB8fCBmb3VyQ0NWYWx1ZS5pbmRleE9mKCdERlhQJykpIHtcbiAgICAgICAgICAgIHJlcHJlc2VudGF0aW9uLmNvZGVjcyA9IGNvbnN0YW50cy5TVFBQO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVwcmVzZW50YXRpb24uY29kZWNQcml2YXRlRGF0YSA9ICcnICsgcXVhbGl0eUxldmVsLmdldEF0dHJpYnV0ZSgnQ29kZWNQcml2YXRlRGF0YScpO1xuICAgICAgICByZXByZXNlbnRhdGlvbi5CYXNlVVJMID0gcXVhbGl0eUxldmVsLkJhc2VVUkw7XG5cbiAgICAgICAgcmV0dXJuIHJlcHJlc2VudGF0aW9uO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEgyNjRDb2RlYyhxdWFsaXR5TGV2ZWwpIHtcbiAgICAgICAgbGV0IGNvZGVjUHJpdmF0ZURhdGEgPSBxdWFsaXR5TGV2ZWwuZ2V0QXR0cmlidXRlKCdDb2RlY1ByaXZhdGVEYXRhJykudG9TdHJpbmcoKTtcbiAgICAgICAgbGV0IG5hbEhlYWRlcixcbiAgICAgICAgICAgIGF2Y290aTtcblxuXG4gICAgICAgIC8vIEV4dHJhY3QgZnJvbSB0aGUgQ29kZWNQcml2YXRlRGF0YSBmaWVsZCB0aGUgaGV4YWRlY2ltYWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIGZvbGxvd2luZ1xuICAgICAgICAvLyB0aHJlZSBieXRlcyBpbiB0aGUgc2VxdWVuY2UgcGFyYW1ldGVyIHNldCBOQUwgdW5pdC5cbiAgICAgICAgLy8gPT4gRmluZCB0aGUgU1BTIG5hbCBoZWFkZXJcbiAgICAgICAgbmFsSGVhZGVyID0gLzAwMDAwMDAxWzAtOV03Ly5leGVjKGNvZGVjUHJpdmF0ZURhdGEpO1xuICAgICAgICAvLyA9PiBGaW5kIHRoZSA2IGNoYXJhY3RlcnMgYWZ0ZXIgdGhlIFNQUyBuYWxIZWFkZXIgKGlmIGl0IGV4aXN0cylcbiAgICAgICAgYXZjb3RpID0gbmFsSGVhZGVyICYmIG5hbEhlYWRlclswXSA/IChjb2RlY1ByaXZhdGVEYXRhLnN1YnN0cihjb2RlY1ByaXZhdGVEYXRhLmluZGV4T2YobmFsSGVhZGVyWzBdKSArIDEwLCA2KSkgOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgcmV0dXJuICdhdmMxLicgKyBhdmNvdGk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0QUFDQ29kZWMocXVhbGl0eUxldmVsLCBmb3VyQ0NWYWx1ZSkge1xuICAgICAgICBjb25zdCBzYW1wbGluZ1JhdGUgPSBwYXJzZUludChxdWFsaXR5TGV2ZWwuZ2V0QXR0cmlidXRlKCdTYW1wbGluZ1JhdGUnKSwgMTApO1xuICAgICAgICBsZXQgY29kZWNQcml2YXRlRGF0YSA9IHF1YWxpdHlMZXZlbC5nZXRBdHRyaWJ1dGUoJ0NvZGVjUHJpdmF0ZURhdGEnKS50b1N0cmluZygpO1xuICAgICAgICBsZXQgb2JqZWN0VHlwZSA9IDA7XG4gICAgICAgIGxldCBjb2RlY1ByaXZhdGVEYXRhSGV4LFxuICAgICAgICAgICAgYXJyMTYsXG4gICAgICAgICAgICBpbmRleEZyZXEsXG4gICAgICAgICAgICBleHRlbnNpb25TYW1wbGluZ0ZyZXF1ZW5jeUluZGV4O1xuXG4gICAgICAgIC8vY2hyb21lIHByb2JsZW0sIGluIGltcGxpY2l0IEFBQyBIRSBkZWZpbml0aW9uLCBzbyB3aGVuIEFBQ0ggaXMgZGV0ZWN0ZWQgaW4gRm91ckNDXG4gICAgICAgIC8vc2V0IG9iamVjdFR5cGUgdG8gNSA9PiBzdHJhbmdlLCBpdCBzaG91bGQgYmUgMlxuICAgICAgICBpZiAoZm91ckNDVmFsdWUgPT09ICdBQUNIJykge1xuICAgICAgICAgICAgb2JqZWN0VHlwZSA9IDB4MDU7XG4gICAgICAgIH1cbiAgICAgICAgLy9pZiBjb2RlY1ByaXZhdGVEYXRhIGlzIGVtcHR5LCBidWlsZCBpdCA6XG4gICAgICAgIGlmIChjb2RlY1ByaXZhdGVEYXRhID09PSB1bmRlZmluZWQgfHwgY29kZWNQcml2YXRlRGF0YSA9PT0gJycpIHtcbiAgICAgICAgICAgIG9iamVjdFR5cGUgPSAweDAyOyAvL0FBQyBNYWluIExvdyBDb21wbGV4aXR5ID0+IG9iamVjdCBUeXBlID0gMlxuICAgICAgICAgICAgaW5kZXhGcmVxID0gc2FtcGxpbmdGcmVxdWVuY3lJbmRleFtzYW1wbGluZ1JhdGVdO1xuICAgICAgICAgICAgaWYgKGZvdXJDQ1ZhbHVlID09PSAnQUFDSCcpIHtcbiAgICAgICAgICAgICAgICAvLyA0IGJ5dGVzIDogICAgIFhYWFhYICAgICAgICAgWFhYWCAgICAgICAgICBYWFhYICAgICAgICAgICAgIFhYWFggICAgICAgICAgICAgICAgICBYWFhYWCAgICAgIFhYWCAgIFhYWFhYWFhcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgJyBPYmplY3RUeXBlJyAnRnJlcSBJbmRleCcgJ0NoYW5uZWxzIHZhbHVlJyAgICdFeHRlbnMgU2FtcGwgRnJlcScgICdPYmplY3RUeXBlJyAgJ0dBUycgJ2FsaWdubWVudCA9IDAnXG4gICAgICAgICAgICAgICAgb2JqZWN0VHlwZSA9IDB4MDU7IC8vIEhpZ2ggRWZmaWNpZW5jeSBBQUMgUHJvZmlsZSA9IG9iamVjdCBUeXBlID0gNSBTQlJcbiAgICAgICAgICAgICAgICBjb2RlY1ByaXZhdGVEYXRhID0gbmV3IFVpbnQ4QXJyYXkoNCk7XG4gICAgICAgICAgICAgICAgZXh0ZW5zaW9uU2FtcGxpbmdGcmVxdWVuY3lJbmRleCA9IHNhbXBsaW5nRnJlcXVlbmN5SW5kZXhbc2FtcGxpbmdSYXRlICogMl07IC8vIGluIEhFIEFBQyBFeHRlbnNpb24gU2FtcGxpbmcgZnJlcXVlbmNlXG4gICAgICAgICAgICAgICAgLy8gZXF1YWxzIHRvIFNhbXBsaW5nUmF0ZSoyXG4gICAgICAgICAgICAgICAgLy9GcmVxIEluZGV4IGlzIHByZXNlbnQgZm9yIDMgYml0cyBpbiB0aGUgZmlyc3QgYnl0ZSwgbGFzdCBiaXQgaXMgaW4gdGhlIHNlY29uZFxuICAgICAgICAgICAgICAgIGNvZGVjUHJpdmF0ZURhdGFbMF0gPSAob2JqZWN0VHlwZSA8PCAzKSB8IChpbmRleEZyZXEgPj4gMSk7XG4gICAgICAgICAgICAgICAgY29kZWNQcml2YXRlRGF0YVsxXSA9IChpbmRleEZyZXEgPDwgNykgfCAocXVhbGl0eUxldmVsLkNoYW5uZWxzIDw8IDMpIHwgKGV4dGVuc2lvblNhbXBsaW5nRnJlcXVlbmN5SW5kZXggPj4gMSk7XG4gICAgICAgICAgICAgICAgY29kZWNQcml2YXRlRGF0YVsyXSA9IChleHRlbnNpb25TYW1wbGluZ0ZyZXF1ZW5jeUluZGV4IDw8IDcpIHwgKDB4MDIgPDwgMik7IC8vIG9yaWdpbiBvYmplY3QgdHlwZSBlcXVhbHMgdG8gMiA9PiBBQUMgTWFpbiBMb3cgQ29tcGxleGl0eVxuICAgICAgICAgICAgICAgIGNvZGVjUHJpdmF0ZURhdGFbM10gPSAweDA7IC8vYWxpZ25tZW50IGJpdHNcblxuICAgICAgICAgICAgICAgIGFycjE2ID0gbmV3IFVpbnQxNkFycmF5KDIpO1xuICAgICAgICAgICAgICAgIGFycjE2WzBdID0gKGNvZGVjUHJpdmF0ZURhdGFbMF0gPDwgOCkgKyBjb2RlY1ByaXZhdGVEYXRhWzFdO1xuICAgICAgICAgICAgICAgIGFycjE2WzFdID0gKGNvZGVjUHJpdmF0ZURhdGFbMl0gPDwgOCkgKyBjb2RlY1ByaXZhdGVEYXRhWzNdO1xuICAgICAgICAgICAgICAgIC8vY29udmVydCBkZWNpbWFsIHRvIGhleCB2YWx1ZVxuICAgICAgICAgICAgICAgIGNvZGVjUHJpdmF0ZURhdGFIZXggPSBhcnIxNlswXS50b1N0cmluZygxNik7XG4gICAgICAgICAgICAgICAgY29kZWNQcml2YXRlRGF0YUhleCA9IGFycjE2WzBdLnRvU3RyaW5nKDE2KSArIGFycjE2WzFdLnRvU3RyaW5nKDE2KTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyAyIGJ5dGVzIDogICAgIFhYWFhYICAgICAgICAgWFhYWCAgICAgICAgICBYWFhYICAgICAgICAgICAgICBYWFhcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgJyBPYmplY3RUeXBlJyAnRnJlcSBJbmRleCcgJ0NoYW5uZWxzIHZhbHVlJyAgICdHQVMgPSAwMDAnXG4gICAgICAgICAgICAgICAgY29kZWNQcml2YXRlRGF0YSA9IG5ldyBVaW50OEFycmF5KDIpO1xuICAgICAgICAgICAgICAgIC8vRnJlcSBJbmRleCBpcyBwcmVzZW50IGZvciAzIGJpdHMgaW4gdGhlIGZpcnN0IGJ5dGUsIGxhc3QgYml0IGlzIGluIHRoZSBzZWNvbmRcbiAgICAgICAgICAgICAgICBjb2RlY1ByaXZhdGVEYXRhWzBdID0gKG9iamVjdFR5cGUgPDwgMykgfCAoaW5kZXhGcmVxID4+IDEpO1xuICAgICAgICAgICAgICAgIGNvZGVjUHJpdmF0ZURhdGFbMV0gPSAoaW5kZXhGcmVxIDw8IDcpIHwgKHBhcnNlSW50KHF1YWxpdHlMZXZlbC5nZXRBdHRyaWJ1dGUoJ0NoYW5uZWxzJyksIDEwKSA8PCAzKTtcbiAgICAgICAgICAgICAgICAvLyBwdXQgdGhlIDIgYnl0ZXMgaW4gYW4gMTYgYml0cyBhcnJheVxuICAgICAgICAgICAgICAgIGFycjE2ID0gbmV3IFVpbnQxNkFycmF5KDEpO1xuICAgICAgICAgICAgICAgIGFycjE2WzBdID0gKGNvZGVjUHJpdmF0ZURhdGFbMF0gPDwgOCkgKyBjb2RlY1ByaXZhdGVEYXRhWzFdO1xuICAgICAgICAgICAgICAgIC8vY29udmVydCBkZWNpbWFsIHRvIGhleCB2YWx1ZVxuICAgICAgICAgICAgICAgIGNvZGVjUHJpdmF0ZURhdGFIZXggPSBhcnIxNlswXS50b1N0cmluZygxNik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvZGVjUHJpdmF0ZURhdGEgPSAnJyArIGNvZGVjUHJpdmF0ZURhdGFIZXg7XG4gICAgICAgICAgICBjb2RlY1ByaXZhdGVEYXRhID0gY29kZWNQcml2YXRlRGF0YS50b1VwcGVyQ2FzZSgpO1xuICAgICAgICAgICAgcXVhbGl0eUxldmVsLnNldEF0dHJpYnV0ZSgnQ29kZWNQcml2YXRlRGF0YScsIGNvZGVjUHJpdmF0ZURhdGEpO1xuICAgICAgICB9IGVsc2UgaWYgKG9iamVjdFR5cGUgPT09IDApIHtcbiAgICAgICAgICAgIG9iamVjdFR5cGUgPSAocGFyc2VJbnQoY29kZWNQcml2YXRlRGF0YS5zdWJzdHIoMCwgMiksIDE2KSAmIDB4RjgpID4+IDM7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gJ21wNGEuNDAuJyArIG9iamVjdFR5cGU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFwU2VnbWVudFRlbXBsYXRlKHN0cmVhbUluZGV4LCB0aW1lc2NhbGUpIHtcbiAgICAgICAgY29uc3Qgc2VnbWVudFRlbXBsYXRlID0ge307XG4gICAgICAgIGxldCBtZWRpYVVybCxcbiAgICAgICAgICAgIHN0cmVhbUluZGV4VGltZVNjYWxlLFxuICAgICAgICAgICAgdXJsO1xuXG4gICAgICAgIHVybCA9IHN0cmVhbUluZGV4LmdldEF0dHJpYnV0ZSgnVXJsJyk7XG4gICAgICAgIG1lZGlhVXJsID0gdXJsID8gdXJsLnJlcGxhY2UoJ3tiaXRyYXRlfScsICckQmFuZHdpZHRoJCcpIDogbnVsbDtcbiAgICAgICAgbWVkaWFVcmwgPSBtZWRpYVVybCA/IG1lZGlhVXJsLnJlcGxhY2UoJ3tzdGFydCB0aW1lfScsICckVGltZSQnKSA6IG51bGw7XG5cbiAgICAgICAgc3RyZWFtSW5kZXhUaW1lU2NhbGUgPSBzdHJlYW1JbmRleC5nZXRBdHRyaWJ1dGUoJ1RpbWVTY2FsZScpO1xuICAgICAgICBzdHJlYW1JbmRleFRpbWVTY2FsZSA9IHN0cmVhbUluZGV4VGltZVNjYWxlID8gcGFyc2VGbG9hdChzdHJlYW1JbmRleFRpbWVTY2FsZSkgOiB0aW1lc2NhbGU7XG5cbiAgICAgICAgc2VnbWVudFRlbXBsYXRlLm1lZGlhID0gbWVkaWFVcmw7XG4gICAgICAgIHNlZ21lbnRUZW1wbGF0ZS50aW1lc2NhbGUgPSBzdHJlYW1JbmRleFRpbWVTY2FsZTtcblxuICAgICAgICBzZWdtZW50VGVtcGxhdGUuU2VnbWVudFRpbWVsaW5lID0gbWFwU2VnbWVudFRpbWVsaW5lKHN0cmVhbUluZGV4LCBzZWdtZW50VGVtcGxhdGUudGltZXNjYWxlKTtcblxuICAgICAgICByZXR1cm4gc2VnbWVudFRlbXBsYXRlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1hcFNlZ21lbnRUaW1lbGluZShzdHJlYW1JbmRleCwgdGltZXNjYWxlKSB7XG4gICAgICAgIGNvbnN0IHNlZ21lbnRUaW1lbGluZSA9IHt9O1xuICAgICAgICBjb25zdCBjaHVua3MgPSBzdHJlYW1JbmRleC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYycpO1xuICAgICAgICBjb25zdCBzZWdtZW50cyA9IFtdO1xuICAgICAgICBsZXQgc2VnbWVudCxcbiAgICAgICAgICAgIHByZXZTZWdtZW50LFxuICAgICAgICAgICAgdE1hbmlmZXN0LFxuICAgICAgICAgICAgaSxqLHI7XG4gICAgICAgIGxldCBkdXJhdGlvbiA9IDA7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNodW5rcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc2VnbWVudCA9IHt9O1xuXG4gICAgICAgICAgICAvLyBHZXQgdGltZSAndCcgYXR0cmlidXRlIHZhbHVlXG4gICAgICAgICAgICB0TWFuaWZlc3QgPSBjaHVua3NbaV0uZ2V0QXR0cmlidXRlKCd0Jyk7XG5cbiAgICAgICAgICAgIC8vID0+IHNlZ21lbnQudE1hbmlmZXN0ID0gb3JpZ2luYWwgdGltZXN0YW1wIHZhbHVlIGFzIGEgc3RyaW5nIChmb3IgY29uc3RydWN0aW5nIHRoZSBmcmFnbWVudCByZXF1ZXN0IHVybCwgc2VlIERhc2hIYW5kbGVyKVxuICAgICAgICAgICAgLy8gPT4gc2VnbWVudC50ID0gbnVtYmVyIHZhbHVlIG9mIHRpbWVzdGFtcCAobWF5YmUgcm91bmRlZCB2YWx1ZSwgYnV0IG9ubHkgZm9yIDAuMSBtaWNyb3NlY29uZClcbiAgICAgICAgICAgIGlmICh0TWFuaWZlc3QgJiYgQmlnSW50KHRNYW5pZmVzdCkuZ3JlYXRlcihCaWdJbnQoTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIpKSkge1xuICAgICAgICAgICAgICAgIHNlZ21lbnQudE1hbmlmZXN0ID0gdE1hbmlmZXN0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VnbWVudC50ID0gcGFyc2VGbG9hdCh0TWFuaWZlc3QpO1xuXG4gICAgICAgICAgICAvLyBHZXQgZHVyYXRpb24gJ2QnIGF0dHJpYnV0ZSB2YWx1ZVxuICAgICAgICAgICAgc2VnbWVudC5kID0gcGFyc2VGbG9hdChjaHVua3NbaV0uZ2V0QXR0cmlidXRlKCdkJykpO1xuXG4gICAgICAgICAgICAvLyBJZiAndCcgbm90IGRlZmluZWQgZm9yIGZpcnN0IHNlZ21lbnQgdGhlbiB0PTBcbiAgICAgICAgICAgIGlmICgoaSA9PT0gMCkgJiYgIXNlZ21lbnQudCkge1xuICAgICAgICAgICAgICAgIHNlZ21lbnQudCA9IDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgICAgICAgIHByZXZTZWdtZW50ID0gc2VnbWVudHNbc2VnbWVudHMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIHByZXZpb3VzIHNlZ21lbnQgZHVyYXRpb24gaWYgbm90IGRlZmluZWRcbiAgICAgICAgICAgICAgICBpZiAoIXByZXZTZWdtZW50LmQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZTZWdtZW50LnRNYW5pZmVzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJldlNlZ21lbnQuZCA9IEJpZ0ludCh0TWFuaWZlc3QpLnN1YnRyYWN0KEJpZ0ludChwcmV2U2VnbWVudC50TWFuaWZlc3QpKS50b0pTTnVtYmVyKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2U2VnbWVudC5kID0gc2VnbWVudC50IC0gcHJldlNlZ21lbnQudDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbiArPSBwcmV2U2VnbWVudC5kO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBTZXQgc2VnbWVudCBhYnNvbHV0ZSB0aW1lc3RhbXAgaWYgbm90IHNldCBpbiBtYW5pZmVzdFxuICAgICAgICAgICAgICAgIGlmICghc2VnbWVudC50KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmV2U2VnbWVudC50TWFuaWZlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZ21lbnQudE1hbmlmZXN0ID0gQmlnSW50KHByZXZTZWdtZW50LnRNYW5pZmVzdCkuYWRkKEJpZ0ludChwcmV2U2VnbWVudC5kKSkudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZ21lbnQudCA9IHBhcnNlRmxvYXQoc2VnbWVudC50TWFuaWZlc3QpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VnbWVudC50ID0gcHJldlNlZ21lbnQudCArIHByZXZTZWdtZW50LmQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzZWdtZW50LmQpIHtcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiArPSBzZWdtZW50LmQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENyZWF0ZSBuZXcgc2VnbWVudFxuICAgICAgICAgICAgc2VnbWVudHMucHVzaChzZWdtZW50KTtcblxuICAgICAgICAgICAgLy8gU3VwcG9ydCBmb3IgJ3InIGF0dHJpYnV0ZSAoaS5lLiBcInJlcGVhdFwiIGFzIGluIE1QRUctREFTSClcbiAgICAgICAgICAgIHIgPSBwYXJzZUZsb2F0KGNodW5rc1tpXS5nZXRBdHRyaWJ1dGUoJ3InKSk7XG4gICAgICAgICAgICBpZiAocikge1xuXG4gICAgICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IChyIC0gMSk7IGorKykge1xuICAgICAgICAgICAgICAgICAgICBwcmV2U2VnbWVudCA9IHNlZ21lbnRzW3NlZ21lbnRzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICBzZWdtZW50ID0ge307XG4gICAgICAgICAgICAgICAgICAgIHNlZ21lbnQudCA9IHByZXZTZWdtZW50LnQgKyBwcmV2U2VnbWVudC5kO1xuICAgICAgICAgICAgICAgICAgICBzZWdtZW50LmQgPSBwcmV2U2VnbWVudC5kO1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJldlNlZ21lbnQudE1hbmlmZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWdtZW50LnRNYW5pZmVzdCAgPSBCaWdJbnQocHJldlNlZ21lbnQudE1hbmlmZXN0KS5hZGQoQmlnSW50KHByZXZTZWdtZW50LmQpKS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uICs9IHNlZ21lbnQuZDtcbiAgICAgICAgICAgICAgICAgICAgc2VnbWVudHMucHVzaChzZWdtZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzZWdtZW50VGltZWxpbmUuUyA9IHNlZ21lbnRzO1xuICAgICAgICBzZWdtZW50VGltZWxpbmUuU19hc0FycmF5ID0gc2VnbWVudHM7XG4gICAgICAgIHNlZ21lbnRUaW1lbGluZS5kdXJhdGlvbiA9IGR1cmF0aW9uIC8gdGltZXNjYWxlO1xuXG4gICAgICAgIHJldHVybiBzZWdtZW50VGltZWxpbmU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0S0lERnJvbVByb3RlY3Rpb25IZWFkZXIocHJvdGVjdGlvbkhlYWRlcikge1xuICAgICAgICBsZXQgcHJIZWFkZXIsXG4gICAgICAgICAgICB3cm1IZWFkZXIsXG4gICAgICAgICAgICB4bWxSZWFkZXIsXG4gICAgICAgICAgICBLSUQ7XG5cbiAgICAgICAgLy8gR2V0IFBsYXlSZWFkeSBoZWFkZXIgYXMgYnl0ZSBhcnJheSAoYmFzZTY0IGRlY29kZWQpXG4gICAgICAgIHBySGVhZGVyID0gQkFTRTY0LmRlY29kZUFycmF5KHByb3RlY3Rpb25IZWFkZXIuZmlyc3RDaGlsZC5kYXRhKTtcblxuICAgICAgICAvLyBHZXQgUmlnaHQgTWFuYWdlbWVudCBoZWFkZXIgKFdSTUhFQURFUikgZnJvbSBQbGF5UmVhZHkgaGVhZGVyXG4gICAgICAgIHdybUhlYWRlciA9IGdldFdSTUhlYWRlckZyb21QUkhlYWRlcihwckhlYWRlcik7XG5cbiAgICAgICAgaWYgKHdybUhlYWRlcikge1xuICAgICAgICAgICAgLy8gQ29udmVydCBmcm9tIG11bHRpLWJ5dGUgdG8gdW5pY29kZVxuICAgICAgICAgICAgd3JtSGVhZGVyID0gbmV3IFVpbnQxNkFycmF5KHdybUhlYWRlci5idWZmZXIpO1xuXG4gICAgICAgICAgICAvLyBDb252ZXJ0IHRvIHN0cmluZ1xuICAgICAgICAgICAgd3JtSGVhZGVyID0gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCB3cm1IZWFkZXIpO1xuXG4gICAgICAgICAgICAvLyBQYXJzZSA8V1JNSGVhZGVyPiB0byBnZXQgS0lEIGZpZWxkIHZhbHVlXG4gICAgICAgICAgICB4bWxSZWFkZXIgPSAobmV3IERPTVBhcnNlcigpKS5wYXJzZUZyb21TdHJpbmcod3JtSGVhZGVyLCAnYXBwbGljYXRpb24veG1sJyk7XG4gICAgICAgICAgICBLSUQgPSB4bWxSZWFkZXIucXVlcnlTZWxlY3RvcignS0lEJykudGV4dENvbnRlbnQ7XG5cbiAgICAgICAgICAgIC8vIEdldCBLSUQgKGJhc2U2NCBkZWNvZGVkKSBhcyBieXRlIGFycmF5XG4gICAgICAgICAgICBLSUQgPSBCQVNFNjQuZGVjb2RlQXJyYXkoS0lEKTtcblxuICAgICAgICAgICAgLy8gQ29udmVydCBVVUlEIGZyb20gbGl0dGxlLWVuZGlhbiB0byBiaWctZW5kaWFuXG4gICAgICAgICAgICBjb252ZXJ0VXVpZEVuZGlhbm5lc3MoS0lEKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBLSUQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0V1JNSGVhZGVyRnJvbVBSSGVhZGVyKHBySGVhZGVyKSB7XG4gICAgICAgIGxldCBsZW5ndGgsXG4gICAgICAgICAgICByZWNvcmRDb3VudCxcbiAgICAgICAgICAgIHJlY29yZFR5cGUsXG4gICAgICAgICAgICByZWNvcmRMZW5ndGgsXG4gICAgICAgICAgICByZWNvcmRWYWx1ZTtcbiAgICAgICAgbGV0IGkgPSAwO1xuXG4gICAgICAgIC8vIFBhcnNlIFBsYXlSZWFkeSBoZWFkZXJcblxuICAgICAgICAvLyBMZW5ndGggLSAzMiBiaXRzIChMRSBmb3JtYXQpXG4gICAgICAgIGxlbmd0aCA9IChwckhlYWRlcltpICsgM10gPDwgMjQpICsgKHBySGVhZGVyW2kgKyAyXSA8PCAxNikgKyAocHJIZWFkZXJbaSArIDFdIDw8IDgpICsgcHJIZWFkZXJbaV07XG4gICAgICAgIGkgKz0gNDtcblxuICAgICAgICAvLyBSZWNvcmQgY291bnQgLSAxNiBiaXRzIChMRSBmb3JtYXQpXG4gICAgICAgIHJlY29yZENvdW50ID0gKHBySGVhZGVyW2kgKyAxXSA8PCA4KSArIHBySGVhZGVyW2ldO1xuICAgICAgICBpICs9IDI7XG5cbiAgICAgICAgLy8gUGFyc2UgcmVjb3Jkc1xuICAgICAgICB3aGlsZSAoaSA8IHBySGVhZGVyLmxlbmd0aCkge1xuICAgICAgICAgICAgLy8gUmVjb3JkIHR5cGUgLSAxNiBiaXRzIChMRSBmb3JtYXQpXG4gICAgICAgICAgICByZWNvcmRUeXBlID0gKHBySGVhZGVyW2kgKyAxXSA8PCA4KSArIHBySGVhZGVyW2ldO1xuICAgICAgICAgICAgaSArPSAyO1xuXG4gICAgICAgICAgICAvLyBDaGVjayBpZiBSaWdodHMgTWFuYWdlbWVudCBoZWFkZXIgKHJlY29yZCB0eXBlID0gMHgwMSlcbiAgICAgICAgICAgIGlmIChyZWNvcmRUeXBlID09PSAweDAxKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBSZWNvcmQgbGVuZ3RoIC0gMTYgYml0cyAoTEUgZm9ybWF0KVxuICAgICAgICAgICAgICAgIHJlY29yZExlbmd0aCA9IChwckhlYWRlcltpICsgMV0gPDwgOCkgKyBwckhlYWRlcltpXTtcbiAgICAgICAgICAgICAgICBpICs9IDI7XG5cbiAgICAgICAgICAgICAgICAvLyBSZWNvcmQgdmFsdWUgPT4gY29udGFpbnMgPFdSTUhFQURFUj5cbiAgICAgICAgICAgICAgICByZWNvcmRWYWx1ZSA9IG5ldyBVaW50OEFycmF5KHJlY29yZExlbmd0aCk7XG4gICAgICAgICAgICAgICAgcmVjb3JkVmFsdWUuc2V0KHBySGVhZGVyLnN1YmFycmF5KGksIGkgKyByZWNvcmRMZW5ndGgpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVjb3JkVmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjb252ZXJ0VXVpZEVuZGlhbm5lc3ModXVpZCkge1xuICAgICAgICBzd2FwQnl0ZXModXVpZCwgMCwgMyk7XG4gICAgICAgIHN3YXBCeXRlcyh1dWlkLCAxLCAyKTtcbiAgICAgICAgc3dhcEJ5dGVzKHV1aWQsIDQsIDUpO1xuICAgICAgICBzd2FwQnl0ZXModXVpZCwgNiwgNyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3dhcEJ5dGVzKGJ5dGVzLCBwb3MxLCBwb3MyKSB7XG4gICAgICAgIGNvbnN0IHRlbXAgPSBieXRlc1twb3MxXTtcbiAgICAgICAgYnl0ZXNbcG9zMV0gPSBieXRlc1twb3MyXTtcbiAgICAgICAgYnl0ZXNbcG9zMl0gPSB0ZW1wO1xuICAgIH1cblxuXG4gICAgZnVuY3Rpb24gY3JlYXRlUFJDb250ZW50UHJvdGVjdGlvbihwcm90ZWN0aW9uSGVhZGVyKSB7XG4gICAgICAgIGxldCBwcm8gPSB7XG4gICAgICAgICAgICBfX3RleHQ6IHByb3RlY3Rpb25IZWFkZXIuZmlyc3RDaGlsZC5kYXRhLFxuICAgICAgICAgICAgX19wcmVmaXg6ICdtc3ByJ1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2NoZW1lSWRVcmk6ICd1cm46dXVpZDo5YTA0ZjA3OS05ODQwLTQyODYtYWI5Mi1lNjViZTA4ODVmOTUnLFxuICAgICAgICAgICAgdmFsdWU6ICdjb20ubWljcm9zb2Z0LnBsYXlyZWFkeScsXG4gICAgICAgICAgICBwcm86IHBybyxcbiAgICAgICAgICAgIHByb19hc0FycmF5OiBwcm9cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVXaWRldmluZUNvbnRlbnRQcm90ZWN0aW9uKEtJRCkge1xuICAgICAgICBsZXQgd2lkZXZpbmVDUCA9IHtcbiAgICAgICAgICAgIHNjaGVtZUlkVXJpOiAndXJuOnV1aWQ6ZWRlZjhiYTktNzlkNi00YWNlLWEzYzgtMjdkY2Q1MWQyMWVkJyxcbiAgICAgICAgICAgIHZhbHVlOiAnY29tLndpZGV2aW5lLmFscGhhJ1xuICAgICAgICB9O1xuICAgICAgICBpZiAoIUtJRClcbiAgICAgICAgICAgIHJldHVybiB3aWRldmluZUNQO1xuICAgICAgICAvLyBDcmVhdGUgV2lkZXZpbmUgQ0VOQyBoZWFkZXIgKFByb3RvY29sIEJ1ZmZlcikgd2l0aCBLSUQgdmFsdWVcbiAgICAgICAgY29uc3Qgd3ZDZW5jSGVhZGVyID0gbmV3IFVpbnQ4QXJyYXkoMiArIEtJRC5sZW5ndGgpO1xuICAgICAgICB3dkNlbmNIZWFkZXJbMF0gPSAweDEyO1xuICAgICAgICB3dkNlbmNIZWFkZXJbMV0gPSAweDEwO1xuICAgICAgICB3dkNlbmNIZWFkZXIuc2V0KEtJRCwgMik7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGEgcHNzaCBib3hcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gMTIgLyogYm94IGxlbmd0aCwgdHlwZSwgdmVyc2lvbiBhbmQgZmxhZ3MgKi8gKyAxNiAvKiBTeXN0ZW1JRCAqLyArIDQgLyogZGF0YSBsZW5ndGggKi8gKyB3dkNlbmNIZWFkZXIubGVuZ3RoO1xuICAgICAgICBsZXQgcHNzaCA9IG5ldyBVaW50OEFycmF5KGxlbmd0aCk7XG4gICAgICAgIGxldCBpID0gMDtcblxuICAgICAgICAvLyBTZXQgYm94IGxlbmd0aCB2YWx1ZVxuICAgICAgICBwc3NoW2krK10gPSAobGVuZ3RoICYgMHhGRjAwMDAwMCkgPj4gMjQ7XG4gICAgICAgIHBzc2hbaSsrXSA9IChsZW5ndGggJiAweDAwRkYwMDAwKSA+PiAxNjtcbiAgICAgICAgcHNzaFtpKytdID0gKGxlbmd0aCAmIDB4MDAwMEZGMDApID4+IDg7XG4gICAgICAgIHBzc2hbaSsrXSA9IChsZW5ndGggJiAweDAwMDAwMEZGKTtcblxuICAgICAgICAvLyBTZXQgdHlwZSAoJ3Bzc2gnKSwgdmVyc2lvbiAoMCkgYW5kIGZsYWdzICgwKVxuICAgICAgICBwc3NoLnNldChbMHg3MCwgMHg3MywgMHg3MywgMHg2OCwgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMF0sIGkpO1xuICAgICAgICBpICs9IDg7XG5cbiAgICAgICAgLy8gU2V0IFN5c3RlbUlEICgnZWRlZjhiYTktNzlkNi00YWNlLWEzYzgtMjdkY2Q1MWQyMWVkJylcbiAgICAgICAgcHNzaC5zZXQoWzB4ZWQsIDB4ZWYsIDB4OGIsIDB4YTksICAweDc5LCAweGQ2LCAweDRhLCAweGNlLCAweGEzLCAweGM4LCAweDI3LCAweGRjLCAweGQ1LCAweDFkLCAweDIxLCAweGVkXSwgaSk7XG4gICAgICAgIGkgKz0gMTY7XG5cbiAgICAgICAgLy8gU2V0IGRhdGEgbGVuZ3RoIHZhbHVlXG4gICAgICAgIHBzc2hbaSsrXSA9ICh3dkNlbmNIZWFkZXIubGVuZ3RoICYgMHhGRjAwMDAwMCkgPj4gMjQ7XG4gICAgICAgIHBzc2hbaSsrXSA9ICh3dkNlbmNIZWFkZXIubGVuZ3RoICYgMHgwMEZGMDAwMCkgPj4gMTY7XG4gICAgICAgIHBzc2hbaSsrXSA9ICh3dkNlbmNIZWFkZXIubGVuZ3RoICYgMHgwMDAwRkYwMCkgPj4gODtcbiAgICAgICAgcHNzaFtpKytdID0gKHd2Q2VuY0hlYWRlci5sZW5ndGggJiAweDAwMDAwMEZGKTtcblxuICAgICAgICAvLyBDb3B5IFdpZGV2aW5lIENFTkMgaGVhZGVyXG4gICAgICAgIHBzc2guc2V0KHd2Q2VuY0hlYWRlciwgaSk7XG5cbiAgICAgICAgLy8gQ29udmVydCB0byBCQVNFNjQgc3RyaW5nXG4gICAgICAgIHBzc2ggPSBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIHBzc2gpO1xuICAgICAgICBwc3NoID0gQkFTRTY0LmVuY29kZUFTQ0lJKHBzc2gpO1xuXG4gICAgICAgIHdpZGV2aW5lQ1AucHNzaCA9IHsgX190ZXh0OiBwc3NoIH07XG5cbiAgICAgICAgcmV0dXJuIHdpZGV2aW5lQ1A7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJvY2Vzc01hbmlmZXN0KHhtbERvYykge1xuICAgICAgICBjb25zdCBtYW5pZmVzdCA9IHt9O1xuICAgICAgICBjb25zdCBjb250ZW50UHJvdGVjdGlvbnMgPSBbXTtcbiAgICAgICAgY29uc3Qgc21vb3RoU3RyZWFtaW5nTWVkaWEgPSB4bWxEb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ1Ntb290aFN0cmVhbWluZ01lZGlhJylbMF07XG4gICAgICAgIGNvbnN0IHByb3RlY3Rpb24gPSB4bWxEb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ1Byb3RlY3Rpb24nKVswXTtcbiAgICAgICAgbGV0IHByb3RlY3Rpb25IZWFkZXIgPSBudWxsO1xuICAgICAgICBsZXQgcGVyaW9kLFxuICAgICAgICAgICAgYWRhcHRhdGlvbnMsXG4gICAgICAgICAgICBjb250ZW50UHJvdGVjdGlvbixcbiAgICAgICAgICAgIEtJRCxcbiAgICAgICAgICAgIHRpbWVzdGFtcE9mZnNldCxcbiAgICAgICAgICAgIHN0YXJ0VGltZSxcbiAgICAgICAgICAgIHNlZ21lbnRzLFxuICAgICAgICAgICAgdGltZXNjYWxlLFxuICAgICAgICAgICAgc2VnbWVudER1cmF0aW9uLFxuICAgICAgICAgICAgaSwgajtcblxuICAgICAgICAvLyBTZXQgbWFuaWZlc3Qgbm9kZSBwcm9wZXJ0aWVzXG4gICAgICAgIG1hbmlmZXN0LnByb3RvY29sID0gJ01TUyc7XG4gICAgICAgIG1hbmlmZXN0LnByb2ZpbGVzID0gJ3VybjptcGVnOmRhc2g6cHJvZmlsZTppc29mZi1saXZlOjIwMTEnO1xuICAgICAgICBtYW5pZmVzdC50eXBlID0gZ2V0QXR0cmlidXRlQXNCb29sZWFuKHNtb290aFN0cmVhbWluZ01lZGlhLCAnSXNMaXZlJykgPyAnZHluYW1pYycgOiAnc3RhdGljJztcbiAgICAgICAgdGltZXNjYWxlID0gIHNtb290aFN0cmVhbWluZ01lZGlhLmdldEF0dHJpYnV0ZSgnVGltZVNjYWxlJyk7XG4gICAgICAgIG1hbmlmZXN0LnRpbWVzY2FsZSA9IHRpbWVzY2FsZSA/IHBhcnNlRmxvYXQodGltZXNjYWxlKSA6IERFRkFVTFRfVElNRV9TQ0FMRTtcbiAgICAgICAgbGV0IGR2cldpbmRvd0xlbmd0aCA9IHBhcnNlRmxvYXQoc21vb3RoU3RyZWFtaW5nTWVkaWEuZ2V0QXR0cmlidXRlKCdEVlJXaW5kb3dMZW5ndGgnKSk7XG4gICAgICAgIC8vIElmIHRoZSBEVlJXaW5kb3dMZW5ndGggZmllbGQgaXMgb21pdHRlZCBmb3IgYSBsaXZlIHByZXNlbnRhdGlvbiBvciBzZXQgdG8gMCwgdGhlIERWUiB3aW5kb3cgaXMgZWZmZWN0aXZlbHkgaW5maW5pdGVcbiAgICAgICAgaWYgKG1hbmlmZXN0LnR5cGUgPT09ICdkeW5hbWljJyAmJiAoZHZyV2luZG93TGVuZ3RoID09PSAwIHx8IGlzTmFOKGR2cldpbmRvd0xlbmd0aCkpKSB7XG4gICAgICAgICAgICBkdnJXaW5kb3dMZW5ndGggPSBJbmZpbml0eTtcbiAgICAgICAgfVxuICAgICAgICAvLyBTdGFyLW92ZXJcbiAgICAgICAgaWYgKGR2cldpbmRvd0xlbmd0aCA9PT0gMCAmJiBnZXRBdHRyaWJ1dGVBc0Jvb2xlYW4oc21vb3RoU3RyZWFtaW5nTWVkaWEsICdDYW5TZWVrJykpIHtcbiAgICAgICAgICAgIGR2cldpbmRvd0xlbmd0aCA9IEluZmluaXR5O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGR2cldpbmRvd0xlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIG1hbmlmZXN0LnRpbWVTaGlmdEJ1ZmZlckRlcHRoID0gZHZyV2luZG93TGVuZ3RoIC8gbWFuaWZlc3QudGltZXNjYWxlO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGR1cmF0aW9uID0gcGFyc2VGbG9hdChzbW9vdGhTdHJlYW1pbmdNZWRpYS5nZXRBdHRyaWJ1dGUoJ0R1cmF0aW9uJykpO1xuICAgICAgICBtYW5pZmVzdC5tZWRpYVByZXNlbnRhdGlvbkR1cmF0aW9uID0gKGR1cmF0aW9uID09PSAwKSA/IEluZmluaXR5IDogZHVyYXRpb24gLyBtYW5pZmVzdC50aW1lc2NhbGU7XG4gICAgICAgIC8vIEJ5IGRlZmF1bHQsIHNldCBtaW5CdWZmZXJUaW1lIHRvIDIgc2VjLiAoYnV0IHNldCBiZWxvdyBhY2NvcmRpbmcgdG8gdmlkZW8gc2VnbWVudCBkdXJhdGlvbilcbiAgICAgICAgbWFuaWZlc3QubWluQnVmZmVyVGltZSA9IDI7XG4gICAgICAgIG1hbmlmZXN0LnR0bWxUaW1lSXNSZWxhdGl2ZSA9IHRydWU7XG5cbiAgICAgICAgLy8gTGl2ZSBtYW5pZmVzdCB3aXRoIER1cmF0aW9uID0gc3RhcnQtb3ZlclxuICAgICAgICBpZiAobWFuaWZlc3QudHlwZSA9PT0gJ2R5bmFtaWMnICYmIGR1cmF0aW9uID4gMCkge1xuICAgICAgICAgICAgbWFuaWZlc3QudHlwZSA9ICdzdGF0aWMnO1xuICAgICAgICAgICAgLy8gV2Ugc2V0IHRpbWVTaGlmdEJ1ZmZlckRlcHRoIHRvIGluaXRpYWwgZHVyYXRpb24sIHRvIGJlIHVzZWQgYnkgTXNzRnJhZ21lbnRDb250cm9sbGVyIHRvIHVwZGF0ZSBzZWdtZW50IHRpbWVsaW5lXG4gICAgICAgICAgICBtYW5pZmVzdC50aW1lU2hpZnRCdWZmZXJEZXB0aCA9IGR1cmF0aW9uIC8gbWFuaWZlc3QudGltZXNjYWxlO1xuICAgICAgICAgICAgLy8gRHVyYXRpb24gd2lsbCBiZSBzZXQgYWNjb3JkaW5nIHRvIGN1cnJlbnQgc2VnbWVudCB0aW1lbGluZSBkdXJhdGlvbiAoc2VlIGJlbG93KVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1hbmlmZXN0LnR5cGUgPT09ICdkeW5hbWljJykge1xuICAgICAgICAgICAgbWFuaWZlc3QucmVmcmVzaE1hbmlmZXN0T25Td2l0Y2hUcmFjayA9IHRydWU7IC8vIFJlZnJlc2ggbWFuaWZlc3Qgd2hlbiBzd2l0Y2hpbmcgdHJhY2tzXG4gICAgICAgICAgICBtYW5pZmVzdC5kb05vdFVwZGF0ZURWUldpbmRvd09uQnVmZmVyVXBkYXRlZCA9IHRydWU7IC8vIERWUldpbmRvdyBpcyB1cGRhdGUgYnkgTXNzRnJhZ21lbnRNb29mUG9jZXNzb3IgYmFzZWQgb24gdGZyZiBib3hlc1xuICAgICAgICAgICAgbWFuaWZlc3QuaWdub3JlUG9zdHBvbmVUaW1lUGVyaW9kID0gdHJ1ZTsgLy8gTmV2ZXIgdXBkYXRlIG1hbmlmZXN0XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNYXAgcGVyaW9kIG5vZGUgdG8gbWFuaWZlc3Qgcm9vdCBub2RlXG4gICAgICAgIG1hbmlmZXN0LlBlcmlvZCA9IG1hcFBlcmlvZChzbW9vdGhTdHJlYW1pbmdNZWRpYSwgbWFuaWZlc3QudGltZXNjYWxlKTtcbiAgICAgICAgbWFuaWZlc3QuUGVyaW9kX2FzQXJyYXkgPSBbbWFuaWZlc3QuUGVyaW9kXTtcblxuICAgICAgICAvLyBJbml0aWFsaXplIHBlcmlvZCBzdGFydCB0aW1lXG4gICAgICAgIHBlcmlvZCA9IG1hbmlmZXN0LlBlcmlvZDtcbiAgICAgICAgcGVyaW9kLnN0YXJ0ID0gMDtcblxuICAgICAgICAvLyBVbmNvbW1lbnQgdG8gdGVzdCBsaXZlIHRvIHN0YXRpYyBtYW5pZmVzdHNcbiAgICAgICAgLy8gaWYgKG1hbmlmZXN0LnR5cGUgIT09ICdzdGF0aWMnKSB7XG4gICAgICAgIC8vICAgICBtYW5pZmVzdC50eXBlID0gJ3N0YXRpYyc7XG4gICAgICAgIC8vICAgICBtYW5pZmVzdC5tZWRpYVByZXNlbnRhdGlvbkR1cmF0aW9uID0gbWFuaWZlc3QudGltZVNoaWZ0QnVmZmVyRGVwdGg7XG4gICAgICAgIC8vICAgICBtYW5pZmVzdC50aW1lU2hpZnRCdWZmZXJEZXB0aCA9IG51bGw7XG4gICAgICAgIC8vIH1cblxuICAgICAgICAvLyBDb250ZW50UHJvdGVjdGlvbiBub2RlXG4gICAgICAgIGlmIChwcm90ZWN0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHByb3RlY3Rpb25IZWFkZXIgPSB4bWxEb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ1Byb3RlY3Rpb25IZWFkZXInKVswXTtcblxuICAgICAgICAgICAgLy8gU29tZSBwYWNrYWdlcnMgcHV0IG5ld2xpbmVzIGludG8gdGhlIFByb3RlY3Rpb25IZWFkZXIgYmFzZTY0IHN0cmluZywgd2hpY2ggaXMgbm90IGdvb2RcbiAgICAgICAgICAgIC8vIGJlY2F1c2UgdGhpcyBjYW5ub3QgYmUgY29ycmVjdGx5IHBhcnNlZC4gTGV0J3MganVzdCBmaWx0ZXIgb3V0IGFueSBuZXdsaW5lcyBmb3VuZCBpbiB0aGVyZS5cbiAgICAgICAgICAgIHByb3RlY3Rpb25IZWFkZXIuZmlyc3RDaGlsZC5kYXRhID0gcHJvdGVjdGlvbkhlYWRlci5maXJzdENoaWxkLmRhdGEucmVwbGFjZSgvXFxufFxcci9nLCAnJyk7XG5cbiAgICAgICAgICAgIC8vIEdldCBLSUQgKGluIENFTkMgZm9ybWF0KSBmcm9tIHByb3RlY3Rpb24gaGVhZGVyXG4gICAgICAgICAgICBLSUQgPSBnZXRLSURGcm9tUHJvdGVjdGlvbkhlYWRlcihwcm90ZWN0aW9uSGVhZGVyKTtcblxuICAgICAgICAgICAgLy8gQ3JlYXRlIENvbnRlbnRQcm90ZWN0aW9uIGZvciBQbGF5UmVhZHlcbiAgICAgICAgICAgIGNvbnRlbnRQcm90ZWN0aW9uID0gY3JlYXRlUFJDb250ZW50UHJvdGVjdGlvbihwcm90ZWN0aW9uSGVhZGVyKTtcbiAgICAgICAgICAgIGNvbnRlbnRQcm90ZWN0aW9uWydjZW5jOmRlZmF1bHRfS0lEJ10gPSBLSUQ7XG4gICAgICAgICAgICBjb250ZW50UHJvdGVjdGlvbnMucHVzaChjb250ZW50UHJvdGVjdGlvbik7XG5cbiAgICAgICAgICAgIC8vIENyZWF0ZSBDb250ZW50UHJvdGVjdGlvbiBmb3IgV2lkZXZpbmUgKGFzIGEgQ0VOQyBwcm90ZWN0aW9uKVxuICAgICAgICAgICAgY29udGVudFByb3RlY3Rpb24gPSBjcmVhdGVXaWRldmluZUNvbnRlbnRQcm90ZWN0aW9uKEtJRCk7XG4gICAgICAgICAgICBjb250ZW50UHJvdGVjdGlvblsnY2VuYzpkZWZhdWx0X0tJRCddID0gS0lEO1xuICAgICAgICAgICAgY29udGVudFByb3RlY3Rpb25zLnB1c2goY29udGVudFByb3RlY3Rpb24pO1xuXG4gICAgICAgICAgICBtYW5pZmVzdC5Db250ZW50UHJvdGVjdGlvbiA9IGNvbnRlbnRQcm90ZWN0aW9ucztcbiAgICAgICAgICAgIG1hbmlmZXN0LkNvbnRlbnRQcm90ZWN0aW9uX2FzQXJyYXkgPSBjb250ZW50UHJvdGVjdGlvbnM7XG4gICAgICAgIH1cblxuICAgICAgICBhZGFwdGF0aW9ucyA9IHBlcmlvZC5BZGFwdGF0aW9uU2V0X2FzQXJyYXk7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGFkYXB0YXRpb25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBhZGFwdGF0aW9uc1tpXS5TZWdtZW50VGVtcGxhdGUuaW5pdGlhbGl6YXRpb24gPSAnJEJhbmR3aWR0aCQnO1xuICAgICAgICAgICAgLy8gUHJvcGFnYXRlIGNvbnRlbnQgcHJvdGVjdGlvbiBpbmZvcm1hdGlvbiBpbnRvIGVhY2ggYWRhcHRhdGlvblxuICAgICAgICAgICAgaWYgKG1hbmlmZXN0LkNvbnRlbnRQcm90ZWN0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBhZGFwdGF0aW9uc1tpXS5Db250ZW50UHJvdGVjdGlvbiA9IG1hbmlmZXN0LkNvbnRlbnRQcm90ZWN0aW9uO1xuICAgICAgICAgICAgICAgIGFkYXB0YXRpb25zW2ldLkNvbnRlbnRQcm90ZWN0aW9uX2FzQXJyYXkgPSBtYW5pZmVzdC5Db250ZW50UHJvdGVjdGlvbl9hc0FycmF5O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYWRhcHRhdGlvbnNbaV0uY29udGVudFR5cGUgPT09ICd2aWRlbycpIHtcbiAgICAgICAgICAgICAgICAvLyBHZXQgdmlkZW8gc2VnbWVudCBkdXJhdGlvblxuICAgICAgICAgICAgICAgIHNlZ21lbnREdXJhdGlvbiA9IGFkYXB0YXRpb25zW2ldLlNlZ21lbnRUZW1wbGF0ZS5TZWdtZW50VGltZWxpbmUuU19hc0FycmF5WzBdLmQgLyBhZGFwdGF0aW9uc1tpXS5TZWdtZW50VGVtcGxhdGUudGltZXNjYWxlO1xuICAgICAgICAgICAgICAgIC8vIFNldCBtaW5CdWZmZXJUaW1lIHRvIG9uZSBzZWdtZW50IGR1cmF0aW9uXG4gICAgICAgICAgICAgICAgbWFuaWZlc3QubWluQnVmZmVyVGltZSA9IHNlZ21lbnREdXJhdGlvbjtcblxuICAgICAgICAgICAgICAgIGlmIChtYW5pZmVzdC50eXBlID09PSAnZHluYW1pYycgKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE1hdGNoIHRpbWVTaGlmdEJ1ZmZlckRlcHRoIHRvIHZpZGVvIHNlZ21lbnQgdGltZWxpbmUgZHVyYXRpb25cbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hbmlmZXN0LnRpbWVTaGlmdEJ1ZmZlckRlcHRoID4gMCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgbWFuaWZlc3QudGltZVNoaWZ0QnVmZmVyRGVwdGggIT09IEluZmluaXR5ICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBtYW5pZmVzdC50aW1lU2hpZnRCdWZmZXJEZXB0aCA+IGFkYXB0YXRpb25zW2ldLlNlZ21lbnRUZW1wbGF0ZS5TZWdtZW50VGltZWxpbmUuZHVyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hbmlmZXN0LnRpbWVTaGlmdEJ1ZmZlckRlcHRoID0gYWRhcHRhdGlvbnNbaV0uU2VnbWVudFRlbXBsYXRlLlNlZ21lbnRUaW1lbGluZS5kdXJhdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENhcCBtaW5CdWZmZXJUaW1lIHRvIHRpbWVTaGlmdEJ1ZmZlckRlcHRoXG4gICAgICAgIG1hbmlmZXN0Lm1pbkJ1ZmZlclRpbWUgPSBNYXRoLm1pbihtYW5pZmVzdC5taW5CdWZmZXJUaW1lLCAobWFuaWZlc3QudGltZVNoaWZ0QnVmZmVyRGVwdGggPyBtYW5pZmVzdC50aW1lU2hpZnRCdWZmZXJEZXB0aCA6IEluZmluaXR5KSk7XG5cbiAgICAgICAgLy8gSW4gY2FzZSBvZiBsaXZlIHN0cmVhbXM6XG4gICAgICAgIC8vIDEtIGNvbmZpZ3VyZSBwbGF5ZXIgYnVmZmVyaW5nIHByb3BlcnRpZXMgYWNjb3JkaW5nIHRvIHRhcmdldCBsaXZlIGRlbGF5XG4gICAgICAgIC8vIDItIGFkYXB0IGxpdmUgZGVsYXkgYW5kIHRoZW4gYnVmZmVycyBsZW5ndGggaW4gY2FzZSB0aW1lU2hpZnRCdWZmZXJEZXB0aCBpcyB0b28gc21hbGwgY29tcGFyZWQgdG8gdGFyZ2V0IGxpdmUgZGVsYXkgKHNlZSBQbGF5YmFja0NvbnRyb2xsZXIuY29tcHV0ZUxpdmVEZWxheSgpKVxuICAgICAgICAvLyAzLSBTZXQgcmV0cnkgYXR0ZW1wdHMgYW5kIGludGVydmFscyBmb3IgRnJhZ21lbnRJbmZvIHJlcXVlc3RzXG4gICAgICAgIGlmIChtYW5pZmVzdC50eXBlID09PSAnZHluYW1pYycpIHtcbiAgICAgICAgICAgIGxldCB0YXJnZXRMaXZlRGVsYXkgPSBtZWRpYVBsYXllck1vZGVsLmdldExpdmVEZWxheSgpO1xuICAgICAgICAgICAgaWYgKCF0YXJnZXRMaXZlRGVsYXkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsaXZlRGVsYXlGcmFnbWVudENvdW50ID0gc2V0dGluZ3MuZ2V0KCkuc3RyZWFtaW5nLmxpdmVEZWxheUZyYWdtZW50Q291bnQgIT09IG51bGwgJiYgIWlzTmFOKHNldHRpbmdzLmdldCgpLnN0cmVhbWluZy5saXZlRGVsYXlGcmFnbWVudENvdW50KSA/IHNldHRpbmdzLmdldCgpLnN0cmVhbWluZy5saXZlRGVsYXlGcmFnbWVudENvdW50IDogNDtcbiAgICAgICAgICAgICAgICB0YXJnZXRMaXZlRGVsYXkgPSBzZWdtZW50RHVyYXRpb24gKiBsaXZlRGVsYXlGcmFnbWVudENvdW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHRhcmdldERlbGF5Q2FwcGluZyA9IE1hdGgubWF4KG1hbmlmZXN0LnRpbWVTaGlmdEJ1ZmZlckRlcHRoIC0gMTAvKkVORF9PRl9QTEFZTElTVF9QQURESU5HKi8sIG1hbmlmZXN0LnRpbWVTaGlmdEJ1ZmZlckRlcHRoIC8gMik7XG4gICAgICAgICAgICBsZXQgbGl2ZURlbGF5ID0gTWF0aC5taW4odGFyZ2V0RGVsYXlDYXBwaW5nLCB0YXJnZXRMaXZlRGVsYXkpO1xuICAgICAgICAgICAgLy8gQ29uc2lkZXIgYSBtYXJnaW4gb2YgbW9yZSB0aGFuIG9uZSBzZWdtZW50IGluIG9yZGVyIHRvIGF2b2lkIFByZWNvbmRpdGlvbiBGYWlsZWQgZXJyb3JzICg0MTIpLCBmb3IgZXhhbXBsZSBpZiBhdWRpbyBhbmQgdmlkZW8gYXJlIG5vdCBjb3JyZWN0bHkgc3luY2hyb25pemVkXG4gICAgICAgICAgICBsZXQgYnVmZmVyVGltZSA9IGxpdmVEZWxheSAtIChzZWdtZW50RHVyYXRpb24gKiAxLjUpO1xuXG4gICAgICAgICAgICAvLyBTdG9yZSBpbml0aWFsIGJ1ZmZlciBzZXR0aW5nc1xuICAgICAgICAgICAgaW5pdGlhbEJ1ZmZlclNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICdzdHJlYW1pbmcnOiB7XG4gICAgICAgICAgICAgICAgICAgICdjYWxjU2VnbWVudEF2YWlsYWJpbGl0eVJhbmdlRnJvbVRpbWVsaW5lJzogc2V0dGluZ3MuZ2V0KCkuc3RyZWFtaW5nLmNhbGNTZWdtZW50QXZhaWxhYmlsaXR5UmFuZ2VGcm9tVGltZWxpbmUsXG4gICAgICAgICAgICAgICAgICAgICdsaXZlRGVsYXknOiBzZXR0aW5ncy5nZXQoKS5zdHJlYW1pbmcubGl2ZURlbGF5LFxuICAgICAgICAgICAgICAgICAgICAnc3RhYmxlQnVmZmVyVGltZSc6IHNldHRpbmdzLmdldCgpLnN0cmVhbWluZy5zdGFibGVCdWZmZXJUaW1lLFxuICAgICAgICAgICAgICAgICAgICAnYnVmZmVyVGltZUF0VG9wUXVhbGl0eSc6IHNldHRpbmdzLmdldCgpLnN0cmVhbWluZy5idWZmZXJUaW1lQXRUb3BRdWFsaXR5LFxuICAgICAgICAgICAgICAgICAgICAnYnVmZmVyVGltZUF0VG9wUXVhbGl0eUxvbmdGb3JtJzogc2V0dGluZ3MuZ2V0KCkuc3RyZWFtaW5nLmJ1ZmZlclRpbWVBdFRvcFF1YWxpdHlMb25nRm9ybVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNldHRpbmdzLnVwZGF0ZSh7XG4gICAgICAgICAgICAgICAgJ3N0cmVhbWluZyc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2NhbGNTZWdtZW50QXZhaWxhYmlsaXR5UmFuZ2VGcm9tVGltZWxpbmUnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAnbGl2ZURlbGF5JzogbGl2ZURlbGF5LFxuICAgICAgICAgICAgICAgICAgICAnc3RhYmxlQnVmZmVyVGltZSc6IGJ1ZmZlclRpbWUsXG4gICAgICAgICAgICAgICAgICAgICdidWZmZXJUaW1lQXRUb3BRdWFsaXR5JzogYnVmZmVyVGltZSxcbiAgICAgICAgICAgICAgICAgICAgJ2J1ZmZlclRpbWVBdFRvcFF1YWxpdHlMb25nRm9ybSc6IGJ1ZmZlclRpbWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERlbGV0ZSBDb250ZW50IFByb3RlY3Rpb24gdW5kZXIgcm9vdCBtYW5pZmVzdCBub2RlXG4gICAgICAgIGRlbGV0ZSBtYW5pZmVzdC5Db250ZW50UHJvdGVjdGlvbjtcbiAgICAgICAgZGVsZXRlIG1hbmlmZXN0LkNvbnRlbnRQcm90ZWN0aW9uX2FzQXJyYXk7XG5cbiAgICAgICAgLy8gSW4gY2FzZSBvZiBWT0Qgc3RyZWFtcywgY2hlY2sgaWYgc3RhcnQgdGltZSBpcyBncmVhdGVyIHRoYW4gMFxuICAgICAgICAvLyBUaGVuIGRldGVybWluZSB0aW1lc3RhbXAgb2Zmc2V0IGFjY29yZGluZyB0byBoaWdoZXIgYXVkaW8vdmlkZW8gc3RhcnQgdGltZVxuICAgICAgICAvLyAodXNlIGNhc2UgPSBsaXZlIHN0cmVhbSBkZWxpbmVhcml6YXRpb24pXG4gICAgICAgIGlmIChtYW5pZmVzdC50eXBlID09PSAnc3RhdGljJykge1xuICAgICAgICAgICAgLy8gSW4gY2FzZSBvZiBzdGFydC1vdmVyIHN0cmVhbSBhbmQgbWFuaWZlc3QgcmVsb2FkaW5nIChkdWUgdG8gdHJhY2sgc3dpdGNoKVxuICAgICAgICAgICAgLy8gd2UgY29uc2lkZXIgcHJldmlvdXMgdGltZXN0YW1wT2Zmc2V0IHRvIGtlZXAgdGltZWxpbmVzIHN5bmNocm9uaXplZFxuICAgICAgICAgICAgdmFyIHByZXZNYW5pZmVzdCA9IG1hbmlmZXN0TW9kZWwuZ2V0VmFsdWUoKTtcbiAgICAgICAgICAgIGlmIChwcmV2TWFuaWZlc3QgJiYgcHJldk1hbmlmZXN0LnRpbWVzdGFtcE9mZnNldCkge1xuICAgICAgICAgICAgICAgIHRpbWVzdGFtcE9mZnNldCA9IHByZXZNYW5pZmVzdC50aW1lc3RhbXBPZmZzZXQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBhZGFwdGF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYWRhcHRhdGlvbnNbaV0uY29udGVudFR5cGUgPT09IGNvbnN0YW50cy5BVURJTyB8fCBhZGFwdGF0aW9uc1tpXS5jb250ZW50VHlwZSA9PT0gY29uc3RhbnRzLlZJREVPKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWdtZW50cyA9IGFkYXB0YXRpb25zW2ldLlNlZ21lbnRUZW1wbGF0ZS5TZWdtZW50VGltZWxpbmUuU19hc0FycmF5O1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lID0gc2VnbWVudHNbMF0udDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aW1lc3RhbXBPZmZzZXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcE9mZnNldCA9IHN0YXJ0VGltZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcE9mZnNldCA9IE1hdGgubWluKHRpbWVzdGFtcE9mZnNldCwgc3RhcnRUaW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvcnJlY3QgY29udGVudCBkdXJhdGlvbiBhY2NvcmRpbmcgdG8gbWluaW11bSBhZGFwdGF0aW9uJ3Mgc2VnbWVudCB0aW1lbGluZSBkdXJhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaW4gb3JkZXIgdG8gZm9yY2UgPHZpZGVvPiBlbGVtZW50IHNlbmRpbmcgJ2VuZGVkJyBldmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFuaWZlc3QubWVkaWFQcmVzZW50YXRpb25EdXJhdGlvbiA9IE1hdGgubWluKG1hbmlmZXN0Lm1lZGlhUHJlc2VudGF0aW9uRHVyYXRpb24sIGFkYXB0YXRpb25zW2ldLlNlZ21lbnRUZW1wbGF0ZS5TZWdtZW50VGltZWxpbmUuZHVyYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRpbWVzdGFtcE9mZnNldCA+IDApIHtcbiAgICAgICAgICAgICAgICAvLyBQYXRjaCBzZWdtZW50IHRlbXBsYXRlcyB0aW1lc3RhbXBzIGFuZCBkZXRlcm1pbmUgcGVyaW9kIHN0YXJ0IHRpbWUgKHNpbmNlIGF1ZGlvL3ZpZGVvIHNob3VsZCBub3QgYmUgYWxpZ25lZCB0byAwKVxuICAgICAgICAgICAgICAgIG1hbmlmZXN0LnRpbWVzdGFtcE9mZnNldCA9IHRpbWVzdGFtcE9mZnNldDtcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYWRhcHRhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgc2VnbWVudHMgPSBhZGFwdGF0aW9uc1tpXS5TZWdtZW50VGVtcGxhdGUuU2VnbWVudFRpbWVsaW5lLlNfYXNBcnJheTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IHNlZ21lbnRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXNlZ21lbnRzW2pdLnRNYW5pZmVzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlZ21lbnRzW2pdLnRNYW5pZmVzdCA9IHNlZ21lbnRzW2pdLnQudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZ21lbnRzW2pdLnQgLT0gdGltZXN0YW1wT2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChhZGFwdGF0aW9uc1tpXS5jb250ZW50VHlwZSA9PT0gY29uc3RhbnRzLkFVRElPIHx8IGFkYXB0YXRpb25zW2ldLmNvbnRlbnRUeXBlID09PSBjb25zdGFudHMuVklERU8pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZC5zdGFydCA9IE1hdGgubWF4KHNlZ21lbnRzWzBdLnQsIHBlcmlvZC5zdGFydCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhZGFwdGF0aW9uc1tpXS5TZWdtZW50VGVtcGxhdGUucHJlc2VudGF0aW9uVGltZU9mZnNldCA9IHBlcmlvZC5zdGFydDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwZXJpb2Quc3RhcnQgLz0gbWFuaWZlc3QudGltZXNjYWxlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmxvb3IgdGhlIGR1cmF0aW9uIHRvIGdldCBhcm91bmQgcHJlY2lzaW9uIGRpZmZlcmVuY2VzIGJldHdlZW4gc2VnbWVudHMgdGltZXN0YW1wcyBhbmQgTVNFIGJ1ZmZlciB0aW1lc3RhbXBzXG4gICAgICAgIC8vIGFuZCB0aGVuIGF2b2lkICdlbmRlZCcgZXZlbnQgbm90IGJlaW5nIHJhaXNlZFxuICAgICAgICBtYW5pZmVzdC5tZWRpYVByZXNlbnRhdGlvbkR1cmF0aW9uID0gTWF0aC5mbG9vcihtYW5pZmVzdC5tZWRpYVByZXNlbnRhdGlvbkR1cmF0aW9uICogMTAwMCkgLyAxMDAwO1xuICAgICAgICBwZXJpb2QuZHVyYXRpb24gPSBtYW5pZmVzdC5tZWRpYVByZXNlbnRhdGlvbkR1cmF0aW9uO1xuXG4gICAgICAgIHJldHVybiBtYW5pZmVzdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYXJzZURPTShkYXRhKSB7XG4gICAgICAgIGxldCB4bWxEb2MgPSBudWxsO1xuXG4gICAgICAgIGlmICh3aW5kb3cuRE9NUGFyc2VyKSB7XG4gICAgICAgICAgICBjb25zdCBwYXJzZXIgPSBuZXcgd2luZG93LkRPTVBhcnNlcigpO1xuXG4gICAgICAgICAgICB4bWxEb2MgPSBwYXJzZXIucGFyc2VGcm9tU3RyaW5nKGRhdGEsICd0ZXh0L3htbCcpO1xuICAgICAgICAgICAgaWYgKHhtbERvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgncGFyc2VyZXJyb3InKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdwYXJzaW5nIHRoZSBtYW5pZmVzdCBmYWlsZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB4bWxEb2M7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0TWF0Y2hlcnMoKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldElyb24oKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGludGVybmFsUGFyc2UoZGF0YSkge1xuICAgICAgICBsZXQgeG1sRG9jID0gbnVsbDtcbiAgICAgICAgbGV0IG1hbmlmZXN0ID0gbnVsbDtcblxuICAgICAgICBjb25zdCBzdGFydFRpbWUgPSB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCk7XG5cbiAgICAgICAgLy8gUGFyc2UgdGhlIE1TUyBYTUwgbWFuaWZlc3RcbiAgICAgICAgeG1sRG9jID0gcGFyc2VET00oZGF0YSk7XG5cbiAgICAgICAgY29uc3QgeG1sUGFyc2VUaW1lID0gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpO1xuXG4gICAgICAgIGlmICh4bWxEb2MgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ29udmVydCBNU1MgbWFuaWZlc3QgaW50byBEQVNIIG1hbmlmZXN0XG4gICAgICAgIG1hbmlmZXN0ID0gcHJvY2Vzc01hbmlmZXN0KHhtbERvYywgbmV3IERhdGUoKSk7XG5cbiAgICAgICAgY29uc3QgbXNzMmRhc2hUaW1lID0gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpO1xuXG4gICAgICAgIGxvZ2dlci5pbmZvKCdQYXJzaW5nIGNvbXBsZXRlOiAoeG1sUGFyc2luZzogJyArICh4bWxQYXJzZVRpbWUgLSBzdGFydFRpbWUpLnRvUHJlY2lzaW9uKDMpICsgJ21zLCBtc3MyZGFzaDogJyArIChtc3MyZGFzaFRpbWUgLSB4bWxQYXJzZVRpbWUpLnRvUHJlY2lzaW9uKDMpICsgJ21zLCB0b3RhbDogJyArICgobXNzMmRhc2hUaW1lIC0gc3RhcnRUaW1lKSAvIDEwMDApLnRvUHJlY2lzaW9uKDMpICsgJ3MpJyk7XG5cbiAgICAgICAgcmV0dXJuIG1hbmlmZXN0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgICAgICAvLyBSZXN0b3JlIGluaXRpYWwgYnVmZmVyIHNldHRpbmdzXG4gICAgICAgIGlmIChpbml0aWFsQnVmZmVyU2V0dGluZ3MpIHtcbiAgICAgICAgICAgIHNldHRpbmdzLnVwZGF0ZShpbml0aWFsQnVmZmVyU2V0dGluZ3MpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW5zdGFuY2UgPSB7XG4gICAgICAgIHBhcnNlOiBpbnRlcm5hbFBhcnNlLFxuICAgICAgICBnZXRNYXRjaGVyczogZ2V0TWF0Y2hlcnMsXG4gICAgICAgIGdldElyb246IGdldElyb24sXG4gICAgICAgIHJlc2V0OiByZXNldFxuICAgIH07XG5cbiAgICBzZXR1cCgpO1xuXG4gICAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG5Nc3NQYXJzZXIuX19kYXNoanNfZmFjdG9yeV9uYW1lID0gJ01zc1BhcnNlcic7XG5leHBvcnQgZGVmYXVsdCBkYXNoanMuRmFjdG9yeU1ha2VyLmdldENsYXNzRmFjdG9yeShNc3NQYXJzZXIpOyAvKiBqc2hpbnQgaWdub3JlOmxpbmUgKi9cbiIsIi8qKlxuICogVGhlIGNvcHlyaWdodCBpbiB0aGlzIHNvZnR3YXJlIGlzIGJlaW5nIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSBCU0QgTGljZW5zZSxcbiAqIGluY2x1ZGVkIGJlbG93LiBUaGlzIHNvZnR3YXJlIG1heSBiZSBzdWJqZWN0IHRvIG90aGVyIHRoaXJkIHBhcnR5IGFuZCBjb250cmlidXRvclxuICogcmlnaHRzLCBpbmNsdWRpbmcgcGF0ZW50IHJpZ2h0cywgYW5kIG5vIHN1Y2ggcmlnaHRzIGFyZSBncmFudGVkIHVuZGVyIHRoaXMgbGljZW5zZS5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMsIERhc2ggSW5kdXN0cnkgRm9ydW0uXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG4gKiBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAqICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAqICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vclxuICogIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4gKiAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIERhc2ggSW5kdXN0cnkgRm9ydW0gbm9yIHRoZSBuYW1lcyBvZiBpdHNcbiAqICBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlXG4gKiAgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gKlxuICogIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgQVMgSVMgQU5EIEFOWVxuICogIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbiAqICBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuXG4gKiAgSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCxcbiAqICBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUXG4gKiAgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLCBEQVRBLCBPUlxuICogIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLFxuICogIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSlcbiAqICBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRVxuICogIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG5pbXBvcnQgRXZlbnRzQmFzZSBmcm9tICcuLi9jb3JlL2V2ZW50cy9FdmVudHNCYXNlJztcblxuLyoqXG4gKiBAY2xhc3NcbiAqIEBpbXBsZW1lbnRzIEV2ZW50c0Jhc2VcbiAqL1xuY2xhc3MgTWVkaWFQbGF5ZXJFdmVudHMgZXh0ZW5kcyBFdmVudHNCYXNlIHtcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBQdWJsaWMgZmFjaW5nIGV4dGVybmFsIGV2ZW50cyB0byBiZSB1c2VkIHdoZW4gZGV2ZWxvcGluZyBhIHBsYXllciB0aGF0IGltcGxlbWVudHMgZGFzaC5qcy5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRyaWdnZXJlZCB3aGVuIHBsYXliYWNrIHdpbGwgbm90IHN0YXJ0IHlldFxuICAgICAgICAgKiBhcyB0aGUgTVBEJ3MgYXZhaWxhYmlsaXR5U3RhcnRUaW1lIGlzIGluIHRoZSBmdXR1cmUuXG4gICAgICAgICAqIENoZWNrIGRlbGF5IHByb3BlcnR5IGluIHBheWxvYWQgdG8gZGV0ZXJtaW5lIHRpbWUgYmVmb3JlIHBsYXliYWNrIHdpbGwgc3RhcnQuXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNBU1RfSU5fRlVUVVJFXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLkFTVF9JTl9GVVRVUkUgPSAnYXN0SW5GdXR1cmUnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcmlnZ2VyZWQgd2hlbiB0aGUgdmlkZW8gZWxlbWVudCdzIGJ1ZmZlciBzdGF0ZSBjaGFuZ2VzIHRvIHN0YWxsZWQuXG4gICAgICAgICAqIENoZWNrIG1lZGlhVHlwZSBpbiBwYXlsb2FkIHRvIGRldGVybWluZSB0eXBlIChWaWRlbywgQXVkaW8sIEZyYWdtZW50ZWRUZXh0KS5cbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI0JVRkZFUl9FTVBUWVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5CVUZGRVJfRU1QVFkgPSAnYnVmZmVyU3RhbGxlZCc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRyaWdnZXJlZCB3aGVuIHRoZSB2aWRlbyBlbGVtZW50J3MgYnVmZmVyIHN0YXRlIGNoYW5nZXMgdG8gbG9hZGVkLlxuICAgICAgICAgKiBDaGVjayBtZWRpYVR5cGUgaW4gcGF5bG9hZCB0byBkZXRlcm1pbmUgdHlwZSAoVmlkZW8sIEF1ZGlvLCBGcmFnbWVudGVkVGV4dCkuXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNCVUZGRVJfTE9BREVEXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLkJVRkZFUl9MT0FERUQgPSAnYnVmZmVyTG9hZGVkJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogVHJpZ2dlcmVkIHdoZW4gdGhlIHZpZGVvIGVsZW1lbnQncyBidWZmZXIgc3RhdGUgY2hhbmdlcywgZWl0aGVyIHN0YWxsZWQgb3IgbG9hZGVkLiBDaGVjayBwYXlsb2FkIGZvciBzdGF0ZS5cbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI0JVRkZFUl9MRVZFTF9TVEFURV9DSEFOR0VEXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLkJVRkZFUl9MRVZFTF9TVEFURV9DSEFOR0VEID0gJ2J1ZmZlclN0YXRlQ2hhbmdlZCc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRyaWdnZXJlZCB3aGVuIGEgZHluYW1pYyBzdHJlYW0gY2hhbmdlZCB0byBzdGF0aWMgKHRyYW5zaXRpb24gcGhhc2UgYmV0d2VlbiBMaXZlIGFuZCBPbi1EZW1hbmQpLlxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjRFlOQU1JQ19UT19TVEFUSUNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuRFlOQU1JQ19UT19TVEFUSUMgPSAnZHluYW1pY1RvU3RhdGljJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogVHJpZ2dlcmVkIHdoZW4gdGhlcmUgaXMgYW4gZXJyb3IgZnJvbSB0aGUgZWxlbWVudCBvciBNU0Ugc291cmNlIGJ1ZmZlci5cbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI0VSUk9SXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLkVSUk9SID0gJ2Vycm9yJztcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRyaWdnZXJlZCB3aGVuIGEgZnJhZ21lbnQgZG93bmxvYWQgaGFzIGNvbXBsZXRlZC5cbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI0ZSQUdNRU5UX0xPQURJTkdfQ09NUExFVEVEXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLkZSQUdNRU5UX0xPQURJTkdfQ09NUExFVEVEID0gJ2ZyYWdtZW50TG9hZGluZ0NvbXBsZXRlZCc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRyaWdnZXJlZCB3aGVuIGEgcGFydGlhbCBmcmFnbWVudCBkb3dubG9hZCBoYXMgY29tcGxldGVkLlxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjRlJBR01FTlRfTE9BRElOR19QUk9HUkVTU1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5GUkFHTUVOVF9MT0FESU5HX1BST0dSRVNTID0gJ2ZyYWdtZW50TG9hZGluZ1Byb2dyZXNzJztcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRyaWdnZXJlZCB3aGVuIGEgZnJhZ21lbnQgZG93bmxvYWQgaGFzIHN0YXJ0ZWQuXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNGUkFHTUVOVF9MT0FESU5HX1NUQVJURURcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuRlJBR01FTlRfTE9BRElOR19TVEFSVEVEID0gJ2ZyYWdtZW50TG9hZGluZ1N0YXJ0ZWQnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcmlnZ2VyZWQgd2hlbiBhIGZyYWdtZW50IGRvd25sb2FkIGlzIGFiYW5kb25lZCBkdWUgdG8gZGV0ZWN0aW9uIG9mIHNsb3cgZG93bmxvYWQgYmFzZSBvbiB0aGUgQUJSIGFiYW5kb24gcnVsZS4uXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNGUkFHTUVOVF9MT0FESU5HX0FCQU5ET05FRFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5GUkFHTUVOVF9MT0FESU5HX0FCQU5ET05FRCA9ICdmcmFnbWVudExvYWRpbmdBYmFuZG9uZWQnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcmlnZ2VyZWQgd2hlbiB7QGxpbmsgbW9kdWxlOkRlYnVnfSBsb2dnZXIgbWV0aG9kcyBhcmUgY2FsbGVkLlxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjTE9HXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLkxPRyA9ICdsb2cnO1xuXG4gICAgICAgIC8vVE9ETyByZWZhY3RvciB3aXRoIGludGVybmFsIGV2ZW50XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcmlnZ2VyZWQgd2hlbiB0aGUgbWFuaWZlc3QgbG9hZCBpcyBjb21wbGV0ZVxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjTUFOSUZFU1RfTE9BREVEXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLk1BTklGRVNUX0xPQURFRCA9ICdtYW5pZmVzdExvYWRlZCc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRyaWdnZXJlZCBhbnl0aW1lIHRoZXJlIGlzIGEgY2hhbmdlIHRvIHRoZSBvdmVyYWxsIG1ldHJpY3MuXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNNRVRSSUNTX0NIQU5HRURcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuTUVUUklDU19DSEFOR0VEID0gJ21ldHJpY3NDaGFuZ2VkJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogVHJpZ2dlcmVkIHdoZW4gYW4gaW5kaXZpZHVhbCBtZXRyaWMgaXMgYWRkZWQsIHVwZGF0ZWQgb3IgY2xlYXJlZC5cbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI01FVFJJQ19DSEFOR0VEXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLk1FVFJJQ19DSEFOR0VEID0gJ21ldHJpY0NoYW5nZWQnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcmlnZ2VyZWQgZXZlcnkgdGltZSBhIG5ldyBtZXRyaWMgaXMgYWRkZWQuXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNNRVRSSUNfQURERURcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuTUVUUklDX0FEREVEID0gJ21ldHJpY0FkZGVkJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogVHJpZ2dlcmVkIGV2ZXJ5IHRpbWUgYSBtZXRyaWMgaXMgdXBkYXRlZC5cbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI01FVFJJQ19VUERBVEVEXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLk1FVFJJQ19VUERBVEVEID0gJ21ldHJpY1VwZGF0ZWQnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcmlnZ2VyZWQgYXQgdGhlIHN0cmVhbSBlbmQgb2YgYSBwZXJpb2QuXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNQRVJJT0RfU1dJVENIX0NPTVBMRVRFRFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5QRVJJT0RfU1dJVENIX0NPTVBMRVRFRCA9ICdwZXJpb2RTd2l0Y2hDb21wbGV0ZWQnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcmlnZ2VyZWQgd2hlbiBhIG5ldyBwZXJpb2Qgc3RhcnRzLlxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjUEVSSU9EX1NXSVRDSF9TVEFSVEVEXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLlBFUklPRF9TV0lUQ0hfU1RBUlRFRCA9ICdwZXJpb2RTd2l0Y2hTdGFydGVkJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogVHJpZ2dlcmVkIHdoZW4gYW4gQUJSIHVwIC9kb3duIHN3aXRjaCBpcyBpbml0aWF0ZWQ7IGVpdGhlciBieSB1c2VyIGluIG1hbnVhbCBtb2RlIG9yIGF1dG8gbW9kZSB2aWEgQUJSIHJ1bGVzLlxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjUVVBTElUWV9DSEFOR0VfUkVRVUVTVEVEXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLlFVQUxJVFlfQ0hBTkdFX1JFUVVFU1RFRCA9ICdxdWFsaXR5Q2hhbmdlUmVxdWVzdGVkJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogVHJpZ2dlcmVkIHdoZW4gdGhlIG5ldyBBQlIgcXVhbGl0eSBpcyBiZWluZyByZW5kZXJlZCBvbi1zY3JlZW4uXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNRVUFMSVRZX0NIQU5HRV9SRU5ERVJFRFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5RVUFMSVRZX0NIQU5HRV9SRU5ERVJFRCA9ICdxdWFsaXR5Q2hhbmdlUmVuZGVyZWQnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcmlnZ2VyZWQgd2hlbiB0aGUgbmV3IHRyYWNrIGlzIGJlaW5nIHJlbmRlcmVkLlxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjVFJBQ0tfQ0hBTkdFX1JFTkRFUkVEXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLlRSQUNLX0NIQU5HRV9SRU5ERVJFRCA9ICd0cmFja0NoYW5nZVJlbmRlcmVkJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogVHJpZ2dlcmVkIHdoZW4gdGhlIHNvdXJjZSBpcyBzZXR1cCBhbmQgcmVhZHkuXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNTT1VSQ0VfSU5JVElBTElaRURcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuU09VUkNFX0lOSVRJQUxJWkVEID0gJ3NvdXJjZUluaXRpYWxpemVkJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogVHJpZ2dlcmVkIHdoZW4gYSBzdHJlYW0gKHBlcmlvZCkgaXMgYmVpbmcgbG9hZGVkXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNTVFJFQU1fSU5JVElBTElaSU5HXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLlNUUkVBTV9JTklUSUFMSVpJTkcgPSAnc3RyZWFtSW5pdGlhbGl6aW5nJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogVHJpZ2dlcmVkIHdoZW4gYSBzdHJlYW0gKHBlcmlvZCkgaXMgbG9hZGVkXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNTVFJFQU1fVVBEQVRFRFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5TVFJFQU1fVVBEQVRFRCA9ICdzdHJlYW1VcGRhdGVkJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogVHJpZ2dlcmVkIHdoZW4gYSBzdHJlYW0gKHBlcmlvZCkgaXMgdXBkYXRlZFxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjU1RSRUFNX0lOSVRJQUxJWkVEXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLlNUUkVBTV9JTklUSUFMSVpFRCA9ICdzdHJlYW1Jbml0aWFsaXplZCc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRyaWdnZXJlZCB3aGVuIHRoZSBwbGF5ZXIgaGFzIGJlZW4gcmVzZXQuXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNTVFJFQU1fVEVBUkRPV05fQ09NUExFVEVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuU1RSRUFNX1RFQVJET1dOX0NPTVBMRVRFID0gJ3N0cmVhbVRlYXJkb3duQ29tcGxldGUnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcmlnZ2VyZWQgb25jZSBhbGwgdGV4dCB0cmFja3MgZGV0ZWN0ZWQgaW4gdGhlIE1QRCBhcmUgYWRkZWQgdG8gdGhlIHZpZGVvIGVsZW1lbnQuXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNURVhUX1RSQUNLU19BRERFRFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5URVhUX1RSQUNLU19BRERFRCA9ICdhbGxUZXh0VHJhY2tzQWRkZWQnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcmlnZ2VyZWQgd2hlbiBhIHRleHQgdHJhY2sgaXMgYWRkZWQgdG8gdGhlIHZpZGVvIGVsZW1lbnQncyBUZXh0VHJhY2tMaXN0XG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNURVhUX1RSQUNLX0FEREVEXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLlRFWFRfVFJBQ0tfQURERUQgPSAndGV4dFRyYWNrQWRkZWQnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcmlnZ2VyZWQgd2hlbiBhIHR0bWwgY2h1bmsgaXMgcGFyc2VkLlxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjVFRNTF9QQVJTRURcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuVFRNTF9QQVJTRUQgPSAndHRtbFBhcnNlZCc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRyaWdnZXJlZCB3aGVuIGEgdHRtbCBjaHVuayBoYXMgdG8gYmUgcGFyc2VkLlxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjVFRNTF9UT19QQVJTRVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5UVE1MX1RPX1BBUlNFID0gJ3R0bWxUb1BhcnNlJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogVHJpZ2dlcmVkIHdoZW4gYSBjYXB0aW9uIGlzIHJlbmRlcmVkLlxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjQ0FQVElPTl9SRU5ERVJFRFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5DQVBUSU9OX1JFTkRFUkVEID0gJ2NhcHRpb25SZW5kZXJlZCc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRyaWdnZXJlZCB3aGVuIHRoZSBjYXB0aW9uIGNvbnRhaW5lciBpcyByZXNpemVkLlxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjQ0FQVElPTl9DT05UQUlORVJfUkVTSVpFXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLkNBUFRJT05fQ09OVEFJTkVSX1JFU0laRSA9ICdjYXB0aW9uQ29udGFpbmVyUmVzaXplJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VudCB3aGVuIGVub3VnaCBkYXRhIGlzIGF2YWlsYWJsZSB0aGF0IHRoZSBtZWRpYSBjYW4gYmUgcGxheWVkLFxuICAgICAgICAgKiBhdCBsZWFzdCBmb3IgYSBjb3VwbGUgb2YgZnJhbWVzLiAgVGhpcyBjb3JyZXNwb25kcyB0byB0aGVcbiAgICAgICAgICogSEFWRV9FTk9VR0hfREFUQSByZWFkeVN0YXRlLlxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjQ0FOX1BMQVlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuQ0FOX1BMQVkgPSAnY2FuUGxheSc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNlbnQgd2hlbiBwbGF5YmFjayBjb21wbGV0ZXMuXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNQTEFZQkFDS19FTkRFRFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5QTEFZQkFDS19FTkRFRCA9ICdwbGF5YmFja0VuZGVkJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VudCB3aGVuIGFuIGVycm9yIG9jY3Vycy4gIFRoZSBlbGVtZW50J3MgZXJyb3JcbiAgICAgICAgICogYXR0cmlidXRlIGNvbnRhaW5zIG1vcmUgaW5mb3JtYXRpb24uXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNQTEFZQkFDS19FUlJPUlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5QTEFZQkFDS19FUlJPUiA9ICdwbGF5YmFja0Vycm9yJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VudCB3aGVuIHBsYXliYWNrIGlzIG5vdCBhbGxvd2VkIChmb3IgZXhhbXBsZSBpZiB1c2VyIGdlc3R1cmUgaXMgbmVlZGVkKS5cbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI1BMQVlCQUNLX05PVF9BTExPV0VEXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLlBMQVlCQUNLX05PVF9BTExPV0VEID0gJ3BsYXliYWNrTm90QWxsb3dlZCc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBtZWRpYSdzIG1ldGFkYXRhIGhhcyBmaW5pc2hlZCBsb2FkaW5nOyBhbGwgYXR0cmlidXRlcyBub3dcbiAgICAgICAgICogY29udGFpbiBhcyBtdWNoIHVzZWZ1bCBpbmZvcm1hdGlvbiBhcyB0aGV5J3JlIGdvaW5nIHRvLlxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjUExBWUJBQ0tfTUVUQURBVEFfTE9BREVEXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLlBMQVlCQUNLX01FVEFEQVRBX0xPQURFRCA9ICdwbGF5YmFja01ldGFEYXRhTG9hZGVkJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VudCB3aGVuIHBsYXliYWNrIGlzIHBhdXNlZC5cbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI1BMQVlCQUNLX1BBVVNFRFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5QTEFZQkFDS19QQVVTRUQgPSAncGxheWJhY2tQYXVzZWQnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZW50IHdoZW4gdGhlIG1lZGlhIGJlZ2lucyB0byBwbGF5IChlaXRoZXIgZm9yIHRoZSBmaXJzdCB0aW1lLCBhZnRlciBoYXZpbmcgYmVlbiBwYXVzZWQsXG4gICAgICAgICAqIG9yIGFmdGVyIGVuZGluZyBhbmQgdGhlbiByZXN0YXJ0aW5nKS5cbiAgICAgICAgICpcbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI1BMQVlCQUNLX1BMQVlJTkdcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuUExBWUJBQ0tfUExBWUlORyA9ICdwbGF5YmFja1BsYXlpbmcnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZW50IHBlcmlvZGljYWxseSB0byBpbmZvcm0gaW50ZXJlc3RlZCBwYXJ0aWVzIG9mIHByb2dyZXNzIGRvd25sb2FkaW5nXG4gICAgICAgICAqIHRoZSBtZWRpYS4gSW5mb3JtYXRpb24gYWJvdXQgdGhlIGN1cnJlbnQgYW1vdW50IG9mIHRoZSBtZWRpYSB0aGF0IGhhc1xuICAgICAgICAgKiBiZWVuIGRvd25sb2FkZWQgaXMgYXZhaWxhYmxlIGluIHRoZSBtZWRpYSBlbGVtZW50J3MgYnVmZmVyZWQgYXR0cmlidXRlLlxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjUExBWUJBQ0tfUFJPR1JFU1NcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuUExBWUJBQ0tfUFJPR1JFU1MgPSAncGxheWJhY2tQcm9ncmVzcyc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNlbnQgd2hlbiB0aGUgcGxheWJhY2sgc3BlZWQgY2hhbmdlcy5cbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI1BMQVlCQUNLX1JBVEVfQ0hBTkdFRFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5QTEFZQkFDS19SQVRFX0NIQU5HRUQgPSAncGxheWJhY2tSYXRlQ2hhbmdlZCc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNlbnQgd2hlbiBhIHNlZWsgb3BlcmF0aW9uIGNvbXBsZXRlcy5cbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI1BMQVlCQUNLX1NFRUtFRFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5QTEFZQkFDS19TRUVLRUQgPSAncGxheWJhY2tTZWVrZWQnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZW50IHdoZW4gYSBzZWVrIG9wZXJhdGlvbiBiZWdpbnMuXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNQTEFZQkFDS19TRUVLSU5HXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLlBMQVlCQUNLX1NFRUtJTkcgPSAncGxheWJhY2tTZWVraW5nJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VudCB3aGVuIGEgc2VlayBvcGVyYXRpb24gaGFzIGJlZW4gYXNrZWQuXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNQTEFZQkFDS19TRUVLX0FTS0VEXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLlBMQVlCQUNLX1NFRUtfQVNLRUQgPSAncGxheWJhY2tTZWVrQXNrZWQnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZW50IHdoZW4gdGhlIHZpZGVvIGVsZW1lbnQgcmVwb3J0cyBzdGFsbGVkXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNQTEFZQkFDS19TVEFMTEVEXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLlBMQVlCQUNLX1NUQUxMRUQgPSAncGxheWJhY2tTdGFsbGVkJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VudCB3aGVuIHBsYXliYWNrIG9mIHRoZSBtZWRpYSBzdGFydHMgYWZ0ZXIgaGF2aW5nIGJlZW4gcGF1c2VkO1xuICAgICAgICAgKiB0aGF0IGlzLCB3aGVuIHBsYXliYWNrIGlzIHJlc3VtZWQgYWZ0ZXIgYSBwcmlvciBwYXVzZSBldmVudC5cbiAgICAgICAgICpcbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI1BMQVlCQUNLX1NUQVJURURcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuUExBWUJBQ0tfU1RBUlRFRCA9ICdwbGF5YmFja1N0YXJ0ZWQnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgdGltZSBpbmRpY2F0ZWQgYnkgdGhlIGVsZW1lbnQncyBjdXJyZW50VGltZSBhdHRyaWJ1dGUgaGFzIGNoYW5nZWQuXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNQTEFZQkFDS19USU1FX1VQREFURURcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuUExBWUJBQ0tfVElNRV9VUERBVEVEID0gJ3BsYXliYWNrVGltZVVwZGF0ZWQnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZW50IHdoZW4gdGhlIG1lZGlhIHBsYXliYWNrIGhhcyBzdG9wcGVkIGJlY2F1c2Ugb2YgYSB0ZW1wb3JhcnkgbGFjayBvZiBkYXRhLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjUExBWUJBQ0tfV0FJVElOR1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5QTEFZQkFDS19XQUlUSU5HID0gJ3BsYXliYWNrV2FpdGluZyc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIE1hbmlmZXN0IHZhbGlkaXR5IGNoYW5nZWQgLSBBcyBhIHJlc3VsdCBvZiBhbiBNUEQgdmFsaWRpdHkgZXhwaXJhdGlvbiBldmVudC5cbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI01BTklGRVNUX1ZBTElESVRZX0NIQU5HRURcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuTUFOSUZFU1RfVkFMSURJVFlfQ0hBTkdFRCA9ICdtYW5pZmVzdFZhbGlkaXR5Q2hhbmdlZCc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEEgZ2FwIG9jY3VyZWQgaW4gdGhlIHRpbWVsaW5lIHdoaWNoIHJlcXVpcmVzIGEgc2VlayB0byB0aGUgbmV4dCBwZXJpb2RcbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI0dBUF9DQVVTRURfU0VFS19UT19QRVJJT0RfRU5EXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLkdBUF9DQVVTRURfU0VFS19UT19QRVJJT0RfRU5EID0gJ2dhcENhdXNlZFNlZWtUb1BlcmlvZEVuZCc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEEgZ2FwIG9jY3VyZWQgaW4gdGhlIHRpbWVsaW5lIHdoaWNoIHJlcXVpcmVzIGFuIGludGVybmFsIHNlZWtcbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI0dBUF9DQVVTRURfSU5URVJOQUxfU0VFS1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5HQVBfQ0FVU0VEX0lOVEVSTkFMX1NFRUsgPSAnZ2FwQ2F1c2VkSW50ZXJuYWxTZWVrJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogRGFzaCBldmVudHMgYXJlIHRyaWdnZXJlZCBhdCB0aGVpciByZXNwZWN0aXZlIHN0YXJ0IHBvaW50cyBvbiB0aGUgdGltZWxpbmUuXG4gICAgICAgICAqIEBldmVudCBNZWRpYVBsYXllckV2ZW50cyNFVkVOVF9NT0RFX09OX1NUQVJUXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLkVWRU5UX01PREVfT05fU1RBUlQgPSAnZXZlbnRNb2RlT25TdGFydCc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERhc2ggZXZlbnRzIGFyZSB0cmlnZ2VyZWQgYXMgc29vbiBhcyB0aGV5IHdlcmUgcGFyc2VkLlxuICAgICAgICAgKiBAZXZlbnQgTWVkaWFQbGF5ZXJFdmVudHMjRVZFTlRfTU9ERV9PTl9SRUNFSVZFXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLkVWRU5UX01PREVfT05fUkVDRUlWRSA9ICdldmVudE1vZGVPblJlY2VpdmUnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBFdmVudCB0aGF0IGlzIGRpc3BhdGNoZWQgd2hlbmV2ZXIgdGhlIHBsYXllciBlbmNvdW50ZXJzIGEgcG90ZW50aWFsIGNvbmZvcm1hbmNlIHZhbGlkYXRpb24gdGhhdCBtaWdodCBsZWFkIHRvIHVuZXhwZWN0ZWQvbm90IG9wdGltYWwgYmVoYXZpb3JcbiAgICAgICAgICogQGV2ZW50IE1lZGlhUGxheWVyRXZlbnRzI0NPTkZPUk1BTkNFX1ZJT0xBVElPTlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5DT05GT1JNQU5DRV9WSU9MQVRJT04gPSAnY29uZm9ybWFuY2VWaW9sYXRpb24nO1xuICAgIH1cbn1cblxubGV0IG1lZGlhUGxheWVyRXZlbnRzID0gbmV3IE1lZGlhUGxheWVyRXZlbnRzKCk7XG5leHBvcnQgZGVmYXVsdCBtZWRpYVBsYXllckV2ZW50cztcbiIsIi8qKlxuICogVGhlIGNvcHlyaWdodCBpbiB0aGlzIHNvZnR3YXJlIGlzIGJlaW5nIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSBCU0QgTGljZW5zZSxcbiAqIGluY2x1ZGVkIGJlbG93LiBUaGlzIHNvZnR3YXJlIG1heSBiZSBzdWJqZWN0IHRvIG90aGVyIHRoaXJkIHBhcnR5IGFuZCBjb250cmlidXRvclxuICogcmlnaHRzLCBpbmNsdWRpbmcgcGF0ZW50IHJpZ2h0cywgYW5kIG5vIHN1Y2ggcmlnaHRzIGFyZSBncmFudGVkIHVuZGVyIHRoaXMgbGljZW5zZS5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMsIERhc2ggSW5kdXN0cnkgRm9ydW0uXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG4gKiBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAqICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAqICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vclxuICogIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4gKiAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIERhc2ggSW5kdXN0cnkgRm9ydW0gbm9yIHRoZSBuYW1lcyBvZiBpdHNcbiAqICBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlXG4gKiAgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gKlxuICogIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgQVMgSVMgQU5EIEFOWVxuICogIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbiAqICBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuXG4gKiAgSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCxcbiAqICBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUXG4gKiAgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLCBEQVRBLCBPUlxuICogIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLFxuICogIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSlcbiAqICBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRVxuICogIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG5cbi8qKlxuICogUmVwcmVzZW50cyBkYXRhIHN0cnVjdHVyZSB0byBrZWVwIGFuZCBkcml2ZSB7RGF0YUNodW5rfVxuICovXG5cbmltcG9ydCBGYWN0b3J5TWFrZXIgZnJvbSAnLi4vLi4vY29yZS9GYWN0b3J5TWFrZXInO1xuXG5mdW5jdGlvbiBJbml0Q2FjaGUoKSB7XG5cbiAgICBsZXQgZGF0YSA9IHt9O1xuXG4gICAgZnVuY3Rpb24gc2F2ZSAoY2h1bmspIHtcbiAgICAgICAgY29uc3QgaWQgPSBjaHVuay5zdHJlYW1JZDtcbiAgICAgICAgY29uc3QgcmVwcmVzZW50YXRpb25JZCA9IGNodW5rLnJlcHJlc2VudGF0aW9uSWQ7XG5cbiAgICAgICAgZGF0YVtpZF0gPSBkYXRhW2lkXSB8fCB7fTtcbiAgICAgICAgZGF0YVtpZF1bcmVwcmVzZW50YXRpb25JZF0gPSBjaHVuaztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBleHRyYWN0IChzdHJlYW1JZCwgcmVwcmVzZW50YXRpb25JZCkge1xuICAgICAgICBpZiAoZGF0YSAmJiBkYXRhW3N0cmVhbUlkXSAmJiBkYXRhW3N0cmVhbUlkXVtyZXByZXNlbnRhdGlvbklkXSkge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGFbc3RyZWFtSWRdW3JlcHJlc2VudGF0aW9uSWRdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIGZ1bmN0aW9uIHJlc2V0ICgpIHtcbiAgICAgICAgZGF0YSA9IHt9O1xuICAgIH1cblxuICAgIGNvbnN0IGluc3RhbmNlID0ge1xuICAgICAgICBzYXZlOiBzYXZlLFxuICAgICAgICBleHRyYWN0OiBleHRyYWN0LFxuICAgICAgICByZXNldDogcmVzZXRcbiAgICB9O1xuXG4gICAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG5Jbml0Q2FjaGUuX19kYXNoanNfZmFjdG9yeV9uYW1lID0gJ0luaXRDYWNoZSc7XG5leHBvcnQgZGVmYXVsdCBGYWN0b3J5TWFrZXIuZ2V0U2luZ2xldG9uRmFjdG9yeShJbml0Q2FjaGUpO1xuIiwiLyoqXG4gKiBUaGUgY29weXJpZ2h0IGluIHRoaXMgc29mdHdhcmUgaXMgYmVpbmcgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIEJTRCBMaWNlbnNlLFxuICogaW5jbHVkZWQgYmVsb3cuIFRoaXMgc29mdHdhcmUgbWF5IGJlIHN1YmplY3QgdG8gb3RoZXIgdGhpcmQgcGFydHkgYW5kIGNvbnRyaWJ1dG9yXG4gKiByaWdodHMsIGluY2x1ZGluZyBwYXRlbnQgcmlnaHRzLCBhbmQgbm8gc3VjaCByaWdodHMgYXJlIGdyYW50ZWQgdW5kZXIgdGhpcyBsaWNlbnNlLlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMywgRGFzaCBJbmR1c3RyeSBGb3J1bS5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbiAqIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICogIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICogIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yXG4gKiAgb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbiAqICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgRGFzaCBJbmR1c3RyeSBGb3J1bSBub3IgdGhlIG5hbWVzIG9mIGl0c1xuICogIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmVcbiAqICB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbiAqXG4gKiAgVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBBUyBJUyBBTkQgQU5ZXG4gKiAgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuICogIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC5cbiAqICBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULFxuICogIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVRcbiAqICBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SXG4gKiAgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksXG4gKiAgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKVxuICogIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFXG4gKiAgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKi9cbi8qKlxuICogQGNsYXNzXG4gKiBAaWdub3JlXG4gKi9cbmNsYXNzIERhc2hKU0Vycm9yIHtcbiAgICBjb25zdHJ1Y3Rvcihjb2RlLCBtZXNzYWdlLCBkYXRhKSB7XG4gICAgICAgIHRoaXMuY29kZSA9IGNvZGUgfHwgbnVsbDtcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZSB8fCBudWxsO1xuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhIHx8IG51bGw7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBEYXNoSlNFcnJvcjsiLCIvKipcbiAqIFRoZSBjb3B5cmlnaHQgaW4gdGhpcyBzb2Z0d2FyZSBpcyBiZWluZyBtYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgQlNEIExpY2Vuc2UsXG4gKiBpbmNsdWRlZCBiZWxvdy4gVGhpcyBzb2Z0d2FyZSBtYXkgYmUgc3ViamVjdCB0byBvdGhlciB0aGlyZCBwYXJ0eSBhbmQgY29udHJpYnV0b3JcbiAqIHJpZ2h0cywgaW5jbHVkaW5nIHBhdGVudCByaWdodHMsIGFuZCBubyBzdWNoIHJpZ2h0cyBhcmUgZ3JhbnRlZCB1bmRlciB0aGlzIGxpY2Vuc2UuXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDEzLCBEYXNoIEluZHVzdHJ5IEZvcnVtLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuICogYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuICogICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gKiAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gKiAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBhbmQvb3JcbiAqICBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuICogICogTmVpdGhlciB0aGUgbmFtZSBvZiBEYXNoIEluZHVzdHJ5IEZvcnVtIG5vciB0aGUgbmFtZXMgb2YgaXRzXG4gKiAgY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0cyBkZXJpdmVkIGZyb20gdGhpcyBzb2Z0d2FyZVxuICogIHdpdGhvdXQgc3BlY2lmaWMgcHJpb3Igd3JpdHRlbiBwZXJtaXNzaW9uLlxuICpcbiAqICBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIEFTIElTIEFORCBBTllcbiAqICBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG4gKiAgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELlxuICogIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsXG4gKiAgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIChJTkNMVURJTkcsIEJVVFxuICogIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1JcbiAqICBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTlkgVEhFT1JZIE9GIExJQUJJTElUWSxcbiAqICBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpXG4gKiAgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEVcbiAqICBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cbiAqL1xuXG4vKipcbiAqIEBjbGFzc1xuICogQGlnbm9yZVxuICovXG5jbGFzcyBEYXRhQ2h1bmsge1xuICAgIC8vUmVwcmVzZW50cyBhIGRhdGEgc3RydWN0dXJlIHRoYXQga2VlcCBhbGwgdGhlIG5lY2Vzc2FyeSBpbmZvIGFib3V0IGEgc2luZ2xlIGluaXQvbWVkaWEgc2VnbWVudFxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnN0cmVhbUlkID0gbnVsbDtcbiAgICAgICAgdGhpcy5tZWRpYUluZm8gPSBudWxsO1xuICAgICAgICB0aGlzLnNlZ21lbnRUeXBlID0gbnVsbDtcbiAgICAgICAgdGhpcy5xdWFsaXR5ID0gTmFOO1xuICAgICAgICB0aGlzLmluZGV4ID0gTmFOO1xuICAgICAgICB0aGlzLmJ5dGVzID0gbnVsbDtcbiAgICAgICAgdGhpcy5zdGFydCA9IE5hTjtcbiAgICAgICAgdGhpcy5lbmQgPSBOYU47XG4gICAgICAgIHRoaXMuZHVyYXRpb24gPSBOYU47XG4gICAgICAgIHRoaXMucmVwcmVzZW50YXRpb25JZCA9IG51bGw7XG4gICAgICAgIHRoaXMuZW5kRnJhZ21lbnQgPSBudWxsO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRGF0YUNodW5rOyIsIi8qKlxuICogVGhlIGNvcHlyaWdodCBpbiB0aGlzIHNvZnR3YXJlIGlzIGJlaW5nIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSBCU0QgTGljZW5zZSxcbiAqIGluY2x1ZGVkIGJlbG93LiBUaGlzIHNvZnR3YXJlIG1heSBiZSBzdWJqZWN0IHRvIG90aGVyIHRoaXJkIHBhcnR5IGFuZCBjb250cmlidXRvclxuICogcmlnaHRzLCBpbmNsdWRpbmcgcGF0ZW50IHJpZ2h0cywgYW5kIG5vIHN1Y2ggcmlnaHRzIGFyZSBncmFudGVkIHVuZGVyIHRoaXMgbGljZW5zZS5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMsIERhc2ggSW5kdXN0cnkgRm9ydW0uXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG4gKiBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAqICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAqICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vclxuICogIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4gKiAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIERhc2ggSW5kdXN0cnkgRm9ydW0gbm9yIHRoZSBuYW1lcyBvZiBpdHNcbiAqICBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlXG4gKiAgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gKlxuICogIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgQVMgSVMgQU5EIEFOWVxuICogIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbiAqICBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuXG4gKiAgSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCxcbiAqICBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUXG4gKiAgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLCBEQVRBLCBPUlxuICogIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLFxuICogIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSlcbiAqICBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRVxuICogIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG5cbmltcG9ydCB7IEhUVFBSZXF1ZXN0IH0gZnJvbSAnLi4vdm8vbWV0cmljcy9IVFRQUmVxdWVzdCc7XG5cbi8qKlxuICogQGNsYXNzXG4gKiBAaWdub3JlXG4gKi9cbmNsYXNzIEZyYWdtZW50UmVxdWVzdCB7XG4gICAgY29uc3RydWN0b3IodXJsKSB7XG4gICAgICAgIHRoaXMuYWN0aW9uID0gRnJhZ21lbnRSZXF1ZXN0LkFDVElPTl9ET1dOTE9BRDtcbiAgICAgICAgdGhpcy5zdGFydFRpbWUgPSBOYU47XG4gICAgICAgIHRoaXMubWVkaWFTdGFydFRpbWUgPSBOYU47XG4gICAgICAgIHRoaXMubWVkaWFUeXBlID0gbnVsbDtcbiAgICAgICAgdGhpcy5tZWRpYUluZm8gPSBudWxsO1xuICAgICAgICB0aGlzLnR5cGUgPSBudWxsO1xuICAgICAgICB0aGlzLmR1cmF0aW9uID0gTmFOO1xuICAgICAgICB0aGlzLnRpbWVzY2FsZSA9IE5hTjtcbiAgICAgICAgdGhpcy5yYW5nZSA9IG51bGw7XG4gICAgICAgIHRoaXMudXJsID0gdXJsIHx8IG51bGw7XG4gICAgICAgIHRoaXMuc2VydmljZUxvY2F0aW9uID0gbnVsbDtcbiAgICAgICAgdGhpcy5yZXF1ZXN0U3RhcnREYXRlID0gbnVsbDtcbiAgICAgICAgdGhpcy5maXJzdEJ5dGVEYXRlID0gbnVsbDtcbiAgICAgICAgdGhpcy5yZXF1ZXN0RW5kRGF0ZSA9IG51bGw7XG4gICAgICAgIHRoaXMucXVhbGl0eSA9IE5hTjtcbiAgICAgICAgdGhpcy5pbmRleCA9IE5hTjtcbiAgICAgICAgdGhpcy5hdmFpbGFiaWxpdHlTdGFydFRpbWUgPSBudWxsO1xuICAgICAgICB0aGlzLmF2YWlsYWJpbGl0eUVuZFRpbWUgPSBudWxsO1xuICAgICAgICB0aGlzLndhbGxTdGFydFRpbWUgPSBudWxsO1xuICAgICAgICB0aGlzLmJ5dGVzTG9hZGVkID0gTmFOO1xuICAgICAgICB0aGlzLmJ5dGVzVG90YWwgPSBOYU47XG4gICAgICAgIHRoaXMuZGVsYXlMb2FkaW5nVGltZSA9IE5hTjtcbiAgICAgICAgdGhpcy5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuICAgICAgICB0aGlzLnJlcHJlc2VudGF0aW9uSWQgPSBudWxsO1xuICAgIH1cblxuICAgIGlzSW5pdGlhbGl6YXRpb25SZXF1ZXN0KCkge1xuICAgICAgICByZXR1cm4gKHRoaXMudHlwZSAmJiB0aGlzLnR5cGUgPT09IEhUVFBSZXF1ZXN0LklOSVRfU0VHTUVOVF9UWVBFKTtcbiAgICB9XG5cbiAgICBzZXRJbmZvKGluZm8pIHtcbiAgICAgICAgdGhpcy50eXBlID0gaW5mbyAmJiBpbmZvLmluaXQgPyBIVFRQUmVxdWVzdC5JTklUX1NFR01FTlRfVFlQRSA6IEhUVFBSZXF1ZXN0Lk1FRElBX1NFR01FTlRfVFlQRTtcbiAgICAgICAgdGhpcy51cmwgPSBpbmZvICYmIGluZm8udXJsID8gaW5mby51cmwgOiBudWxsO1xuICAgICAgICB0aGlzLnJhbmdlID0gaW5mbyAmJiBpbmZvLnJhbmdlID8gaW5mby5yYW5nZS5zdGFydCArICctJyArIGluZm8ucmFuZ2UuZW5kIDogbnVsbDtcbiAgICAgICAgdGhpcy5tZWRpYVR5cGUgPSBpbmZvICYmIGluZm8ubWVkaWFUeXBlID8gaW5mby5tZWRpYVR5cGUgOiBudWxsO1xuICAgIH1cbn1cblxuRnJhZ21lbnRSZXF1ZXN0LkFDVElPTl9ET1dOTE9BRCA9ICdkb3dubG9hZCc7XG5GcmFnbWVudFJlcXVlc3QuQUNUSU9OX0NPTVBMRVRFID0gJ2NvbXBsZXRlJztcblxuZXhwb3J0IGRlZmF1bHQgRnJhZ21lbnRSZXF1ZXN0O1xuIiwiLyoqXG4gKiBUaGUgY29weXJpZ2h0IGluIHRoaXMgc29mdHdhcmUgaXMgYmVpbmcgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIEJTRCBMaWNlbnNlLFxuICogaW5jbHVkZWQgYmVsb3cuIFRoaXMgc29mdHdhcmUgbWF5IGJlIHN1YmplY3QgdG8gb3RoZXIgdGhpcmQgcGFydHkgYW5kIGNvbnRyaWJ1dG9yXG4gKiByaWdodHMsIGluY2x1ZGluZyBwYXRlbnQgcmlnaHRzLCBhbmQgbm8gc3VjaCByaWdodHMgYXJlIGdyYW50ZWQgdW5kZXIgdGhpcyBsaWNlbnNlLlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMywgRGFzaCBJbmR1c3RyeSBGb3J1bS5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbiAqIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICogIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICogIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yXG4gKiAgb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbiAqICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgRGFzaCBJbmR1c3RyeSBGb3J1bSBub3IgdGhlIG5hbWVzIG9mIGl0c1xuICogIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmVcbiAqICB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbiAqXG4gKiAgVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBBUyBJUyBBTkQgQU5ZXG4gKiAgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuICogIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC5cbiAqICBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULFxuICogIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVRcbiAqICBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SXG4gKiAgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksXG4gKiAgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKVxuICogIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFXG4gKiAgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKi9cbi8qKlxuICogQGNsYXNzZGVzYyBUaGlzIE9iamVjdCBob2xkcyByZWZlcmVuY2UgdG8gdGhlIEhUVFBSZXF1ZXN0IGZvciBtYW5pZmVzdCwgZnJhZ21lbnQgYW5kIHhsaW5rIGxvYWRpbmcuXG4gKiBNZW1iZXJzIHdoaWNoIGFyZSBub3QgZGVmaW5lZCBpbiBJU08yMzAwOS0xIEFubmV4IEQgc2hvdWxkIGJlIHByZWZpeGVkIGJ5IGEgXyBzbyB0aGF0IHRoZXkgYXJlIGlnbm9yZWRcbiAqIGJ5IE1ldHJpY3MgUmVwb3J0aW5nIGNvZGUuXG4gKiBAaWdub3JlXG4gKi9cbmNsYXNzIEhUVFBSZXF1ZXN0IHtcbiAgICAvKipcbiAgICAgKiBAY2xhc3NcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIElkZW50aWZpZXIgb2YgdGhlIFRDUCBjb25uZWN0aW9uIG9uIHdoaWNoIHRoZSBIVFRQIHJlcXVlc3Qgd2FzIHNlbnQuXG4gICAgICAgICAqIEBwdWJsaWNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudGNwaWQgPSBudWxsO1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhpcyBpcyBhbiBvcHRpb25hbCBwYXJhbWV0ZXIgYW5kIHNob3VsZCBub3QgYmUgaW5jbHVkZWQgaW4gSFRUUCByZXF1ZXN0L3Jlc3BvbnNlIHRyYW5zYWN0aW9ucyBmb3IgcHJvZ3Jlc3NpdmUgZG93bmxvYWQuXG4gICAgICAgICAqIFRoZSB0eXBlIG9mIHRoZSByZXF1ZXN0OlxuICAgICAgICAgKiAtIE1QRFxuICAgICAgICAgKiAtIFhMaW5rIGV4cGFuc2lvblxuICAgICAgICAgKiAtIEluaXRpYWxpemF0aW9uIEZyYWdtZW50XG4gICAgICAgICAqIC0gSW5kZXggRnJhZ21lbnRcbiAgICAgICAgICogLSBNZWRpYSBGcmFnbWVudFxuICAgICAgICAgKiAtIEJpdHN0cmVhbSBTd2l0Y2hpbmcgRnJhZ21lbnRcbiAgICAgICAgICogLSBvdGhlclxuICAgICAgICAgKiBAcHVibGljXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnR5cGUgPSBudWxsO1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIG9yaWdpbmFsIFVSTCAoYmVmb3JlIGFueSByZWRpcmVjdHMgb3IgZmFpbHVyZXMpXG4gICAgICAgICAqIEBwdWJsaWNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudXJsID0gbnVsbDtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBhY3R1YWwgVVJMIHJlcXVlc3RlZCwgaWYgZGlmZmVyZW50IGZyb20gYWJvdmVcbiAgICAgICAgICogQHB1YmxpY1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5hY3R1YWx1cmwgPSBudWxsO1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIGNvbnRlbnRzIG9mIHRoZSBieXRlLXJhbmdlLXNwZWMgcGFydCBvZiB0aGUgSFRUUCBSYW5nZSBoZWFkZXIuXG4gICAgICAgICAqIEBwdWJsaWNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmFuZ2UgPSBudWxsO1xuICAgICAgICAvKipcbiAgICAgICAgICogUmVhbC1UaW1lIHwgVGhlIHJlYWwgdGltZSBhdCB3aGljaCB0aGUgcmVxdWVzdCB3YXMgc2VudC5cbiAgICAgICAgICogQHB1YmxpY1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy50cmVxdWVzdCA9IG51bGw7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZWFsLVRpbWUgfCBUaGUgcmVhbCB0aW1lIGF0IHdoaWNoIHRoZSBmaXJzdCBieXRlIG9mIHRoZSByZXNwb25zZSB3YXMgcmVjZWl2ZWQuXG4gICAgICAgICAqIEBwdWJsaWNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudHJlc3BvbnNlID0gbnVsbDtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBIVFRQIHJlc3BvbnNlIGNvZGUuXG4gICAgICAgICAqIEBwdWJsaWNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVzcG9uc2Vjb2RlID0gbnVsbDtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBkdXJhdGlvbiBvZiB0aGUgdGhyb3VnaHB1dCB0cmFjZSBpbnRlcnZhbHMgKG1zKSwgZm9yIHN1Y2Nlc3NmdWwgcmVxdWVzdHMgb25seS5cbiAgICAgICAgICogQHB1YmxpY1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5pbnRlcnZhbCA9IG51bGw7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaHJvdWdocHV0IHRyYWNlcywgZm9yIHN1Y2Nlc3NmdWwgcmVxdWVzdHMgb25seS5cbiAgICAgICAgICogQHB1YmxpY1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy50cmFjZSA9IFtdO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUeXBlIG9mIHN0cmVhbSAoXCJhdWRpb1wiIHwgXCJ2aWRlb1wiIGV0Yy4uKVxuICAgICAgICAgKiBAcHVibGljXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9zdHJlYW0gPSBudWxsO1xuICAgICAgICAvKipcbiAgICAgICAgICogUmVhbC1UaW1lIHwgVGhlIHJlYWwgdGltZSBhdCB3aGljaCB0aGUgcmVxdWVzdCBmaW5pc2hlZC5cbiAgICAgICAgICogQHB1YmxpY1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fdGZpbmlzaCA9IG51bGw7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgZHVyYXRpb24gb2YgdGhlIG1lZGlhIHJlcXVlc3RzLCBpZiBhdmFpbGFibGUsIGluIHNlY29uZHMuXG4gICAgICAgICAqIEBwdWJsaWNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX21lZGlhZHVyYXRpb24gPSBudWxsO1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIG1lZGlhIHNlZ21lbnQgcXVhbGl0eVxuICAgICAgICAgKiBAcHVibGljXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9xdWFsaXR5ID0gbnVsbDtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGFsbCB0aGUgcmVzcG9uc2UgaGVhZGVycyBmcm9tIHJlcXVlc3QuXG4gICAgICAgICAqIEBwdWJsaWNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3Jlc3BvbnNlSGVhZGVycyA9IG51bGw7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgc2VsZWN0ZWQgc2VydmljZSBsb2NhdGlvbiBmb3IgdGhlIHJlcXVlc3QuIHN0cmluZy5cbiAgICAgICAgICogQHB1YmxpY1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fc2VydmljZUxvY2F0aW9uID0gbnVsbDtcbiAgICB9XG59XG5cbi8qKlxuICogQGNsYXNzZGVzYyBUaGlzIE9iamVjdCBob2xkcyByZWZlcmVuY2UgdG8gdGhlIHByb2dyZXNzIG9mIHRoZSBIVFRQUmVxdWVzdC5cbiAqIEBpZ25vcmVcbiAqL1xuY2xhc3MgSFRUUFJlcXVlc3RUcmFjZSB7XG4gICAgLyoqXG4gICAgKiBAY2xhc3NcbiAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogUmVhbC1UaW1lIHwgTWVhc3VyZW1lbnQgc3RyZWFtIHN0YXJ0LlxuICAgICAgICAgKiBAcHVibGljXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnMgPSBudWxsO1xuICAgICAgICAvKipcbiAgICAgICAgICogTWVhc3VyZW1lbnQgc3RyZWFtIGR1cmF0aW9uIChtcykuXG4gICAgICAgICAqIEBwdWJsaWNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZCA9IG51bGw7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBMaXN0IG9mIGludGVnZXJzIGNvdW50aW5nIHRoZSBieXRlcyByZWNlaXZlZCBpbiBlYWNoIHRyYWNlIGludGVydmFsIHdpdGhpbiB0aGUgbWVhc3VyZW1lbnQgc3RyZWFtLlxuICAgICAgICAgKiBAcHVibGljXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmIgPSBbXTtcbiAgICB9XG59XG5cbkhUVFBSZXF1ZXN0LkdFVCA9ICdHRVQnO1xuSFRUUFJlcXVlc3QuSEVBRCA9ICdIRUFEJztcbkhUVFBSZXF1ZXN0Lk1QRF9UWVBFID0gJ01QRCc7XG5IVFRQUmVxdWVzdC5YTElOS19FWFBBTlNJT05fVFlQRSA9ICdYTGlua0V4cGFuc2lvbic7XG5IVFRQUmVxdWVzdC5JTklUX1NFR01FTlRfVFlQRSA9ICdJbml0aWFsaXphdGlvblNlZ21lbnQnO1xuSFRUUFJlcXVlc3QuSU5ERVhfU0VHTUVOVF9UWVBFID0gJ0luZGV4U2VnbWVudCc7XG5IVFRQUmVxdWVzdC5NRURJQV9TRUdNRU5UX1RZUEUgPSAnTWVkaWFTZWdtZW50JztcbkhUVFBSZXF1ZXN0LkJJVFNUUkVBTV9TV0lUQ0hJTkdfU0VHTUVOVF9UWVBFID0gJ0JpdHN0cmVhbVN3aXRjaGluZ1NlZ21lbnQnO1xuSFRUUFJlcXVlc3QuTVNTX0ZSQUdNRU5UX0lORk9fU0VHTUVOVF9UWVBFID0gJ0ZyYWdtZW50SW5mb1NlZ21lbnQnO1xuSFRUUFJlcXVlc3QuTElDRU5TRSA9ICdsaWNlbnNlJztcbkhUVFBSZXF1ZXN0Lk9USEVSX1RZUEUgPSAnb3RoZXInO1xuXG5leHBvcnQgeyBIVFRQUmVxdWVzdCwgSFRUUFJlcXVlc3RUcmFjZSB9O1xuIl19
