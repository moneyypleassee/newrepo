import { ClerkProvider } from "@clerk/clerk-react";

const clerkKey = process.env.NEXT_PUBLIC_CLERK_FRONTEND_API_KEY; // Adjust this variable name if necessary

function MyApp({ Component, pageProps }) {
  return (
    <ClerkProvider publishableKey={clerkKey}>
      <Component {...pageProps} />
    </ClerkProvider>
  );
}

export default MyApp;