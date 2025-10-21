/** @type {import('next').NextConfig} */
const nextConfig = {
	typescript: {
		// Allow production builds even if there are type errors.
		// NOTE: This silences TypeScript build failures; prefer fixing types before CI/CD.
		ignoreBuildErrors: true,
	},
};

export default nextConfig;
