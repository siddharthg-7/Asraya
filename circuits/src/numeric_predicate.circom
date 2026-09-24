pragma circom 2.0.0;

/**
 * Num2Bits template:
 * Decomposes an input into n bits and asserts each bit is boolean (b * (1 - b) === 0).
 */
template Num2Bits(n) {
    signal input in;
    signal output out[n];
    var lc1 = 0;

    var e2 = 1;
    for (var i = 0; i < n; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (out[i] - 1) === 0;
        lc1 += out[i] * e2;
        e2 = e2 + e2;
    }

    lc1 === in;
}

/**
 * LessEqThan template:
 * Checks whether in[0] <= in[1].
 * Enforces that (in[1] - in[0]) is non-negative within 64 bits.
 */
template LessEqThan(n) {
    signal input in[2]; // in[0]: private earnings, in[1]: public threshold
    signal output out;

    component n2b = Num2Bits(n + 1);
    n2b.in <== (1 << n) + in[1] - in[0];

    out <== n2b.out[n];
    out === 1; // Strict predicate satisfaction constraint
}

/**
 * Pramāṇa Numeric Predicate Circuit
 * Primary Demonstration: trailing_12m_earnings LTE 300000
 *
 * Inputs:
 * - earnings:  PRIVATE witness (citizen's private earnings attribute)
 * - threshold: PUBLIC signal (policy authorized threshold, e.g. 300000)
 * - nonce:     PUBLIC challenge signal (verifier-provided nonce for request binding)
 */
template NumericPredicateVerifier() {
    signal input earnings;  // PRIVATE
    signal input threshold; // PUBLIC
    signal input nonce;     // PUBLIC

    // 1. Enforce that earnings <= threshold
    component comparator = LessEqThan(64);
    comparator.in[0] <== earnings;
    comparator.in[1] <== threshold;

    // 2. Cryptographic binding to verifier request nonce
    signal nonceSquare;
    nonceSquare <== nonce * nonce;
}

component main {public [threshold, nonce]} = NumericPredicateVerifier();
