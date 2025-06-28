import React, { useEffect, useState } from "react";
import { auth } from "../firebase/init";
import { onAuthStateChanged, User } from "firebase/auth";

const AuthStatus = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  if (user) {
    return <div>Welcome, {user.email}</div>;
  } else {
    return <div>Please log in</div>;
  }
};

export default AuthStatus;
