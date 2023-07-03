import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import { redis } from "./redis";
import { Adapter } from "next-auth/adapters";

const DEBUG = false;

const GITHUB_ID = process.env.GITHUB_ID;
const GITHUB_SECRET = process.env.GITHUB_SECRET;

if (!GITHUB_ID || !GITHUB_SECRET) {
	throw new Error(
		"Missing environment variables GITHUB_ID and GITHUB_SECRET. Define them in .env.local"
	);
}

const adapter = UpstashRedisAdapter(redis) as Adapter;

export const authOptions: NextAuthOptions = {
	session: {
		strategy: "jwt",
	},
	adapter,
	providers: [
		GithubProvider({
			clientId: GITHUB_ID,
			clientSecret: GITHUB_SECRET,
		}),
	],
	callbacks: {
		async signIn({ user, account, profile, email, credentials }) {
			if (DEBUG)
				console.log("signIn", {
					user,
					account,
					profile,
					email,
					credentials,
				});
			return true;
		},
		async redirect({ url, baseUrl }) {
			if (DEBUG) console.log("redirect", { url, baseUrl });
			return baseUrl;
		},
		async session({ session, user, token }) {
			if (DEBUG) console.log("session"), { session, user, token };
			return session;
		},
		async jwt({ token, user, account, profile, isNewUser }) {
			if (DEBUG)
				console.log("jwt", {
					token,
					user,
					account,
					profile,
					isNewUser,
				});
			return token;
		},
	},
};
