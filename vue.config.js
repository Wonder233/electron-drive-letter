const { defineConfig } = require("@vue/cli-service");
const path = require("path");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const productName = "企业网盘";

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  configureWebpack: {
    target: "electron-renderer",
    resolve: {
      extensions: [".js", ".json", ".vue", ".ts", ".tsx"],
      alias: {
        // vue: 'vue/dist/vue.js',
        src: resolve("src"),
        common: resolve("common"),
      },
      plugins: [
        new TsconfigPathsPlugin({
          configFile: path.join(__dirname, "tsconfig.json"),
          extensions: [".ts", ".tsx", ".js", ".json", ".vue"],
        }),
      ],
    },
    plugins: [],
  },
  pluginOptions: {
    electronBuilder: {
      chainWebpackMainProcess: (config) => {
        config.resolve.alias
          .set("main", resolve("main"))
          .set("common", resolve("common"));
        config.module
          .rule("babel")
          .test(/\.ts$/)
          .before("ts")
          .use("babel")
          .loader("babel-loader")
          .options({
            presets: [["@babel/preset-env", { modules: false }]],
            plugins: ["@babel/plugin-proposal-class-properties"],
          });
      },
      outputDir: "dist",
      mainProcessFile: "main/background.ts",
      mainProcessWatch: ["main"],
      nodeIntegration: true,
      customFileProtocol: "./",
      files: ["./dist/bundled/**/*"],
      builderOptions: {
        appId: "com.tencent.test",
        productName: productName,
        artifactName: "test-${version}.${arch}.${ext}",
        copyright: "",
        publish: {
          provider: "generic",
          url: "",
        },
        mac: {
          category: "Productivity",
          target: [
            {
              target: "dmg",
              arch: ["x64", "arm64"],
            },
            {
              target: "zip",
              arch: ["x64", "arm64"],
            },
          ],
          icon: "build/icons/favicon.icns",
          extraResources: [
            {
              from: "./resources/icons/",
              to: "./icons/",
            },
            {
              from: "./resources/bfile/",
              to: "./bfile/",
            },
            {
              from: "./resources/vbs/",
              to: "./vbs/",
            },
          ],
          entitlements: "build/entitlements.mac.plist",
          entitlementsInherit: "build/entitlements.mac.plist",
          extendInfo: {
            CFBundleURLTypes: [
              {
                CFBundleURLSchemes: ["test"],
                CFBundleURLName: "com.tencent.test",
              },
              {
                CFBundleURLSchemes: ["test"],
                CFBundleURLName: "com.tencent.test",
              },
            ],
          },
          hardenedRuntime: true,
          gatekeeperAssess: false,
        },
        dmg: {
          icon: "build/icons/favicon.icns",
          contents: [
            {
              x: 410,
              y: 180,
              type: "link",
              path: "/Applications",
            },
            {
              x: 130,
              y: 180,
              type: "file",
            },
          ],
        },
        win: {
          target: [
            {
              target: "nsis",
              arch: ["x64", "ia32"],
            },
            "zip",
          ],
          icon: "build/icons/favicon.ico",
          extraResources: [
            {
              from: "./resources/icons/",
              to: "./icons/",
            },
            {
              from: "./resources/vbs/",
              to: "./vbs/",
            },
          ],
          signingHashAlgorithms: ["sha256"],
        },
        nsis: {
          oneClick: false,
          perMachine: true,
          allowElevation: true,
          allowToChangeInstallationDirectory: true,
          include: "build/script/installerScript.nsh",
          deleteAppDataOnUninstall: true,
        },
        portable: { requestExecutionLevel: "admin" },
        directories: { output: "package" },
        forceCodeSigning: false,
      },
    },
  },
});
