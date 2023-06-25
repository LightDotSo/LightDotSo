STATIC_LIB_NAME := libuniffi_lightwallet_core.a

.PHONY: ios

ios:
	@make build-targets
	@make bindgen-swift
	@make assemble-frameworks
	@make xcframework
	@make cp-xcframework-source

build-targets:
	cargo build --release --target x86_64-apple-ios
	cargo +nightly build --release --target aarch64-apple-ios-sim
	cargo build --release --target aarch64-apple-ios

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

swift-lint:
	swift build -c release --package-path ios/LightWalletBuildTools --product swiftlint
	./ios/LightWalletBuildTools/.build/release/swiftlint ios

license-checker:
	cargo mpl-license-checker
