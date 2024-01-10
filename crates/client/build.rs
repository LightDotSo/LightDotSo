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

#![allow(clippy::unwrap_used)]

// From: https://github.com/oxidecomputer/progenitor/blob/4a182d734e46fa1ce15415bf5bd497fc347dc43e/example-build/build.rs
// License: MPL-2.0

#[allow(unused_imports)]
use std::{
    env,
    fs::{self, File},
    path::Path,
};

fn main() {
    let src = "./specs/keeper.json";
    println!("cargo:rerun-if-changed={}", src);
    let file = File::open(src).unwrap();
    let spec = serde_json::from_reader(file).unwrap();
    let mut generator = progenitor::Generator::default();

    let tokens = generator.generate_tokens(&spec).unwrap();
    let ast = syn::parse2(tokens).unwrap();
    let _ = prettyplease::unparse(&ast);
    // let parsed_content = prettyplease::unparse(&ast);

    // Allow clippy::unwrap_used for the coming generated code
    // let mut content = "#![allow(clippy::all)]\n\n".to_owned();
    // content.push_str(&parsed_content);

    // let mut out_file = Path::new(&env::var("OUT_DIR").unwrap()).to_path_buf();
    // out_file.push("mod.rs");

    // fs::write(out_file, content).unwrap();
}
