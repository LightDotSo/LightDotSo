// swift-tools-version: 5.8
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
  name: "LightWalletBuildTools",
  dependencies: [
    .package(url: "https://github.com/realm/SwiftLint", from: "0.51.0")
  ]
)
