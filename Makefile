# Heavily inspired by Lighthouse: https://github.com/sigp/lighthouse/blob/693886b94176faa4cb450f024696cb69cda2fe58/Makefile
# Also from Reth: https://github.com/paradigmxyz/reth/blob/7da36e042125397af89b9b477f9292dc676e69f8/Makefile
# And from: https://github.com/Terrahop/react-native-rust-demo/blob/30a70fe16148c33ded2f3789b303a52ad5dd6b72/rust/Makefile
# Some: https://github.com/xmtp/libxmtp/blob/1491ccb6d3f9ae6ff7671435f0df81545044bb44/bindings_swift/Makefile

## Constants

NAME = libuniffi_lightwallet_core
LIB = $(NAME).a
SO = $(NAME).so
ARCHS_IOS = x86_64-apple-ios aarch64-apple-ios-sim
ARCHS_IOS_ARM = aarch64-apple-ios
ARCHS_MAC = x86_64-apple-darwin aarch64-apple-darwin

CRATES_DIR = "crates/core"

CARGO_PARAMS = --no-default-features --package lightwallet-core
TARGET_DIR = target

##@ Help

.PHONY: help
help: ## Display this help.
	@awk 'BEGIN {FS = ":.*##"; printf "Usage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Install

install: ios-setup mac-setup ## Install all dependencies.

ios-setup: ## Install iOS dependencies.
	rustup target add $(ARCHS_IOS)
	rustup target add $(ARCHS_IOS_ARM)

mac-setup: ## Install macOS dependencies.
	rustup target add $(ARCHS_MAC)

##@ Build

.PHONY: ios
ios: ## Build the project for iOS.
	@make $(ARCHS_IOS)
	@make $(LIB)
	@make bindgen-swift
	@make xcframework
	@make cp-xcframework-source

##@ Cargo Build

.PHONY: $(ARCHS_IOS) ## Build the project for iOS.
$(ARCHS_IOS): %:
	cargo build $(CARGO_PARAMS) --target $@ --release --lib

.PHONY: $(ARCHS_IOS_ARM) ## Build the project for iOS (Specific structure).
$(ARCHS_IOS_ARM): %:
	cargo build $(CARGO_PARAMS) --target $@ --release --lib

.PHONY: $(ARCHS_MAC) ## Build the project for macOS.
$(ARCHS_MAC): %:
	cargo build $(CARGO_PARAMS) --target $@ --release --lib

##@ Apple Build

$(LIB): $(ARCHS_IOS) $(ARCHS_IOS_ARM) $(ARCHS_MAC) ## Build the universal binary for iOS and macOS.
	rm -rf $(TARGET_DIR)/lipo_macos $(TARGET_DIR)/lipo_ios_simulator || echo "Skip removing $(LIB)"
	mkdir -p $(TARGET_DIR)/lipo_macos $(TARGET_DIR)/lipo_ios_simulator
	lipo -create -output $(TARGET_DIR)/lipo_ios_simulator/$(LIB) $(foreach arch,$(ARCHS_IOS),$(wildcard target/$(arch)/release/$(LIB)))
	lipo -create -output $(TARGET_DIR)/lipo_macos/$(LIB) $(foreach arch,$(ARCHS_MAC),$(wildcard target/$(arch)/release/$(LIB)))

bindgen-swift: ## Generate the Swift bindings.
	rm -rf $(TARGET_DIR)/Generated || echo "Skip removing Generated"
	mkdir -p $(TARGET_DIR)/Generated
	cp -r $(CRATES_DIR)/src $(TARGET_DIR)/Generated/
	find $(TARGET_DIR)/Generated -type f -name "*.swift" -delete
	cargo uniffi-bindgen generate $(CRATES_DIR)/src/LightWalletCore.udl --language swift
	sed -i '' 's/module\ LightWalletCoreFFI/framework\ module\ LightWalletCoreFFI/' $(CRATES_DIR)/src/LightWalletCoreFFI.modulemap

xcframework: ## Build the xcframework for iOS and macOS.
	rm -rf $(TARGET_DIR)/LightWalletCoreFFI.framework || echo "Skip removing framework"
	xcodebuild -create-xcframework \
		-library ./$(TARGET_DIR)/lipo_macos/$(LIB) \
		-headers ./$(TARGET_DIR)/Generated/ \
		-library ./$(TARGET_DIR)/lipo_ios_simulator/$(LIB) \
		-headers ./$(TARGET_DIR)/Generated/ \
		-output $(TARGET_DIR)/LightWalletCoreFFI.xcframework

cp-xcframework-source: ## Copy the xcframework to the iOS project.
	cp -r $(TARGET_DIR)/LightWalletCoreFFI.xcframework ios
	cp $(CRATES_DIR)/src/LightWalletCore.swift ios/LightWalletCore/Sources/Generated

##@ Contracts

.PHONY: storage-layout
storage-layout: ## Omits the current storage layout from the current contracts with foundry
	./contracts/storage.sh
