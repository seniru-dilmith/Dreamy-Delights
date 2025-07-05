import React, { useEffect, useState } from "react";
import { auth } from "../firebase/init";
import { onAuthStateChanged, User } from "firebase/auth";

const AuthStatus = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!auth) {
      console.warn("Firebase auth is not initialized");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  if (!auth) {
    return <div>Authentication not available</div>;
  }

  if (user) {
    return <div>Welcome, {user.email}</div>;
  } else {
    return <div>Please log in</div>;
  }
};

export default AuthStatus;
