# Heavily inspired by Lighthouse: https://github.com/sigp/lighthouse/blob/693886b94176faa4cb450f024696cb69cda2fe58/Makefile
# Also from Reth: https://github.com/paradigmxyz/reth/blob/7da36e042125397af89b9b477f9292dc676e69f8/Makefile
# And from: https://github.com/Terrahop/react-native-rust-demo/blob/30a70fe16148c33ded2f3789b303a52ad5dd6b72/rust/Makefile
# Some: https://github.com/xmtp/libxmtp/blob/1491ccb6d3f9ae6ff7671435f0df81545044bb44/bindings_swift/Makefile

## Constants

WORKSPACE = lightdotso
NAME = libuniffi_lightwallet_core
STATIC_LIB_NAME = $(NAME).a
SHARED_LIB_NAME = $(NAME).so
ARCHS_IOS = x86_64-apple-ios aarch64-apple-ios-sim
ARCHS_IOS_ARM = aarch64-apple-ios
ARCHS_MAC = x86_64-apple-darwin aarch64-apple-darwin

CRATES_DIR = "crates/core"

CARGO_PARAMS = --package lightwallet-core --crate-type=staticlib
TARGET_DIR = target

##@ Help

.PHONY: help
help: ## Display this help.
	@awk 'BEGIN {FS = ":.*##"; printf "Usage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Install

install: ios-setup mac-setup ## Install all dependencies.

.PHONY: ios-setup
ios-setup: ## Install iOS dependencies.
	rustup target add $(ARCHS_IOS)
	rustup target add $(ARCHS_IOS_ARM)

.PHONY: mac-setup
mac-setup: ## Install macOS dependencies.
	rustup target add $(ARCHS_MAC)

##@ Build

.PHONY: ios
ios: ## Build the project for iOS.
	@make $(STATIC_LIB_NAME)
	@make bindgen-swift
	@make assemble-frameworks
	@make xcframework
	@make cp-xcframework-source

##@ Cargo Build

.PHONY: $(ARCHS_IOS) ## Build the project for iOS.
$(ARCHS_IOS): %:
	cargo rustc $(CARGO_PARAMS) --target $@ --release

.PHONY: $(ARCHS_IOS_ARM) ## Build the project for iOS (Specific structure).
$(ARCHS_IOS_ARM): %:
	cargo rustc $(CARGO_PARAMS) --target $@ --release

.PHONY: $(ARCHS_MAC) ## Build the project for macOS.
$(ARCHS_MAC): %:
	cargo rustc $(CARGO_PARAMS) --target $@ --release

##@ Apple Build

.PHONY: $(STATIC_LIB_NAME)
$(STATIC_LIB_NAME): $(ARCHS_IOS) $(ARCHS_IOS_ARM) $(ARCHS_MAC) ## Build the universal binary for iOS and macOS.
	rm -rf $(TARGET_DIR)/lipo_macos $(TARGET_DIR)/lipo_ios_simulator || echo "Skip removing $(STATIC_LIB_NAME)"
	mkdir -p $(TARGET_DIR)/lipo_macos $(TARGET_DIR)/lipo_ios_simulator
	lipo -create -output $(TARGET_DIR)/lipo_ios_simulator/$(STATIC_LIB_NAME) $(foreach arch,$(ARCHS_IOS),$(wildcard target/$(arch)/release/$(STATIC_LIB_NAME)))
	lipo -create -output $(TARGET_DIR)/lipo_macos/$(STATIC_LIB_NAME) $(foreach arch,$(ARCHS_MAC),$(wildcard target/$(arch)/release/$(STATIC_LIB_NAME)))

.PHONY: bindgen-swift
bindgen-swift: ## Generate the Swift bindings.
	rm -rf $(TARGET_DIR)/Generated || echo "Skip removing Generated"
	mkdir -p $(TARGET_DIR)/Generated
	cp -r $(CRATES_DIR)/src $(TARGET_DIR)/Generated/
	find $(TARGET_DIR)/Generated -type f -name "*.swift" -delete
	cargo uniffi-bindgen generate $(CRATES_DIR)/src/LightWalletCore.udl --language swift
	sed -i '' 's/module\ LightWalletCoreFFI/framework\ module\ LightWalletCoreFFI/' $(CRATES_DIR)/src/LightWalletCoreFFI.modulemap

