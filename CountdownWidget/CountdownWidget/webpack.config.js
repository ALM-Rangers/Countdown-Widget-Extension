var path = require("path");
var webpack = require("webpack");

module.exports = {
	target: "web",
	entry: {
		countdown: "./src/countdown.ts",
		countdownConfiguration: "./src/countdownConfiguration.ts",
		fancyCountdownConfiguration: "./src/fancyCountdownConfiguration.ts"
	},
	output: {
		filename: "[name].js",
		libraryTarget: "amd"
	},
	externals: [
		/^VSS\/.*/, /^TFS\/.*/, /^q$/
	],
	resolve: {
		extensions: ["*", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
        modules: [path.resolve("./src"), "node_modules"]
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				enforce: "pre",
				loader: "tslint-loader",
				options: {
					emitErrors: true,
					failOnHint: true
				}
			},
			{
				test: /\.tsx?$/,
				loader: "ts-loader"
			}
		]
	}
};