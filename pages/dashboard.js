import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/clerk-react';

export default function Dashboard() {
  const { user } = useUser();

  return (
    <>
      <SignedIn>
        <h1>Welcome to your Dashboard, {user?.firstName}!</h1>
        <p>Email: {user?.emailAddress}</p>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}