.PHONY: xcframework
xcframework: ## Build the xcframework for iOS and macOS.
	rm -rf $(TARGET_DIR)/LightWalletCoreFFI.framework || echo "Skip removing framework"
	xcodebuild -create-xcframework \
		-library ./$(TARGET_DIR)/lipo_macos/$(STATIC_LIB_NAME) \
		-headers ./$(TARGET_DIR)/Generated/ \
		-library ./$(TARGET_DIR)/lipo_ios_simulator/$(STATIC_LIB_NAME) \
		-headers ./$(TARGET_DIR)/Generated/ \
		-output $(TARGET_DIR)/LightWalletCoreFFI.xcframework

.PHONY: cp-xcframework-source
cp-xcframework-source: ## Copy the xcframework to the iOS project.
	cp -r $(TARGET_DIR)/LightWalletCoreFFI.xcframework ios
	cp $(CRATES_DIR)/src/LightWalletCore.swift ios/LightWalletCore/Sources/Generated

##@ Old Overrides

.PHONY: assemble-frameworks
assemble-frameworks: # Temporary override for old build system
	find . -type d -name LightWalletCoreFFI.framework -exec rm -rf {} \; || echo "rm failed"
	cd target/x86_64-apple-ios/release && mkdir -p LightWalletCoreFFI.framework && cd LightWalletCoreFFI.framework && mkdir Headers Modules && cp ../../../../crates/core/src/LightWalletCoreFFI.modulemap ./Modules/module.modulemap && cp ../../../../crates/core/src/LightWalletCoreFFI.h ./Headers/LightWalletCoreFFI.h && cp ../$(STATIC_LIB_NAME) ./LightWalletCoreFFI
	cd target/aarch64-apple-ios-sim/release && mkdir -p LightWalletCoreFFI.framework && cd LightWalletCoreFFI.framework && mkdir Headers Modules && cp ../../../../crates/core/src/LightWalletCoreFFI.modulemap ./Modules/module.modulemap && cp ../../../../crates/core/src/LightWalletCoreFFI.h ./Headers/LightWalletCoreFFI.h && cp ../$(STATIC_LIB_NAME) ./LightWalletCoreFFI
	cd target/aarch64-apple-ios/release && mkdir -p LightWalletCoreFFI.framework && cd LightWalletCoreFFI.framework && mkdir Headers Modules && cp ../../../../crates/core/src/LightWalletCoreFFI.modulemap ./Modules/module.modulemap && cp ../../../../crates/core/src/LightWalletCoreFFI.h ./Headers/LightWalletCoreFFI.h && cp ../$(STATIC_LIB_NAME) ./LightWalletCoreFFI

.PHONY: xcframework
xcframework:  # Temporary override for old build system
	lipo -create target/x86_64-apple-ios/release/LightWalletCoreFFI.framework/LightWalletCoreFFI target/aarch64-apple-ios-sim/release/LightWalletCoreFFI.framework/LightWalletCoreFFI -output target/aarch64-apple-ios-sim/release/LightWalletCoreFFI.framework/LightWalletCoreFFI
	rm -rf target/LightWalletCoreFFI.xcframework || echo "skip removing"
	xcodebuild -create-xcframework -framework target/aarch64-apple-ios/release/LightWalletCoreFFI.framework -framework target/aarch64-apple-ios-sim/release/LightWalletCoreFFI.framework -output target/LightWalletCoreFFI.xcframework

##@ Contracts
contracts: contracts-size contracts-storage contracts-wagmi ## Runs all the contract generation scripts

.PHONY: contracts-size
contracts-size: ## Omits the current code size layout from the current contracts with foundry
	./contracts/size.sh

.PHONY: contracts-storage
contracts-storage: ## Omits the current storage layout from the current contracts with foundry
	./contracts/storage.sh

.PHONY: contracts-wagmi
contracts-wagmi: ## Copies over certain directory for wagmi generation
	./contracts/wagmi.sh

#@ zellij
shell:
	zellij --layout zellij.kdl a $(WORKSPACE) || zellij --layout zellij.kdl -s $(WORKSPACE)
