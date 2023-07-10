pub fn rust_greeting(to: String) -> String {
    format!("Hello World, {}!", to)
}

pub fn rust_hello_world() -> String {
    "Hello World".to_string()
}

pub use lightwallet_keychain::keychain_hello_world;

uniffi_macros::include_scaffolding!("LightWalletCore");
