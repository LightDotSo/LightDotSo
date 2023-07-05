# Heavily inspired by Lighthouse: https://github.com/sigp/lighthouse/blob/693886b94176faa4cb450f024696cb69cda2fe58/Makefile
# Also from Reth: https://github.com/paradigmxyz/reth/blob/7da36e042125397af89b9b477f9292dc676e69f8/Makefile
# And from: https://github.com/Terrahop/react-native-rust-demo/blob/30a70fe16148c33ded2f3789b303a52ad5dd6b72/rust/Makefile
# Some: https://github.com/xmtp/libxmtp/blob/1491ccb6d3f9ae6ff7671435f0df81545044bb44/bindings_swift/Makefile

## Constants

NAME = libuniffi_lightwallet_core
LIB = $(NAME).a
SO = $(NAME).so
ARCHS_IOS = x86_64-apple-ios aarch64-apple-ios
ARCHS_MAC = x86_64-apple-darwin aarch64-apple-darwin

TARGET_DIR = target
CARGO_PARAMS = --no-default-features --package lightwallet-core

##@ Help

.PHONY: help
help: ## Display this help.
	@awk 'BEGIN {FS = ":.*##"; printf "Usage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Build

.PHONY: ios
ios: ## Build the project for iOS.
	@make $(ARCHS_IOS)
	@make bindgen-swift
	@make assemble-frameworks
	@make xcframework
	@make cp-xcframework-source

.PHONY: $(ARCHS_IOS)
$(ARCHS_IOS): %:
	cargo build $(CARGO_PARAMS) --target $@ --release --lib

$(LIB): $(ARCHS_IOS)
	lipo -create -output $(IOS_DEST)/$@ $(foreach arch,$(ARCHS_IOS),$(wildcard $(TARGET_DIR)/$(arch)/release/$(LIB)))

bindgen-swift:
	cargo uniffi-bindgen generate crates/core/src/LightWalletCore.udl --language swift
	sed -i '' 's/module\ LightWalletCoreFFI/framework\ module\ LightWalletCoreFFI/' crates/core/src/LightWalletCoreFFI.modulemap

assemble-frameworks:
	find . -type d -name LightWalletCoreFFI.framework -exec rm -rf {} \; || echo "rm failed"
	cd target/x86_64-apple-ios/release && mkdir -p LightWalletCoreFFI.framework && cd LightWalletCoreFFI.framework && mkdir Headers Modules Resources && cp ../../../../crates/core/src/LightWalletCoreFFI.modulemap ./Modules/module.modulemap && cp ../../../../crates/core/src/LightWalletCoreFFI.h ./Headers/LightWalletCoreFFI.h && cp ../$(STATIC_LIB_NAME) ./LightWalletCoreFFI && cp ../../../../crates/core/misc/apple/Info.plist ./Resources
	cd target/aarch64-apple-ios-sim/release && mkdir -p LightWalletCoreFFI.framework && cd LightWalletCoreFFI.framework && mkdir Headers Modules Resources && cp ../../../../crates/core/src/LightWalletCoreFFI.modulemap ./Modules/module.modulemap && cp ../../../../crates/core/src/LightWalletCoreFFI.h ./Headers/LightWalletCoreFFI.h && cp ../$(STATIC_LIB_NAME) ./LightWalletCoreFFI && cp ../../../../crates/core/misc/apple/Info.plist ./Resources
	cd target/aarch64-apple-ios/release && mkdir -p LightWalletCoreFFI.framework && cd LightWalletCoreFFI.framework && mkdir Headers Modules Resources && cp ../../../../crates/core/src/LightWalletCoreFFI.modulemap ./Modules/module.modulemap && cp ../../../../crates/core/src/LightWalletCoreFFI.h ./Headers/LightWalletCoreFFI.h && cp ../$(STATIC_LIB_NAME) ./LightWalletCoreFFI && cp ../../../../crates/core/misc/apple/Info.plist ./Resources

xcframework:
	lipo -create target/x86_64-apple-ios/release/LightWalletCoreFFI.framework/LightWalletCoreFFI target/aarch64-apple-ios-sim/release/LightWalletCoreFFI.framework/LightWalletCoreFFI -output target/aarch64-apple-ios-sim/release/LightWalletCoreFFI.framework/LightWalletCoreFFI
	rm -rf target/LightWalletCoreFFI.xcframework || echo "skip removing"
	xcodebuild -create-xcframework -framework target/aarch64-apple-ios/release/LightWalletCoreFFI.framework -framework target/aarch64-apple-ios-sim/release/LightWalletCoreFFI.framework -output target/LightWalletCoreFFI.xcframework

cp-xcframework-source:
	cp -r target/LightWalletCoreFFI.xcframework ios
	cp crates/core/src/LightWalletCore.swift ios/LightWalletCore/Sources/Generated

##@ Contracts

.PHONY: storage-layout
storage-layout: ## Omits the current storage layout from the current contracts with foundry
	./contracts/storage.sh
