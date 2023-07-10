// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

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
