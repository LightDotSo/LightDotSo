// From: noir-starter
// Link: https://github.com/noir-lang/noir-starter/blob/dff860c69eb235df64bfbdfe86fdc03cbc8f97cb/with-foundry/circuits/src/main.nr

fn main(x : Field, y : pub Field) {
    assert(x == y);
}

#[test]
fn test_main() {
    main(1, 1);
    main(2, 2);
    main(3, 3);
}
