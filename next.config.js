/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
	turbopack: {
		root: path.resolve(__dirname),
	},
	output: 'export',
	images: {
		unoptimized: true,
	},
};

module.exports = nextConfig;