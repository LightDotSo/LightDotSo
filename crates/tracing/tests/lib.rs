// Copyright 2023-2024 LightDotSo.
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

use lightdotso_tracing::{init, init_test_tracing, stdout};

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use lightdotso_tracing::tracing::{info, Level};

    #[ignore = "This test can only be run on the local machine"]
    #[test]
    fn test_stdout_layer() {
        let layers = vec![stdout(Level::INFO)];
        init(layers);
        info!("This is a test log message");
    }

    #[ignore = "This test can only be run on the local machine"]
    #[test]
    fn test_init_test_tracing() {
        init_test_tracing();
        info!("This is a test log message");
    }
}
