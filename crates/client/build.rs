// Copyright 2023-2024 Light.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
