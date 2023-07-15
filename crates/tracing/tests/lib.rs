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
