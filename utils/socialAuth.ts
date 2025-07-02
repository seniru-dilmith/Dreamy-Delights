/**
 * Social Authentication Utilities
 * Handles Google and Facebook authentication flows
 */

declare global {
  interface Window {
    google?: any;
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

// Google Sign-In configuration
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// Facebook configuration
const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

/**
 * Initialize and perform Google Sign-In
 */
export const initializeGoogleSignIn = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    // Check if Google Sign-In is configured
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('your-')) {
      console.log('Google Sign-In not configured');
      resolve(null);
      return;
    }

    // Load Google Identity Services script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initGoogleAuth();
      document.head.appendChild(script);
    } else {
      initGoogleAuth();
    }

    function initGoogleAuth() {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: { credential: string }) => {
          resolve(response.credential);
        },
        auto_select: false,
        cancel_on_tap_outside: true
      });

      // Show the One Tap dialog
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If One Tap is not displayed, show popup
          showGooglePopup();
        }
      });
    }

    function showGooglePopup() {
      window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'email profile',
        callback: (response: any) => {
          if (response.access_token) {
            // Get user info using access token
            fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${response.access_token}`)
              .then(res => res.json())
              .then(userInfo => {
                // Create a mock ID token for our backend
                // In production, you'd use the proper Google ID token
                const mockIdToken = btoa(JSON.stringify({
                  sub: userInfo.id,
                  email: userInfo.email,
                  name: userInfo.name,
                  picture: userInfo.picture,
                  email_verified: userInfo.verified_email
                }));
                resolve(mockIdToken);
              })
              .catch(() => resolve(null));
          } else {
            resolve(null);
          }
        }
      }).requestAccessToken();
    }
  });
};

/**
 * Initialize and perform Facebook Login
 */
export const initializeFacebookLogin = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    // Check if Facebook Login is configured
    if (!FACEBOOK_APP_ID || FACEBOOK_APP_ID.includes('your-')) {
      console.log('Facebook Login not configured');
      resolve(null);
      return;
    }

    // Load Facebook SDK
    if (!window.FB) {
      window.fbAsyncInit = () => {
        window.FB.init({
          appId: FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
        performFacebookLogin();
      };

      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    } else {
      performFacebookLogin();
    }

    function performFacebookLogin() {
      window.FB.login((response: any) => {
        if (response.status === 'connected') {
          resolve(response.authResponse.accessToken);
        } else {
          resolve(null);
        }
      }, { scope: 'email,public_profile' });
    }
  });
};

/**
 * Simple fallback authentication (for demo purposes)
 */
export const showSocialAuthDemo = (provider: 'google' | 'facebook') => {
  const message = `
${provider === 'google' ? 'Google' : 'Facebook'} authentication setup required:

1. Create a ${provider === 'google' ? 'Google Cloud' : 'Facebook Developer'} project
2. Configure OAuth credentials
3. Add your domain to authorized origins
4. Update environment variables in .env.local:
   ${provider === 'google' ? 
     '- NEXT_PUBLIC_GOOGLE_CLIENT_ID' : 
     '- NEXT_PUBLIC_FACEBOOK_APP_ID'}

For now, please use email/password authentication.
  `;
  
  alert(message);
};
