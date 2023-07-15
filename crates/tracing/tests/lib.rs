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

use lightdotso_tracing::{init, init_test_tracing, stdout};

#[cfg(test)]
mod tests {
    use super::*;
    use tracing::{info, Level};

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
