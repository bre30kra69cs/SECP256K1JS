import {BigNumber} from 'bignumber.js';
const R = require("ramda");
const L = require('lodash');



//For easy way
let print = console.log;

let bn = R.curry((y, x) => new BigNumber(x, y));
let bn16 = bn(16);
let bn10 = bn(10);
let bn2 = bn(2);

BigNumber.config({ MODULO_MODE: BigNumber.EUCLID });


// PARAMETERS

//Numbers
const BIN = 2;

const BYTE = 8;

const HEX = 16;

//secp256k1 tuple
let p = bn16("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC2F");

let a = bn16("0000000000000000000000000000000000000000000000000000000000000000");

let b = bn16("0000000000000000000000000000000000000000000000000000000000000007");

let G = [
    bn16("79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798"),
    bn16("483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8")
];

let n = bn16("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141");

let h = bn16("0000000000000000000000000000000000000000000000000000000000000001");



// POINT ADDITION

let getAdditionAl = P => R.pipe(
    x => x[1][1].plus(additionInverse(x[0][1])),
    x => x.multipliedBy(new_multiplicative_inverse(P[1][0].plus(additionInverse(P[0][0])))),
    x => x.modulo(p)
)(P);

//Addition: alpha computation
let pointAdditionAl = R.pipe(
    getAdditionAl
);

//Addition: x computation
let pointAdditionX = R.curry((P, al) => R.pipe(
    x => x.exponentiatedBy(2),
    x => x.plus(additionInverse(P[0][0])),
    x => x.plus(additionInverse(P[1][0])),
    x => x.modulo(p)
)(al));

//Addition: y computation
let pointAdditionY = R.curry((al, P, x3) => R.pipe(
    x => x.multipliedBy(P[0][0].plus(additionInverse(x3))),
    x => x.plus(additionInverse(P[0][1])),
    x => x.modulo(p)
)(al));

//Point addition
let pointAddition = twoP => R.pipe(
    pointAdditionAl,
    pointAdditionX(twoP),
    x => [x, pointAdditionY(pointAdditionAl(twoP), twoP, x)]
)(twoP);



// DOUBLING ADDITION

//Multiplicative inverse by N modulo
let multiplicativeInverseN = R.curry((n, a) => {
    let t = bn10(0);
    let newt = bn10(1);
    let r = n;
    let newr = a;
    let i = 0;
    while (newr.comparedTo(bn10(0)) !== 0) {
        let quotient = r.dividedToIntegerBy(newr);
        let statet = t;
        t = newt;
        newt = statet.minus(quotient.multipliedBy(newt));

        let stater = r;
        r = newr;
        newr = stater.minus(quotient.multipliedBy(newr));
        i++;
    }
    if (r.comparedTo(bn10(1)) === 1) {
        print("МЫ В ЖОПЕ");
    }
    if (t.comparedTo(bn10(0)) === -1) {
        t = t.plus(n);
    }
    return t;
});



let new_multiplicative_inverse_n = R.curry((p, a) => {
    let u = a;
    let v = p;
    let A = bn10(1);
    let C = bn10(0);

    while (u.comparedTo(0) !== 0) {
        if (u.modulo(2).comparedTo(0) === 0) {
            u = u.dividedBy(2);
            if (A.modulo(2).comparedTo(0) === 0) { A = A.dividedBy(2) }
            else { A = A.plus(p).dividedBy(2) }
        }
        if (v.modulo(2).comparedTo(0) === 0) {
            v = v.dividedBy(2);
            if (C.modulo(2).comparedTo(0) === 0) { C = C.dividedBy(2) }
            else { C = C.plus(p).dividedBy(2) }
        }
        if (u.comparedTo(v) === 1 || u.comparedTo(v) === 0) {
            u = u.minus(v);
            A = A.minus(C);
        }
        else {
            v = v.minus(u);
            C = C.minus(A);
        }
    }
    return C.modulo(p);
});

let new_multiplicative_inverse = new_multiplicative_inverse_n(p);
let  multiplicativeInverse = multiplicativeInverseN(p);
let additionInverse = x => x.negated().modulo(p);

//Doubling: alpha computation
let pointDoublingAl = twoP => R.pipe(
    x => x[0][0].exponentiatedBy(bn10(2)),
    x => x.multipliedBy(bn10(3)),
    x => x.plus(a),
    x => x.multipliedBy(new_multiplicative_inverse(twoP[0][1].multipliedBy(bn10(2)))),
    x => x.modulo(p)
)(twoP);

//Doubling: x computation
let pointDoublingX = R.curry((P, al) => R.pipe(
    R.tap(x => print("pointDoublingX 1  :   ", x.toString(16))),
    x => x.exponentiatedBy(2),
    R.tap(x => print("pointDoublingX 2  :   ", x.toString(16))),
    R.tap(x => print(additionInverse(P[0][0].multipliedBy(2)).toString(16))),
    x => x.plus(additionInverse(P[0][0].multipliedBy(2))),
    R.tap(x => print("pointDoublingX 3  :   ", x.toString(16))),
    x => x.modulo(p),
    R.tap(x => print("pointDoublingX 4  :   ", x.toString(16))),
)(al));

//Doubling: y computation
let pointDoublingY = R.curry((al, P, x3) => R.pipe(
    x => x.multipliedBy(P[0][0].plus(additionInverse(x3))),
    x => x.plus(additionInverse(P[0][1])),
    x => x.modulo(p)
)(al));

//Doubling addition
let pointDoubling = P => R.pipe(
    R.tap(x => x.forEach(y => print(y[0].toString(16), y[1].toString(16)))),
    pointDoublingAl,
    R.tap(x => print("pointDoublingAl   :   ", x.toString(16))),
    pointDoublingX([P, P]),
    R.tap(x => print("pointDoublingX    :   ", x.toString(16))),
    R.tap(x => print("pointDoublingY    :   ", pointDoublingY(pointDoublingAl([P, P]), [P, P], x).toString(16))),
    x => [x, pointDoublingY(pointDoublingAl([P, P]), [P, P], x)]
)([P, P]);



// DOUBLING AND ADD ALGORITHM
let byte2bn = R.pipe(
    R.map(bn16),
    R.map(x => x.toString(2)),
    R.map(R.split("")),
    R.map(x => R.repeat("0", BYTE - x.length).concat(x)),
    R.reduce(R.concat, []),
    R.reverse,
    R.map(x => parseInt(x))
);

let doubling = R.curry((P, mas) => {
    let result = [];
    let state = P;
    for (let i = 0; i < mas.length; i++) {
        result.push([mas[i].toString(10), state]);
        state = pointDoubling(state);
    }
    return result;
});

let doublingAndAdd = (P, value) => R.pipe(
    byte2bn,
    R.tap(print),
    doubling(P),
    R.tap(print),
    R.filter(x => x[0] === '1'),
    R.map(R.prop(1)),
    R.tap(R.forEach(x => print(x[0].toString(16), x[1].toString(16)))),
    x => R.reduce((P1, P2) => pointAddition([P1, P2]), R.head(x), R.tail(x))
)(value);


let two_state = R.pipe(
    x => R.repeat("0", 64 - x.length).join("") + x,
    R.splitEvery(2)
);

let str_b = "AA5E28D6A97A2479A65527F7290311A3624D4CC0FA1578598EE3C2613BF99522";


let res = doublingAndAdd(G, ["02"]);
res = res.map(x => x.toString(16));
print(res);


let test_point = [
    bn16("79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"),
    bn16("483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8")
];
